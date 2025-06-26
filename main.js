// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Create map with initial view (will be adjusted after markers are added)
    const map = L.map('map').setView([20, 0], 2);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // City coordinates and information
    const cities = {
        london: { coords: [51.5074, -0.1278], name: 'London, UK', zoom: 11 },
        tokyo: { coords: [35.6762, 139.6503], name: 'Tokyo, Japan', zoom: 11 },
        newyork: { coords: [40.7128, -74.0060], name: 'New York, NY', zoom: 11 },
        losangeles: { coords: [34.0522, -118.2437], name: 'Los Angeles, CA', zoom: 10 },
        sanfrancisco: { coords: [37.7749, -122.4194], name: 'San Francisco, CA', zoom: 12 },
        cairo: { coords: [30.0444, 31.2357], name: 'Cairo, Egypt', zoom: 11 },
        saopaulo: { coords: [-23.5505, -46.6333], name: 'São Paulo, Brazil', zoom: 10 },
        mexicocity: { coords: [19.4326, -99.1332], name: 'Mexico City, Mexico', zoom: 10 }
    };
    
    // Store markers for each city
    const cityMarkers = {};
    
    // Add markers for all cities
    Object.keys(cities).forEach(cityKey => {
        const city = cities[cityKey];
        const marker = L.marker(city.coords)
            .addTo(map)
            .bindPopup(city.name);
        
        // Add click event to marker for smooth zoom behavior
        marker.on('click', function() {
            // Remove active class from all city links
            const cityLinks = document.querySelectorAll('.city-links a');
            cityLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to corresponding city link
            const cityLink = document.querySelector(`[data-city="${cityKey}"]`);
            if (cityLink) {
                cityLink.classList.add('active');
            }
            
            // Smoothly fly to city with proper zoom level
            map.flyTo(city.coords, city.zoom, {
                animate: true,
                duration: 1.5
            });
        });
        
        cityMarkers[cityKey] = marker;
    });
    
    // Fit map to show all cities on initial load
    const group = new L.featureGroup(Object.values(cityMarkers));
    map.fitBounds(group.getBounds(), {
        padding: [20, 20]
    });
    
    // Add click handlers for city links
    const cityLinks = document.querySelectorAll('.city-links a');
    cityLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const cityKey = this.getAttribute('data-city');
            const city = cities[cityKey];
            
            if (city) {
                // Remove active class from all links
                cityLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
                
                // Smoothly fly to city with animation
                map.flyTo(city.coords, city.zoom, {
                    animate: true,
                    duration: 1.5
                });
                
                // Open the marker popup
                if (cityMarkers[cityKey]) {
                    cityMarkers[cityKey].openPopup();
                }
            }
        });
    });
    
    // No city is active by default since we start zoomed out
    
    // Add click handler for Show All button
    const showAllBtn = document.querySelector('.show-all-btn');
    showAllBtn.addEventListener('click', function() {
        // Remove active class from all city links
        cityLinks.forEach(link => link.classList.remove('active'));
        
        // Create a group of all city coordinates to fit bounds
        const allCoords = Object.values(cities).map(city => city.coords);
        const group = new L.featureGroup(Object.values(cityMarkers));
        
        // Smoothly fly to show all cities
        map.flyToBounds(group.getBounds(), {
            animate: true,
            duration: 1.5,
            padding: [20, 20]
        });
    });

    // Add click handler for Export KML button
    const exportKmlBtn = document.querySelector('#export-kml-btn');
    exportKmlBtn.addEventListener('click', function() {
        // Generate KML content for all cities
        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>City Locations</name>
    <description>Exported city markers from Primer Design Sandbox</description>
`;
        
        Object.keys(cities).forEach(cityKey => {
            const city = cities[cityKey];
            kmlContent += `    <Placemark>
      <name>${city.name}</name>
      <Point>
        <coordinates>${city.coords[1]},${city.coords[0]},0</coordinates>
      </Point>
    </Placemark>
`;
        });
        
        kmlContent += `  </Document>
</kml>`;
        
        // Create and download the KML file
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'city-locations.kml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Add click handler for Map Settings button
    const mapSettingsBtn = document.querySelector('#map-settings-btn');
    mapSettingsBtn.addEventListener('click', function() {
        // Toggle between different map tile layers
        const currentTiles = map._layers;
        const tileLayerKeys = Object.keys(currentTiles).filter(key => 
            currentTiles[key] instanceof L.TileLayer
        );
        
        if (tileLayerKeys.length > 0) {
            const currentTileLayer = currentTiles[tileLayerKeys[0]];
            map.removeLayer(currentTileLayer);
            
            // Check current tile URL to determine next layer
            const currentUrl = currentTileLayer._url;
            let newTileLayer;
            
            if (currentUrl.includes('openstreetmap.org')) {
                // Switch to satellite view
                newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '© <a href="https://www.esri.com/">Esri</a>'
                });
            } else {
                // Switch back to OpenStreetMap
                newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                });
            }
            
            newTileLayer.addTo(map);
        }
    });

    // Add click handler for Fullscreen button
    const fullscreenBtn = document.querySelector('#fullscreen-btn');
    fullscreenBtn.addEventListener('click', function() {
        const mapContainer = document.querySelector('#map');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
            } else if (mapContainer.webkitRequestFullscreen) {
                mapContainer.webkitRequestFullscreen();
            } else if (mapContainer.msRequestFullscreen) {
                mapContainer.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', function() {
        // Invalidate map size when entering/exiting fullscreen
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    });
    
    document.addEventListener('webkitfullscreenchange', function() {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    });
});