import { Product, SpiderQuizQuestion, SpiderCharacter, UserProfile } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "spider-robot",
    name: "Google AI Spider Robot Companion",
    tagline: "Your desktop AI assistant with dynamic mobility.",
    description: "The ultimate convergence of Google Assistant AI and advanced arachnid-engineering. Features physical wall-climbing mobility, multi-sensory environment scanning, intelligent voice response, and automatic smart home syncing. Coated in a pristine matte spider-red finish with glowing custom color accents.",
    category: "Tech",
    price: 349.99,
    discountPrice: 299.99,
    rating: 4.9,
    reviewsCount: 142,
    image: "/src/assets/images/spider_robot_companion_1784213791365.jpg",
    images: [
      "/src/assets/images/spider_robot_companion_1784213791365.jpg",
      "https://picsum.photos/seed/spider-robot-2/800/800",
      "https://picsum.photos/seed/spider-robot-3/800/800",
      "https://picsum.photos/seed/spider-robot-4/800/800"
    ],
    specs: {
      "Processor": "Google Tensor Spider-G3",
      "Connectivity": "Wi-Fi 7, Bluetooth 5.4, Ultra-Wideband (UWB)",
      "Battery Life": "Up to 12 hours active surveillance",
      "Sensors": "LiDAR Terrain Scanner, 4K HDR Camera Eye, Ultrasonic Gyro",
      "Wall Climbing": "Gecko-pad synthetic fibers (micro-suction active active)",
      "Audio": "Dual-beamforming mics, 360-degree sound system"
    },
    variants: [
      {
        name: "Voice Engine",
        options: ["Puck (Playful)", "Zephyr (Calming)", "Kore (Intelligent)"]
      },
      {
        name: "Chassis Color",
        options: ["Spider Red", "Midnight Black", "Google Blue"]
      }
    ],
    pointsValue: 3000,
    inventory: 15,
    isNew: true,
    isBestSeller: true
  },
  {
    id: "web-link-sneaker",
    name: "WEB-LINK 0.1 Limited Sneaker",
    tagline: "Smart lifestyle footwear with reactive soles.",
    description: "Engineered for maximum agility and peak urban lifestyle aesthetics. Crafted with breathable spider-fiber mesh, an interactive rainbow gradient midsole responsive to running impact, and smart NFC-enabled heels that automatically log your running stats in Google Fit.",
    category: "Wearables",
    price: 189.99,
    rating: 4.8,
    reviewsCount: 96,
    image: "/src/assets/images/sneaker_collaboration_1784213807380.jpg",
    images: [
      "/src/assets/images/sneaker_collaboration_1784213807380.jpg",
      "https://picsum.photos/seed/sneaker-2/800/800",
      "https://picsum.photos/seed/sneaker-3/800/800",
      "https://picsum.photos/seed/sneaker-4/800/800"
    ],
    specs: {
      "Upper Material": "Web-woven liquid polymer synthetic",
      "Midsole": "Reactive gel-fluid with custom LED pressure spots",
      "Weight": "240g (Lightweight performance)",
      "Smart Tech": "Integrated Google WebLink NFC chip",
      "Traction": "High-grip web-grid traction tread"
    },
    variants: [
      {
        name: "Size (US)",
        options: ["8", "9", "10", "11", "12"]
      },
      {
        name: "Webbing Highlight",
        options: ["White Silk", "Glowing Neon", "Reflective Black"]
      }
    ],
    pointsValue: 1900,
    inventory: 48,
    isNew: true
  },
  {
    id: "brand-new-hoodie",
    name: "A Brand New Day x Google Hoodie",
    tagline: "Premium comfort with high-contrast character art.",
    description: "An official limited-edition double-knit heavyweight cotton hoodie. Blends clean material-inspired minimalism on the front with a dramatic glowing graphic of Spider-Man swinging on the back. Premium drawstring locks with tiny Google-colored accents.",
    category: "Wearables",
    price: 119.99,
    discountPrice: 99.99,
    rating: 4.7,
    reviewsCount: 210,
    image: "/src/assets/images/hoodie_collaboration_1784213823284.jpg",
    images: [
      "/src/assets/images/hoodie_collaboration_1784213823284.jpg",
      "https://picsum.photos/seed/hoodie-2/800/800",
      "https://picsum.photos/seed/hoodie-3/800/800"
    ],
    specs: {
      "Material": "80% Organic Cotton, 20% Recycled Polyester (380 GSM)",
      "Print Type": "High-density thermal glow-in-the-dark silkscreen",
      "Fit": "Modern slightly oversized drop-shoulder fit",
      "Pockets": "Front dual kangaroo pouch with hidden zip pocket",
      "Lining": "Ultra-soft combed fleece lining"
    },
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL", "XXL"]
      },
      {
        name: "Accent Style",
        options: ["Classic Navy", "Stealth Gray"]
      }
    ],
    pointsValue: 1000,
    inventory: 75,
    isBestSeller: true
  },
  {
    id: "heroic-tshirt",
    name: "A Brand New Day x Google T-Shirt",
    tagline: "Heavyweight smart jersey featuring interactive NFC.",
    description: "Designed for premium modern living. Features a clean chest band in Google's iconic palette, integrated with a fine holographic spider-web texture overlay. Equipped with an interactive NFC smart-tag on the left sleeve that opens the Spider-Verse portal app.",
    category: "Wearables",
    price: 54.99,
    rating: 4.6,
    reviewsCount: 184,
    image: "/src/assets/images/tshirt_collaboration_1784213837377.jpg",
    images: [
      "/src/assets/images/tshirt_collaboration_1784213837377.jpg",
      "https://picsum.photos/seed/tshirt-2/800/800",
      "https://picsum.photos/seed/tshirt-3/800/800"
    ],
    specs: {
      "Material": "100% Combed Ringspun Cotton (240 GSM)",
      "Smart Tech": "Integrated sleeve NFC chip (Programmable)",
      "Neckline": "Thick rib knit crewneck collar",
      "Print": "Breathable water-based digital sublimation print"
    },
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL", "XXL"]
      },
      {
        name: "Color",
        options: ["Hero Red", "Prism Black", "Alabaster White"]
      }
    ],
    pointsValue: 550,
    inventory: 120
  },
  {
    id: "glow-cap",
    name: "Spider-Man G-Logo Structured Cap",
    tagline: "Structured style with retro-reflective sewing.",
    description: "Elevate your accessory rotation with this limited structured six-panel cap. Features a high-contrast embroidered Spider-Man visor lining and a customized Google G logo in thick, colorful multi-color stitching. Includes a premium adjustable magnetic buckle closure.",
    category: "Accessories",
    price: 39.99,
    rating: 4.7,
    reviewsCount: 78,
    image: "/src/assets/images/cap_collaboration_1784213856094.jpg",
    images: [
      "/src/assets/images/cap_collaboration_1784213856094.jpg",
      "https://picsum.photos/seed/cap-2/800/800",
      "https://picsum.photos/seed/cap-3/800/800"
    ],
    specs: {
      "Structure": "Rigid structured high-profile six-panel crown",
      "Material": "Premium cotton twill reinforced panels",
      "Closure": "Fidlock® magnetic slide release strap",
      "Accents": "Retro-reflective silver thread outlines"
    },
    variants: [
      {
        name: "Fit Type",
        options: ["One Size Fits All", "XL Deep Fit"]
      }
    ],
    pointsValue: 400,
    inventory: 150
  }
];

