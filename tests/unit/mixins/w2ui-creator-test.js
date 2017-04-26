import Ember from 'ember';
import W2uiCreatorMixin from 'subpub/mixins/w2ui-creator';
import { module, test } from 'qunit';

module('Unit | Mixin | w2ui creator');

// Replace this with your real tests.
test('it works', function(assert) {
  let W2uiCreatorObject = Ember.Object.extend(W2uiCreatorMixin);
  let subject = W2uiCreatorObject.create();
  assert.ok(subject);
});
