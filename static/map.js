const map = L.map('map').setView([39.8283, -98.5795], 4); // center of US

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
let radarLayer;
function addRadarLayer() {
    if (radarLayer) {
        map.removeLayer(radarLayer);
    }

    radarLayer = L.tileLayer.wms("https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?", {
        layers: 'conus_bref_qcd',
        format: 'image/png',
        transparent: true,
        attribution: "NOAA/NWS",
    }).addTo(map);
}

// Initial load
addRadarLayer();

fetch('/alerts')
    .then(res => res.json())
    .then(data => {
        data.forEach(alert => {
            const geom = alert.geometry;
            const props = alert.properties;
            const color = props.color || "#808080";

            if (!geom) return;

            switch (geom.type) {
                case "Polygon":
                    drawPolygon(geom.coordinates, color, props);
                    break;

                case "MultiPolygon":
                    geom.coordinates.forEach(polygon => {
                        drawPolygon(polygon, color, props);
                    });
                    break;

                case "GeometryCollection":
                    geom.geometries.forEach(subGeom => {
                        if (subGeom.type === "Polygon") {
                            drawPolygon(subGeom.coordinates, color, props);
                        } else if (subGeom.type === "MultiPolygon") {
                            subGeom.coordinates.forEach(polygon => {
                                drawPolygon(polygon, color, props);
                            });
                        }
                    });
                    break;
            }
        });
    });

function drawPolygon(coords, color, props) {
    const latlngs = coords[0].map(c => [c[1], c[0]]);
    L.polygon(latlngs, { color, fillColor: color, fillOpacity: 0.5 })
        .bindPopup(`<strong>${props.headline}</strong><br>${props.areaDesc}<br><em>${props.event}</em>`)
        .addTo(map);
}
