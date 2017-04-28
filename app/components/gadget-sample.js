import Ember from 'ember';
import breadcrumbsMixin from '../mixins/breadcrumbs-mixin';

export default Ember.Component.extend(breadcrumbsMixin, {
	subpubService: Ember.inject.service(),  	
	linkToView: 'Test',
	gridViewClass: Ember.computed('linkToView',  function () { 
		return this.get('linkToView')+'DetailView';	
	}),
	gridObjMapping: Ember.computed('widget_id', function() { 
		return {
			'TestDetailView' : {
				gridName: 'TestDetailView',
				recid:'recid', 
				columnsService: 'getTestColumns', 
				recordsService: 'getTestData',
				showTotal: 1,
				clickableFields:  ['order_number'],  //handle clickable fields to trigger another grid view
				view: 'detail',
				refreshTime: 3
			},
			'Test1DetailView' : {
				gridName: 'Test1DetailView',
				recid:'recid', 
				columnsService: 'getTestColumns1', 
				recordsService: 'getTestData1',
				showTotal: 1,
				clickableFields:  [],  //handle clickable fields to trigger another grid view
				view: 'detail',
				refreshTime: 3
			}
		};
	}),
	setGridObj (gridName, extraParams){			
		let gridMapping = this.get('gridObjMapping');		
		if( gridMapping[gridName] ){ 
			let gridViewObj = gridMapping[gridName];	
			
			if( extraParams!==undefined && Object.keys(extraParams).length !== 0){
				gridViewObj.extraParams = extraParams;
			}
			this.set('gridViewObj', gridViewObj);	
		}else{
			Ember.Logger.log("No Grid View found on Mapping!");			
		}		
	},
	handleGridView: function (topics, data, scope){
				
		let self = this.scope;	
		
		//switch to grid view based on the linkToView 
		if(data.linkToView!==undefined) {
			self.set('linkToView', data.linkToView);
		}
			
		//empty gridView object
		self.set('gridViewObj', {});    	
		
		//create a new gridView object
		self.setGridObj(self.get('gridViewClass'), data);
	},

	pathLayers:{
		'Test':1,
		'Test1':2
	},
	
	handleGridViewNPath: function (topics, data, scope){		
		let self = this.scope;	
        let pathLayers = self.get('pathLayers');
		
		if(data){			
			self.propertyWillChange('pathArrayObj');	
				
			/*** update the subscripted path ***/			
			if(data.column){ //published by clicking on ID inside of Grid View				
				
				switch(data.column){
					case "Order Number":
						data['linkToView']= 'Test1';
						data['orderNumber']= data.value;
						self.updatePath(data.value, self, pathLayers.Test1, data);	
						break;
					default:
						self.updatePath(data.value, self, pathLayers.Test, data);	
						break;					
				}
			}		
			
			self.propertyDidChange('pathArrayObj');		
		
			/*** update the subscripted grid view ***/	
			let subscriptionGridName = topics.replace('Path', 'Grid');		
			self.get('subpubService').publish( subscriptionGridName, data, self);		
		}	
	},
	init() {
		this._super(...arguments);

		// Set grid view object based on the gridViewClass
		this.setGridObj(this.get('gridViewClass'));	
		
		// Subscribers onClick events and its handler functions for all gridObjetMapping
		let gridMapping = this.get('gridObjMapping');		
		for (var key in gridMapping) {			
			this.get('subpubService').subscribe('subscription'+key+'Path/update', this.handleGridViewNPath, this);
			this.get('subpubService').subscribe('subscription'+key+'Grid/update', this.handleGridView, this);
		}		
	},
	
	actions: {
		updatePath(path){  //tigger by clicking on breadcrumb
			
			let data = path.data;			
			
			//published by clicking on OverView on breadcrumb 
			if(path.label === 'OverView'){ 
				data['linkToView'] = 'Test';				
			}			
		
			//update breadcrumb
			this.updateBreadcrumbs(path);
			
			//update grid view
			this.get('subpubService').publish(  this.get('subscriptionNameGrid') + '/update' , data , this);
						
		},
		updateGrid(){  

			let handleGridViewData = this.get('handleGridViewData');	
						
			// update the grid view
			this.get('subpubService').publish(  this.get('subscriptionNamePath') + '/update' , handleGridViewData , this);	
			
		}		
	}	

});
