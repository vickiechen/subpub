import Ember from 'ember';
import BreadcrumbsMixinMixin from 'subpub/mixins/breadcrumbs-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | breadcrumbs mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let BreadcrumbsMixinObject = Ember.Object.extend(BreadcrumbsMixinMixin);
  let subject = BreadcrumbsMixinObject.create();
  assert.ok(subject);
});
