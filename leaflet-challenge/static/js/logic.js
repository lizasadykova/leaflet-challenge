// Check if L is defined
if (typeof L !== 'undefined') {
    console.log('Leaflet (L) is defined.');
} else {
    console.error('Leaflet (L) is not defined. Check your Leaflet library inclusion.');
}

// Creating the map object
let myMap = L.map("map", {
    center: [27.96044, -82.30695],
    zoom: 3
});

// Define street tile layer
const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Initialize LayerGroups
let earthquakeGroup = new L.LayerGroup();
let tectonicGroup = new L.LayerGroup();

// Load the GeoJSON data.
const geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
const TECTONIC_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

const overlayMaps = {
    "Street Map": street
};

// Define baseMaps as a constant
const baseMaps = {
    "Street Map": street
};

let overlays = {
    Earthquakes: earthquakeGroup,
    Tectonic: tectonicGroup
};

// Function to determine color based on depth
function getValue(x) {
    return x > 90 ? "#F06A6A" :
          x > 70 ? "#F0A76A" :
          x > 50 ? "#F3B94C" :
          x > 30 ? "#F3DB4C" :
          x > 10 ? "#E1F34C" :
          "#B6F34C";
}

// Function to style the GeoJSON layer
function style(feature) {
    return {
        "stroke": true,
        radius: feature.properties.mag * 3,
        fillColor: getValue(feature.geometry.coordinates[2]),
        color: "black",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Get the data with d3.
d3.json(geoData).then(function(data) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, style(feature));
        },
        // popup for each layer
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<strong>" + feature.properties.place + "</strong><br /><br />Magnitude: " +
                feature.properties.mag + "<br /><br />depth: " + feature.geometry.coordinates[2]);
        }
    }).addTo(earthquakeGroup);

    earthquakeGroup.addTo(myMap);

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = ["#98ee00","#d4ee00","#eecc00","#ee9c00","#ea822c","#ea2c2c"];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '">&emsp;&emsp;</i> '
                + grades[i]
                + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
});

// Get the data with d3.
d3.json(TECTONIC_URL).then(function(plate_data) {
    let tectonicPlates = L.geoJson(plate_data, {
        style: {
            color: "blue",
            weight: 2,
            opacity: 1
        }
    });

    tectonicPlates.addTo(tectonicGroup);
    tectonicGroup.addTo(myMap);
});

var layersControl = L.control.layers(baseMaps, overlays, { collapsed: false });

// Add overlay layers to layer control
layersControl.addOverlay(earthquakeGroup, "Earthquakes");
layersControl.addOverlay(tectonicGroup, "Tectonic Plates");

// Add the layer control to the map
layersControl.addTo(myMap);
