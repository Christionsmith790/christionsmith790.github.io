// Create Map Object

var map = L.map("map", { center: [39.981192, -75.155399], zoom: 10 });
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);
map.doubleClickZoom.disable();

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

var mbAttr =
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  mbUrl =
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

var grayscale = L.tileLayer(mbUrl, {
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr,
  }),
  streets = L.tileLayer(mbUrl, {
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr,
  });

var baseMaps = {
  grayscale: grayscale,
  streets: streets,
};

// Define Markers

var temple = L.marker([39.981192, -75.155399]);
var drexel = L.marker([39.957352834066796, -75.18939693143933]);
var penn = L.marker([39.95285548473699, -75.19309508637147]);

// Groups Markers into One Layer group

var universities = L.layerGroup([temple, drexel, penn]);
var universityLayer = {
  "Phily University": universities,
};

// load GeoJSON from an API
var neighborhoodsLayer = null;
$.getJSON(
  "https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+child_blood_lead_levels_by_ct&filename=child_blood_lead_levels_by_ct&format=geojson&skipfields=cartodb_id",
  function (data) {
    neighborhoodsLayer = L.geoJson(data, {
      style: styleFunc,
      onEachFeature: onEachFeature,
    }).addTo(map);
  }
);

var overlayLayer = {
  blood_lead_level: neighborhoodsLayer,
  "Phily University": universities,
};

// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
  return {
    fillColor: setColorFunc(feature.properties.perc_5plus),
    fillOpacity: 0.9,
    weight: 1,
    opacity: 1,
    color: "#ffffff",
    dashArray: "3",
  };
}

// Set function for color ramp
function setColorFunc(density) {
  return density > 15
    ? "#eff3ff"
    : density > 10
    ? "#bdd7e7"
    : density > 5
    ? "#6baed6"
    : density > 0
    ? "#2171b5"
    : "#BFBCBB";
}
// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomFeature,
  });
  layer.bindPopup("Blood lead level: " + feature.properties.perc_5plus);
}

// Now let’s make the states highlighted visually in some way when they are hovered with a mouse. First we’ll define an event listener for layer mouseover event:
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });
  // for different web browsers
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

// Define what happens on mouseout:
function resetHighlight(e) {
  neighborhoodsLayer.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state:
function zoomFeature(e) {
  console.log(e.target.getBounds());
  map.fitBounds(e.target.getBounds().pad(1.5));
}

// Create Leaflet Control Object for Legend
var legend = L.control({ position: "bottomright" });

// Function that runs when legend is added to map
legend.onAdd = function (map) {
  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<b>Blood lead level</b><br />";
  div.innerHTML += "by census tract<br />";
  div.innerHTML += "<br>";
  div.innerHTML += '<i style="background: #eff3ff"></i><p>15+</p>';
  div.innerHTML += '<i style="background: #bdd7e7"></i><p>10-15</p>';
  div.innerHTML += '<i style="background: #6baed6"></i><p>5-10</p>';
  div.innerHTML += '<i style="background: #2171b5"></i><p>0-5</p>';
  div.innerHTML += "<hr>";
  div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';

  // Return the Legend div containing the HTML content
  return div;
};

// Add Legend to Map
legend.addTo(map);

// Add Scale Bar to Map
L.control.scale({ position: "bottomleft" }).addTo(map);

// Add Layers
L.control.layers(baseMaps, overlayLayer).addTo(map);
