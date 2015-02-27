Meteor.methods({
    addPlace: function(geeson) {
	 return Places.insert({loc:geeson});
    }
});