export const QUIZ_QUESTIONS: SpiderQuizQuestion[] = [
  {
    id: 1,
    question: "When facing a major problem, what is your primary approach?",
    options: [
      { text: "Build a brand-new high-tech gadget to solve it systematically.", points: { peter: 3, miles: 1, gwen: 2, miguel: 4 } },
      { text: "Listen to my intuition and improvise on the fly with style.", points: { peter: 1, miles: 4, gwen: 3, miguel: 1 } },
      { text: "Examine past precedents and enforce structural order strictly.", points: { peter: 2, miles: 1, gwen: 1, miguel: 5 } },
      { text: "Collaborate, play a drum solo first to clear my head, then dive in.", points: { peter: 1, miles: 2, gwen: 4, miguel: 0 } }
    ]
  },
  {
    id: 2,
    question: "What's your ideal visual aesthetic for tech and clothing?",
    options: [
      { text: "Sleek, black, urban-streetwear with colorful graffiti pops.", points: { peter: 1, miles: 5, gwen: 2, miguel: 1 } },
      { text: "Modern white, cyan, and magenta high-contrast minimalist chic.", points: { peter: 2, miles: 2, gwen: 5, miguel: 2 } },
      { text: "Futuristic, sharp, glowing dark neon-noir styling.", points: { peter: 1, miles: 1, gwen: 1, miguel: 5 } },
      { text: "Humble, functional, retro-engineering with colorful red details.", points: { peter: 5, miles: 2, gwen: 1, miguel: 1 } }
    ]
  },
  {
    id: 3,
    question: "Select your preferred superpower amplification.",
    options: [
      { text: "Perfect optical camouflage and dynamic bio-electricity.", points: { peter: 1, miles: 5, gwen: 2, miguel: 1 } },
      { text: "Interdimensional portal keypads and super-strength talons.", points: { peter: 1, miles: 1, gwen: 2, miguel: 5 } },
      { text: "Extreme acoustic sensing and aerial dance-like agility.", points: { peter: 2, miles: 2, gwen: 5, miguel: 1 } },
      { text: "Custom chemical web formula upgrades and spider-tracer drones.", points: { peter: 5, miles: 1, gwen: 1, miguel: 2 } }
    ]
  },
  {
    id: 4,
    question: "Which music playlist fuels your creative focus?",
    options: [
      { text: "High-energy hip-hop, lo-fi beats, and modern trap.", points: { peter: 1, miles: 5, gwen: 3, miguel: 1 } },
      { text: "Indie rock, punk drums, and heavy bass lines.", points: { peter: 2, miles: 2, gwen: 5, miguel: 1 } },
      { text: "Cyberpunk synthwave, industrial techno, and orchestral fusion.", points: { peter: 1, miles: 1, gwen: 1, miguel: 5 } },
      { text: "Classic 80s rock, retro pop, and science podcasts.", points: { peter: 5, miles: 2, gwen: 1, miguel: 1 } }
    ]
  },
  {
    id: 5,
    question: "How do you view artificial intelligence and smart robotics?",
    options: [
      { text: "A cool partner to build side-by-side with, like an AI Spider Drone.", points: { peter: 5, miles: 3, gwen: 2, miguel: 3 } },
      { text: "Extremely helpful for organizing schedules and predicting canon anomalies.", points: { peter: 2, miles: 1, gwen: 1, miguel: 5 } },
      { text: "A fun way to customize my style, play music, and express myself.", points: { peter: 2, miles: 4, gwen: 4, miguel: 1 } },
      { text: "An elegant, invisible tool that shouldn't clutter my lifestyle.", points: { peter: 3, miles: 2, gwen: 5, miguel: 2 } }
    ]
  },
  {
    id: 6,
    question: "What's your absolute favorite urban activity?",
    options: [
      { text: "Slinging across skyscrapers, taking high-angle landscape photos.", points: { peter: 5, miles: 2, gwen: 3, miguel: 1 } },
      { text: "Finding hidden alleys, spraying colorful murals, skating.", points: { peter: 1, miles: 5, gwen: 2, miguel: 1 } },
      { text: "Exploring rooftops, playing drums with a band, checking fashion.", points: { peter: 2, miles: 2, gwen: 5, miguel: 1 } },
      { text: "Monitoring city telemetry, managing inter-world portals.", points: { peter: 1, miles: 1, gwen: 1, miguel: 5 } }
    ]
  },
  {
    id: 7,
    question: "Your style is best summarized as...",
    options: [
      { text: "Practical, nerdy, comfortable, with unexpected bright colors.", points: { peter: 5, miles: 2, gwen: 2, miguel: 1 } },
      { text: "Streetwear-focused, modern layering, high-top sneakers.", points: { peter: 1, miles: 5, gwen: 3, miguel: 1 } },
      { text: "Elegant, athletic, custom jackets, high contrast elements.", points: { peter: 2, miles: 2, gwen: 5, miguel: 2 } },
      { text: "Intimidatingly sleek, cybernetic, tailored high-tech threads.", points: { peter: 1, miles: 1, gwen: 1, miguel: 5 } }
    ]
  },
  {
    id: 8,
    question: "At the end of a long day saving the city, what's your treat?",
    options: [
      { text: "Grabbing a standard New York slice and doing laundry.", points: { peter: 5, miles: 2, gwen: 2, miguel: 1 } },
      { text: "Chilling in my room with a sketchbook and high-fidelity beats.", points: { peter: 1, miles: 5, gwen: 3, miguel: 1 } },
      { text: "Grabbing hot cocoa and visiting the local skate park.", points: { peter: 2, miles: 3, gwen: 5, miguel: 1 } },
      { text: "Re-calibrating neural servers and double-checking logs.", points: { peter: 1, miles: 1, gwen: 1, miguel: 5 } }
    ]
  }
];

