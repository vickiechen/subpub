'use strict';

define('subpub/tests/app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass jshint.');
  });
});
define('subpub/tests/components/bread-crumb.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/bread-crumb.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/bread-crumb.js should pass jshint.');
  });
});
define('subpub/tests/components/gadget-sample.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/gadget-sample.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/gadget-sample.js should pass jshint.\ncomponents/gadget-sample.js: line 47, col 45, \'scope\' is defined but never used.\ncomponents/gadget-sample.js: line 68, col 50, \'scope\' is defined but never used.\n\n2 errors');
  });
});
define('subpub/tests/components/grid-view.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/grid-view.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/grid-view.js should pass jshint.\ncomponents/grid-view.js: line 198, col 65, Don\'t make functions within a loop.\n\n1 error');
  });
});
define('subpub/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('subpub/tests/helpers/destroy-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('subpub/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember', 'subpub/tests/helpers/start-app', 'subpub/tests/helpers/destroy-app'], function (exports, _qunit, _ember, _subpubTestsHelpersStartApp, _subpubTestsHelpersDestroyApp) {
  var Promise = _ember['default'].RSVP.Promise;

  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _subpubTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _subpubTestsHelpersDestroyApp['default'])(_this.application);
        });
      }
    });
  };
});
define('subpub/tests/helpers/module-for-acceptance.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('subpub/tests/helpers/resolver', ['exports', 'subpub/resolver', 'subpub/config/environment'], function (exports, _subpubResolver, _subpubConfigEnvironment) {

  var resolver = _subpubResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _subpubConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _subpubConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('subpub/tests/helpers/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('subpub/tests/helpers/start-app', ['exports', 'ember', 'subpub/app', 'subpub/config/environment'], function (exports, _ember, _subpubApp, _subpubConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _subpubConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _subpubApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('subpub/tests/helpers/start-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define('subpub/tests/integration/components/bread-crumb-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('bread-crumb', 'Integration | Component | bread crumb', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 15
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'bread-crumb', ['loc', [null, [1, 0], [1, 15]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@2.8.3',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
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
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'bread-crumb', [], [], 0, null, ['loc', [null, [2, 4], [4, 20]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('subpub/tests/integration/components/bread-crumb-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | integration/components/bread-crumb-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/bread-crumb-test.js should pass jshint.');
  });
});
define('subpub/tests/integration/components/gadget-sample-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('gadget-sample', 'Integration | Component | gadget sample', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 17
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'gadget-sample', ['loc', [null, [1, 0], [1, 17]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@2.8.3',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
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
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'gadget-sample', [], [], 0, null, ['loc', [null, [2, 4], [4, 22]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('subpub/tests/integration/components/gadget-sample-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | integration/components/gadget-sample-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/gadget-sample-test.js should pass jshint.');
  });
});
define('subpub/tests/integration/components/grid-view-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('grid-view', 'Integration | Component | grid view', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 13
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'grid-view', ['loc', [null, [1, 0], [1, 13]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@2.8.3',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
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
          'revision': 'Ember@2.8.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'grid-view', [], [], 0, null, ['loc', [null, [2, 4], [4, 18]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('subpub/tests/integration/components/grid-view-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | integration/components/grid-view-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/grid-view-test.js should pass jshint.');
  });
});
define('subpub/tests/mixins/breadcrumbs-mixin.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | mixins/breadcrumbs-mixin.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'mixins/breadcrumbs-mixin.js should pass jshint.\nmixins/breadcrumbs-mixin.js: line 20, col 13, \'w2ui\' is not defined.\nmixins/breadcrumbs-mixin.js: line 21, col 27, \'w2ui\' is not defined.\n\n2 errors');
  });
});
define('subpub/tests/mixins/w2ui-creator.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | mixins/w2ui-creator.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'mixins/w2ui-creator.js should pass jshint.\nmixins/w2ui-creator.js: line 24, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 25, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 48, col 9, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 57, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 63, col 21, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 76, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 79, col 9, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 80, col 9, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 190, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 191, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 192, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 194, col 13, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 195, col 24, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 196, col 27, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 240, col 25, \'w2ui\' is not defined.\nmixins/w2ui-creator.js: line 235, col 21, \'export2CSV\' is not defined.\n\n16 errors');
  });
});
define('subpub/tests/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass jshint.');
  });
});
define('subpub/tests/router.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass jshint.');
  });
});
define('subpub/tests/routes/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | routes/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass jshint.');
  });
});
define('subpub/tests/services/ajax-service.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | services/ajax-service.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/ajax-service.js should pass jshint.');
  });
});
define('subpub/tests/services/subpub-service.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | services/subpub-service.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/subpub-service.js should pass jshint.');
  });
});
define('subpub/tests/test-helper', ['exports', 'subpub/tests/helpers/resolver', 'ember-qunit'], function (exports, _subpubTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_subpubTestsHelpersResolver['default']);
});
define('subpub/tests/test-helper.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
define('subpub/tests/unit/mixins/breadcrumbs-mixin-test', ['exports', 'ember', 'subpub/mixins/breadcrumbs-mixin', 'qunit'], function (exports, _ember, _subpubMixinsBreadcrumbsMixin, _qunit) {

  (0, _qunit.module)('Unit | Mixin | breadcrumbs mixin');

  // Replace this with your real tests.
  (0, _qunit.test)('it works', function (assert) {
    var BreadcrumbsMixinObject = _ember['default'].Object.extend(_subpubMixinsBreadcrumbsMixin['default']);
    var subject = BreadcrumbsMixinObject.create();
    assert.ok(subject);
  });
});
define('subpub/tests/unit/mixins/breadcrumbs-mixin-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/mixins/breadcrumbs-mixin-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/mixins/breadcrumbs-mixin-test.js should pass jshint.');
  });
});
define('subpub/tests/unit/mixins/w2ui-creator-test', ['exports', 'ember', 'subpub/mixins/w2ui-creator', 'qunit'], function (exports, _ember, _subpubMixinsW2uiCreator, _qunit) {

  (0, _qunit.module)('Unit | Mixin | w2ui creator');

  // Replace this with your real tests.
  (0, _qunit.test)('it works', function (assert) {
    var W2uiCreatorObject = _ember['default'].Object.extend(_subpubMixinsW2uiCreator['default']);
    var subject = W2uiCreatorObject.create();
    assert.ok(subject);
  });
});
define('subpub/tests/unit/mixins/w2ui-creator-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/mixins/w2ui-creator-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/mixins/w2ui-creator-test.js should pass jshint.');
  });
});
define('subpub/tests/unit/routes/application-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('subpub/tests/unit/routes/application-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/routes/application-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass jshint.');
  });
});
define('subpub/tests/unit/services/ajax-service-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('service:ajax-service', 'Unit | Service | ajax service', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });
});
define('subpub/tests/unit/services/ajax-service-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/services/ajax-service-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/ajax-service-test.js should pass jshint.');
  });
});
define('subpub/tests/unit/services/subpub-service-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('service:subpub-service', 'Unit | Service | subpub service', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });
});
define('subpub/tests/unit/services/subpub-service-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/services/subpub-service-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/subpub-service-test.js should pass jshint.');
  });
});
/* jshint ignore:start */

require('subpub/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map
