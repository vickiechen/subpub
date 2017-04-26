import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
       return{ //for getting test data from a local json file
		   testData :  $.getJSON( "data/testData.json"), 
		   testData1 :  $.getJSON( "data/testData1.json")
	   }
    } 
});