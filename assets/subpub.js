"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('subpub/app', ['exports', 'ember', 'subpub/resolver', 'ember-load-initializers', 'subpub/config/environment'], function (exports, _ember, _subpubResolver, _emberLoadInitializers, _subpubConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _subpubConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _subpubConfigEnvironment['default'].podModulePrefix,
    Resolver: _subpubResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _subpubConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('subpub/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'subpub/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _subpubConfigEnvironment) {

  var name = _subpubConfigEnvironment['default'].APP.name;
  var version = _subpubConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('subpub/components/bread-crumb', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Component.extend({
		pathID: _ember['default'].computed('gridViewClass', function () {
			//must have this property for defining the grid view class and subscription Path
			return "breadcrumb_" + this.get('gridViewClass');
		}),

		actions: {
			updatePath: function updatePath(path) {
				this.sendAction('updatePath', path);
			}
		}
	});
});
define('subpub/components/gadget-sample', ['exports', 'ember', 'subpub/mixins/breadcrumbs-mixin'], function (exports, _ember, _subpubMixinsBreadcrumbsMixin) {
	exports['default'] = _ember['default'].Component.extend(_subpubMixinsBreadcrumbsMixin['default'], {
		subpubService: _ember['default'].inject.service(),
		linkToView: 'Test',
		gridViewClass: _ember['default'].computed('linkToView', function () {
			return this.get('linkToView') + 'DetailView';
		}),
		gridObjMapping: _ember['default'].computed('widget_id', function () {
			return {
				'TestDetailView': {
					gridName: 'TestDetailView',
					recid: 'recid',
					columnsService: 'getTestColumns',
					recordsService: 'getTestData',
					showTotal: 1,
					clickableFields: ['order_number'], //handle clickable fields to trigger another grid view
					view: 'detail',
					refreshTime: 3
				},
				'Test1DetailView': {
					gridName: 'Test1DetailView',
					recid: 'recid',
					columnsService: 'getTestColumns1',
					recordsService: 'getTestData1',
					showTotal: 1,
					clickableFields: [], //handle clickable fields to trigger another grid view
					view: 'detail',
					refreshTime: 3
				}
			};
		}),
		setGridObj: function setGridObj(gridName, extraParams) {
			var gridMapping = this.get('gridObjMapping');
			if (gridMapping[gridName]) {
				var gridViewObj = gridMapping[gridName];

				if (extraParams !== undefined && Object.keys(extraParams).length !== 0) {
					gridViewObj.extraParams = extraParams;
				}
				this.set('gridViewObj', gridViewObj);
			} else {
				_ember['default'].Logger.log("No Grid View found on Mapping!");
			}
		},
		handleGridView: function handleGridView(topics, data, scope) {

			var self = this.scope;

			//switch to grid view based on the linkToView
			if (data.linkToView !== undefined) {
				self.set('linkToView', data.linkToView);
			}

			//empty gridView object
			self.set('gridViewObj', {});

			//create a new gridView object
			self.setGridObj(self.get('gridViewClass'), data);
		},

		pathLayers: {
			'Test': 1,
			'Test1': 2
		},

		handleGridViewNPath: function handleGridViewNPath(topics, data, scope) {
			var self = this.scope;
			var pathLayers = self.get('pathLayers');

			if (data) {
				self.propertyWillChange('pathArrayObj');

				/*** update the subscripted path ***/
				if (data.column) {
					//published by clicking on ID inside of Grid View				

					switch (data.column) {
						case "Order Number":
							data['linkToView'] = 'Test1';
							data['orderNumber'] = data.value;
							self.updatePath(data.value, self, pathLayers.Test1, data);
							break;
						default:
							self.updatePath(data.value, self, pathLayers.Test, data);
							break;
					}
				}

				self.propertyDidChange('pathArrayObj');

				/*** update the subscripted grid view ***/
				var subscriptionGridName = topics.replace('Path', 'Grid');
				self.get('subpubService').publish(subscriptionGridName, data, self);
			}
		},
		init: function init() {
			this._super.apply(this, arguments);

			// Set grid view object based on the gridViewClass
			this.setGridObj(this.get('gridViewClass'));

			// Subscribers onClick events and its handler functions for all gridObjetMapping
			var gridMapping = this.get('gridObjMapping');
			for (var key in gridMapping) {
				this.get('subpubService').subscribe('subscription' + key + 'Path/update', this.handleGridViewNPath, this);
				this.get('subpubService').subscribe('subscription' + key + 'Grid/update', this.handleGridView, this);
			}
		},

		actions: {
			updatePath: function updatePath(path) {
				//tigger by clicking on breadcrumb

				var data = path.data;

				//published by clicking on OverView on breadcrumb
				if (path.label === 'OverView') {
					data['linkToView'] = 'Test';
				}

				//update breadcrumb
				this.updateBreadcrumbs(path);

				//update grid view
				this.get('subpubService').publish(this.get('subscriptionNameGrid') + '/update', data, this);
			},
			updateGrid: function updateGrid() {

				var handleGridViewData = this.get('handleGridViewData');

				// update the grid view
				this.get('subpubService').publish(this.get('subscriptionNamePath') + '/update', handleGridViewData, this);
			}
		}

	});
});
define('subpub/components/grid-view', ['exports', 'ember', 'subpub/mixins/w2ui-creator'], function (exports, _ember, _subpubMixinsW2uiCreator) {
	var run = _ember['default'].run;
	exports['default'] = _ember['default'].Component.extend(_subpubMixinsW2uiCreator['default'], {
		ajaxService: _ember['default'].inject.service(),
		subpubService: _ember['default'].inject.service(),

		recid: 0,
		columnsService: '',
		recordsService: '',
		clickableFields: [], //handle clickable fields to trigger another grid view, value will be passed by its parents grid view object
		columnGroups: [],
		gridHeight: '400px', // by default
		gridWidth: '98%', // by default
		refreshTime: 3, //set refresh time to 3 minutes by defaut
		nextTick: null,

		gridViewStyle: _ember['default'].computed('gridHeight', 'gridWidth', function () {
			var height = this.get('gridHeight');
			var width = this.get('gridWidth');
			return _ember['default'].String.htmlSafe('height:' + height + "; width:" + width);
		}),

		defaultSortConfigArrayObjs: [{
			field: 'TroubleReported',
			direction: 'dsc'
		}, {
			field: 'System',
			direction: 'dsc'
		}],

		didReceiveAttrs: function didReceiveAttrs() {
			this._super.apply(this, arguments);

			// assigned object values into ember attributes
			this.assignedAttrs(this.get('gridViewObj'));

			// create grid view based on gridViewObj passed from its parent	
			this.createGridView();

			// stop previour timer if any
			this.stopRefreshTimer();

			//start refresh timer based on the refreshTime for this user
			this.refreshTimerData();
		},

		refreshTimerData: function refreshTimerData() {
			var self = this;
			var refreshTime = self.get('refreshTime') * 100 * 60;
			self.set('nextTick', run.later(function () {
				if (!(self.get('isDestroyed') || self.get('isDestroying'))) {
					_ember['default'].Logger.log('Refresh timer for ', self.get('gridName'), 'Get Grid View Data');
					self.createGridView();
					self.refreshTimerData(); // repeat
				}
			}, parseInt(refreshTime)));
		},

		createGridView: function createGridView() {

			// check if object exist, if no, return and do nothing
			if (this.get('gridViewObj') === null) {
				_ember['default'].Logger.log("No Grid Object defined!");
				return;
			}

			var self = this;
			var gridName = this.get('gridName'),
			    recid = this.get('recid'),
			    defaultSortConfigArrayObjs = this.get('defaultSortConfigArrayObjs'),
			    columnsService = this.get('columnsService'),
			    recordsService = this.get('recordsService'),
			    showTotal = this.get('showTotal'),
			    clickableFields = this.get('clickableFields'),
			    columnGroups = this.get('columnGroups');

			// get columns for this wu2i grid
			this.getColumns(columnsService).then(function (columns) {

				self.set('gridColumns', columns);

				//this update in the column configuration is just with test purposes, can be deleted
				columns.map(function (column) {
					column.hideable = true;
				});

				//let toolBar = self.createToolBar(handlerFunction); to pass our own handlerFunction
				var toolBar = self.createToolBar();

				// build grid based on columns

				self.buildGrid(gridName, columns, recid, defaultSortConfigArrayObjs, toolBar).then(function (divGrid) {

					//assign columnGroups to divGrid if present
					if (columnGroups !== undefined && columnGroups.length > 0) {
						divGrid.columnGroups = columnGroups;
					}

					self.getRecords(recordsService).then(function (records) {
						// show empty rows when there is no data returned from endpoint or has errorMsg
						if (records === undefined) {
							records = [];
							if (records.errorMsg !== undefined) {
								_ember['default'].Logger.log('Error Message: ' + records.errorMsg);
							} else {
								_ember['default'].Logger.log('No apiData returned from ' + gridName);
							}
						}

						/***since we can not filter out data by passed params in json file, so I have to manully add this condition on json return for testData2 layer. This code should be removed if we have api services ***/
						if (records.data) {
							records = records.data;
						} else {
							var params = self.get('extraParams') ? self.get('extraParams') : [];
							records = records[params.value];
						}
						/*** END Testing ***/

						// load grid data to this grid
						self.loadGridData(records, gridName, showTotal, clickableFields);

						// customize the wu2i onclick function for this grid 
						Object.getPrototypeOf(divGrid).onClick = function (event) {
							//will trigger another gridview by this event, probably will call action setGridObj(gridName) on its parent (tab component) to load another grid view, will implement this after we got other gridview mapping ready!
							var cellColumnNumber = event.column,
							    cellColumnName = divGrid.columns[cellColumnNumber] && divGrid.columns[cellColumnNumber].caption || false,
							    cellFieldName = divGrid.columns[cellColumnNumber] && divGrid.columns[cellColumnNumber].field || false;

							if (cellColumnName) {
								event.onComplete = function () {
									var cellValue = event.originalEvent.target.innerText,
									    finalSelectionObject = {
										column: cellColumnName,
										value: cellValue,
										rowId: event.recid,
										record: this.get(event.recid)

									};

									if (clickableFields.indexOf(cellFieldName) !== -1) {
										//only publish for clickableFields
										//subscription path name need to be same as naming convention from the subscription defined on grid view component!
										var subscriptionNamePath = 'subscription' + event.target + 'Path/update';
										self.get('subpubService').publish(subscriptionNamePath, finalSelectionObject, self);
									}
								};
							}
						};

						// customize the wu2i onExpand function for this grid
						Object.getPrototypeOf(divGrid).onExpand = function (event) {
							// show text data in 3 columns, to be cutomized later if needed.
							var record = divGrid.get(event.recid),
							    details = record.Details,
							    newHTMLArray = [],
							    height = '';

							_ember['default'].$.each(details, function (i, e) {
								newHTMLArray.push('<strong>' + e.caption + ': </strong><span>' + e.value + '</span><br>');
							});

							height = Math.round(details.length / 3 * 16 + 40);
							var newHTMLStr = '<div class="grid-child-row" style="height: ' + height + 'px">' + newHTMLArray.join("") + '</div>';
							_ember['default'].$('#' + event.box_id).html(newHTMLStr);
						};

						// customize the wu2i onColumnDragStart function for this grid
						Object.getPrototypeOf(divGrid).onColumnDragStart = function (event) {
							_ember['default'].$('.cell').addClass('noselect'); // disable selecting other element when dragging a column
							_ember['default'].Logger.log('Action Trigger on onColumnDragStart !', event);
						};

						// customize the wu2i onColumnDragEnd function for this grid
						Object.getPrototypeOf(divGrid).onColumnDragEnd = function (event) {
							event.onComplete = function () {
								_ember['default'].$('.cell').removeClass('noselect');

								var newColumns = divGrid.columns;
								for (var i = 0; i < newColumns.length; i++) {
									newColumns[i].order = i;
								}
								_ember['default'].Logger.log('newColumns can be stored to DB for ordering!');
							};
						};

						// customize the wu2i onColumnOnOff function for this grid??
						Object.getPrototypeOf(divGrid).onColumnOnOff = function (event) {
							event.onComplete = function () {
								_ember['default'].Logger.log('Action Trigger on onColumnOnOff !');
							};
						};

						var updateClockFields = [];
						for (var i in updateClockFields) {
							_ember['default'].$('.' + updateClockFields[i]).each(function () {
								var time = _ember['default'].$(this).html();
								self.updateClock(time, this);
							});
						}
					});
				});
			});
		},
		stopRefreshTimer: function stopRefreshTimer() {
			run.cancel(this.get('nextTick'));
			this.set('nextTick', null);
		}
	});
});
define('subpub/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('subpub/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('subpub/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'subpub/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _subpubConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_subpubConfigEnvironment['default'].APP.name, _subpubConfigEnvironment['default'].APP.version)
  };
});
define('subpub/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('subpub/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('subpub/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('subpub/initializers/export-application-global', ['exports', 'ember', 'subpub/config/environment'], function (exports, _ember, _subpubConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_subpubConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _subpubConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_subpubConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('subpub/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('subpub/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('subpub/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("subpub/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('subpub/mixins/breadcrumbs-mixin', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Mixin.create({
		subpubService: _ember['default'].inject.service(),
		subscription: {},

		// Name subscription Names for breadcrumbs and gridview based on the gridViewClass, we will use the same naming convention on breadcrum-mixi.js and grid-view.js
		subscriptionNamePath: _ember['default'].computed('gridViewClass', function () {
			//must have this property for defining the grid view class and subscription Path
			return 'subscription' + this.get('gridViewClass') + 'Path';
		}),

		// Name subscription Names for breadcrumbs and gridview based on the gridViewClass, we will use the same naming convention on breadcrum-mixi.js and grid-view.js
		subscriptionNameGrid: _ember['default'].computed('gridViewClass', function () {
			//must have this property for defining the grid view class and subscription Path
			return 'subscription' + this.get('gridViewClass') + 'Grid';
		}),

		getValueFromGridView: function getValueFromGridView(rowId, key) {
			var gridViewObj = this.get('gridViewObj');
			var value = '';
			if (w2ui[gridViewObj.gridName] !== undefined && rowId !== undefined) {
				var rowData = w2ui[gridViewObj.gridName].records[rowId];
				value = rowData !== undefined ? rowData[key] : "";
				value = value.toString().replace("<span class='clickableFields'>", "").replace("</span>", ""); //remove span html style			
			}
			return value;
		},

		pathArrayObj: [{ label: "OverView", data: {}, layer: 1 }],

		updatePath: function updatePath(path, scope, layer) {
			var data = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

			var pathArrayObj = scope.get('pathArrayObj'),
			    flag = false;

			pathArrayObj.map(function (obj) {
				if (obj.layer === layer) {
					_ember['default'].set(obj, 'label', "/ " + path);
					flag = true;
				}
			});

			if (!flag) {
				pathArrayObj.pushObject({ label: "/ " + path, data: data, layer: layer });
			}

			pathArrayObj.map(function (path, index) {
				if (path.layer > layer) {
					pathArrayObj.splice(index, 1);
				}
			});

			function compare(a, b) {
				if (a.layer < b.layer) {
					return -1;
				}
				if (a.layer > b.layer) {
					return 1;
				}
				return 0;
			}
			pathArrayObj.sort(compare);

			if (!(scope.get('isDestroyed') || scope.get('isDestroying'))) {
				scope.set('pathArrayObj', pathArrayObj);
			} else {
				_ember['default'].Logger.log('scope for updating pathArrayObj is destored. Cant not update breadcrumbs now!');
			}
		},

		updateBreadcrumbs: function updateBreadcrumbs(path) {
			var pathArrayObj = [];
			this.get('pathArrayObj').map(function (obj) {
				if (obj.layer < path.layer || obj.layer === path.layer) {
					pathArrayObj.push(obj);
				}
			});
			this.set('pathArrayObj', pathArrayObj);
		}

	});
});
define('subpub/mixins/w2ui-creator', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Mixin.create({
		self: this,
		defaultToolBarItem: [{ type: 'break' }, { type: 'button', id: 'export-csv', caption: ' <i class="fa fa-file-excel-o" aria-hidden="true"></i> Export' }],

		toolbarShow: { /*** ref http://w2ui.com/web/docs/1.5/w2grid.show to see the the default setting if you dont see we defined values here ***/
			toolbar: true, // indicates if toolbar is visible
			toolbarReload: false, // indicates if toolbar reload button is visible
			toolbarColumns: true, // indicates if toolbar columns button is visible
			toolbarSearch: false, // indicates if toolbar search controls are visible
			footer: true, // indicates if footer is visible
			statusResponse: false,
			statusRecordID: false,
			expandColumn: false, // indicates if expand column is visible
			lineNumbers: false, // indicates if line numbers column is visible
			selectColumn: false // indicates if select column is visible
		},

		buildGrid: function buildGrid(gridName, columns, recid, defaultSortConfigArrayObjs, toolBar) {
			if (w2ui.hasOwnProperty(gridName)) {
				w2ui[gridName].destroy();
			}

			var initGrid = _ember['default'].$('#' + gridName).w2grid({
				name: gridName,
				recid: recid,
				columns: columns,
				sortData: defaultSortConfigArrayObjs !== undefined ? defaultSortConfigArrayObjs : [],
				toolbar: toolBar,
				show: this.get('toolbarShow'),
				multiSelect: false,
				reorderColumns: true
			});

			function checkGrid() {
				return new _ember['default'].RSVP.Promise(function (resolve, reject) {
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

		loadGridData: function loadGridData(records, gridName, showTotal) {
			var clickableFields = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

			if (records !== null) {
				//clear up grid view records
				w2ui[gridName].clear();

				//Sum up columns and show total if showTotal is true
				if (showTotal !== undefined && showTotal === 1) {
					var columnsTotal = this.computedTotals(records);
					if (columnsTotal !== '') {
						w2ui[gridName].summary = columnsTotal;
					}
				}

				//Added clickableFields style class on clickableFields
				records.map(function (ele) {
					for (var key in ele) {
						// add clickableFields style if it defined on w2ui mapping object
						if (clickableFields.indexOf(key) !== -1) {
							ele[key] = "<span class='clickableFields'>" + ele[key] + "</span>";
						}
					}
				});
				w2ui[gridName].add(records);
			}

			w2ui[gridName].refresh();
			w2ui[gridName].unlock();
		},

		updateClock: function updateClock(time, targetObj) {
			var self = this;
			var mytime = setInterval(function () {
				time = self.addOneSec(time);
				if (_ember['default'].$(targetObj) && !self.parentView.showSummary) {
					_ember['default'].$(targetObj).html(time);
				} else {
					clearInterval(mytime);
					_ember['default'].Logger.log("Stop Clock Timer");
				}
			}, 1000); //calling timer every sec
		},

		addOneSec: function addOneSec(time) {
			var timeArr = time.split(':');
			for (var i = timeArr.length - 1; i >= 0; i--) {
				if (i === 2) {
					timeArr[i] = parseInt(timeArr[i]) + 1; //add 1 sec
				}
				if (timeArr[i] === 60) {
					timeArr[i] = '00';
					timeArr[i - 1] = parseInt(timeArr[i - 1]) + 1; //add 1 onto the next unit of time when it reachs 60
				}
				if (String(timeArr[i]).length < 2) {
					timeArr[i] = '0' + timeArr[i]; //add leading zero when it has less than 2 digits
				}
			}
			return timeArr.join(':');
		},

		computedTotals: function computedTotals(data) {
			var _this = this;

			if (data && data.length > 0) {
				var _ret = (function () {

					var returnData = {};
					returnData['w2ui'] = {
						style: "background-color: #EBEBEB, height: 35px !important,font-family: Omnes_ATT Medium !important, font-weight: 700 !important, font-size: 15px !important, max-height: 38px !important",
						'class': "totals"
					};

					var computedColumns = [];
					_this.get('gridColumns').forEach(function (e) {
						if (e.getTotal) {
							computedColumns.push(e.field);
						}
					});

					//loop via data to get total of each columns
					data.map(function (ele) {
						for (var key in ele) {
							if (ele.hasOwnProperty(key)) {
								var val = ele[key];

								if (key === 'recid') {
									returnData[key] = 'TOTAL'; //only show Total label on the bottom of ID column
								} else if (computedColumns.indexOf(key) !== -1) {
										//calculate the total on numberic column								
										if (/^\d+$/.test(val)) {
											var sum = 0;
											if (returnData[key] !== undefined) {
												if (/^-?\d*\.?\d*$/.test(returnData[key])) {
													sum = parseFloat(returnData[key]) + parseFloat(val);
												} else {
													sum = parseInt(returnData[key]) + parseInt(val);
												}
											} else {
												sum = parseInt(val);
											}
											returnData[key] = sum;
										} else if (/^-?\d*\.?\d*$/.test(val)) {
											var sum = 0;
											if (returnData[key] !== undefined) {
												sum = parseFloat(returnData[key]) + parseFloat(val);
											} else {
												sum = parseFloat(val);
											}
											returnData[key] = sum;
										} else {
											returnData[key] = '';
										}
									}
							}
						}
					});

					return {
						v: [returnData]
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			} else {
				return '';
			}
		},

		createToolBar: function createToolBar() {
			var handlerFunction = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			var itemsArrayObjs = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return {
				items: itemsArrayObjs || this.get('defaultToolBarItem'),
				onClick: handlerFunction || this.onClickToolbar
			};
		},

		convertGridNameToTitle: function convertGridNameToTitle(gridName) {
			var title = gridName.replace(/_/g, ' '); //Replace _ to white space
			return title.replace(/(^| )(\w)/g, function (x) {
				//Capitalizing first letter of each word in string
				return x.toUpperCase();
			});
		},

		onClickToolbar: function onClickToolbar(event) {
			var _this2 = this;

			var gridName = this.owner.name;
			if (event.target === 'w2ui-column-on-off') {
				w2ui[gridName].initColumnOnOff();
				w2ui[gridName].initResize();
				w2ui[gridName].resize();
			} else if (event.target === 'export-csv') {
				(function () {
					//create csv files based on current w2ui grid
					w2ui[gridName].lock('Exporting Data ...', true);
					var data = w2ui[gridName].records;
					var columns = w2ui[gridName].columns;
					var header = [],
					    fieldsName = [],
					    emptyRow = [],
					    finalExcelArray = [];

					//set exported title by grid name and breadbrumb path if this is for TM2
					var titleHeader = ["Data Exported For " + _this2.convertGridNameToTitle(gridName)];
					var UTCTime = ["Generated at UTC Time:  " + new Date().toUTCString()];

					finalExcelArray.push(titleHeader);
					finalExcelArray.push(UTCTime);
					finalExcelArray.push(emptyRow);

					//loop via each columns to get header and fields name
					columns.forEach(function (element) {
						if (element.field !== 'rowID') {
							//dont need row ID field
							header.push(element.caption);
							fieldsName.push(element.field);
							emptyRow.push(null);
						}
					});

					finalExcelArray.push(header);
					finalExcelArray.push(emptyRow);

					//loop via each data to get values on rows
					data.forEach(function (element) {
						var row = [];
						fieldsName.forEach(function (e) {
							var ele = element[e];
							if (ele !== undefined && ele !== null) {
								ele = ele.toString();
								ele = ele.replace("<span class='clickableFields'>", ""); //Replace the html code
								ele = ele.replace("</span>", ""); //Replace the html code
							}
							row.push(ele);
						});
						finalExcelArray.push(row);
					});

					new _ember['default'].RSVP.Promise(function (resolve, reject) {
						if (export2CSV(finalExcelArray, gridName + "_data")) {
							//use gridName as file name, we can change format later if need
							resolve('OK');
						} else {
							reject(new Error('Error Exporting Data'));
						}
					}).then(function () {
						return w2ui[gridName].unlock();
					});
				})();
			}
		},

		getColumns: function getColumns(endpointName) {
			var extraParams = this.get('extraParams') ? this.get('extraParams') : [];

			return this.get('ajaxService').getData(endpointName, extraParams).then(function (data) {
				var columns = data.columns;
				columns.forEach(function (element, index) {
					columns[index].hideable = false; //set hideable = 0 by default, so users can change hidden value to show/hide the column field
					columns[index].searchable = true; //set searchable = 1 by default, so users can use search on the column field
				});
				return columns;
			});
		},

		getRecords: function getRecords(endpointName) {
			var extraParams = this.get('extraParams') ? this.get('extraParams') : [];
			return this.get('ajaxService').getData(endpointName, extraParams).then(function (data) {
				return data;
			});
		},

		assignedAttrs: function assignedAttrs(obj) {
			this.set('gridName', obj['gridName']); //grid name for creating wu2i
			this.set('recid', obj['recid']); //unique row ID for wu2i
			this.set('columnsService', obj['columnsService']); //api mapping defined on service/request-service
			this.set('recordsService', obj['recordsService']); //api mapping defined on service/request-service
			this.set('extraParams', obj['extraParams']); //optional, extra params you would like to pass to api above
			this.set('showTotal', obj['showTotal']); //boolean, determine if we need to show total for numberic columns
			this.set('clickableFields', obj['clickableFields']); //Array, handle clickable fields to trigger another grid view
			this.set('gadgetID', obj['gadgetID']); //String, handle gadgetID for getting widget fields
			this.set('ticketSystem', obj['ticketSystem']); //String, handle ticketSystem for getting different layer of widget fields
			this.set('view', obj['view']); //String, handle view for getting different grid view for user
			this.set('columnGroups', obj['columnGroups']); //Array of String, groups number of columns in grid view
			this.set('alterColumnGroups', obj['alterColumnGroups']); //Array of column group names whose background color has to be changed
			this.set('alterColumns', obj['alterColumns']); //Array of column names whose background color has to be changed
			this.set('alterColor', obj['alterColor']); //color code or name for background color of column
			this.set('refreshTime', obj['refreshTime'] ? obj['refreshTime'] : 5); //set the refresh time for grid view, use 5 mins as default
			return;
		}
	});
});
define('subpub/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('subpub/router', ['exports', 'ember', 'subpub/config/environment'], function (exports, _ember, _subpubConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _subpubConfigEnvironment['default'].locationType,
    rootURL: _subpubConfigEnvironment['default'].rootURL
  });

  Router.map(function () {});

  exports['default'] = Router;
});
define('subpub/routes/application', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('subpub/services/ajax-service', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Service.extend({
		testUrl: 'http://vc333s.web.att.com:4401',
		restEndPointMaps: { /**** All API mappings ***/
			'getTestColumns': { 'endPointName': 'getTestColumns', 'title': 'Get Test Columns From API', 'api': '/data/testColumns.json', 'file': true },
			'getTestColumns1': { 'endPointName': 'getTestColumns1', 'title': 'Get Test Columns 1 From API', 'api': '/data/testColumns1.json', 'file': true },
			'getTestData': { 'endPointName': 'getTestData', 'title': 'Get Test Data From API', 'api': '/data/testData.json', 'file': true },
			'getTestData1': { 'endPointName': 'getTestData1', 'title': 'Get Test Data 1 From API', 'api': '/data/testData1.json', 'file': true }
		},

		/***
   Return an obj with the information of the REST service endpoint
   @param {string} key = key on the mapping
   @return {object} stat information.
   ***/
		getEndPointInfo: function getEndPointInfo(endPointName) {
			var restEndPointMaps = this.get('restEndPointMaps');
			var dt = restEndPointMaps[endPointName];
			restEndPointMaps = null;
			return dt;
		},
		/**
  	Return the mandatories params used on each request acording to the endpoint configuration requirements
  **/
		getRequiredParams: function getRequiredParams() {
			var params = {
				userID: 'Tester'
			};
			return params;
		},
		/**
  	Return the mandatories params mixed with the extraParams to use in a request
  **/
		addExtraParams: function addExtraParams(extraParams, params) {
			var newParams = params;
			if (extraParams !== undefined) {
				for (var key in extraParams) {
					if (extraParams.hasOwnProperty(key)) {
						if (newParams.length > 0) {
							newParams.push(key, extraParams[key]);
						} else {
							newParams[key] = extraParams[key];
						}
					}
				}
			}
			return newParams;
		},
		/**
  	Return the response of a GET resquest 
  **/
		getData: function getData(endPointName) {
			var extraParams = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
			var async = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

			var endpointInfo = this.getEndPointInfo(endPointName);
			if (endpointInfo === undefined || endpointInfo === '') {
				_ember['default'].Logger.error('Unable to locate API URL:' + endPointName);
				return false;
			}

			var apiURL = this.get('testUrl') + endpointInfo.api;
			var params = this.getRequiredParams(endPointName);
			if (extraParams !== undefined) {
				params = this.addExtraParams(extraParams, params);
			}

			_ember['default'].Logger.log('Ajax Get Call:', apiURL, params);

			if (endpointInfo['file'] === true) {
				//get data from a json file
				var res = _ember['default'].$.getJSON(apiURL, params);
				res.then(function (data) {
					data = eval("(" + data.responseText + ")");
				});
				return res;
			} else {
				//get data from an api
				var res = _ember['default'].$.ajax({
					url: apiURL,
					data: params,
					async: async,
					type: 'GET',
					dataType: 'json',
					error: function error(jqXHR, textStatus, errorThrown) {
						_ember['default'].Logger.error(textStatus, errorThrown, jqXHR);
					}
				});
				res.then(function (data) {
					if (data.errorMsg !== undefined && data.errorMsg !== '') {
						_ember['default'].Logger.error(data.errorMsg);
					}
					data['endpointInfo'] = endpointInfo;
				});
				return res;
			}
		},

		postData: function postData(endPointName) {
			var extraParams = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
			var stringify = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			var self = this;
			var endpointInfo = this.getEndPointInfo(endPointName);
			if (endpointInfo === undefined || endpointInfo === '') {
				_ember['default'].Logger.error('Unable to locate API URL:' + endPointName);
				return false;
			}

			var apiURL = 'http://localhost:4401/' + endpointInfo.api;
			var params;
			if (stringify) {
				params = JSON.stringify(extraParams);
			} else {
				params = self.getRequiredParams(endPointName);
				if (extraParams !== undefined) {
					params = self.addExtraParams(extraParams, params);
				}
				if (params['stash'] !== undefined) {
					apiURL += "/" + params['stash'];
				}
			}

			_ember['default'].Logger.log('Ajax POST Call:', apiURL, params);

			var res = _ember['default'].$.ajax({
				url: apiURL,
				data: params,
				type: 'POST',
				dataType: 'json',
				error: function error(jqXHR, textStatus, errorThrown) {
					_ember['default'].Logger.error(textStatus, errorThrown, jqXHR);
				}
			});
			res.then(function (data) {
				if (data.errorMsg !== undefined && data.errorMsg !== '') {
					_ember['default'].Logger.error(data.errorMsg);
				}
				//messages...
			});
			return res;
		}

	});
});
define('subpub/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('subpub/services/subpub-service', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Service.extend({
        // Storage for topics that can be broadcast
        // or listened to
        topics: {},

        // An topic identifier
        subUid: -1,

        // Publish or broadcast events of interest
        // with a specific topic name and arguments
        // such as the data to pass along
        publish: function publish(topic, args) {

            var topics = this.get('topics');

            if (!topics[topic]) {
                return false;
            }

            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(topic, args);
            }
            return true;
        },

        // Subscribe to events of interest
        // with a specific topic name and a
        // callback function, to be executed
        // when the topic/event is observed
        subscribe: function subscribe(topic, func, scope) {

            var topics = this.get('topics');

            if (!topics[topic]) {
                topics[topic] = [];
            }

            if (topics[topic].length) {
                var funcRegistered = false;
                topics[topic].map(function (handlerObj) {
                    if (handlerObj.func === func) {
                        funcRegistered = true;
                        handlerObj.scope = scope;
                    }
                });
                if (funcRegistered) {
                    return false;
                }
            }

            var subUid = this.get('subUid');
            var token = (++subUid).toString();
            this.set('subUid', subUid);

            topics[topic].push({
                token: token,
                func: func,
                scope: scope
            });
            this.set('topics', topics);

            return token;
        },

        // Unsubscribe from a specific
        // topic, based on a tokenized reference
        // to the subscription
        unsubscribe: function unsubscribe(token) {

            var topics = this.get('topics');

            for (var m in topics) {
                if (topics[m]) {
                    for (var i = 0, j = topics[m].length; i < j; i++) {
                        if (topics[m][i].token === token) {
                            topics[m].splice(i, 1);
                            return token;
                        }
                    }
                }
            }
            return true;
        }
    });
});
define("subpub/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 17
          }
        },
        "moduleName": "subpub/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Grid View Example:");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "gadget-sample", ["loc", [null, [2, 0], [2, 17]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("subpub/templates/components/bread-crumb", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 1
            },
            "end": {
              "line": 4,
              "column": 1
            }
          },
          "moduleName": "subpub/templates/components/bread-crumb.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1, "href", "");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0, 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["updatePath", ["get", "path", ["loc", [null, [3, 35], [3, 39]]], 0, 0, 0, 0]], [], ["loc", [null, [3, 13], [3, 41]]], 0, 0], ["content", "path.label", ["loc", [null, [3, 42], [3, 56]]], 0, 0, 0, 0]],
        locals: ["path"],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 1
            },
            "end": {
              "line": 11,
              "column": 1
            }
          },
          "moduleName": "subpub/templates/components/bread-crumb.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "path.label", ["loc", [null, [10, 2], [10, 16]]], 0, 0, 0, 0]],
        locals: ["path"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 6
          }
        },
        "moduleName": "subpub/templates/components/bread-crumb.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-12");
        dom.setAttribute(el1, "style", "margin-left: -12px;");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("			\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" This is for getting title for a exported file ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "style", "display: none");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [4]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        morphs[1] = dom.createAttrMorph(element1, 'id');
        morphs[2] = dom.createMorphAt(element1, 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "pathArrayObj", ["loc", [null, [2, 9], [2, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 1], [4, 10]]]], ["attribute", "id", ["get", "pathID", ["loc", [null, [8, 10], [8, 16]]], 0, 0, 0, 0], 0, 0, 0, 0], ["block", "each", [["get", "pathArrayObj", ["loc", [null, [9, 9], [9, 21]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [9, 1], [11, 10]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("subpub/templates/components/gadget-sample", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 4
            },
            "end": {
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "subpub/templates/components/gadget-sample.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("					");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("	\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "grid-view", [], ["gridViewObj", ["subexpr", "@mut", [["get", "gridViewObj", ["loc", [null, [10, 29], [10, 40]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [10, 5], [10, 42]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 4
            },
            "end": {
              "line": 13,
              "column": 4
            }
          },
          "moduleName": "subpub/templates/components/gadget-sample.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("					");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Grid View Not Found or Not Ready Yet!");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 7
          }
        },
        "moduleName": "subpub/templates/components/gadget-sample.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "col-md-12");
        var el3 = dom.createTextNode("	\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row history-path-row");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n				\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row grid-view");
        var el4 = dom.createTextNode("	\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-12");
        var el5 = dom.createTextNode("			\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("		\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("	\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("	");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 1]), 1, 1);
        return morphs;
      },
      statements: [["inline", "bread-crumb", [], ["pathArrayObj", ["subexpr", "@mut", [["get", "pathArrayObj", ["loc", [null, [4, 30], [4, 42]]], 0, 0, 0, 0]], [], [], 0, 0], "gridViewClass", ["subexpr", "@mut", [["get", "gridViewClass", ["loc", [null, [4, 57], [4, 70]]], 0, 0, 0, 0]], [], [], 0, 0], "updatePath", "updatePath"], ["loc", [null, [4, 3], [4, 96]]], 0, 0], ["block", "if", [["get", "gridViewObj", ["loc", [null, [9, 10], [9, 21]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [9, 4], [13, 11]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("subpub/templates/components/grid-view", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 52
          }
        },
        "moduleName": "subpub/templates/components/grid-view.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createAttrMorph(element0, 'id');
        morphs[1] = dom.createAttrMorph(element0, 'style');
        return morphs;
      },
      statements: [["attribute", "id", ["get", "gridName", ["loc", [null, [1, 10], [1, 18]]], 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "style", ["get", "gridViewStyle", ["loc", [null, [1, 29], [1, 42]]], 0, 0, 0, 0], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('subpub/config/environment', ['ember'], function(Ember) {
  var prefix = 'subpub';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("subpub/app")["default"].create({"name":"subpub","version":"0.0.0+fdf923b2"});
}

/* jshint ignore:end */
//# sourceMappingURL=subpub.map
