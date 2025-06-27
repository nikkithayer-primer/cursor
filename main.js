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
        mexicocity: { coords: [19.4326, -99.1332], name: 'Mexico City, Mexico', zoom: 10 },
        stpetersburg: { coords: [59.9311, 30.3609], name: 'St. Petersburg, Russia', zoom: 11 },
        novgorod: { coords: [58.5218, 31.2755], name: 'Veliky Novgorod, Russia', zoom: 11 },
        pskov: { coords: [57.8136, 28.3496], name: 'Pskov, Russia', zoom: 11 },
        petrozavodsk: { coords: [61.7849, 34.3469], name: 'Petrozavodsk, Russia', zoom: 11 },
        murmansk: { coords: [68.9585, 33.0827], name: 'Murmansk, Russia', zoom: 10 },
        omaha: { coords: [41.2565, -95.9345], name: 'Omaha, NE', zoom: 11 },
        iowacity: { coords: [41.6611, -91.5302], name: 'Iowa City, IA', zoom: 11 },
        iran: { coords: [32.4279, 53.6880], name: 'Iran', zoom: 6 },
        cedarfalls: { coords: [42.5348, -92.4453], name: 'Cedar Falls, IA', zoom: 11 }
    };
    
    // Store markers for each city
    const cityMarkers = {};
    
    // Track visibility state for each city
    const cityVisibility = {};
    
    // Track manual visibility state (user-controlled) separately from viewport visibility
    const cityManualVisibility = {};
    
    // Create cluster groups for each color
    const clusterGroups = {
        blue: L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                    className: 'marker-cluster marker-cluster-blue',
                    iconSize: new L.Point(40, 40)
                });
            }
        }),
        orange: L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                    className: 'marker-cluster marker-cluster-orange',
                    iconSize: new L.Point(40, 40)
                });
            }
        }),
        green: L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                    className: 'marker-cluster marker-cluster-green',
                    iconSize: new L.Point(40, 40)
                });
            }
        }),
        pink: L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                    className: 'marker-cluster marker-cluster-pink',
                    iconSize: new L.Point(40, 40)
                });
            }
        })
    };

    // Define city colors based on their accordion sections
    const cityColors = {
        // North America - Blue
        newyork: '#43A7DD',
        losangeles: '#43A7DD', 
        sanfrancisco: '#43A7DD',
        mexicocity: '#43A7DD',
        // Europe - Orange
        london: '#FC922D',
        stpetersburg: '#FC922D',
        novgorod: '#FC922D',
        pskov: '#FC922D',
        petrozavodsk: '#FC922D',
        murmansk: '#FC922D',
        // Asia & South America - Green
        tokyo: '#819B2A',
        saopaulo: '#819B2A',
        // Africa & Middle East - Pink
        cairo: '#DF5094',
        omaha: '#DF5094',
        iowacity: '#DF5094',
        iran: '#DF5094',
        cedarfalls: '#DF5094'
    };

    // Function to create custom colored marker
    function createColoredMarker(color) {
        const svgIcon = `
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
                <circle cx="12.5" cy="12.5" r="5" fill="white"/>
            </svg>
        `;
        
        return L.divIcon({
            html: svgIcon,
            className: 'custom-marker',
            iconSize: [25, 41],
            iconAnchor: [12.5, 41],
            popupAnchor: [0, -41]
        });
    }

    // Map colors to cluster group names
    const colorToClusterGroup = {
        '#43A7DD': 'blue',
        '#FC922D': 'orange', 
        '#819B2A': 'green',
        '#DF5094': 'pink'
    };

    // Add markers for all cities
    Object.keys(cities).forEach(cityKey => {
        const city = cities[cityKey];
        const color = cityColors[cityKey];
        const customIcon = createColoredMarker(color);
        
        const marker = L.marker(city.coords, { icon: customIcon })
            .bindPopup(city.name);
        
        // Add marker to appropriate cluster group
        const clusterGroupName = colorToClusterGroup[color];
        if (clusterGroupName && clusterGroups[clusterGroupName]) {
            clusterGroups[clusterGroupName].addLayer(marker);
        }
        
        // Initialize all cities as visible
        cityVisibility[cityKey] = true;
        cityManualVisibility[cityKey] = true;
        
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
    
    // Add all cluster groups to the map
    Object.values(clusterGroups).forEach(clusterGroup => {
        map.addLayer(clusterGroup);
    });
    
    // Add click handlers to cluster groups to zoom to fit all pins in the cluster
    Object.entries(clusterGroups).forEach(([colorName, clusterGroup]) => {
        clusterGroup.on('clusterclick', function(event) {
            // Get all markers in this cluster group
            const markers = [];
            clusterGroup.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    markers.push(layer);
                }
            });
            
            if (markers.length > 0) {
                // Create a feature group from all markers in this cluster
                const group = new L.featureGroup(markers);
                
                // Zoom to fit all markers in this cluster with padding
                map.fitBounds(group.getBounds(), {
                    padding: [20, 20],
                    maxZoom: 8
                });
            }
        });
    });
    
    // Fit map to show all cities on initial load
    const group = new L.featureGroup(Object.values(cityMarkers));
    map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 4
    });

    // Define city groups based on their accordion sections
    const cityGroups = {
        'north-america': {
            title: 'North America',
            cities: Object.keys(cityColors).filter(city => cityColors[city] === '#43A7DD')
        },
        'europe': {
            title: 'Europe',
            cities: Object.keys(cityColors).filter(city => cityColors[city] === '#FC922D')
        },
        'asia-south-america': {
            title: 'Asia & South America',
            cities: Object.keys(cityColors).filter(city => cityColors[city] === '#819B2A')
        },
        'africa': {
            title: 'Africa & Middle East',
            cities: Object.keys(cityColors).filter(city => cityColors[city] === '#DF5094')
        }
    };

    // Function to update accordion header counts
    function updateAccordionCounts() {
        Object.keys(cityGroups).forEach(sectionId => {
            const group = cityGroups[sectionId];
            const header = document.querySelector(`[data-section="${sectionId}"] span`);
            if (header) {
                header.innerHTML = `${group.title} <span class="accordion-count">${group.cities.length}</span>`;
            }
        });
    }

    // Update accordion counts on initialization
    updateAccordionCounts();

    // Update Show All button with total city count
    const totalCities = Object.keys(cities).length;

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
    
    // Update Show All button text with total city count
    showAllBtn.textContent = `Show All (${totalCities})`;
    
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

    // Add search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const dateRangeBtn = document.querySelector('.date-range-btn');
    const advancedOptionsBtn = document.querySelector('.advanced-options-btn');
    const backBtn = document.querySelector('.back-btn');

    // Back button functionality
    backBtn.addEventListener('click', function() {
        // Go back in browser history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, redirect to a default page or show message
            console.log('No previous page to go back to');
        }
    });

    // Search button functionality
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value;
        console.log('Searching for:', searchTerm);
        // Add search logic here
    });

    // Enter key search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Date range button functionality
    dateRangeBtn.addEventListener('click', function() {
        console.log('Opening date range picker');
        // Add date range picker logic here
    });

    // Advanced options button functionality
    advancedOptionsBtn.addEventListener('click', function() {
        console.log('Opening advanced options');
        // Add advanced options panel logic here
    });

    // Add visibility toggle functionality
    const visibilityToggles = document.querySelectorAll('.visibility-toggle');
    visibilityToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const cityKey = this.getAttribute('data-city');
            const marker = cityMarkers[cityKey];
            const cityLink = document.querySelector(`a[data-city="${cityKey}"]`);
            const cityDetails = cityLink.querySelector('.city-details');
            
            if (cityManualVisibility[cityKey]) {
                // Manually hide the city
                cityManualVisibility[cityKey] = false;
                cityVisibility[cityKey] = false;
                
                // Remove marker from its cluster group
                const color = cityColors[cityKey];
                const clusterGroupName = colorToClusterGroup[color];
                if (clusterGroupName && clusterGroups[clusterGroupName]) {
                    clusterGroups[clusterGroupName].removeLayer(marker);
                }
                
                // Remove active state if this city was active
                cityLink.classList.remove('active');
                
                // Hide city details
                if (cityDetails) {
                    cityDetails.style.display = 'none';
                }
            } else {
                // Manually show the city
                cityManualVisibility[cityKey] = true;
                cityVisibility[cityKey] = true;
                
                // Add marker back to its cluster group
                const color = cityColors[cityKey];
                const clusterGroupName = colorToClusterGroup[color];
                if (clusterGroupName && clusterGroups[clusterGroupName]) {
                    clusterGroups[clusterGroupName].addLayer(marker);
                }
                
                // Show city details
                if (cityDetails) {
                    cityDetails.style.display = 'block';
                }
            }
            
            // Update sidebar visibility and event count after toggle
            updateSidebarVisibility();
        });
    });

    // Add click handlers for menu toggle buttons
    const menuToggles = document.querySelectorAll('.menu-toggle');
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const cityKey = this.getAttribute('data-city');
            const city = cities[cityKey];
            
            // Close any existing popovers
            const existingPopover = document.querySelector('.menu-popover');
            if (existingPopover) {
                existingPopover.remove();
            }
            
            // Create popover element
            const popover = document.createElement('div');
            popover.className = 'menu-popover';
            popover.innerHTML = `
                <div class="menu-popover-content">
                    <div class="menu-item" data-action="zoom">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <span>Zoom to ${city.name}</span>
                    </div>
                    <div class="menu-item" data-action="info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="l 12,16 0,-4"/>
                            <path d="l 12,8 0,0"/>
                        </svg>
                        <span>City Information</span>
                    </div>
                    <div class="menu-item" data-action="export">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="21"/>
                            <line x1="8" y1="13" x2="16" y2="21"/>
                        </svg>
                        <span>Export Location</span>
                    </div>
                </div>
            `;
            
            // Position popover relative to the button
            const buttonRect = this.getBoundingClientRect();
            popover.style.position = 'fixed';
            popover.style.top = (buttonRect.bottom + 8) + 'px';
            popover.style.left = (buttonRect.left - 100) + 'px'; // Offset to the left to fit better
            popover.style.zIndex = '1000';
            
            document.body.appendChild(popover);
            
            // Add click handlers for menu items
            const menuItems = popover.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    
                    switch(action) {
                        case 'zoom':
                            // Zoom to the city
                            map.flyTo(city.coords, city.zoom, {
                                animate: true,
                                duration: 1.5
                            });
                            
                            // Open the marker popup
                            if (cityMarkers[cityKey]) {
                                cityMarkers[cityKey].openPopup();
                            }
                            
                            // Set as active
                            const cityLinks = document.querySelectorAll('.city-links a');
                            cityLinks.forEach(l => l.classList.remove('active'));
                            const cityLink = document.querySelector(`[data-city="${cityKey}"]`);
                            if (cityLink) {
                                cityLink.classList.add('active');
                            }
                            break;
                            
                        case 'info':
                            alert(`${city.name}\nCoordinates: ${city.coords[0]}, ${city.coords[1]}\nZoom Level: ${city.zoom}`);
                            break;
                            
                        case 'export':
                            // Export single city as KML
                            const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${city.name}</name>
    <Placemark>
      <name>${city.name}</name>
      <Point>
        <coordinates>${city.coords[1]},${city.coords[0]},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;
                            
                            const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${cityKey}-location.kml`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            break;
                    }
                    
                    // Close popover after action
                    popover.remove();
                });
            });
            
            // Close popover when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closePopover(e) {
                    if (!popover.contains(e.target)) {
                        popover.remove();
                        document.removeEventListener('click', closePopover);
                    }
                });
            }, 100);
        });
    });

    // Function to update sidebar visibility based on map viewport
    function updateSidebarVisibility() {
        const mapBounds = map.getBounds();
        const zoom = map.getZoom();
        
        // Only filter when zoomed in (zoom level > 1)
        const shouldFilter = zoom > 1;
        
        // Track which accordion sections should be expanded
        const sectionsWithVisibleCities = new Set();
        
        // Count visible events
        let visibleEventCount = 0;
        
        // Define which cities belong to which accordion sections
        const cityToSection = {
            newyork: 'north-america',
            losangeles: 'north-america', 
            sanfrancisco: 'north-america',
            mexicocity: 'north-america',
            london: 'europe',
            stpetersburg: 'europe',
            novgorod: 'europe',
            pskov: 'europe',
            petrozavodsk: 'europe',
            murmansk: 'europe',
            tokyo: 'asia-south-america',
            saopaulo: 'asia-south-america',
            cairo: 'africa',
            omaha: 'africa',
            iowacity: 'africa',
            iran: 'africa',
            cedarfalls: 'africa'
        };
        
        Object.keys(cities).forEach(cityKey => {
            const city = cities[cityKey];
            const cityListItem = document.querySelector(`li:has(a[data-city="${cityKey}"])`);
            const cityLink = document.querySelector(`a[data-city="${cityKey}"]`);
            const visibilityToggle = document.querySelector(`button[data-city="${cityKey}"]`);
            const eyeVisible = visibilityToggle?.querySelector('.eye-visible');
            const eyeHidden = visibilityToggle?.querySelector('.eye-hidden');
            
            const latLng = L.latLng(city.coords[0], city.coords[1]);
            const isInBounds = mapBounds.contains(latLng);
            const isManuallyVisible = cityManualVisibility[cityKey];
            
            // Track which sections have cities in view
            if (isInBounds && cityToSection[cityKey]) {
                sectionsWithVisibleCities.add(cityToSection[cityKey]);
            }
            
            // Count visible events (cities that are actually visible on the map)
            const color = cityColors[cityKey];
            const clusterGroupName = colorToClusterGroup[color];
            const isMarkerOnMap = clusterGroupName && clusterGroups[clusterGroupName] && clusterGroups[clusterGroupName].hasLayer(cityMarkers[cityKey]);
            
            if (cityVisibility[cityKey] && isMarkerOnMap) {
                visibleEventCount++;
            }
            
            if (cityListItem && visibilityToggle && eyeVisible && eyeHidden) {
                let shouldShowInSidebar = true;
                let shouldShowEyeAsVisible = isManuallyVisible;
                
                if (shouldFilter) {
                    // When zoomed in, cities out of bounds are treated as hidden
                    if (!isInBounds) {
                        shouldShowEyeAsVisible = false;
                        cityVisibility[cityKey] = false;
                        // Remove marker from cluster group if it's not in bounds
                        if (isManuallyVisible && isMarkerOnMap) {
                            clusterGroups[clusterGroupName].removeLayer(cityMarkers[cityKey]);
                        }
                    } else if (isManuallyVisible) {
                        // City is in bounds and manually visible
                        shouldShowEyeAsVisible = true;
                        cityVisibility[cityKey] = true;
                        // Add marker back to cluster group if it's not on the map
                        if (!isMarkerOnMap) {
                            clusterGroups[clusterGroupName].addLayer(cityMarkers[cityKey]);
                        }
                    }
                    
                    // Only show sidebar items that are in bounds or manually visible
                    shouldShowInSidebar = isInBounds || !isManuallyVisible;
                } else {
                    // When zoomed out, restore all cities based on manual visibility
                    if (isManuallyVisible) {
                        cityVisibility[cityKey] = true;
                        if (!isMarkerOnMap) {
                            clusterGroups[clusterGroupName].addLayer(cityMarkers[cityKey]);
                        }
                    } else {
                        cityVisibility[cityKey] = false;
                        if (isMarkerOnMap) {
                            clusterGroups[clusterGroupName].removeLayer(cityMarkers[cityKey]);
                        }
                    }
                    shouldShowEyeAsVisible = isManuallyVisible;
                }
                
                // Update sidebar item visibility
                cityListItem.style.display = shouldShowInSidebar ? 'flex' : 'none';
                
                // Update city details visibility
                const cityDetails = cityLink.querySelector('.city-details');
                
                // Update eye icon state
                if (shouldShowEyeAsVisible) {
                    eyeVisible.style.display = 'block';
                    eyeHidden.style.display = 'none';
                    visibilityToggle.classList.remove('hidden');
                    cityLink.classList.remove('disabled');
                    // Show city details when pin is visible
                    if (cityDetails) {
                        cityDetails.style.display = 'block';
                    }
                } else {
                    eyeVisible.style.display = 'none';
                    eyeHidden.style.display = 'block';
                    visibilityToggle.classList.add('hidden');
                    cityLink.classList.add('disabled');
                    // Hide city details when pin is hidden
                    if (cityDetails) {
                        cityDetails.style.display = 'none';
                    }
                }
            }
        });
        
        // Count visible events after all processing is done
        visibleEventCount = 0;
        Object.keys(cities).forEach(cityKey => {
            const color = cityColors[cityKey];
            const clusterGroupName = colorToClusterGroup[color];
            const isMarkerOnMap = clusterGroupName && clusterGroups[clusterGroupName] && clusterGroups[clusterGroupName].hasLayer(cityMarkers[cityKey]);
            
            if (cityVisibility[cityKey] && isMarkerOnMap) {
                visibleEventCount++;
            }
        });
        
        // Update the event count display
        const eventCountElement = document.querySelector('.event-count');
        if (eventCountElement) {
            eventCountElement.textContent = `Showing ${visibleEventCount} events`;
        }
        
        // Auto-expand accordion sections with cities in view
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            const sectionId = header.getAttribute('data-section');
            const content = document.getElementById(sectionId);
            
            if (sectionsWithVisibleCities.has(sectionId)) {
                // Expand this section as it has cities in view
                header.classList.add('active');
                content.classList.add('active');
            } else if (shouldFilter) {
                // When zoomed in, collapse sections with no cities in view
                header.classList.remove('active');
                content.classList.remove('active');
            }
            // When zoomed out, leave accordion state as is (don't auto-collapse)
        });
    }

    // Add map event listeners for viewport changes
    map.on('moveend', updateSidebarVisibility);
    map.on('zoomend', updateSidebarVisibility);
    
    // Initial update
    updateSidebarVisibility();

    // Add accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const content = document.getElementById(sectionId);
            const isActive = this.classList.contains('active');
            
            // Close all accordion sections
            accordionHeaders.forEach(h => h.classList.remove('active'));
            document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
            
            // Open clicked section if it wasn't already active
            if (!isActive) {
                this.classList.add('active');
                content.classList.add('active');
                
                // Zoom to show all cities in this group
                zoomToGroupCities(sectionId);
            }
        });
    });
    
    // Function to zoom to all cities in a specific group
    function zoomToGroupCities(sectionId) {
        // Define which cities belong to which accordion sections
        const sectionToCities = {
            'north-america': ['newyork', 'losangeles', 'sanfrancisco', 'mexicocity'],
            'europe': ['london', 'stpetersburg', 'novgorod', 'pskov', 'petrozavodsk', 'murmansk'],
            'asia-south-america': ['tokyo', 'saopaulo'],
            'africa': ['cairo', 'omaha', 'iowacity', 'iran', 'cedarfalls']
        };
        
        const citiesInSection = sectionToCities[sectionId];
        if (!citiesInSection) return;
        
        // First, show all hidden cities in this section
        const markersToShow = [];
        citiesInSection.forEach(cityKey => {
            const marker = cityMarkers[cityKey];
            if (!marker) return;
            
            const color = cityColors[cityKey];
            const clusterGroupName = colorToClusterGroup[color];
            const isMarkerOnMap = clusterGroupName && clusterGroups[clusterGroupName] && clusterGroups[clusterGroupName].hasLayer(marker);
            
            // If city is manually hidden or not on map, show it
            if (!cityManualVisibility[cityKey] || !isMarkerOnMap) {
                // Make city manually visible
                cityManualVisibility[cityKey] = true;
                cityVisibility[cityKey] = true;
                
                // Add marker to its cluster group if not already there
                if (!isMarkerOnMap && clusterGroupName && clusterGroups[clusterGroupName]) {
                    clusterGroups[clusterGroupName].addLayer(marker);
                }
                
                // Update UI elements
                const cityLink = document.querySelector(`a[data-city="${cityKey}"]`);
                const visibilityToggle = document.querySelector(`button[data-city="${cityKey}"]`);
                const eyeVisible = visibilityToggle?.querySelector('.eye-visible');
                const eyeHidden = visibilityToggle?.querySelector('.eye-hidden');
                const cityDetails = cityLink?.querySelector('.city-details');
                
                if (visibilityToggle && eyeVisible && eyeHidden) {
                    eyeVisible.style.display = 'block';
                    eyeHidden.style.display = 'none';
                    visibilityToggle.classList.remove('hidden');
                }
                
                if (cityLink) {
                    cityLink.classList.remove('disabled');
                }
                
                if (cityDetails) {
                    cityDetails.style.display = 'block';
                }
            }
            
            markersToShow.push(marker);
        });
        
        // Update sidebar visibility after showing cities
        updateSidebarVisibility();
        
        // Zoom to fit all markers in this section
        if (markersToShow.length > 0) {
            const group = new L.featureGroup(markersToShow);
            map.fitBounds(group.getBounds(), {
                padding: [30, 30],
                maxZoom: 6,
                animate: true,
                duration: 1.5
            });
        }
    }

    // Open the first accordion section by default
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }
});