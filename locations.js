// Location data for the map
const locationsData = [
    {
        name: "San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        description: "The tech capital of the world, known for its iconic Golden Gate Bridge, steep hills, and vibrant culture.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Los Angeles",
        latitude: 34.0522,
        longitude: -118.2437,
        description: "The entertainment capital, home to Hollywood, beautiful beaches, and year-round sunshine.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "New York",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "The city that never sleeps, featuring iconic landmarks like Times Square, Central Park, and the Statue of Liberty.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Camden",
        latitude: 51.5392,
        longitude: -0.1426,
        description: "A vibrant North London neighborhood famous for Camden Market, live music venues, and alternative culture scene.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Shoreditch",
        latitude: 51.5255,
        longitude: -0.0726,
        description: "East London's creative hub known for street art, trendy bars, vintage shops, and innovative restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Notting Hill",
        latitude: 51.5152,
        longitude: -0.1953,
        description: "Charming West London area famous for colorful Victorian houses, Portobello Road Market, and the annual Carnival.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Greenwich",
        latitude: 51.4816,
        longitude: -0.0076,
        description: "Historic maritime district home to the Prime Meridian, Royal Observatory, and beautiful riverside views.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Covent Garden",
        latitude: 51.5118,
        longitude: -0.1226,
        description: "Central London's theater and shopping district with street performers, boutique shops, and historic market buildings.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        description: "The City of Light, famous for the Eiffel Tower, Louvre Museum, romantic ambiance, and world-class cuisine.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Lyon",
        latitude: 45.7640,
        longitude: 4.8357,
        description: "France's gastronomic capital, known for its Renaissance architecture, silk industry heritage, and exceptional restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Marseille",
        latitude: 43.2965,
        longitude: 5.3698,
        description: "France's oldest city and major Mediterranean port, famous for its diverse culture, bouillabaisse, and coastal beauty.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Nice",
        latitude: 43.7102,
        longitude: 7.2620,
        description: "Glamorous French Riviera resort city known for its stunning coastline, Promenade des Anglais, and vibrant art scene.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Bordeaux",
        latitude: 44.8378,
        longitude: -0.5792,
        description: "World-renowned wine capital with elegant 18th-century architecture, prestigious vineyards, and exceptional gastronomy.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Toulouse",
        latitude: 43.6047,
        longitude: 1.4442,
        description: "The Pink City, known for its rose-colored brick architecture, aerospace industry, and vibrant university atmosphere.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Suspect movement"
    },
    {
        name: "Copacabana",
        latitude: -22.9711,
        longitude: -43.1825,
        description: "World-famous beach neighborhood in Rio de Janeiro, known for its stunning coastline, vibrant nightlife, and iconic promenade.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Ipanema",
        latitude: -22.9838,
        longitude: -43.2096,
        description: "Sophisticated beachfront district in Rio, famous for its beautiful beach, upscale shops, and trendy restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Santa Teresa",
        latitude: -22.9142,
        longitude: -43.1896,
        description: "Bohemian hilltop neighborhood in Rio known for its colonial architecture, art studios, and charming cobblestone streets.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed"
    },
    {
        name: "Baixa de Luanda",
        latitude: -8.8159,
        longitude: 13.2306,
        description: "Historic downtown district of Luanda, Angola's capital, featuring colonial architecture and the bustling city center.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Miramar",
        latitude: -8.8034,
        longitude: 13.2441,
        description: "Upscale coastal neighborhood in Luanda known for its modern developments, restaurants, and Atlantic Ocean views.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Talatona",
        latitude: -8.9167,
        longitude: 13.1833,
        description: "Modern suburban district in Luanda featuring shopping centers, residential complexes, and contemporary architecture.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Suspect movement"
    },
    {
        name: "Istanbul",
        latitude: 41.0082,
        longitude: 28.9784,
        description: "Turkey's largest city straddling Europe and Asia, famous for the Hagia Sophia, Blue Mosque, and rich Byzantine and Ottoman heritage.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    },
    {
        name: "Ankara",
        latitude: 39.9334,
        longitude: 32.8597,
        description: "Turkey's capital city in central Anatolia, known for its modern government buildings, museums, and ancient Hittite ruins.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results"
    },
    {
        name: "Izmir",
        latitude: 38.4192,
        longitude: 27.1287,
        description: "Major port city on Turkey's Aegean coast, known for its ancient Agora, vibrant bazaars, and beautiful waterfront promenade.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks"
    }
]; 