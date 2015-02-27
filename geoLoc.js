if (Meteor.isClient) {
  Meteor.subscribe('Places');
  Session.setDefault('ord',null);

  Meteor.startup(function(){
    // Session.set('pos',Geolocation.latLng());
    map = null;
    fc = null;
    Mapbox.load();
  });

  Template.body.rendered = function () {
    this.autorun(function () {
      Session.set('pos',Geolocation.latLng() || { lat: 0, lng: 0 });
      if ( Mapbox.loaded() && Session.get('pos').lat != 0  && Session.get('pos').lng != 0 ) {

        if(map == null){
        L.mapbox.accessToken = 'pk.eyJ1IjoidG9tYmVycyIsImEiOiJwdkVzMXF3In0.tYVES5240mnmR1Dzon0nxg';
        map = L.mapbox.map('map', 'tombers.lb0738je').setView(Session.get('pos'), 14);
        map.on('click', onMapClick);

        var fixedMarker = L.marker(new L.LatLng(Session.get('pos').lat,Session.get('pos').lng), {
    icon: L.mapbox.marker.icon({
        'marker-color': 'ff8888'
    })
}).bindPopup('Mapbox DC').addTo(map);

        fc = fixedMarker.getLatLng();
        // addMarker(Session.get('pos').lng,Session.get('pos').lat,false);
        var ord = [];
        Places.find().fetch().forEach(function(place){
          // console.log(place);
          var latlng = {lat:place.loc.geometry.coordinates[1] ,lng:place.loc.geometry.coordinates[0]}
          var dist = (fc.distanceTo(latlng)).toFixed(0) + 'm';
          place.loc.properties.description = dist;
          ord.push({title:place.loc.properties.title,dist:dist});
          ord.sort(function (a,b){
            if(parseInt(a.dist) > parseInt(b.dist)){return 1;}
            else{return -1;}
          })
          Session.set('ord',ord);
          L.mapbox.featureLayer(place.loc).addTo(map);
        });
      }

      }
    });
  };

  Template.body.helpers({
    loc: function () {
      // return 0, 0 if the location isn't ready
      return Geolocation.latLng() || { lat: 0, lng: 0 };
    },
    error: Geolocation.error,
    places:function(){
    return Session.get('ord');

    }
  });
}



function addMarker(lng,lat,name){
  var geeson = {
    // this feature is in the GeoJSON format: see geojson.org
    // for the full specification
    type: 'Feature',
    geometry: {
      type: 'Point',
      // coordinates here are in longitude, latitude order because
      // x, y is the standard for GeoJSON and many formats
      coordinates: [lng,lat]


    },
    properties: {
      title: name,
      description: 'Description',
      // one can customize markers by adding simplestyle properties
      // https://www.mapbox.com/guides/an-open-platform/#simplestyle
      'marker-size': 'large',
      'marker-color': '#115E4A',
      'marker-symbol': 'embassy'
    }
  };
  Meteor.call('addPlace',geeson);
  L.mapbox.featureLayer(geeson).addTo(map);


}

function onMapClick(e) {
  // console.log(e);
  // console.log((fc.distanceTo({lat: 51.43340394307212, lng: -0.16565322875976562})).toFixed(0) + 'm');

    // alert("You clicked the map at " + e.latlng);

    var name = prompt("Please enter a name", "");
if (name != null) {
    addMarker(e.latlng.lng,e.latlng.lat,name);
  }
    // console.log(e.latlng);
    // alert((fc.distanceTo(e.latlng)).toFixed(0) + 'm');


}
