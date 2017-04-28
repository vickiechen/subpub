import Ember from 'ember';

export default Ember.Component.extend({
	pathID : Ember.computed('gridViewClass', function () { //must have this property for defining the grid view class and subscription Path
         return "breadcrumb_" + this.get('gridViewClass');
    }),

	actions: {
		updatePath(path){
			this.sendAction('updatePath', path);	
		}
	}	
});