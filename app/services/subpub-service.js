import Ember from 'ember';

export default Ember.Service.extend({
    // Storage for topics that can be broadcast
    // or listened to
    topics : {},
 
    // An topic identifier
    subUid : -1,
 
    // Publish or broadcast events of interest
    // with a specific topic name and arguments
    // such as the data to pass along
    publish : function( topic, args ) {

 		let topics = this.get('topics');

        if ( !topics[topic] ) {
            return false;
        }
 
        let subscribers = topics[topic],
            len = subscribers ? subscribers.length : 0;

        while (len--) {
            subscribers[len].func( topic, args );
        }
        return true;
    },

  	// Subscribe to events of interest
    // with a specific topic name and a
    // callback function, to be executed
    // when the topic/event is observed
    subscribe : function( topic, func , scope ) {
    	
 		let topics = this.get('topics');
 
        if (!topics[topic]) {
            topics[topic] = [];
        }
        
        if(topics[topic].length){
            var funcRegistered = false;
            topics[topic].map((handlerObj)=>{
                if(handlerObj.func == func){
                    funcRegistered = true;
                    handlerObj.scope = scope;
                }
            });
            if(funcRegistered) return false;
        }

        let subUid = this.get('subUid');
        let token = ( ++subUid ).toString();
        this.set('subUid', subUid);

        topics[topic].push({
            token: token,
            func: func,
            scope : scope
        });
        this.set('topics', topics);

        return token;
    },
 
    // Unsubscribe from a specific
    // topic, based on a tokenized reference
    // to the subscription
    unsubscribe : function( token ) {
    	
 		let topics = this.get('topics');

        for ( var m in topics ) {
            if ( topics[m] ) {
                for ( var i = 0, j = topics[m].length; i < j; i++ ) {
                    if ( topics[m][i].token === token ) {
                        topics[m].splice( i, 1 );
                        return token;
                    }
                }
            }
        }
        return true;
    }
});