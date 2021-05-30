// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data)
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    console.log(earthquakeData[1].geometry.coordinates[1])
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
       layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  // Adjust the circles
  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

  function pointToLayer(feature,latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions)
  }


  // Define a function to apply colours to the circles
  function chooseColor(mag) {
    switch (true) {
    case mag > 5:
        return "#ea2c2c";
    case mag > 4:
        return "#ea822c";
    case mag > 3:
        return "#ee9c00";
    case mag > 2:
        return "#eecc00";
    case mag > 1:
        return "#d4ee00";
    default:
        return "#98ee00";
    }
  }
// Define a function to adjust the circles as per magnitude level
  function Radius (mag) {
      if (mag === 0) {
          return 1;
      }
      return mag *5;
  }

  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: function (feature){
        return {
                color: "white",
             // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)
                fillColor: chooseColor(feature.properties.mag),
                radius: Radius(feature.properties.mag),
                fillOpacity: 0.5,
                weight: 1.5
        }}}
  );

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


// Apply the function
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      36.7783, -119.4179
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

     
    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend");
      var legendInfo = [{
        limit: "0-1",
        color:"#98ee00"},
        {
        limit: "1-2",
        color:"#d4ee00"
        },
        {
        limit: "2-3",
        color:"#eecc00"
        },
        {
        limit: "3-4",
        color:"#ee9c00"
        },
        {
        limit: "4-5",
        color:"#ea822c"
        },
        {
        limit: "5+",
        color:"#ea2c2c"
        }
    ]

    
    var labels = [];
    for(i = 0; i<legendInfo.length; i++){
        div.innerHTML +=  labels.push("<li style=\"background-color: " + legendInfo[i].color + "\">" + legendInfo[i].limit +"</li>"  );
    };
    
    div.innerHTML = "<ul>" + labels.join("") + "</ul>";
    return div;
  }
  // Add the legend to the map
  legend.addTo(myMap);
};
