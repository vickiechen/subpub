import Ember from 'ember';

export default Ember.Component.extend({
	subpubService: Ember.inject.service(),  
	linkToView: '',
	size: 'md', 
	mode: 0 ,
	gridViewClass: Ember.computed('size', 'linkToView',  function () { //must have this property for defining the grid view class and subscription Path
		let linkToView = this.get('linkToView');
        if(this.get('size')==='full'){
			return linkToView+'FullView';	
		}
		else{	
			return linkToView+'DetailView';	
		}
    }),
	gridObjMapping: Ember.computed('widget_id', function() { 
		return {
			'DetailView' : {
				gridName: 'DetailView',
				recid:'rowID', 
				columnsService: 'getColumns', 
				recordsService: 'getRecords',
				showTotal: 1,
				gadgetID: 1,
				ticketSystem: 'Test',
				clickableFields:  ['name'],  //handle clickable fields to trigger another grid view
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
			}else{  
				gridViewObj.extraParams = { 
					mode: this.get('mode')
				};
			}
			this.set('gridViewObj', gridViewObj);	
		}else{
			Ember.Logger.log("No Grid View found on Mapping!");			
		}		
	},
	handleGridView: function (topics, data, scope){
		/** 
			Example for data object
			data = { 
				stat: '5To7'
				taskType: 'AGLTH001',
				filter: 'Assigned',
				linkToView:'Task'
			}
		**/
		
		let self = this.scope;	

		//add current mode to pass to api
		data['mode'] = self.get('mode');	
		
		//switch to grid view based on the linkToView 
		if(data.stat!==undefined) {
			self.set('statOnDetailView', data.stat);
		}
		
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
		'overView':1,
		'stat':2
	},
	
	handleGridViewNPath: function (topics, data, scope){		
		let self = this.scope;	
        let pathLayers = self.get('pathLayers');
		
		//keep save data into handleGridViewData attributes, so we can reuse it when its doing searching mode 1
		self.set('handleGridViewData', data);
				
		//the params and linkToView needs to pass to api to get grid view data
        let gridViewData = { 
			stat: self.get('statOnDetailView'),
			linkToView:''
		};		
		
		if(data){			
			self.propertyWillChange('pathArrayObj');	
				
			/*** update the subscripted path ***/			
			/*if(data.column){ //published by clicking on column name/value inside of Grid View				
				
				if(data.column ==='Task Type'){	
					gridViewData['taskType'] = data.value;	
					gridViewData['linkToView'] = 'Task';								
					self.updatePath(data.value, self, pathLayers.taskType, gridViewData);	
					
				}else if(data.column ==='Task'){
					if(data.rowId !==undefined ){
						gridViewData['taskType'] = self.getValueFromGridView(data.rowId, 'task_type');	
					}	
					gridViewData['linkToView'] = 'Task';								
					self.updatePath(data.value, self, pathLayers.taskType, gridViewData);	
				}
				else if (data.value && /^\d+$/.test( data.value ) ) {  //published by clicking on digits value inside of Grid View
					
					if(data.rowId !==undefined ){
						gridViewData['taskType'] = self.getValueFromGridView(data.rowId, 'task_type');
						self.updatePath(gridViewData['taskType']  , self, pathLayers.taskType , gridViewData);						
					}			
						
					if (data.column ==='Ticket Number'){ //click on ticket numbers
						gridViewData['ticketNumber'] = data.value;
						gridViewData['linkToView'] = 'Ticket';
						self.updatePath("Ticket "+ data.value , self, pathLayers.ticketNumber , gridViewData);							
					} 
					else {	//click on task numbers			
						gridViewData['filter'] = data.column;	
						gridViewData['linkToView'] = 'Task';								
						self.updatePath(data.column + " Tasks", self, pathLayers.filter , gridViewData);							
					}							
				} 
				else { //click on none numberic value						
					let otherColumns = ['Origin','Assigned To','Team'];
					if (otherColumns.indexOf(data.column)!==-1){ 
						Ember.Logger.log('The layer for the column view is not ready yet:' + data.column);
					}else{					
						//update taskType on breadcrumb						
						gridViewData['linkToView'] = 'Task';
						if(data.rowId !==undefined ){ 	
							let taskType = self.getValueFromGridView(data.rowId, 'task_type');	
							gridViewData['taskType'] = taskType;	
						}
						self.updatePath(data.value, self, pathLayers.taskType, gridViewData);						
					}					
				}
			}	*/		
			
			self.propertyDidChange('pathArrayObj');		
		
			/*** update the subscripted grid view ***/	
			let subscriptionGridName = topics.replace('Path', 'Grid');		
			self.get('subpubService').publish( subscriptionGridName, gridViewData, self);		
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
			
			//published by clicking on All Tasks on breadcrumb 
			if(path.label === 'All Tasks'){ 
				data['stat'] = 'overView'; 
				data['linkToView'] = '';				
			}			
		
			//update breadcrumb
			this.updateBreadcrumbs(path);
			
			//update grid view
			this.get('subpubService').publish(  this.get('subscriptionNameGrid') + '/update' , data , this);
						
		},
		updateGrid(searchData){  //tigger by clicking on  datetime-view's search button 

			let handleGridViewData = this.get('handleGridViewData');	
			
			if(searchData!==undefined && searchData.mode ===1){
				this.set('searchData', searchData);
			}else{
				this.set('searchData', {});
				this.set('mode', 0);
			}
			
			// update the grid view
			this.get('subpubService').publish(  this.get('subscriptionNamePath') + '/update' , handleGridViewData , this);	
			
		}
		
	}	

});
