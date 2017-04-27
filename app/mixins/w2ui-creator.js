import Ember from 'ember';

export default Ember.Mixin.create({
    self: this,
    defaultToolBarItem: [
                            { type: 'break' },
                            { type: 'button', id: 'export-csv', caption: ' <i class="fa fa-file-excel-o" aria-hidden="true"></i> Export' }
                        ],

    toolbarShow:   {  /*** ref http://w2ui.com/web/docs/1.5/w2grid.show to see the the default setting if you dont see we defined values here ***/
                        toolbar: true,         // indicates if toolbar is visible
                        toolbarReload: false,  // indicates if toolbar reload button is visible
                        toolbarColumns: true,  // indicates if toolbar columns button is visible
                        toolbarSearch: false,  // indicates if toolbar search controls are visible
                        footer: true,          // indicates if footer is visible
                        statusResponse: false,
                        statusRecordID: false,
                        expandColumn: false,    // indicates if expand column is visible
                        lineNumbers: false,     // indicates if line numbers column is visible
                        selectColumn: false		// indicates if select column is visible
                    },

    buildGrid: function(gridName, columns, recid, defaultSortConfigArrayObjs=[], toolBar){
        let self = this;

        if (w2ui.hasOwnProperty(gridName)) {
            w2ui[gridName].destroy();
        }

        var initGrid = Ember.$('#'+gridName).w2grid({
            name: gridName,
            recid: recid,
            columns: columns,
            sortData: defaultSortConfigArrayObjs,
            toolbar: toolBar,
            show: this.get('toolbarShow'),
            multiSelect: false,
            reorderColumns: true
        });

        function checkGrid() {
            return new Ember.RSVP.Promise(function (resolve, reject) {
                if (initGrid) {
                    resolve('OK');
                } else {
                    reject(new Error('Error'));
                }
            });
        }
        w2ui[gridName].lock('Loading Fields...', true);
        return checkGrid().then(function () {
            return initGrid;
        });
    },

    loadGridData: function (records, gridName, showTotal, clickableFields=[]) {
        let self = this;
        if(records !== null){
			//clear up grid view records
			w2ui[gridName].clear();

            //Sum up columns and show total if showTotal is true
            if(showTotal !== undefined && showTotal === 1){
                let columnsTotal = this.computedTotals(records);
                if(columnsTotal !=='' ){
                    w2ui[gridName].summary = columnsTotal;
                }
            }

            //Added clickableFields style class on clickableFields
            records.map(function(ele, index){
				for (var key in ele) { 
					// add clickableFields style if it defined on w2ui mapping object
					if( clickableFields.indexOf(key) !==-1 ){ 
						ele[key] = "<span class='clickableFields'>"  + ele[key] + "</span>";
					}
				}
			});
            w2ui[gridName].add(records);
        }
				
        w2ui[gridName].refresh();
        w2ui[gridName].unlock();
    },

	updateClock: function(time, targetObj){
		var self = this;
		let mytime = setInterval( function (){
			time = self.addOneSec(time);
			if( $(targetObj) &&  !self.parentView.showSummary ) {
				$(targetObj).html(time);
			}else{
				clearInterval(mytime);
				Ember.Logger.log("Stop Clock Timer");
			}
		},1000); //calling timer every sec
	},

	addOneSec(time){
		let timeArr = time.split(':');
		for(var i = timeArr.length-1; i >=0; i--){
			if(i==2){
				timeArr[i] = parseInt(timeArr[i])+1; //add 1 sec
			}
			if(timeArr[i] == 60 ) {
				timeArr[i] = '00';
				timeArr[i-1] = parseInt(timeArr[i-1])+1; //add 1 onto the next unit of time when it reachs 60
			}
			if(String(timeArr[i]).length<2){
				timeArr[i] = '0'+ timeArr[i]; //add leading zero when it has less than 2 digits
			}
		};
		return timeArr.join(':')
	},

	computedTotals: function (data){
		if( data && data.length >0 ){

			let returnData= {};
			returnData['w2ui'] = {
								  style: "background-color: #EBEBEB, height: 35px !important,font-family: Omnes_ATT Medium !important, font-weight: 700 !important, font-size: 15px !important, max-height: 38px !important",
								  class: "totals"
							   };

			//loop via data to get total of each columns
			data.map(function(ele, index){
				for (var key in ele) {
					if (ele.hasOwnProperty(key)) {
						let val = ele[key];
			
						if(key === 'recid' ){
							returnData[key] = 'TOTAL';  //only show Total label on the bottom of ID column
						}else{
							//calculate the total on numberic column								
							if( /^\d+$/.test( val ) ){	
								let sum = 0;
								if(returnData[key] !== undefined){
									if ( /^-?\d*\.?\d*$/.test( returnData[key] ) ) {
										sum = parseFloat(returnData[key]) + parseFloat(val);
									} else {
										sum = parseInt(returnData[key]) + parseInt(val);
									}
								}else{
									sum = parseInt(val);
								}
								returnData[key] = sum;					
							} else if ( /^-?\d*\.?\d*$/.test( val ) ) {
								let sum = 0;
								if (returnData[key] != undefined) {
									sum = parseFloat(returnData[key]) + parseFloat(val);
								} else {
									sum = parseFloat(val);
								}
								returnData[key] = sum;
							} else{ 
								returnData[key] = '';
							}
						}						
					}
				}
			});

			return [ returnData ];
		}else{
			return '';
		}
	},

    createToolBar: function (handlerFunction = null, itemsArrayObjs = null) {
        return  {
                    items: itemsArrayObjs || this.get('defaultToolBarItem'),
                    onClick: handlerFunction || this.onClickToolbar
                };
    },

    onClickToolbar: function (event) {
        let gridName = this.owner.name;
        if(event.target === 'w2ui-column-on-off'){
            w2ui[gridName].initColumnOnOff();
            w2ui[gridName].initResize();
            w2ui[gridName].resize();
        } else if (event.target === 'export-csv'){  //create csv files based on current w2ui grid
            w2ui[gridName].lock('Exporting Data ...', true);
            let data = w2ui[gridName].records;
            let columns = w2ui[gridName].columns;
            let header = [], fieldsName=[], emptyRow = [], finalExcelArray = [];

			//add title and UTC time on the header
			function convertGridNameToTitle(gridName) {
				let title = gridName.replace(/_/g,' ');               //Replace _ to white space
				return title.replace(/(^| )(\w)/g, function(x) {      //Capitalizing first letter of each word in string
					return x.toUpperCase();
				});
			}
		
			//set exported title by grid name and breadbrumb path if this is for TM2
			let titleHeader = [ "Data Exported For "  + convertGridNameToTitle(gridName) ];
			let UTCTime = [ "Generated at UTC Time:  " + (new Date()).toUTCString() ];

			finalExcelArray.push(titleHeader);
			finalExcelArray.push(UTCTime);
			finalExcelArray.push(emptyRow);

			//loop via each columns to get header and fields name
            columns.forEach(function(element, index, array) {
				if(element.field !== 'rowID'){  //dont need row ID field
					header.push(element.caption);
					fieldsName.push(element.field);
					emptyRow.push(null);
				}
            });

            finalExcelArray.push(header);
            finalExcelArray.push(emptyRow);

		    //loop via each data to get values on rows
            data.forEach(function(element, index, array) {
                 let row = [];
                 fieldsName.forEach(function(e, i) {
                    let ele = element[e];
					if(ele !== undefined && ele !== null){
						ele = ele.toString();
						ele = ele.replace("<span class='clickableFields'>", "");  //Replace the html code
						ele = ele.replace("</span>", ""); 						  //Replace the html code
					}
                    row.push(ele);
                 });
                finalExcelArray.push(row);
            });

            new Ember.RSVP.Promise(function (resolve, reject) {
                if (export2CSV(finalExcelArray, gridName +"_data")) { //use gridName as file name, we can change format later if need
                    resolve('OK');
                } else {
                    reject(new Error('Error Exporting Data'));
                }
            }).then(()=>w2ui[gridName].unlock());
        }
    },

	getColumns: function (endpointName){
		let extraParams = (this.get('extraParams')?this.get('extraParams'):[]);

	    return this.get('ajaxService').getData(endpointName,extraParams).then((data) => { 
            let columns = data.columns;			
            columns.forEach(function(element, index, array) {	
				columns[index].hideable = false;     //set hideable = 0 by default, so users can change hidden value to show/hide the column field
                columns[index].searchable = true;    //set searchable = 1 by default, so users can use search on the column field
            });
            return columns;
        });
    },

    getRecords:function (endpointName) {

        let self = this;
        let extraParams = (this.get('extraParams')?this.get('extraParams'):[]);		
        return this.get('ajaxService').getData(endpointName,extraParams).then((data) => { 
            return data;
        });
    },

	assignedAttrs(obj){
		this.set('gridName', obj['gridName']);             //grid name for creating wu2i
		this.set('recid', obj['recid']);                   //unique row ID for wu2i
		this.set('columnsService', obj['columnsService']); //api mapping defined on service/request-service
		this.set('recordsService', obj['recordsService']); //api mapping defined on service/request-service
		this.set('extraParams', obj['extraParams']);       //optional, extra params you would like to pass to api above
		this.set('showTotal', obj['showTotal']);           //boolean, determine if we need to show total for numberic columns
		this.set('clickableFields', obj['clickableFields']);   //Array, handle clickable fields to trigger another grid view
		this.set('gadgetID', obj['gadgetID']);            //String, handle gadgetID for getting widget fields
		this.set('ticketSystem', obj['ticketSystem']);      //String, handle ticketSystem for getting different layer of widget fields
		this.set('view', obj['view']);      				//String, handle view for getting different grid view for user
		this.set('columnGroups', obj['columnGroups']);			//Array of String, groups number of columns in grid view
		this.set('alterColumnGroups', obj['alterColumnGroups']);			//Array of column group names whose background color has to be changed
		this.set('alterColumns', obj['alterColumns']);								//Array of column names whose background color has to be changed
		this.set('alterColor', obj['alterColor']);					//color code or name for background color of column
		this.set('refreshTime', (obj['refreshTime']?obj['refreshTime']:5));    //set the refresh time for grid view, use 5 mins as default
		return;
	}
});