// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Create map instance with a temporary center, will be updated to show all locations
    const map = L.map('map').setView([39.8283, -98.5795], 2);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create single marker cluster group for all markers
    const markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 80,
        disableClusteringAtZoom: 8,
        iconCreateFunction: function(cluster) {
            // Get all child markers and count by layer
            const children = cluster.getAllChildMarkers();
            const layerCounts = {};
            const layerColors = LAYERS.getColorsObject();
            
            // Count markers by layer
            children.forEach(marker => {
                const layer = marker.options.layer;
                layerCounts[layer] = (layerCounts[layer] || 0) + 1;
            });
            
            // Calculate proportions and create border segments
            const totalCount = children.length;
            const presentLayers = Object.keys(layerCounts);
            
            let clusterContent = '';
            if (presentLayers.length > 1) {
                // Create SVG with multi-colored border segments
                let segments = [];
                let currentAngle = -90; // Start from top
                
                presentLayers.forEach(layer => {
                    const proportion = layerCounts[layer] / totalCount;
                    const angleSize = proportion * 360;
                    const color = layerColors[layer];
                    
                    // Create SVG arc path
                    const startAngleRad = (currentAngle * Math.PI) / 180;
                    const endAngleRad = ((currentAngle + angleSize) * Math.PI) / 180;
                    const radius = 15;
                    const centerX = 18;
                    const centerY = 18;
                    
                    const x1 = centerX + radius * Math.cos(startAngleRad);
                    const y1 = centerY + radius * Math.sin(startAngleRad);
                    const x2 = centerX + radius * Math.cos(endAngleRad);
                    const y2 = centerY + radius * Math.sin(endAngleRad);
                    
                    const largeArcFlag = angleSize > 180 ? 1 : 0;
                    
                    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    segments.push(`<path d="${pathData}" fill="${color}" opacity="0.8"/>`);
                    currentAngle += angleSize;
                });
                
                clusterContent = `
                    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                        <svg width="36" height="36" viewBox="0 0 36 36" style="position: absolute; top: 0; left: 0; z-index: 1;">
                            ${segments.join('')}
                        </svg>
                        <div style="background-color: var(--gray-9); color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; position: relative; z-index: 2;">${cluster.getChildCount()}</div>
                    </div>
                `;
            } else if (presentLayers.length === 1) {
                // Single color border
                const color = layerColors[presentLayers[0]];
                clusterContent = `<div style="background-color: var(--gray-9); color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 3px solid ${color};">${cluster.getChildCount()}</div>`;
            } else {
                // Fallback for no layer info
                clusterContent = `<div style="background-color: var(--gray-9); color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${cluster.getChildCount()}</div>`;
            }
            
            return L.divIcon({
                html: clusterContent,
                className: 'custom-cluster-icon',
                iconSize: [36, 36]
            });
        }
    });

    // Add cluster hover events after the cluster group is created
    markerCluster.on('clustermouseover', function(e) {
        const clusterElement = e.layer._icon;
        if (clusterElement) {
            highlightCluster(clusterElement, true);
            
            // Collect all items in cluster for tooltip with icons
            const childMarkers = e.layer.getAllChildMarkers();
            const clusterItems = [];
            childMarkers.forEach(marker => {
                const popup = marker.getPopup();
                if (!popup) return;
                const content = popup.getContent();
                const nameMatch = content.match(/<h4>(.*?)<\/h4>/);
                if (!nameMatch) return;
                const locationName = nameMatch[1];
                const loc = locationsData.find(l => l.name === locationName);
                if (!loc) return;
                highlightSidebarItem(locationName, true);
                clusterItems.push({
                    headline: loc.headline,
                    name: locationName,
                    layer: loc.layer,
                    extractionType: loc['extraction-type'] || 'Location'
                });
            });

            // Show tooltip listing all items with colored icons
            if (clusterItems.length > 0) {
                const clusterRect = clusterElement.getBoundingClientRect();
                const mapContainer = document.getElementById('map');
                const mapRect = mapContainer.getBoundingClientRect();
                const x = clusterRect.left + clusterRect.width / 2 - mapRect.left;
                const y = clusterRect.top + clusterRect.height / 2 - mapRect.top;
                showClusterTooltip(clusterItems, x, y);
            }
        }
    });

    markerCluster.on('clustermouseout', function(e) {
        const clusterElement = e.layer._icon;
        if (clusterElement) {
            highlightCluster(clusterElement, false);
            
            // Remove highlight from sidebar items for all markers in the cluster
            const childMarkers = e.layer.getAllChildMarkers();
            childMarkers.forEach(marker => {
                const popup = marker.getPopup();
                if (popup) {
                    const content = popup.getContent();
                    const nameMatch = content.match(/<h4>(.*?)<\/h4>/);
                    if (nameMatch) {
                        const locationName = nameMatch[1];
                        highlightSidebarItem(locationName, false);
                    }
                }
            });
            
            // Hide tooltip
            hideMapTooltip();
        }
    });

    // Store individual markers and shapes by layer for visibility control
    const markersByLayer = LAYERS.initializeArrays();

    // Store individual geoshapes separately for different handling
    const shapesByLayer = LAYERS.initializeArrays();

    // Store geoshape data and their corresponding pin markers
    const geoshapeData = [];
    const geoshapePinsByLayer = LAYERS.initializeArrays();

    // (Removed unused showAllZoomLevel state)

    // Layer colors for both markers and polygons
    const layerColors = LAYERS.getColorsObject();

    // Mapping of extraction types to SVG filenames
    const extractionTypeSVGMap = {
        'Location': 'Location.svg',
        'Animal': 'PawPrint.svg',
        'Currency': 'Currency.svg',
        'Civilian Vehicle': 'Car.svg',
        'Communication Device': 'walkie.svg',
        'Disease': 'Disease.svg',
        'Date-Time Mention': 'DateTimeMention.svg',
        'Facility': 'Facility.svg',
        'Fungus': 'Fungus.svg',
        'Microbe': 'Microbe.svg',
        'Miscellaneous': 'Shapes.svg',
        'Military Vehicle': 'TankFilled.svg',
        'Named Event': 'NamedEvent.svg',
        'Organization': 'Organization.svg',
        'Person': 'Person.svg',
        'Plant': 'Plant.svg',
        'Role': 'Manage.svg',
        'Substance': 'Flask.svg',
        'Unidentified Equipment': 'UnidentifiedEquipment.svg',
        'Unnamed Event': 'UnnamedEvent.svg',
        'Weapon': 'Grenade.svg'
    };

    // Function to get SVG content by filename from inline map, with a simple fallback
    function getSVG(filename) {
        if (window.SVG_MAP && window.SVG_MAP.byFilename && window.SVG_MAP.byFilename[filename]) {
            return window.SVG_MAP.byFilename[filename];
        }
        // Fallback SVG
        return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>';
    }

    // Function to colorize SVG content
    function colorizeSVG(svgContent, color) {
        // Replace fill attributes with the specified color
        let colorizedSVG = svgContent
            .replace(/fill="[^"]*"/g, `fill="${color}"`)
            .replace(/fill:[^;]*/g, `fill:${color}`)
            .replace(/<svg/, `<svg style="color: ${color}"`);
        
        // If no fill attributes found, add fill to the main elements
        if (!colorizedSVG.includes('fill=')) {
            colorizedSVG = colorizedSVG.replace(/<path/g, `<path fill="${color}"`);
            colorizedSVG = colorizedSVG.replace(/<circle/g, `<circle fill="${color}"`);
            colorizedSVG = colorizedSVG.replace(/<rect/g, `<rect fill="${color}"`);
            colorizedSVG = colorizedSVG.replace(/<polygon/g, `<polygon fill="${color}"`);
        }
        
        return colorizedSVG;
    }

    // Function to get extraction type icon HTML
    function getExtractionTypeIconHTML(extractionType, color, size = '16px') {
        const filename = extractionTypeSVGMap[extractionType] || extractionTypeSVGMap['Location'];
        const svgContent = getSVG(filename);
        const colorizedSVG = colorizeSVG(svgContent, color);
        
        // Wrap in a container div with specified size
        return `<div style="width: ${size}; height: ${size}; display: inline-flex; align-items: center; justify-content: center;">${colorizedSVG}</div>`;
    }

    // (Removed unused layerIcons fallback marker creation)

    // Function to create extraction-type specific map markers
    function createExtractionTypeMarker(extractionType, layerColor) {
        const filename = extractionTypeSVGMap[extractionType] || extractionTypeSVGMap['Location'];
        const svgContent = getSVG(filename);
        const colorizedSVG = colorizeSVG(svgContent, 'white'); // White for visibility on colored pin
        
        return L.divIcon({
            html: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.4));">
                <circle cx="12" cy="12" r="12" fill="${layerColor}" />
                <g transform="translate(16,16)" style="transform-origin: center;">
                    <g transform="translate(-12,-12)">
                        ${colorizedSVG.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
                    </g>
                </g>
            </svg>`,
            className: 'custom-extraction-circle-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }

    // Function to get pin icon for sidebar display
    function getPinIcon(extractionType, layerColor) {
        if (!extractionType || !layerColor) {
            return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="8" fill="#ccc"/></svg>';
        }
        
        return getExtractionTypeIconHTML(extractionType, layerColor, '16px');
    }

    // (Removed duplicate getLayerClass; single canonical version defined later)

    // Function to create a geoshape (polygon) for locations with boundary data
    function createGeoshape(location) {
        const color = layerColors[location.layer];
        
        const polygon = L.polygon(location.boundaries, {
            color: 'white',         // White stroke/border color
            weight: 2,
            opacity: 0.8,
            fillColor: color,       // Layer-specific fill color
            fillOpacity: 0.3,
            layer: location.layer
        });

        // Create popup content
        const popupContent = `
            <div>
                <h3>${location.headline}</h3>
                <h4>${location.name}</h4>
                <p>${location.description}</p>
                <small>${location.date}</small>
            </div>
        `;
        
        polygon.bindPopup(popupContent);

        // Add hover effects for highlighting
        polygon.on('mouseover', function(e) {
            this.setStyle({
                weight: 3,
                fillOpacity: 0.4
            });
            highlightSidebarItem(location.name, true);
            
            // Show tooltip at polygon center
            const center = polygon.getBounds().getCenter();
            const point = map.latLngToContainerPoint(center);
            showMapTooltip(location.name, point.x, point.y, false, 0);
        });

        polygon.on('mouseout', function(e) {
            this.setStyle({
                weight: 2,
                fillOpacity: 0.3
            });
            highlightSidebarItem(location.name, false);
            hideMapTooltip();
        });

        // Add click event to fly to polygon bounds
        polygon.on('click', function(e) {
            map.flyToBounds(polygon.getBounds(), {
                padding: [20, 20],
                duration: 1.5
            });
            
            // Update sidebar and geoshape visibility after animation completes
            setTimeout(function() {
                updateSidebarVisibility();
                updateGeoshapeVisibility();
            }, 1600);
        });

        return polygon;
    }

    // Function to manage geoshape/pin visibility based on zoom level
    function updateGeoshapeVisibility() {
        const currentZoom = map.getZoom();
        const bounds = map.getBounds();
        
        geoshapeData.forEach((location, index) => {
            const polygon = shapesByLayer[location.layer].find(shape => 
                shape.options.locationName === location.name
            );
            const pinMarker = geoshapePinsByLayer[location.layer][geoshapeData.filter(loc => loc.layer === location.layer).indexOf(location)];
            
            // Check if this location should be visible based on individual location visibility
            const isLocationVisible = locationVisibility[location.name] !== false; // Default to true if not set
            
            // Determine zoom threshold based on type: countries at zoom 4+, states at zoom 7+, seas at zoom 4+, cities at zoom 9+
            let zoomThreshold;
            if (location.type === 'country') {
                zoomThreshold = 3;
            } else if (location.type === 'state') {
                zoomThreshold = 5;
            } else if (location.type === 'sea') {
                zoomThreshold = 4;
            } else {
                zoomThreshold = 9; // Default for cities and other types
            }
            const shouldShowAsPins = currentZoom <= zoomThreshold;
            
            if (shouldShowAsPins) {
                // Show as pin, hide polygon
                if (polygon && map.hasLayer(polygon)) {
                    map.removeLayer(polygon);
                }
                if (pinMarker && !markerCluster.hasLayer(pinMarker) && layerVisibility[location.layer] && isLocationVisible) {
                    markerCluster.addLayer(pinMarker);
                }
            } else {
                // Hide pin, potentially show polygon
                if (pinMarker && markerCluster.hasLayer(pinMarker)) {
                    markerCluster.removeLayer(pinMarker);
                }
                
                // Only show polygon if its center is visible, layer is visible, and location is visible
                if (polygon && layerVisibility[location.layer] && isLocationVisible) {
                    const center = L.polygon(location.boundaries).getBounds().getCenter();
                    if (bounds.contains(center)) {
                        if (!map.hasLayer(polygon)) {
                            map.addLayer(polygon);
                        }
                    } else {
                        if (map.hasLayer(polygon)) {
                            map.removeLayer(polygon);
                        }
                    }
                }
            }
        });
    }

    // Layer visibility state
    const layerVisibility = LAYERS.getVisibilityObject();

    // Location visibility state (indexed by location name)
    const locationVisibility = {};

    // Get sidebar container
    const locationList = document.getElementById('location-list');

    // Helper: find a marker (regular or geoshape pin) for a given location object
    function findMarkerForLocation(location) {
        if (!location) return null;
        // Try regular point marker
        const layerMarkers = markersByLayer[location.layer] || [];
        let marker = layerMarkers.find(m => {
            const popup = m.getPopup && m.getPopup();
            const content = popup && popup.getContent && popup.getContent();
            return typeof content === 'string' && content.includes(`<h4>${location.name}</h4>`);
        }) || null;

        // If not found and location has boundaries, try geoshape pin by aligned index
        if (!marker && location.boundaries && location.boundaries.length > 0) {
            const geoshapePins = geoshapePinsByLayer[location.layer] || [];
            const locationIndex = geoshapeData
                .filter(l => l.layer === location.layer)
                .findIndex(l => l.name === location.name);
            if (locationIndex >= 0 && locationIndex < geoshapePins.length) {
                marker = geoshapePins[locationIndex] || null;
            }
        }
        return marker;
    }

    // Helper: find a marker by location name
    function findMarkerForLocationName(locationName) {
        const loc = locationsData.find(l => l.name === locationName);
        return findMarkerForLocation(loc);
    }

    // Function to show all locations with fly animation (for button clicks)
    function showAllLocations() {
        // Calculate bounds from all visible locations
        const group = new L.featureGroup();
        locationsData.forEach(location => {
            if (layerVisibility[location.layer]) {
                if (location.boundaries && location.boundaries.length > 0) {
                    // Add polygon bounds
                    group.addLayer(L.polygon(location.boundaries));
                } else {
                    // Add marker point
                    group.addLayer(L.marker([location.latitude, location.longitude]));
                }
            }
        });
        
        // Fly to bounds to show all locations with padding and animation
        if (group.getLayers().length > 0) {
            map.flyToBounds(group.getBounds(), {
                padding: [20, 20],
                duration: 1.5
            });
            
            // Update sidebar and geoshape visibility after animation completes
            setTimeout(function() {
                updateSidebarVisibility();
                updateGeoshapeVisibility();
            }, 1600);
        }
    }

    // Function to fit all locations (for initial load)
    function fitAllLocations() {
        // Calculate bounds from all locations
        const group = new L.featureGroup();
        locationsData.forEach(location => {
            if (location.boundaries && location.boundaries.length > 0) {
                // Add polygon bounds
                group.addLayer(L.polygon(location.boundaries));
            } else {
                // Add marker point
                group.addLayer(L.marker([location.latitude, location.longitude]));
            }
        });
        
        // Fit map to show all locations with padding (no animation for initial load)
        map.fitBounds(group.getBounds(), {
            padding: [20, 20]
        });
        
        // (Removed unused showAllZoomLevel capture)
    }

    // Function to zoom to specific layer
    function zoomToLayer(layerName) {
        const layerLocations = locationsData.filter(location => location.layer === layerName);
        if (layerLocations.length === 0) return;

        const group = new L.featureGroup();
        layerLocations.forEach(location => {
            if (location.boundaries && location.boundaries.length > 0) {
                // Add polygon bounds
                group.addLayer(L.polygon(location.boundaries));
            } else {
                // Add marker point
                group.addLayer(L.marker([location.latitude, location.longitude]));
            }
        });
        
        map.flyToBounds(group.getBounds(), {
            padding: [20, 20],
            duration: 1.5
        });
        
        // Update sidebar and geoshape visibility after animation completes
        setTimeout(function() {
            updateSidebarVisibility();
            updateGeoshapeVisibility();
        }, 1600);
    }

    // Function to toggle layer visibility
    function toggleLayerVisibility(layerName) {
        layerVisibility[layerName] = !layerVisibility[layerName];
        
        // Toggle individual markers in the single cluster
        const layerMarkers = markersByLayer[layerName];
        layerMarkers.forEach(marker => {
            if (layerVisibility[layerName]) {
                markerCluster.addLayer(marker);
            } else {
                markerCluster.removeLayer(marker);
            }
        });

        // Toggle geoshape pins in cluster
        const layerGeoshapePins = geoshapePinsByLayer[layerName];
        layerGeoshapePins.forEach(pin => {
            if (layerVisibility[layerName]) {
                // Will be managed by updateGeoshapeVisibility based on zoom level
            } else {
                if (markerCluster.hasLayer(pin)) {
                    markerCluster.removeLayer(pin);
                }
            }
        });

        // Toggle individual shapes will be managed by updateGeoshapeVisibility
        // based on zoom level and bounds visibility
        
        // Update eye icon
        const layerSection = document.querySelector(`[data-layer="${layerName}"]`);
        const eyeBtn = layerSection.querySelector('.eye-toggle');
        updateEyeIcon(eyeBtn, layerVisibility[layerName]);
        
        // Update visibility based on current state
        updateSidebarVisibility();
        updateGeoshapeVisibility();
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
        document.querySelectorAll('.layer-popover, .location-popover').forEach(popover => {
            popover.classList.remove('show');
        });
    }

    // Function to toggle individual location visibility
    function toggleLocationVisibility(locationName) {
        locationVisibility[locationName] = !locationVisibility[locationName];
        
        // Find the location's marker and toggle its visibility
        const location = locationsData.find(loc => loc.name === locationName);
        if (location) {
            const marker = findMarkerForLocation(location);
            
            if (marker) {
                if (locationVisibility[locationName]) {
                    // Show marker - but respect zoom level for geoshapes
                    if (location.boundaries && location.boundaries.length > 0) {
                        // For geoshapes, let updateGeoshapeVisibility manage the actual visibility
                        updateGeoshapeVisibility();
                    } else {
                        // For regular markers, add directly to cluster
                        if (!markerCluster.hasLayer(marker)) {
                            markerCluster.addLayer(marker);
                        }
                    }
                } else {
                    // Hide marker
                    if (markerCluster.hasLayer(marker)) {
                        markerCluster.removeLayer(marker);
                    }
                    // Also hide the corresponding polygon if it's a geoshape
                    if (location.boundaries && location.boundaries.length > 0) {
                        const polygon = shapesByLayer[location.layer].find(shape => 
                            shape.options.locationName === location.name
                        );
                        if (polygon && map.hasLayer(polygon)) {
                            map.removeLayer(polygon);
                        }
                    }
                }
            }
        }
        
        // Update the location item's appearance
        updateLocationItemAppearance(locationName);
    }

    // Function to update location item appearance based on visibility
    function updateLocationItemAppearance(locationName) {
        const locationItems = document.querySelectorAll('.location-item');
        locationItems.forEach(item => {
            const nameElement = item.querySelector('.location-name-content span:last-child');
            if (nameElement && nameElement.textContent === locationName) {
                const isVisible = locationVisibility[locationName];
                const locationNameDiv = item.querySelector('.location-name');
                const infoWrapper = item.querySelector('.location-info-wrapper');
                const eyeBtn = item.querySelector('.location-eye-toggle');
                
                if (isVisible) {
                    // Show state
                    locationNameDiv.classList.remove('location-hidden');
                    infoWrapper.style.display = 'block';
                } else {
                    // Hidden state
                    locationNameDiv.classList.add('location-hidden');
                    infoWrapper.style.display = 'none';
                }
                
                // Update eye icon
                if (eyeBtn) {
                    updateLocationEyeIcon(eyeBtn, isVisible);
                }
            }
        });
    }

    // Function to update location eye icon
    function updateLocationEyeIcon(eyeBtn, isVisible) {
        const eyeIcon = isVisible ? 
            '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
            '<svg viewBox="0 0 24 24"><path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/></svg>';
        eyeBtn.innerHTML = eyeIcon;
        eyeBtn.classList.toggle('eye-closed', !isVisible);
    }

    // Function to get CSS class for layer
    function getLayerClass(layer) {
        return 'layer-' + layer.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Function to highlight/unhighlight sidebar item when hovering over map markers
    function highlightSidebarItem(locationName, highlight) {
        const locationItems = document.querySelectorAll('.location-item');
        locationItems.forEach(item => {
            const nameElement = item.querySelector('.location-name-content span:last-child');
            if (nameElement && nameElement.textContent === locationName) {
                if (highlight) {
                    // Find the location data to get the layer
                    const location = locationsData.find(loc => loc.name === locationName);
                    if (location) {
                        const layerClass = getLayerClass(location.layer);
                        item.classList.add('location-item-highlighted', layerClass);
                    }
                } else {
                    // Remove both highlighted class and any layer classes
                    item.classList.remove('location-item-highlighted');
                    ['layer-activities-extracted-from-search-results', 'layer-drone-attacks', 'layer-drones-witnessed', 'layer-suspect-movement'].forEach(cls => {
                        item.classList.remove(cls);
                    });
                }
            }
        });
    }

    // Function to highlight/unhighlight clusters
    function highlightCluster(clusterElement, highlight) {
        if (clusterElement) {
            if (highlight) {
                // Add highlight class for filter and z-index
                clusterElement.classList.add('cluster-highlighted');
                
                // Get current transform and add scale to it
                const currentTransform = clusterElement.style.transform || '';
                const newTransform = currentTransform + ' scale(1.2)';
                clusterElement.style.transform = newTransform;
                clusterElement.style.transformOrigin = 'center';
            } else {
                // Remove highlight class
                clusterElement.classList.remove('cluster-highlighted');
                
                // Remove scale from current transform
                const currentTransform = clusterElement.style.transform || '';
                const newTransform = currentTransform.replace(/\s*scale\([^)]*\)/g, '');
                clusterElement.style.transform = newTransform;
                clusterElement.style.transformOrigin = '';
            }
        }
    }

    // Function to highlight/unhighlight map marker when hovering over sidebar location names
    function highlightMapMarker(locationName, highlight) {
        // Find the location's marker
        const location = locationsData.find(loc => loc.name === locationName);
        if (location) {
            const marker = findMarkerForLocation(location);
            
            if (marker && markerCluster.hasLayer(marker)) {
                const markerElement = marker._icon;
                if (markerElement) {
                    if (highlight) {
                        // Add highlight class for filter and z-index
                        markerElement.classList.add('marker-highlighted');
                        
                        // Get current transform and add scale to it
                        const currentTransform = markerElement.style.transform || '';
                        const newTransform = currentTransform + ' scale(1.1)';
                        markerElement.style.transform = newTransform;
                        markerElement.style.transformOrigin = 'bottom center';
                    } else {
                        // Remove highlight class
                        markerElement.classList.remove('marker-highlighted');
                        
                        // Remove scale from current transform
                        const currentTransform = markerElement.style.transform || '';
                        const newTransform = currentTransform.replace(/\s*scale\([^)]*\)/g, '');
                        markerElement.style.transform = newTransform;
                        markerElement.style.transformOrigin = '';
                    }
                } else {
                    // Marker might be in a cluster, try to find and highlight the cluster
                    const clusters = markerCluster._featureGroup._layers;
                    Object.values(clusters).forEach(cluster => {
                        if (cluster.getAllChildMarkers && cluster.getAllChildMarkers().includes(marker)) {
                            const clusterElement = cluster._icon;
                            if (clusterElement) {
                                highlightCluster(clusterElement, highlight);
                            }
                        }
                    });
                }
            }
        }
    }

    // Create tooltip element
    const mapTooltip = document.createElement('div');
    mapTooltip.className = 'map-tooltip';
    mapTooltip.style.display = 'none';
    document.body.appendChild(mapTooltip);

    // Function to show tooltip next to a single map marker
    function showMapTooltip(locationName, x, y, isCluster = false, additionalCount = 0) {
        const location = locationsData.find(loc => loc.name === locationName);
        if (!location) return;

        let tooltipContent = `
            <div class="map-tooltip-location">${location.name}</div>
            <div class="map-tooltip-headline">${location.headline}</div>
        `;
        
        mapTooltip.innerHTML = tooltipContent;
        mapTooltip.style.display = 'block';
        
        // Position tooltip next to the marker/cluster
        const tooltipRect = mapTooltip.getBoundingClientRect();
        const mapContainer = document.getElementById('map');
        const mapRect = mapContainer.getBoundingClientRect();
        
        // Calculate position relative to map container
        let left = x + 20; // Offset from marker
        let top = y - (tooltipRect.height / 2); // Center vertically on marker
        
        // Adjust if tooltip would go outside map bounds
        if (left + tooltipRect.width > mapRect.width) {
            left = x - tooltipRect.width - 20; // Show on left side
        }
        if (top < 0) {
            top = 10;
        }
        if (top + tooltipRect.height > mapRect.height) {
            top = mapRect.height - tooltipRect.height - 10;
        }
        
        mapTooltip.style.left = (mapRect.left + left) + 'px';
        mapTooltip.style.top = (mapRect.top + top) + 'px';
    }

    // Function to show tooltip for a cluster with all items listed and colored icons
    function showClusterTooltip(clusterItems, x, y) {
        if (!clusterItems || clusterItems.length === 0) return;

        const maxItems = 3;
        const displayItems = clusterItems.slice(0, maxItems);
        const remaining = clusterItems.length - displayItems.length;

        const itemsHTML = displayItems.map(item => {
            const iconHTML = getExtractionTypeIconHTML(item.extractionType || 'Location', layerColors[item.layer] || '#66778C', '14px');
            return `
                <div class="map-tooltip-cluster-item" style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;max-width:360px;">
                    <span class="map-tooltip-cluster-icon">${iconHTML}</span>
                    <span style="display:flex;flex-direction:column;gap:4px;max-width:320px;">
                        <span class="map-tooltip-cluster-headline" style="line-height:1.25;">${item.headline}</span>
                        <div class="location-name"><div class="location-name-content"><span>${item.name}</span></div></div>
                    </span>
                </div>
            `;
        }).join('');

        const moreHTML = remaining > 0
            ? `<div class="map-tooltip-cluster-more" style="margin-top:6px;color:var(--gray-9);font-size:12px;">+${remaining} more</div>`
            : '';

        const tooltipContent = `
            <div class="map-tooltip-cluster" style="padding:10px 12px;">
                ${itemsHTML}
                ${moreHTML}
            </div>
        `;

        mapTooltip.innerHTML = tooltipContent;
        mapTooltip.style.display = 'block';

        // Position tooltip next to the cluster
        const tooltipRect = mapTooltip.getBoundingClientRect();
        const mapContainer = document.getElementById('map');
        const mapRect = mapContainer.getBoundingClientRect();

        let left = x + 20;
        let top = y - (tooltipRect.height / 2);

        if (left + tooltipRect.width > mapRect.width) {
            left = x - tooltipRect.width - 20;
        }
        if (top < 0) {
            top = 10;
        }
        if (top + tooltipRect.height > mapRect.height) {
            top = mapRect.height - tooltipRect.height - 10;
        }

        mapTooltip.style.left = (mapRect.left + left) + 'px';
        mapTooltip.style.top = (mapRect.top + top) + 'px';
    }

    // Function to hide tooltip
    function hideMapTooltip() {
        mapTooltip.style.display = 'none';
    }

    // Function to show tooltip for sidebar hover
    function showTooltipForLocation(locationName) {
        const location = locationsData.find(loc => loc.name === locationName);
        if (!location) return;

        const marker = findMarkerForLocation(location);
        
        if (marker && markerCluster.hasLayer(marker)) {
            const markerElement = marker._icon;
            if (markerElement) {
                // Individual marker - show tooltip next to it
                const markerRect = markerElement.getBoundingClientRect();
                const mapContainer = document.getElementById('map');
                const mapRect = mapContainer.getBoundingClientRect();
                
                const x = markerRect.left + markerRect.width / 2 - mapRect.left;
                const y = markerRect.top + markerRect.height / 2 - mapRect.top;
                
                showMapTooltip(locationName, x, y, false, 0);
            } else {
                // Marker is in a cluster - find the cluster and show tooltip
                const clusters = markerCluster._featureGroup._layers;
                Object.values(clusters).forEach(cluster => {
                    if (cluster.getAllChildMarkers && cluster.getAllChildMarkers().includes(marker)) {
                        const clusterElement = cluster._icon;
                        if (clusterElement) {
                            const clusterRect = clusterElement.getBoundingClientRect();
                            const mapContainer = document.getElementById('map');
                            const mapRect = mapContainer.getBoundingClientRect();
                            
                            const x = clusterRect.left + clusterRect.width / 2 - mapRect.left;
                            const y = clusterRect.top + clusterRect.height / 2 - mapRect.top;
                            
                            // Count additional locations in cluster
                            const allMarkersInCluster = cluster.getAllChildMarkers();
                            const additionalCount = allMarkersInCluster.length - 1;
                            
                            showMapTooltip(locationName, x, y, true, additionalCount);
                        }
                    }
                });
            }
        }
    }

    

    // Group locations by layer
    const locationsByLayer = {};
    const layerOrder = ['Activities extracted from search results', 'Drone attacks', 'Drones witnessed', 'Suspect movement', 'Troop Activity'];

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
    for (const layerName of layerOrder) {
        if (locationsByLayer[layerName]) {
            // Create layer section
            const layerSection = document.createElement('div');
            layerSection.className = 'layer-section';
            layerSection.setAttribute('data-layer', layerName);
            
            // Create layer header with controls
            const layerHeader = document.createElement('div');
            layerHeader.className = 'layer-header';
            layerHeader.innerHTML = `
                    <button class="layer-control-btn target-btn ${getLayerClass(layerName)}" title="Zoom to layer">
                        <svg viewBox="0 0 24 24"><path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M20.94,11C20.7,6.73 17.27,3.3 13,3.06V1H11V3.06C6.73,3.3 3.3,6.73 3.06,11H1V13H3.06C3.3,17.27 6.73,20.7 11,20.94V23H13V20.94C17.27,20.7 20.7,17.27 20.94,13H23V11H20.94M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19Z"/></svg>
                    </button>
                <div class="layer-title">
                    <div class="layer-title-row">
                        <span class="layer-name">${layerName}</span>
                    </div>
                    <div class="layer-count">Showing ${locationsByLayer[layerName].length} of ${locationsByLayer[layerName].length} locations</div>
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
            for (const location of locationsByLayer[layerName]) {
                // Initialize location visibility (default to visible)
                locationVisibility[location.name] = true;

                // Check if location has boundary data for geoshape rendering
                if (location.boundaries && location.boundaries.length > 0) {
                    // Create geoshape (polygon) for cities, states, countries
                    const polygon = createGeoshape(location);
                    polygon.options.locationName = location.name; // Add identifier
                    
                    // Initially add polygon to map (will be managed by updateGeoshapeVisibility)
                    map.addLayer(polygon);
                    
                    // Store polygon reference for layer visibility control
                    shapesByLayer[location.layer].push(polygon);
                    
                    // Store geoshape data for management
                    geoshapeData.push(location);
                    
                    // Create a corresponding pin marker for clustering (positioned at geoshape center)
                    const center = L.polygon(location.boundaries).getBounds().getCenter();
                    const popupContent = `
                        <div>
                            <h3>${location.headline}</h3>
                            <h4>${location.name}</h4>
                            <p>${location.description}</p>
                            <small>${location.date}</small>
                        </div>
                    `;
                    
                    // Create pin marker with extraction-type icon
                    const pinMarkerIcon = createExtractionTypeMarker(location['extraction-type'] || 'Location', layerColors[location.layer]);
                    const pinMarker = L.marker([center.lat, center.lng], {
                        icon: pinMarkerIcon,
                        layer: location.layer
                    }).bindPopup(popupContent);
                    
                    // Add click event to pin marker
                    pinMarker.on('click', function(e) {
                        // Zoom to the geoshape bounds instead of just the center point
                        map.flyToBounds(polygon.getBounds(), {
                            padding: [20, 20],
                            duration: 1.5
                        });
                        
                        // Update sidebar after animation completes
                        setTimeout(() => {
                            updateSidebarVisibility();
                            updateGeoshapeVisibility();
                        }, 1600);
                    });

                    // Add hover events to pin marker
                    pinMarker.on('mouseover', function(e) {
                        highlightSidebarItem(location.name, true);
                        highlightMapMarker(location.name, true);
                        
                        const markerElement = pinMarker._icon;
                        if (markerElement) {
                            const markerRect = markerElement.getBoundingClientRect();
                            const mapContainer = document.getElementById('map');
                            const mapRect = mapContainer.getBoundingClientRect();
                            
                            const x = markerRect.left + markerRect.width / 2 - mapRect.left;
                            const y = markerRect.top + markerRect.height / 2 - mapRect.top;
                            
                            showMapTooltip(location.name, x, y, false, 0);
                        }
                    });

                    pinMarker.on('mouseout', function(e) {
                        highlightSidebarItem(location.name, false);
                        highlightMapMarker(location.name, false);
                        hideMapTooltip();
                    });
                    
                    // Store pin marker reference
                    geoshapePinsByLayer[location.layer].push(pinMarker);
                } else {
                    // Create marker for point locations
                    const popupContent = `
                        <div>
                            <h3>${location.headline}</h3>
                            <h4>${location.name}</h4>
                            <p>${location.description}</p>
                            <small>${location.date}</small>
                        </div>
                    `;
                    
                    // Create marker with extraction-type icon
                    const markerIcon = createExtractionTypeMarker(location['extraction-type'] || 'Location', layerColors[location.layer]);
                    const marker = L.marker([location.latitude, location.longitude], {
                        icon: markerIcon,
                        layer: location.layer
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

                    // Add hover events to marker to highlight corresponding sidebar item and the marker itself
                    marker.on('mouseover', function(e) {
                        highlightSidebarItem(location.name, true);
                        highlightMapMarker(location.name, true);
                        
                        // Show tooltip next to the marker
                        const markerElement = marker._icon;
                        if (markerElement) {
                            const markerRect = markerElement.getBoundingClientRect();
                            const mapContainer = document.getElementById('map');
                            const mapRect = mapContainer.getBoundingClientRect();
                            
                            const x = markerRect.left + markerRect.width / 2 - mapRect.left;
                            const y = markerRect.top + markerRect.height / 2 - mapRect.top;
                            
                            showMapTooltip(location.name, x, y, false, 0);
                        }
                    });

                    marker.on('mouseout', function(e) {
                        highlightSidebarItem(location.name, false);
                        highlightMapMarker(location.name, false);
                        hideMapTooltip();
                    });
                    
                    // Add marker to the appropriate cluster group
                    markerCluster.addLayer(marker);

                    // Store marker reference for layer visibility control
                    markersByLayer[location.layer].push(marker);
                }

                // Create sidebar item with SVG pin icon and controls
                const locationItem = document.createElement('div');
                locationItem.className = 'location-item';
                
                // Get the pin icon HTML
            const pinIconHTML = getPinIcon(location['extraction-type'] || 'Location', layerColors[location.layer]);
                
                locationItem.innerHTML = `
                    <div class="location-name" data-lat="${location.latitude}" data-lng="${location.longitude}">
                        <div class="location-name-content">
                            <span class="pin-icon ${getLayerClass(location.layer)}" title="${location['extraction-type'] || 'Location'}" data-tooltip="${location['extraction-type'] || 'Location'}">${pinIconHTML}</span>
                            <span>${location.name}</span>
                        </div>
                        <div class="location-controls">
                            <button class="layer-control-btn location-eye-toggle" title="Toggle visibility">
                                <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            </button>
                            <button class="layer-control-btn location-menu-btn" title="Location options">
                                <svg viewBox="0 0 24 24"><path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/></svg>
                                <div class="location-popover">
                                    <div class="location-popover-item" data-action="zoom">Zoom to Location</div>
                                    <div class="location-popover-item" data-action="hide">Hide Location</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="location-info-wrapper">
                        <div class="location-headline">${location.headline}</div>
                        <div class="location-date">${location.date}</div>
                        <div class="location-description">${location.description}</div>
                        <div class="location-coordinates">
                            ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
                        </div>
                    </div>
                `;

                // Add click handlers for location controls
                const locationEyeBtn = locationItem.querySelector('.location-eye-toggle');
                const locationMenuBtn = locationItem.querySelector('.location-menu-btn');
                const locationPopover = locationItem.querySelector('.location-popover');

                if (locationEyeBtn) {
                    locationEyeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleLocationVisibility(location.name);
                    });
                }
                
                if (locationMenuBtn && locationPopover) {
                    locationMenuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeAllPopovers();
                        locationPopover.classList.toggle('show');
                    });

                    // Add popover menu handlers
                    locationPopover.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = e.target.dataset.action;
                        
                        switch(action) {
                            case 'zoom':
                                map.flyTo([location.latitude, location.longitude], 13, {
                                    animate: true,
                                    duration: 1.5
                                });
                                setTimeout(updateSidebarVisibility, 1600);
                                break;
                            case 'hide':
                                if (locationVisibility[location.name]) {
                                    toggleLocationVisibility(location.name);
                                }
                                break;
                        }
                        closeAllPopovers();
                    });
                }

                // Add click event to location name for flying to location (but not on controls)
                const locationNameElement = locationItem.querySelector('.location-name-content span:last-child');
                if (locationNameElement) {
                    locationNameElement.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const nameDiv = locationItem.querySelector('.location-name');
                        const lat = parseFloat(nameDiv.dataset.lat);
                        const lng = parseFloat(nameDiv.dataset.lng);
                        map.flyTo([lat, lng], 13, {
                            animate: true,
                            duration: 1.5
                        });
                        
                        // Update sidebar after animation completes
                        setTimeout(updateSidebarVisibility, 1600);
                    });
                }

                // Add hover events to entire location item to highlight corresponding map marker
                locationItem.addEventListener('mouseenter', function(e) {
                    highlightMapMarker(location.name, true);
                    showTooltipForLocation(location.name);
                });

                locationItem.addEventListener('mouseleave', function(e) {
                    highlightMapMarker(location.name, false);
                    hideMapTooltip();
                });

                layerSection.appendChild(locationItem);
            }

            locationList.appendChild(layerSection);
        }
    }

    // Add all cluster groups to the map
    map.addLayer(markerCluster);

    // Close popovers when clicking outside
    document.addEventListener('click', closeAllPopovers);

    // Function to update sidebar based on visible map bounds
    function updateSidebarVisibility() {
        const bounds = map.getBounds();
        
        // Update each location item's visibility
        locationsData.forEach(location => {
            const isInBounds = bounds.contains([location.latitude, location.longitude]);
            const isLayerVisible = layerVisibility[location.layer];
            const isLocationVisible = locationVisibility[location.name];
            
            // Find the location item in the sidebar
            const locationItems = document.querySelectorAll('.location-item');
            locationItems.forEach(item => {
                const locationName = item.querySelector('.location-name-content span:last-child');
                if (locationName && locationName.textContent === location.name) {
                    // Show item only if location is in bounds AND layer is visible AND location is visible
                    item.style.display = (isInBounds && isLayerVisible && isLocationVisible) ? 'block' : 'none';
                }
            });
        });
        
        // Update layer counts to show visible vs total locations
        Object.keys(locationsByLayer).forEach(layerName => {
            const visibleCount = locationsByLayer[layerName].filter(location => {
                const isInBounds = bounds.contains([location.latitude, location.longitude]);
                const isLocationVisible = locationVisibility[location.name];
                return isInBounds && layerVisibility[layerName] && isLocationVisible;
            }).length;
            
            const totalCount = locationsByLayer[layerName].length;
            
            const layerSection = document.querySelector(`[data-layer="${layerName}"]`);
            const countElement = layerSection.querySelector('.layer-count');
            countElement.textContent = `Showing ${visibleCount} of ${totalCount} locations`;
        });
    }

    // Add event listeners for map movement and zoom
    map.on('moveend', function() {
        updateSidebarVisibility();
        updateGlobalCounts();
        updateGeoshapeVisibility();
    });
    map.on('zoomend', function() {
        updateSidebarVisibility();  
        updateGlobalCounts();
        updateGeoshapeVisibility();
    });
    
    // Update visible/total counts and wire fit-all button
    const countsEl = document.getElementById('global-counts');
    function updateGlobalCounts() {
        if (!countsEl) return;
        const total = locationsData.length;
        let visible = 0;
        document.querySelectorAll('.location-item').forEach(item => {
            if (item.style.display !== 'none') visible += 1;
        });
        countsEl.textContent = `Showing ${visible} of ${total} locations`;
    }
    updateGlobalCounts();
    const fitAllBtn = document.getElementById('fit-all-btn');
    if (fitAllBtn) {
        fitAllBtn.addEventListener('click', showAllLocations);
    }

    // Set initial view to show all locations (no animation for first load)
    fitAllLocations();
    
    // Initial sidebar update after map is loaded
    setTimeout(function() {
        updateSidebarVisibility();
        // Give extra time for showAllZoomLevel to be set
        setTimeout(updateGeoshapeVisibility, 200);
    }, 100);

    // Fit-all button click is set above if present

    // Add click handler for info button tooltip
    const infoBtn = document.getElementById('info-btn');
    const infoTooltip = document.getElementById('info-tooltip');
    
    if (infoBtn && infoTooltip) {
        infoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            infoTooltip.classList.toggle('show');
        });
        
        // Close tooltip when clicking outside
        document.addEventListener('click', function() {
            infoTooltip.classList.remove('show');
        });
    }

    // Add click handler for Map Layer Toggle (Street Map / Satellite)
    const toolbarToggle = document.getElementById('toolbar-toggle');
    if (toolbarToggle) {
        toolbarToggle.addEventListener('change', function() {
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
                        attribution: '© <a href="https://www.esri.com/">Esri</a>',
                        maxZoom: 19
                    });
                } else {
                    // Switch back to OpenStreetMap
                    newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19
                    });
                }
                
                newTileLayer.addTo(map);
            }
        });
    }

    // Sidebar filter and toggle
    const sidebarFilterInput = document.getElementById('sidebar-filter');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebarElement = document.getElementById('sidebar');
    const contentArea = document.querySelector('.content-area');
    const clusterToggle = document.getElementById('cluster-toggle');
    const summaryToggle = document.getElementById('summary-toggle');
    const typeFilterBtn = document.getElementById('type-filter-btn');
    const typeFilterModal = document.getElementById('type-filter-modal');
    const typeFilterBackdrop = document.getElementById('type-filter-backdrop');
    const typeFilterList = document.getElementById('type-filter-list');
    const typeFilterClose = document.getElementById('type-filter-close');
    const typeFilterApply = document.getElementById('type-filter-apply');
    const typeFilterClear = document.getElementById('type-filter-clear');

    // Build list of extraction types from data
    const allExtractionTypes = Array.from(new Set(locationsData
        .map(l => l['extraction-type'])
        .filter(Boolean)));
    const extractionTypeVisibility = {};
    allExtractionTypes.forEach(t => extractionTypeVisibility[t] = true);

    function openTypeModal() {
        if (!typeFilterModal || !typeFilterBackdrop) return;
        // Populate list
        if (typeFilterList) {
            typeFilterList.innerHTML = allExtractionTypes.map(t => {
                const checked = extractionTypeVisibility[t] ? 'checked' : '';
                return `<label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" data-type="${t}" ${checked}>
                    <span>${t}</span>
                </label>`;
            }).join('');
        }
        typeFilterBackdrop.style.display = 'block';
        typeFilterModal.style.display = 'block';
    }
    function closeTypeModal() {
        if (!typeFilterModal || !typeFilterBackdrop) return;
        typeFilterBackdrop.style.display = 'none';
        typeFilterModal.style.display = 'none';
    }
    if (typeFilterBtn) typeFilterBtn.addEventListener('click', openTypeModal);
    if (typeFilterClose) typeFilterClose.addEventListener('click', closeTypeModal);
    if (typeFilterBackdrop) typeFilterBackdrop.addEventListener('click', closeTypeModal);

    if (typeFilterApply) {
        typeFilterApply.addEventListener('click', function() {
            // Read selections
            if (typeFilterList) {
                typeFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    const t = cb.getAttribute('data-type');
                    extractionTypeVisibility[t] = cb.checked;
                });
            }
            // Apply to sidebar items and markers
            document.querySelectorAll('.location-item').forEach(item => {
                const nameSpan = item.querySelector('.location-name-content span:last-child');
                if (!nameSpan) return;
                const locName = nameSpan.textContent;
                const loc = locationsData.find(l => l.name === locName);
                if (!loc) return;
                const typeAllowed = extractionTypeVisibility[loc['extraction-type'] || 'Location'] !== false;
                const combinedAllowed = typeAllowed && (locationVisibility[loc.name] !== false);
                // Persist combined visibility so all logic (sidebar + map) respects it
                locationVisibility[loc.name] = combinedAllowed;
                const nameDiv = item.querySelector('.location-name');
                if (nameDiv) {
                    if (combinedAllowed) nameDiv.classList.remove('location-hidden');
                    else nameDiv.classList.add('location-hidden');
                }
                // Toggle marker / pin
                let marker = findMarkerForLocation(loc);
                if (marker) {
                    if (combinedAllowed) {
                        if (clusterToggle && clusterToggle.checked) {
                            if (!markerCluster.hasLayer(marker)) markerCluster.addLayer(marker);
                            if (map.hasLayer(marker)) map.removeLayer(marker);
                        } else {
                            if (markerCluster.hasLayer(marker)) markerCluster.removeLayer(marker);
                            if (!map.hasLayer(marker)) map.addLayer(marker);
                        }
                    } else {
                        if (markerCluster.hasLayer(marker)) markerCluster.removeLayer(marker);
                        if (map.hasLayer(marker)) map.removeLayer(marker);
                    }
                }
            });
            updateSidebarVisibility();
            if (typeof updateGlobalCounts === 'function') updateGlobalCounts();
            updateGeoshapeVisibility();
            closeTypeModal();
        });
    }

    if (typeFilterClear) {
        typeFilterClear.addEventListener('click', function() {
            // Reset all types to checked in UI and state
            allExtractionTypes.forEach(t => extractionTypeVisibility[t] = true);
            if (typeFilterList) {
                typeFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = true;
                });
            }
        });
    }

    if (sidebarFilterInput) {
        sidebarFilterInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.location-item');
            items.forEach(item => {
                const nameEl = item.querySelector('.location-name-content span:last-child');
                const name = nameEl?.textContent?.toLowerCase() || '';
                const headline = item.querySelector('.location-headline')?.textContent?.toLowerCase() || '';
                const pinType = item.querySelector('.pin-icon')?.getAttribute('data-tooltip')?.toLowerCase() || '';
                const matches = (name.includes(query) || headline.includes(query) || pinType.includes(query));
                item.style.display = matches ? 'block' : 'none';
                if (nameEl) {
                    const locName = nameEl.textContent;
                    // Hide markers on the map for non-matching items; show for matches
                    const currentlyVisible = locationVisibility[locName] !== false;
                    if (matches && !currentlyVisible) {
                        locationVisibility[locName] = true;
                    } else if (!matches && currentlyVisible) {
                        locationVisibility[locName] = false;
                    }
                }
            });
            // Apply map/geoshape updates after filtering
            updateGeoshapeVisibility();
            // For regular markers, add/remove based on locationVisibility
            locationsData.forEach(location => {
                const isVisible = locationVisibility[location.name] !== false;
                // Find marker or geoshape pin
                let marker = findMarkerForLocation(location);
                if (marker) {
                    if (isVisible) {
                        if (!markerCluster.hasLayer(marker)) markerCluster.addLayer(marker);
                    } else {
                        if (markerCluster.hasLayer(marker)) markerCluster.removeLayer(marker);
                    }
                }
            });
            // Finally, refresh sidebar counts and map layout, then fit to visible markers
            updateSidebarVisibility();
            updateGlobalCounts();
            setTimeout(() => {
                map.invalidateSize();
                const visibleLayers = [];
                markerCluster.eachLayer(layer => {
                    if (layer && typeof layer.getLatLng === 'function') {
                        visibleLayers.push(layer);
                    }
                });
                if (visibleLayers.length > 0) {
                    const group = new L.featureGroup(visibleLayers);
                    map.flyToBounds(group.getBounds(), {
                        padding: [20, 20],
                        animate: true,
                        duration: 0.6,
                        maxZoom: 9 // Do not zoom in past city geoshape threshold
                    });
                }
            }, 80);
        });
    }

    function invalidateMapSizeSoon() {
        setTimeout(() => map.invalidateSize(), 150);
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function() {
            const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
            this.setAttribute('aria-expanded', String(!isCollapsed));
            this.title = isCollapsed ? 'Show sidebar' : 'Hide sidebar';
            const sidebarTab = document.getElementById('sidebar-tab');
            if (sidebarTab) {
                sidebarTab.classList.toggle('show', isCollapsed);
            }
            invalidateMapSizeSoon();
            if (isCollapsed) {
                // When entering full-screen map, fit to contents
                setTimeout(() => fitAllLocations(), 200);
            }
        });
    }

    // Toggle clustering on/off
    if (clusterToggle) {
        clusterToggle.addEventListener('change', function() {
            const enableClustering = clusterToggle.checked;
            // Gather all current point markers (including geoshape pins)
            const allMarkers = [];
            Object.values(markersByLayer).forEach(arr => allMarkers.push(...arr));
            Object.values(geoshapePinsByLayer).forEach(arr => allMarkers.push(...arr));

            if (enableClustering) {
                // Re-add only visible markers to cluster; remove any direct layers
                allMarkers.forEach(m => {
                    // Always remove any direct layer version
                    if (map.hasLayer(m)) {
                        map.removeLayer(m);
                    }

                    // Determine visibility based on layer and point visibility
                    let show = true;
                    const layerName = m.options?.layer;
                    if (layerName && layerVisibility[layerName] === false) show = false;
                    if (m.getPopup) {
                        const content = m.getPopup()?.getContent?.() || '';
                        const nameMatch = content.match(/<h4>(.*?)<\/h4>/);
                        if (nameMatch) {
                            const name = nameMatch[1];
                            if (locationVisibility[name] === false) show = false;
                        }
                    }

                    if (show) {
                        if (!markerCluster.hasLayer(m)) {
                            markerCluster.addLayer(m);
                        }
                    } else if (markerCluster.hasLayer(m)) {
                        markerCluster.removeLayer(m);
                    }
                });
                if (!map.hasLayer(markerCluster)) map.addLayer(markerCluster);
                // Let geoshape pin visibility be enforced per zoom
                updateGeoshapeVisibility();
            } else {
                // Disable clustering: remove from cluster group and add directly to map if visible
                allMarkers.forEach(m => {
                    if (markerCluster.hasLayer(m)) {
                        markerCluster.removeLayer(m);
                    }
                    // Only show markers that should be visible per layer/location visibility and zoom for geoshapes
                    let show = true;
                    const layerName = m.options?.layer;
                    if (layerName && layerVisibility[layerName] === false) show = false;
                    if (m.getPopup) {
                        const content = m.getPopup()?.getContent?.() || '';
                        const nameMatch = content.match(/<h4>(.*?)<\/h4>/);
                        if (nameMatch) {
                            const name = nameMatch[1];
                            if (locationVisibility[name] === false) show = false;
                        }
                    }
                    if (show && !map.hasLayer(m)) map.addLayer(m);
                });
                if (map.hasLayer(markerCluster)) map.removeLayer(markerCluster);
            }
            map.invalidateSize();
        });
    }

    // Toggle full summaries on/off
    if (summaryToggle) {
        summaryToggle.addEventListener('change', function() {
            const enableSummaries = summaryToggle.checked;
            document.body.classList.toggle('hide-summaries', !enableSummaries);
        });
    }
    // Sidebar bottom tab to restore sidebar
    const sidebarTabBtn = document.getElementById('sidebar-tab');
    if (sidebarTabBtn) {
        sidebarTabBtn.addEventListener('click', function() {
            document.body.classList.remove('sidebar-collapsed');
            const toggle = document.getElementById('sidebar-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
                toggle.title = 'Hide sidebar';
            }
            this.classList.remove('show');
            invalidateMapSizeSoon();
        });
    }

    // (Removed full screen toggle and related handlers)

    // (Removed search section functionality)


});