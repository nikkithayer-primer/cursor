// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Create map instance with a temporary center, will be updated to show all locations
    const map = L.map('map').setView([39.8283, -98.5795], 2);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create marker cluster group
    const markers = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 80
    });

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

    // Add markers for each location and populate sidebar
    locationsData.forEach((location, index) => {
        // Create popup content
        const popupContent = `
            <div>
                <h3>${location.headline}</h3>
                <h4>${location.name}</h4>
                <p>${location.description}</p>
                <small>${location.date}</small>
            </div>
        `;
        
        // Create marker and add to cluster group instead of directly to map
        const marker = L.marker([location.latitude, location.longitude])
            .bindPopup(popupContent);
        
        // Add click event to marker to fly to location when clicked
        marker.on('click', function(e) {
            map.flyTo([location.latitude, location.longitude], 13, {
                animate: true,
                duration: 1.5
            });
        });
        
        markers.addLayer(marker);

        // Create sidebar item
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `
            <div class="location-name" data-lat="${location.latitude}" data-lng="${location.longitude}">
                ${location.name}
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

        locationList.appendChild(locationItem);
    });

    // Add the marker cluster group to the map
    map.addLayer(markers);

    // Set initial view to show all locations (no animation for first load)
    fitAllLocations();

    // Add click handler for "Show All" button (with animation)
    document.getElementById('show-all-btn').addEventListener('click', showAllLocations);
});