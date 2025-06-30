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
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#43A7DD" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'G-M': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FC922D" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'N-S': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#819B2A" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        }),
        'T-Z': L.divIcon({
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"><circle cx="12" cy="8" r="6" fill="white" opacity="0.8"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#DF5094" /></svg>',
            className: 'custom-pin-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    };

    // Layer visibility state
    const layerVisibility = {
        'A-F': true,
        'G-M': true,
        'N-S': true,
        'T-Z': true
    };

    // Get sidebar container
    const locationList = document.getElementById('location-list');

    // Function to show all locations with fly animation (for button clicks)
    function showAllLocations() {
        // Calculate bounds from all visible locations
        const group = new L.featureGroup();
        locationsData.forEach(location => {
            if (layerVisibility[location.layer]) {
                group.addLayer(L.marker([location.latitude, location.longitude]));
            }
        });
        
        // Fly to bounds to show all locations with padding and animation
        if (group.getLayers().length > 0) {
            map.flyToBounds(group.getBounds(), {
                padding: [20, 20],
                duration: 1.5
            });
            
            // Update sidebar after animation completes
            setTimeout(updateSidebarVisibility, 1600);
        }
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

    // Function to zoom to specific layer
    function zoomToLayer(layerName) {
        const layerLocations = locationsData.filter(location => location.layer === layerName);
        if (layerLocations.length === 0) return;

        const group = new L.featureGroup();
        layerLocations.forEach(location => {
            group.addLayer(L.marker([location.latitude, location.longitude]));
        });
        
        map.flyToBounds(group.getBounds(), {
            padding: [20, 20],
            duration: 1.5
        });
        
        // Update sidebar after animation completes
        setTimeout(updateSidebarVisibility, 1600);
    }

    // Function to toggle layer visibility
    function toggleLayerVisibility(layerName) {
        layerVisibility[layerName] = !layerVisibility[layerName];
        
        // Toggle cluster group on map
        if (layerVisibility[layerName]) {
            map.addLayer(markerClusters[layerName]);
        } else {
            map.removeLayer(markerClusters[layerName]);
        }
        
        // Update eye icon
        const layerSection = document.querySelector(`[data-layer="${layerName}"]`);
        const eyeBtn = layerSection.querySelector('.eye-toggle');
        updateEyeIcon(eyeBtn, layerVisibility[layerName]);
        
        // Update sidebar visibility based on current map bounds
        updateSidebarVisibility();
    }

    // Function to update eye icon
    function updateEyeIcon(eyeBtn, isVisible) {
        eyeBtn.classList.toggle('eye-closed', !isVisible);
        const svg = isVisible ? 
            '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
            '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        eyeBtn.innerHTML = svg;
    }

    // Function to close all popovers
    function closeAllPopovers() {
        document.querySelectorAll('.layer-popover').forEach(popover => {
            popover.classList.remove('show');
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
            layerSection.setAttribute('data-layer', layerName);
            
            // Create layer header with controls
            const layerHeader = document.createElement('div');
            layerHeader.className = 'layer-header';
            layerHeader.innerHTML = `
                <div class="layer-title">
                    <div class="layer-title-row">
                        <button class="layer-control-btn target-btn layer-${layerName.toLowerCase().replace('-', '')}" title="Zoom to layer">
                            <svg viewBox="0 0 24 24"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>
                        </button>
                        <span class="layer-name">${layerName}</span>
                    </div>
                    <div class="layer-count">Showing ${locationsByLayer[layerName].length} of ${locationsByLayer[layerName].length} points</div>
                </div>
                <div class="layer-controls">
                    <button class="layer-control-btn eye-toggle" title="Toggle visibility">
                        <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </button>
                    <button class="layer-control-btn menu-btn" title="Layer options">
                        <svg viewBox="0 0 24 24"><path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/></svg>
                        <div class="layer-popover">
                            <div class="layer-popover-item" data-action="zoom">Zoom to Layer</div>
                            <div class="layer-popover-item" data-action="hide">Hide Layer</div>
                            <div class="layer-popover-item" data-action="show-only">Show Only This Layer</div>
                        </div>
                    </button>
                </div>
            `;
            layerSection.appendChild(layerHeader);

            // Add click handlers for layer controls
            const targetBtn = layerHeader.querySelector('.target-btn');
            const eyeBtn = layerHeader.querySelector('.eye-toggle');
            const menuBtn = layerHeader.querySelector('.menu-btn');
            const popover = layerHeader.querySelector('.layer-popover');

            targetBtn.addEventListener('click', () => {
                // If layer is hidden, show it first
                if (!layerVisibility[layerName]) {
                    toggleLayerVisibility(layerName);
                }
                zoomToLayer(layerName);
            });
            eyeBtn.addEventListener('click', () => toggleLayerVisibility(layerName));
            
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllPopovers();
                popover.classList.toggle('show');
            });

            // Add popover menu handlers
            popover.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                
                switch(action) {
                    case 'zoom':
                        zoomToLayer(layerName);
                        break;
                    case 'hide':
                        if (layerVisibility[layerName]) {
                            toggleLayerVisibility(layerName);
                        }
                        break;
                    case 'show-only':
                        // Hide all other layers
                        Object.keys(layerVisibility).forEach(layer => {
                            if (layer !== layerName && layerVisibility[layer]) {
                                toggleLayerVisibility(layer);
                            }
                        });
                        // Show this layer if hidden
                        if (!layerVisibility[layerName]) {
                            toggleLayerVisibility(layerName);
                        }
                        break;
                }
                closeAllPopovers();
            });

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
                    
                    // Update sidebar after animation completes
                    setTimeout(updateSidebarVisibility, 1600);
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
                    
                    // Update sidebar after animation completes
                    setTimeout(updateSidebarVisibility, 1600);
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

    // Close popovers when clicking outside
    document.addEventListener('click', closeAllPopovers);

    // Function to update sidebar based on visible map bounds
    function updateSidebarVisibility() {
        const bounds = map.getBounds();
        
        // Update each location item's visibility
        locationsData.forEach(location => {
            const isInBounds = bounds.contains([location.latitude, location.longitude]);
            const isLayerVisible = layerVisibility[location.layer];
            
            // Find the location item in the sidebar
            const locationItems = document.querySelectorAll('.location-item');
            locationItems.forEach(item => {
                const locationName = item.querySelector('.location-name span:last-child');
                if (locationName && locationName.textContent === location.name) {
                    // Show item only if location is in bounds AND layer is visible
                    item.style.display = (isInBounds && isLayerVisible) ? 'block' : 'none';
                }
            });
        });
        
        // Update layer counts to show visible vs total locations
        Object.keys(locationsByLayer).forEach(layerName => {
            const visibleCount = locationsByLayer[layerName].filter(location => {
                const isInBounds = bounds.contains([location.latitude, location.longitude]);
                return isInBounds && layerVisibility[layerName];
            }).length;
            
            const totalCount = locationsByLayer[layerName].length;
            
            const layerSection = document.querySelector(`[data-layer="${layerName}"]`);
            const countElement = layerSection.querySelector('.layer-count');
            countElement.textContent = `Showing ${visibleCount} of ${totalCount} points`;
        });
    }

    // Add event listeners for map movement
    map.on('moveend', updateSidebarVisibility);
    map.on('zoomend', updateSidebarVisibility);
    
    // Update Show All button text with total count
    const showAllBtn = document.getElementById('show-all-btn');
    const totalLocations = locationsData.length;
    showAllBtn.textContent = `Show all ${totalLocations} locations`;

    // Set initial view to show all locations (no animation for first load)
    fitAllLocations();
    
    // Initial sidebar update after map is loaded
    setTimeout(updateSidebarVisibility, 100);

    // Add click handler for "Show All" button (with animation)
    showAllBtn.addEventListener('click', showAllLocations);
});