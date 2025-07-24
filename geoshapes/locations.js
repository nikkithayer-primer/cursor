// Location data for the map
const locationsData = [
    {
        name: "San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        description: "The tech capital of the world, known for its iconic Golden Gate Bridge, steep hills, and vibrant culture.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "city",
        boundaries: [
            [37.8199, -122.5110], [37.8088, -122.4702], [37.8144, -122.4156], 
            [37.8067, -122.4156], [37.7849, -122.4058], [37.7849, -122.3994],
            [37.7685, -122.3994], [37.7616, -122.4058], [37.7539, -122.4156],
            [37.7539, -122.4220], [37.7462, -122.4220], [37.7385, -122.4284],
            [37.7308, -122.4349], [37.7231, -122.4413], [37.7154, -122.4477],
            [37.7077, -122.4542], [37.7000, -122.4606], [37.6923, -122.4670],
            [37.6846, -122.4734], [37.6769, -122.4799], [37.6692, -122.4863],
            [37.6615, -122.4927], [37.6615, -122.5027], [37.7077, -122.5110],
            [37.7539, -122.5110], [37.8001, -122.5110], [37.8199, -122.5110]
        ]
    },
    {
        name: "Los Angeles",
        latitude: 34.0522,
        longitude: -118.2437,
        description: "The entertainment capital, home to Hollywood, beautiful beaches, and year-round sunshine.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "city",
        boundaries: [
            [34.3373, -118.6681], [34.3373, -118.1553], [34.2257, -118.1553],
            [34.1141, -118.1553], [34.0025, -118.1553], [33.8909, -118.1553],
            [33.7793, -118.1553], [33.7030, -118.2269], [33.6267, -118.2985],
            [33.5504, -118.3701], [33.4741, -118.4417], [33.3978, -118.5133],
            [33.3215, -118.5849], [33.2452, -118.6565], [33.1689, -118.7281],
            [33.1689, -118.7997], [33.2452, -118.8713], [33.3215, -118.9429],
            [33.3978, -119.0145], [33.4741, -119.0861], [33.5504, -119.1577],
            [33.6267, -119.2293], [33.7030, -119.3009], [33.7793, -119.3725],
            [33.8909, -119.3725], [34.0025, -119.3725], [34.1141, -119.3725],
            [34.2257, -119.3725], [34.3373, -119.3725], [34.3373, -118.6681]
        ]
    },
    {
        name: "New York",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "The city that never sleeps, featuring iconic landmarks like Times Square, Central Park, and the Statue of Liberty.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "city",
        boundaries: [
            [40.9176, -73.7004], [40.9176, -74.2591], [40.4774, -74.2591],
            [40.4774, -73.9441], [40.5034, -73.7004], [40.6953, -73.7004],
            [40.8176, -73.7004], [40.9176, -73.7004]
        ]
    },
    {
        name: "Camden",
        latitude: 51.5392,
        longitude: -0.1426,
        description: "A vibrant North London neighborhood famous for Camden Market, live music venues, and alternative culture scene.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "neighborhood"
    },
    {
        name: "Shoreditch",
        latitude: 51.5255,
        longitude: -0.0726,
        description: "East London's creative hub known for street art, trendy bars, vintage shops, and innovative restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "neighborhood"
    },
    {
        name: "Notting Hill",
        latitude: 51.5152,
        longitude: -0.1953,
        description: "Charming West London area famous for colorful Victorian houses, Portobello Road Market, and the annual Carnival.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "neighborhood"
    },
    {
        name: "Greenwich",
        latitude: 51.4816,
        longitude: -0.0076,
        description: "Historic maritime district home to the Prime Meridian, Royal Observatory, and beautiful riverside views.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "neighborhood"
    },
    {
        name: "Covent Garden",
        latitude: 51.5118,
        longitude: -0.1226,
        description: "Central London's theater and shopping district with street performers, boutique shops, and historic market buildings.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "neighborhood"
    },
    {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        description: "The City of Light, famous for the Eiffel Tower, Louvre Museum, romantic ambiance, and world-class cuisine.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "city",
        boundaries: [
            [48.9021, 2.2247], [48.9021, 2.4697], [48.8156, 2.4697],
            [48.8156, 2.4247], [48.7976, 2.4697], [48.7976, 2.2247],
            [48.8156, 2.2247], [48.9021, 2.2247]
        ]
    },
    {
        name: "Lyon",
        latitude: 45.7640,
        longitude: 4.8357,
        description: "France's gastronomic capital, known for its Renaissance architecture, silk industry heritage, and exceptional restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "city",
        boundaries: [
            [45.8176, 4.7440], [45.8176, 4.9274], [45.7104, 4.9274],
            [45.7104, 4.7440], [45.8176, 4.7440]
        ]
    },
    {
        name: "Marseille",
        latitude: 43.2965,
        longitude: 5.3698,
        description: "France's oldest city and major Mediterranean port, famous for its diverse culture, bouillabaisse, and coastal beauty.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "city",
        boundaries: [
            [43.3565, 5.3198], [43.3565, 5.4698], [43.2365, 5.4698],
            [43.2365, 5.3198], [43.3565, 5.3198]
        ]
    },
    {
        name: "Nice",
        latitude: 43.7102,
        longitude: 7.2620,
        description: "Glamorous French Riviera resort city known for its stunning coastline, Promenade des Anglais, and vibrant art scene.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "city",
        boundaries: [
            [43.7502, 7.1920], [43.7502, 7.3320], [43.6702, 7.3320],
            [43.6702, 7.1920], [43.7502, 7.1920]
        ]
    },
    {
        name: "Bordeaux",
        latitude: 44.8378,
        longitude: -0.5792,
        description: "World-renowned wine capital with elegant 18th-century architecture, prestigious vineyards, and exceptional gastronomy.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "city",
        boundaries: [
            [44.8878, -0.6292], [44.8878, -0.5292], [44.7878, -0.5292],
            [44.7878, -0.6292], [44.8878, -0.6292]
        ]
    },
    {
        name: "Toulouse",
        latitude: 43.6047,
        longitude: 1.4442,
        description: "The Pink City, known for its rose-colored brick architecture, aerospace industry, and vibrant university atmosphere.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Suspect movement",
        type: "city",
        boundaries: [
            [43.6547, 1.3942], [43.6547, 1.4942], [43.5547, 1.4942],
            [43.5547, 1.3942], [43.6547, 1.3942]
        ]
    },
    {
        name: "Copacabana",
        latitude: -22.9711,
        longitude: -43.1825,
        description: "World-famous beach neighborhood in Rio de Janeiro, known for its stunning coastline, vibrant nightlife, and iconic promenade.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "neighborhood"
    },
    {
        name: "Ipanema",
        latitude: -22.9838,
        longitude: -43.2096,
        description: "Sophisticated beachfront district in Rio, famous for its beautiful beach, upscale shops, and trendy restaurants.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "neighborhood"
    },
    {
        name: "Santa Teresa",
        latitude: -22.9142,
        longitude: -43.1896,
        description: "Bohemian hilltop neighborhood in Rio known for its colonial architecture, art studios, and charming cobblestone streets.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "neighborhood"
    },
    {
        name: "Baixa de Luanda",
        latitude: -8.8159,
        longitude: 13.2306,
        description: "Historic downtown district of Luanda, Angola's capital, featuring colonial architecture and the bustling city center.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "neighborhood"
    },
    {
        name: "Miramar",
        latitude: -8.8034,
        longitude: 13.2441,
        description: "Upscale coastal neighborhood in Luanda known for its modern developments, restaurants, and Atlantic Ocean views.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "neighborhood"
    },
    {
        name: "Talatona",
        latitude: -8.9167,
        longitude: 13.1833,
        description: "Modern suburban district in Luanda featuring shopping centers, residential complexes, and contemporary architecture.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Suspect movement",
        type: "neighborhood"
    },
    {
        name: "Istanbul",
        latitude: 41.0082,
        longitude: 28.9784,
        description: "Turkey's largest city straddling Europe and Asia, famous for the Hagia Sophia, Blue Mosque, and rich Byzantine and Ottoman heritage.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "city",
        boundaries: [
            [41.1582, 28.6784], [41.1582, 29.2784], [40.8582, 29.2784],
            [40.8582, 28.6784], [41.1582, 28.6784]
        ]
    },
    {
        name: "Ankara",
        latitude: 39.9334,
        longitude: 32.8597,
        description: "Turkey's capital city in central Anatolia, known for its modern government buildings, museums, and ancient Hittite ruins.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "city",
        boundaries: [
            [40.0334, 32.7597], [40.0334, 32.9597], [39.8334, 32.9597],
            [39.8334, 32.7597], [40.0334, 32.7597]
        ]
    },
    {
        name: "Izmir",
        latitude: 38.4192,
        longitude: 27.1287,
        description: "Major port city on Turkey's Aegean coast, known for its ancient Agora, vibrant bazaars, and beautiful waterfront promenade.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drone attacks",
        type: "city",
        boundaries: [
            [38.5192, 27.0287], [38.5192, 27.2287], [38.3192, 27.2287],
            [38.3192, 27.0287], [38.5192, 27.0287]
        ]
    },
    {
        name: "United States",
        latitude: 39.8283,
        longitude: -98.5795,
        description: "The United States of America, a federal republic comprising 50 states, known for its diverse landscapes, cultures, and as a global economic and political powerhouse.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "country",
        boundaries: [
            [24.8226118538, -80.67577434], [30.1110671828, -84.2672468503], [28.6440578116, -96.0144936698], 
            [25.4439401759, -98.1718943902], [29.3324547176, -100.1456865388], [29.1121234017, -103.5602136914], 
            [31.5925660545, -106.1958851276], [31.101913674, -110.3418851395], [32.1759485309, -114.6611287233],
            [32.0555521686, -117.0110223015], [34.5250848, -120.5417855259], [39.9481889194, -124.5537808946],
            [46.7243078555, -124.0510783931], [48.2347857149, -124.989851253], [48.8752597195, -122.5807291032],
            [49.2362270995, -94.9802147382], [47.9990185404, -88.2348207903], [45.7761843375, -82.7013914887],
            [41.9955077943, -82.554800774], [43.1593960166, -78.3399475476], [44.737031173, -74.9861296808],
            [44.9932524073, -71.1169252931], [47.393767047, -68.914803068], [46.7793409412, -67.0286689867],
            [44.8226907625, -66.9813882292], [38.2068989149, -75.7324096829], [34.898152082, -75.4066525391],
            [33.3395793417, -79.0033075495], [31.0955741556, -80.726858983], [25.6837088405, -79.1632246928],
            [24.8226118538, -80.67577434]
        ]
    },
    {
        name: "Ohio",
        latitude: 39.9612,
        longitude: -82.9988,
        description: "The Buckeye State, located in the Midwest, known for its industrial heritage, diverse agriculture, and being the birthplace of aviation pioneers.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Suspect movement",
        type: "state",
        boundaries: [
            [41.9773, -80.5189], [41.9657, -84.8203], [39.1034, -84.8203],
            [39.0918, -82.9988], [38.4031, -82.4429], [38.4031, -82.0191],
            [38.7594, -81.6459], [38.8495, -81.2634], [39.4667, -80.5776],
            [40.6438, -80.5189], [41.9773, -80.5189]
        ]
    },
    {
        name: "California",
        latitude: 36.7783,
        longitude: -119.4179,
        description: "The Golden State, known for its Mediterranean climate, technological innovation, entertainment industry, and diverse geography from beaches to mountains.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Drones witnessed",
        type: "state",
        boundaries: [
            [32.4211562947, -116.9300839305], [33.9086371678, -118.3660313487], [34.4337049463, -120.5262181163], 
            [36.3992093205, -121.9841381907], [37.4187392391, -122.4855610728], [38.7984100061, -123.6986920238], 
            [40.4132640049, -124.4318577647], [42.0057114551, -124.3470570445], [42.008772769, -119.9973294139], 
            [38.9845290191, -119.9945828319], [34.3573568558, -113.9685818553], [32.7312957162, -114.620551765], 
            [32.4211562947, -116.9300839305]
        ]
    },
    {
        name: "Turkey",
        latitude: 38.9637,
        longitude: 35.2433,
        description: "A transcontinental country located mainly on Anatolia in Western Asia, with a smaller portion on the Balkan Peninsula in Southeastern Europe. Known for its rich history, cultural heritage, and strategic location between Europe and Asia.",
        headline: "Hello world",
        date: "May 30, 2025 | 17:20 (UTC)",
        layer: "Activities extracted from search results",
        type: "country",
        boundaries: [
            [35.8544479315, 35.9837790392], [36.3300964363, 35.8318587206], [36.613494872, 36.258265581], 
            [36.8881673728, 36.127116289], [36.5498791995, 35.4165240191], [36.8024464543, 34.6004458331], 
            [36.2964839041, 34.0399714373], [36.0039440156, 32.7856417559], [36.0523947568, 32.3854132555], 
            [36.4587411219, 32.121054735], [36.5537403655, 31.6840048693], [36.8144036932, 31.346861925], 
            [36.8411289265, 30.6901713274], [36.275935779, 30.5055495165], [36.1306996868, 29.7489519976], 
            [36.2079570054, 29.2301054858], [36.5877930085, 29.0431662463], [36.7288752693, 28.483378496], 
            [36.43844296, 27.8832503222], [37.0027236332, 28.2700034045], [36.8964047035, 27.221495714], 
            [37.2107462549, 27.6319380663], [37.3617320926, 27.1480246447], [37.8676371868, 27.1933432482], 
            [38.0546805098, 26.7854758166], [38.1715766909, 26.3413020037], [38.1281760923, 25.8636542223], 
            [38.6619555373, 25.886056032], [38.644125866, 26.4418097399], [38.3643051681, 26.9111319445], 
            [38.6397012755, 26.7932005785], [38.8455566912, 26.9880362414], [38.9372802318, 26.7030783556], 
            [39.1448723859, 25.8922358416], [40.0955711501, 26.279503908], [40.2800163847, 26.2086077593], 
            [40.6242132115, 26.7976637743], [40.6237571937, 26.043383684], [41.20038834, 26.3721152209], 
            [41.295896801, 26.6235133074], [41.6862772947, 26.3405295275], [42.1344808899, 27.2164317034], 
            [41.9121457493, 27.5549479388], [41.9911072748, 28.0622931384], [41.5774750163, 28.1511279009], 
            [41.1587210459, 30.2163000964], [41.0685774716, 31.1163206957], [41.8016784502, 32.6230784319], 
            [41.968520354, 33.1822653674], [42.0305832301, 34.9912329577], [41.6367103531, 35.4244204424], 
            [41.7571307794, 36.0062666796], [41.2781608575, 36.4197989367], [41.4732482459, 36.8140192889], 
            [41.1350654912, 37.1786280535], [40.9460974013, 38.181387987], [41.1054517109, 39.5433493517], 
            [40.8836364204, 39.9566241167], [41.4719620345, 41.5862055682], [41.5439505677, 42.733246889], 
            [41.0431416029, 43.5594530962], [40.6772854193, 43.6900874041], [40.3786222757, 43.579365816], 
            [40.0993792078, 43.7444182299], [40.0741632748, 44.2855807208], [39.8052718388, 44.6285601519], 
            [39.3586235269, 44.4255705737], [39.3372511859, 44.080788698], [38.3783691148, 44.4836779498], 
            [37.9255469864, 44.3121882342], [37.7672880169, 44.5756026171], [37.2231861991, 44.7952433489], 
            [36.9484852239, 44.2739935778], [37.2054142223, 44.134261217], [37.3478821635, 43.8570280932], 
            [37.2691688311, 43.5614272021], [37.2542770836, 42.186333742], [37.0439765115, 41.4156599902], 
            [37.1097154746, 40.7840319537], [36.6668006359, 39.4181223772], [36.6575746297, 38.6437579058], 
            [36.9038175411, 38.3136530779], [36.6238972128, 37.3562975787], [36.6073630336, 37.0585509203], 
            [36.8451815527, 36.7895575427], [36.6559909503, 36.5753241442], [36.3487638026, 36.6579790972], 
            [36.2437536068, 36.4084692858], [36.0206066576, 36.3652106188], [35.8544479315, 35.9837790392]
        ]
    }
]; 