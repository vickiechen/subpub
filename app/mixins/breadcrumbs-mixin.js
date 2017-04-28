import Ember from 'ember';

export default Ember.Mixin.create({
	subpubService: Ember.inject.service(),	
	subscription: {},
		
	// Name subscription Names for breadcrumbs and gridview based on the gridViewClass, we will use the same naming convention on breadcrum-mixi.js and grid-view.js
	subscriptionNamePath: Ember.computed('gridViewClass', function () { //must have this property for defining the grid view class and subscription Path
        return 'subscription'+ this.get('gridViewClass') + 'Path'; 
    }),
	
	// Name subscription Names for breadcrumbs and gridview based on the gridViewClass, we will use the same naming convention on breadcrum-mixi.js and grid-view.js
	subscriptionNameGrid: Ember.computed('gridViewClass', function () { //must have this property for defining the grid view class and subscription Path
        return 'subscription'+ this.get('gridViewClass') + 'Grid'; 
    }),
		
	getValueFromGridView: function (rowId, key){
		let gridViewObj = this.get('gridViewObj');	
		let value = '';
		if( w2ui[gridViewObj.gridName] !== undefined && rowId !==undefined ){ 							
			let rowData = w2ui[gridViewObj.gridName].records[ rowId ];			
			value = ( rowData!== undefined? rowData[key]: "");
			value = value.toString().replace( "<span class='clickableFields'>", "").replace("</span>",""); //remove span html style			
		}
		return value;		
	},	
	
	pathArrayObj: [ { label:"OverView", data:{}, layer:1} ], 
	
	updatePath: function (path, scope, layer, data={}){
		
		let pathArrayObj = scope.get('pathArrayObj'), flag = false;

		pathArrayObj.map((obj)=>{
			if(obj.layer === layer){
				Ember.set(obj, 'label' ,"/ "+path);
				flag = true;
			}
		});
		
		if(!flag){
			pathArrayObj.pushObject({ label:"/ "+path, data:data, layer:layer});
		}
		
		pathArrayObj.map((path, index)=>{
			if(path.layer > layer){
				pathArrayObj.splice(index, 1);
			}
		});

		function compare(a,b) {
			if(a.layer < b.layer){
				return -1;
			}
			if(a.layer > b.layer){
				return 1;
			}
			return 0;
		}
		pathArrayObj.sort(compare);
		
		if ( !(scope.get('isDestroyed') || scope.get('isDestroying')) ) {
			scope.set('pathArrayObj',pathArrayObj);
		}else{
			Ember.Logger.log('scope for updating pathArrayObj is destored. Cant not update breadcrumbs now!');			
		}		
	},

	updateBreadcrumbs(path){ 
		let pathArrayObj = [];
		this.get('pathArrayObj').map((obj)=>{
			if( obj.layer < path.layer || obj.layer === path.layer ){
				pathArrayObj.push( obj );
			}
		});								
		this.set('pathArrayObj' , pathArrayObj);
		
	}
	
});