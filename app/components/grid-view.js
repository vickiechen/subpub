import Ember from 'ember';
import gridCreatorMixin from '../mixins/w2ui-creator';
const {computed,run} = Ember;

export default Ember.Component.extend(gridCreatorMixin,{
	ajaxService: Ember.inject.service(),
	subpubService: Ember.inject.service(),
	
	recid: 0,
	columnsService: '',
	recordsService: '',
	clickableFields:  [],//handle clickable fields to trigger another grid view, value will be passed by its parents grid view object
	columnGroups: [],
	gridHeight: '400px', // by default
	gridWidth: '98%',    // by default
	refreshTime: 3,      //set refresh time to 3 minutes by defaut
	nextTick: null,
	
	gridViewStyle: Ember.computed('gridHeight','gridWidth', function() {
		let height = this.get('gridHeight');
		let width = this.get('gridWidth');
		return Ember.String.htmlSafe('height:' + height+"; width:"+width);
	}),

	defaultSortConfigArrayObjs: [{
                field: 'TroubleReported',
                direction: 'dsc'
			},{
                field: 'System',
                direction: 'dsc'
            }],

	didReceiveAttrs() {
		this._super(...arguments); 
		
		// assigned object values into ember attributes
		this.assignedAttrs(this.get('gridViewObj'));	

		// create grid view based on gridViewObj passed from its parent	
		this.createGridView();
		
		// stop previour timer if any
		//this.stopRefreshTimer(); 
		
		//start refresh timer based on the refreshTime for this user
		//this.refreshTimerData();
	},

	refreshTimerData:function(){
		var self = this;
		var refreshTime = self.get('refreshTime') * 1000 * 60;
		self.set('nextTick',run.later(function(){ 
		  	if(!(self.get('isDestroyed') || self.get('isDestroying'))  ){		
				//Ember.Logger.log('Refresh timer for ', self.get('gridName'), 'Get Grid View Data');
				self.createGridView();
				self.refreshTimerData(); // repeat
			}
        }, parseInt(refreshTime) ));
	},
	
	alterColumnGroupColor: function(alterColumnGroups, alterColor) {
		let gridName = this.get('gridName');
		if(alterColumnGroups!==undefined && alterColumnGroups.length >0){
			for (let i = 0; i < alterColumnGroups.length; i++ ){
				let colGrps = Ember.$('#'+ gridName).find('.w2ui-col-group');
				colGrps.each(function (index, element){
					let groupName = Ember.$(this).text().trim();
					if(groupName === alterColumnGroups[i] ){
						Ember.$(this).parent('.w2ui-head').addClass("customColumnStyle"+alterColor);
					}
					if((colGrps.length - 1) === index) {
						Ember.$(this).parent('.w2ui-head').addClass("customColumnStyle" + "EAEAEA");
					}
				});
			}
		}
	},
	
	alterColumnColor: function(alterColumns, alterColor) {
		let gridName = this.get('gridName');
		if(alterColumns!==undefined && alterColumns.length >0){
			for (let i = 0; i < alterColumns.length; i++ ){
				let colGrps = Ember.$('#'+ gridName).find('.w2ui-col-header');
				colGrps.each(function (index, element){
					let groupName = Ember.$(this).text().trim();
					if(groupName === alterColumns[i] ){
						Ember.$(this).parent('.w2ui-head').addClass("customColumnStyle"+alterColor);
					}
					Ember.$('.w2ui-head-last').addClass("customColumnStyle" + "EAEAEA");
				});
			}
		}
	},
	
	createGridView: function() {

		// check if object exist, if no, return and do nothing
		if(this.get('gridViewObj') === null){
			Ember.Logger.log("No Grid Object defined!");
			return;
		}

	    let self = this;
		let gridName = this.get('gridName'),
		    recid = this.get('recid'),
			defaultSortConfigArrayObjs = this.get('defaultSortConfigArrayObjs'),
			columnsService = this.get('columnsService'),
			recordsService = this.get('recordsService'),
			showTotal = this.get('showTotal'),
			clickableFields = this.get('clickableFields'),
			columnGroups = this.get('columnGroups');
			
		// get columns for this wu2i grid 
		this.getColumns(columnsService).then((columns) => { 

			//this update in the column configuration is just with test purposes, can be deleted
			columns.map((column)=>{
				column.hideable = true;
			});

			//let toolBar = self.createToolBar(handlerFunction); to pass our own handlerFunction
			let toolBar = self.createToolBar();

			// build grid based on columns

			self.buildGrid(gridName, columns, recid, defaultSortConfigArrayObjs, toolBar ).then((divGrid) => { 			
			
				//assign columnGroups to divGrid if present
				if (columnGroups!== undefined && columnGroups.length > 0) {
					divGrid.columnGroups = columnGroups;
				}
				
				self.getRecords(recordsService).then((records) => { 
					// show empty rows when there is no data returned from endpoint or has errorMsg
					if(records === undefined){
						records = [];
						if(records.errorMsg !== undefined){
							Ember.Logger.log('Error Message: ' + records.errorMsg);
						}else{
							Ember.Logger.log('No apiData returned from ' + gridName);
						}
					}

					// load grid data to this grid
					self.loadGridData(records.data,gridName,showTotal,clickableFields);

					
					// customize the wu2i onclick function for this grid  
					divGrid.__proto__.onClick = (event)=>{ 
						//will trigger another gridview by this event, probably will call action setGridObj(gridName) on its parent (tab component) to load another grid view, will implement this after we got other gridview mapping ready!
						let cellColumnNumber = event.column,
							cellColumnName = (divGrid.columns[cellColumnNumber] && divGrid.columns[cellColumnNumber].caption) || false,
							cellFieldName = (divGrid.columns[cellColumnNumber] && divGrid.columns[cellColumnNumber].field) || false;

						if( cellColumnName ){
						    event.onComplete = function () {
								let cellValue = event.originalEvent.target.innerText,
									finalSelectionObject = 	{
																column: cellColumnName,
																value: cellValue,
																rowId : event.recid,
																record : this.get(event.recid)

                					};

							    if( clickableFields.indexOf(cellFieldName) !==-1 ){ //only publish for clickableFields
									//subscription path name need to be same as naming convention from the subscription defined on grid view component!
									let subscriptionNamePath = 'subscription'+ event.target + 'Path/update';
									self.get('subpubService').publish( subscriptionNamePath, finalSelectionObject, self );
								}
						    };		
								
						}
					};


					// customize the wu2i onExpand function for this grid
					divGrid.__proto__.onExpand = (event)=>{

						// show text data in 3 columns, to be cutomized later if needed.
						let record = divGrid.get(event.recid),
							details = record.Details,
							newHTMLArray = [],
							height = '';

							$.each(details, function(i,e){
							  newHTMLArray.push ('<strong>'+ e.caption + ': </strong><span>'+ e.value +'</span><br>');
							});

							height = Math.round(((details.length/3)*16)+40);
							var newHTMLStr = '<div class="mdb2-child-row" style="height: '+ height +'px">'+ newHTMLArray.join("") +'</div>';
							$('#'+event.box_id).html(newHTMLStr);
					};


					// customize the wu2i onColumnDragStart function for this grid
					divGrid.__proto__.onColumnDragStart = (event)=>{
						$('.cell').addClass('noselect'); // disable selecting other element when dragging a column
					};

					// customize the wu2i onColumnDragEnd function for this grid
					divGrid.__proto__.onColumnDragEnd = (event)=>{
						event.onComplete = function () {
							$('.cell').removeClass('noselect');

							let newColumns = divGrid.columns;
							for(var i=0; i<newColumns.length; i++){
								newColumns[i].order = i;
							}
							var newColumnsJSON = JSON.stringify(newColumns);

							let extraParams = {
								newColumns: newColumnsJSON,
								view: (newColumns[0].screen_view!==undefined?newColumns[0].screen_view:'full')
							};
							
							//calling a function to alter ColumnGroup CSS class TM2-150 "TaskMaster Hourly Detail View"
							self.alterColumnGroupColor(self.get('alterColumnGroups'), self.get('alterColor'));
							
							//calling a function to alter Column CSS class TM2-150 "TaskMaster Hourly Detail View"
							self.alterColumnColor(self.get('alterColumns'), self.get('alterColor'));
							
						}
					};

					// customize the wu2i onColumnOnOff function for this grid??
					divGrid.__proto__.onColumnOnOff = (event)=>{
						event.onComplete = function () {
							var fieldID = '';
							var order = '';
							var action = '';
							var column = w2ui[gridName].getColumn(event.field);
							var columns = divGrid.columns;

							for(var i=0; i<columns.length; i++){
								if(columns[i].field === column.field){
									fieldID = columns[i]['widget_field_id'];
									order = columns[i]['order'];
									view = (columns[i]['screen_view']!==undefined?columns[i]['screen_view']:'full');
								}
							}

							if(column.hidden){
								action = 1; //hidden = true
							} else {
								action = 0; //hidden = false
							}
							
							//calling a function to alter ColumnGroup CSS class TM2-150 "TaskMaster Hourly Detail View"
							self.alterColumnGroupColor(self.get('alterColumnGroups'), self.get('alterColor'));
							
							//calling a function to alter Column CSS class TM2-150 "TaskMaster Hourly Detail View"
							self.alterColumnColor(self.get('alterColumns'), self.get('alterColor'));
							
						};
					};
					
					//calling a function to alter ColumnGroup CSS class TM2-150 "TaskMaster Hourly Detail View"
					this.alterColumnGroupColor(this.get('alterColumnGroups'), this.get('alterColor'));
					
					//calling a function to alter Column CSS class TM2-150 "TaskMaster Hourly Detail View"
					this.alterColumnColor(this.get('alterColumns'), this.get('alterColor'));
					
					//Start Clock Timer when grid view loaded, need to add class name that needs update clock feature into updateClockFields array below 		
					let updateClockFields = [];
					for (let i in updateClockFields){
						$('.'+ updateClockFields[i]).each(function (index, element){
							let time = $(this).html();
							self.updateClock(time, this);
						});
					}
				});
			});
        });
    },
	stopRefreshTimer: function () {
        run.cancel(this.get('nextTick'));
        this.set('nextTick', null);
    },
});