export const SPIDER_CHARACTERS: SpiderCharacter[] = [
  {
    id: "peter",
    name: "Peter Parker",
    alias: "The Spectacular Spider-Man",
    description: "The classic, brilliant, retro-engineering hero. Always relying on intellect, classic web formulas, and a humble heart to save the day.",
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=600",
    accentColor: "#E62429",
    recommendedProduct: "spider-robot"
  },
  {
    id: "miles",
    name: "Miles Morales",
    alias: "The Dynamic Spider-Man",
    description: "The stylistic, urban-modern, expressive trendsetter. Infuses rhythm, artistic style, optical camo, and dynamic bio-electricity into heroism.",
    image: "https://images.unsplash.com/photo-1608889174633-81499f163c40?auto=format&fit=crop&q=80&w=600",
    accentColor: "#4285F4",
    recommendedProduct: "web-link-sneaker"
  },
  {
    id: "gwen",
    name: "Gwen Stacy",
    alias: "Ghost-Spider",
    description: "The ultra-agile, sleek, alternative-rock minimalist. Combines athletic performance, high contrast visual styling, and drumming instincts.",
    image: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=600",
    accentColor: "#EA4335",
    recommendedProduct: "brand-new-hoodie"
  },
  {
    id: "miguel",
    name: "Miguel O'Hara",
    alias: "Spider-Man 2099",
    description: "The intense, high-tech, cybernetic futurist. Spearheading interdimensional order with laser grids, advanced AI interfaces, and relentless focus.",
    image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=600",
    accentColor: "#FBBC05",
    recommendedProduct: "brand-new-hoodie"
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Aaryan Rajawat",
  email: "aaryanrajawat88@gmail.com",
  points: 4500, // Pre-filled points
  level: 4,
  nextLevelPoints: 5000,
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  savedAddresses: [
    {
      id: "adr-1",
      label: "Home Base",
      name: "Aaryan Rajawat",
      street: "221 Chelsea Street",
      city: "New York",
      state: "NY",
      zip: "10011",
      country: "United States"
    }
  ],
  paymentMethods: [
    {
      id: "pm-1",
      type: "Google Pay",
      last4: "8899",
      expiry: "09/30"
    },
    {
      id: "pm-2",
      type: "Visa",
      last4: "4321",
      expiry: "12/28"
    }
  ],
  unlockedWallpapers: [
    "https://picsum.photos/seed/wallpaper1/1920/1080",
    "https://picsum.photos/seed/wallpaper2/1920/1080"
  ],
  claimableCoupons: [
    {
      code: "SPIDEYPOINTS15",
      discountType: "percent",
      value: 15,
      description: "Get 15% OFF any Google wearables",
      minSpend: 50
    },
    {
      code: "FREESHIPWEB",
      discountType: "free-shipping",
      value: 0,
      description: "Free shipping across all multiverse zones"
    }
  ],
  ownedCoupons: ["SPIDEYPOINTS15"]
};
