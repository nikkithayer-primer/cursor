// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Create map instance with a temporary center, will be updated to show all locations
    const map = L.map('map').setView([39.8283, -98.5795], 2);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create separate marker cluster groups for each layer
    const markerClusters = {
        'A-F': L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 80,
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #43A7DD; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        }),
        'G-M': L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 80,
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #FC922D; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        }),
        'N-S': L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 80,
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #819B2A; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        }),
        'T-Z': L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 80,
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #DF5094; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        })
    };

    // Create custom colored markers for each layer
    const layerIcons = {
        'A-F': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#43A7DD" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'G-M': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FC922D" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'N-S': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#819B2A" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'T-Z': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#DF5094" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    };

    // Get sidebar container
    const locationList = document.getElementById('location-list');

    // Function to show all locations with fly animation (for button clicks)
    function showAllLocations() {
        // Calculate bounds from all locations
        const group = new L.featureGroup();
        locationsData.forEach(location => {
            group.addLayer(L.marker([location.latitude, location.longitude]));
        });
        
        // Fly to bounds to show all locations with padding and animation
        map.flyToBounds(group.getBounds(), {
            padding: [20, 20],
            duration: 1.5
        });
    }

    // Function to fit all locations (for initial load)
    function fitAllLocations() {
        // Calculate bounds from all locations
        const group = new L.featureGroup();
        locationsData.forEach(location => {
            group.addLayer(L.marker([location.latitude, location.longitude]));
        });
        
        // Fit map to show all locations with padding (no animation for initial load)
        map.fitBounds(group.getBounds(), {
            padding: [20, 20]
        });
    }

    // Function to get CSS class for layer
    function getLayerClass(layer) {
        return 'layer-' + layer.toLowerCase().replace('-', '-');
    }

    // SVG pin icon
    function getPinIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`;
    }

    // Group locations by layer
    const locationsByLayer = {};
    const layerOrder = ['A-F', 'G-M', 'N-S', 'T-Z'];

    locationsData.forEach(location => {
        if (!locationsByLayer[location.layer]) {
            locationsByLayer[location.layer] = [];
        }
        locationsByLayer[location.layer].push(location);
    });

    // Sort locations within each layer alphabetically
    Object.keys(locationsByLayer).forEach(layer => {
        locationsByLayer[layer].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Add markers for each location and populate sidebar by layer
    layerOrder.forEach(layerName => {
        if (locationsByLayer[layerName]) {
            // Create layer section
            const layerSection = document.createElement('div');
            layerSection.className = 'layer-section';
            
            // Create layer header
            const layerHeader = document.createElement('div');
            layerHeader.className = 'layer-header';
            layerHeader.textContent = layerName;
            layerSection.appendChild(layerHeader);

            // Add locations for this layer
            locationsByLayer[layerName].forEach((location, index) => {
                // Create popup content
                const popupContent = `
                    <div>
                        <h3>${location.headline}</h3>
                        <h4>${location.name}</h4>
                        <p>${location.description}</p>
                        <small>${location.date}</small>
                    </div>
                `;
                
                // Create marker with custom colored icon and add to appropriate cluster group
                const marker = L.marker([location.latitude, location.longitude], {
                    icon: layerIcons[location.layer]
                }).bindPopup(popupContent);
                
                // Add click event to marker to fly to location when clicked
                marker.on('click', function(e) {
                    map.flyTo([location.latitude, location.longitude], 13, {
                        animate: true,
                        duration: 1.5
                    });
                });
                
                // Add marker to the appropriate cluster group
                markerClusters[location.layer].addLayer(marker);

                // Create sidebar item with SVG pin icon
                const locationItem = document.createElement('div');
                locationItem.className = 'location-item';
                locationItem.innerHTML = `
                    <div class="location-name" data-lat="${location.latitude}" data-lng="${location.longitude}">
                        <span class="pin-icon ${getLayerClass(location.layer)}">${getPinIcon()}</span>
                        <span>${location.name}</span>
                    </div>
                    <div class="location-headline">${location.headline}</div>
                    <div class="location-date">${location.date}</div>
                    <div class="location-description">${location.description}</div>
                    <div class="location-coordinates">
                        ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
                    </div>
                `;

                // Add click event to location name for flying to location
                const locationNameElement = locationItem.querySelector('.location-name');
                locationNameElement.addEventListener('click', function() {
                    const lat = parseFloat(this.dataset.lat);
                    const lng = parseFloat(this.dataset.lng);
                    map.flyTo([lat, lng], 13, {
                        animate: true,
                        duration: 1.5
                    });
                });

                layerSection.appendChild(locationItem);
            });

            locationList.appendChild(layerSection);
        }
    });

    // Add all cluster groups to the map
    Object.values(markerClusters).forEach(clusterGroup => {
        map.addLayer(clusterGroup);
    });

    // Set initial view to show all locations (no animation for first load)
    fitAllLocations();

    // Add click handler for "Show All" button (with animation)
    document.getElementById('show-all-btn').addEventListener('click', showAllLocations);
});