// Layer configuration for the map application
const LAYERS = {
    // Layer definitions with colors and properties
    definitions: {
        'Activities extracted from search results': {
            name: 'Activities extracted from search results',
            color: '#43A7DD',
            visible: true
        },
        'Drone attacks': {
            name: 'Drone attacks',
            color: '#FC922D',
            visible: true
        },
        'Drones witnessed': {
            name: 'Drones witnessed',
            color: '#819B2A',
            visible: true
        },
        'Suspect movement': {
            name: 'Suspect movement',
            color: '#DF5094',
            visible: true
        }
    },

    // Get all layer names
    getNames() {
        return Object.keys(this.definitions);
    },

    // Get layer color by name
    getColor(layerName) {
        return this.definitions[layerName]?.color || '#000000';
    },

    // Get layer visibility state
    isVisible(layerName) {
        return this.definitions[layerName]?.visible || false;
    },

    // Set layer visibility
    setVisibility(layerName, visible) {
        if (this.definitions[layerName]) {
            this.definitions[layerName].visible = visible;
        }
    },

    // Get colors object for backward compatibility
    getColorsObject() {
        const colors = {};
        Object.entries(this.definitions).forEach(([name, config]) => {
            colors[name] = config.color;
        });
        return colors;
    },

    // Get visibility object for backward compatibility
    getVisibilityObject() {
        const visibility = {};
        Object.entries(this.definitions).forEach(([name, config]) => {
            visibility[name] = config.visible;
        });
        return visibility;
    },

    // Initialize empty arrays for each layer (for storing markers/shapes)
    initializeArrays() {
        const arrays = {};
        this.getNames().forEach(layerName => {
            arrays[layerName] = [];
        });
        return arrays;
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LAYERS = LAYERS;
}
