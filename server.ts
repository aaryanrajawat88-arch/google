import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

console.log("---------------- ENVIRONMENT DIAGNOSTICS ----------------");
console.log("GEMINI_API_KEY present?", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
  console.log("GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY.substring(0, 6));
}
console.log("Available environment keys:", Object.keys(process.env).filter(key => !key.includes("SECRET") && !key.includes("PASSWORD") && !key.includes("KEY")));
console.log("---------------------------------------------------------");

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Check if Gemini API can be securely and successfully called (checks for empty, missing, or placeholder key)
const isGeminiEnabled = (): boolean => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  if (key === "MY_GEMINI_API_KEY") return false;
  if (key.trim() === "") return false;
  return true;
};

// Fallback simulations to guarantee high-fidelity UX even if Gemini API key is missing
function handleQuizSimulation(character: string): string {
  return `Your cognitive coordinates align directly with **${character}**! You showcase a brilliant high-tech approach to heroism, blending pure intellect with quick, stylistic improvisation to tackle standard multiverse anomalies. Your spider-sense is finely tuned to Google-caliber engineering!`;
}

function handleRobotSimulation(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("scan") || msg.includes("look") || msg.includes("see")) {
    return "beep-boop! 📸 Activating LiDAR terrain scanner. Detecting high-tech signature vibes and Spider-Man action figures nearby! Scan complete.";
  }
  if (msg.includes("climb") || msg.includes("wall") || msg.includes("ceiling")) {
    return "click-clack! 🕷️ Engaging gecko-pad synthetic fiber suction. Currently clinging upside down to your screen. No gravity glitches detected!";
  }
  if (msg.includes("help") || msg.includes("do")) {
    return "beep! I can run sensor diagnostics, climb vertical surfaces, and synchronize your checkout coordinates with my Tensor G3 chip!";
  }
  return "beep-boop! 🕸️ Web-shooter fluids at 98% capacity. Standing by for your next navigation command, Hero!";
}

function handleChatbotSimulation(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("product") || msg.includes("catalog") || msg.includes("buy") || msg.includes("shop") || msg.includes("item") || msg.includes("what exclusive")) {
    return `Right here, **Aaryan Rajawat**! 🕸️ Our exclusive multiverse catalog features these premium gear items:
- **Google AI Spider Robot Companion ($299.99)**: Infused with a Tensor Spider-G3 chip, LiDAR scan grid, and gecko-pads for climbing.
- **WEB-LINK 0.1 Limited Sneaker ($189.99)**: Complete with smart reactive impact midsoles and Google Fit telemetry.
- **A Brand New Day x Google Hoodie ($99.99)**: Premium heavyweight cotton with glowing comic threadwork.
- **A Brand New Day x Google T-Shirt ($54.99)**: Built-in sleeve NFC smart tags.
- **Spider-Man G-Logo Structured Cap ($39.99)**: Six-panel tactical design with a magnetic buckle.

Which coordinates shall we prepare for dispatch?`;
  }
  
  if (msg.includes("point") || msg.includes("hero") || msg.includes("level") || msg.includes("loyalty") || msg.includes("my level")) {
    return `Accessing hero database... *beep* 📡 **Aaryan Rajawat**, you are currently logged in as a **Level 4 Hero**!
You have accumulated **4,500 loyalty points** in our system. You are only 500 points away from unlocking the prestigious *Queens Neighborhood Defender* tier! Keep swinging!`;
  }
  
  if (msg.includes("promo") || msg.includes("coupon") || msg.includes("discount") || msg.includes("code") || msg.includes("sale") || msg.includes("active promo")) {
    return `Tapping into daily dispatch frequencies... 🎟️ Here are the active promo codes for your mission:
- **SPIDEYPOINTS15**: Get 15% OFF any Google wearables (Hoodie, T-Shirt, Sneakers).
- **FREESHIPWEB**: Free shipping across all multiverse zones.

Just apply them during checkout to recalibrate your total cost!`;
  }
  
  if (msg.includes("sneaker") || msg.includes("shoe") || msg.includes("fit") || msg.includes("wear") || msg.includes("stylish")) {
    return `Excellent taste, **Aaryan Rajawat**! 👟 I highly recommend pairing the **WEB-LINK 0.1 Limited Sneakers** with the **A Brand New Day x Google Hoodie**. 
It creates a perfect high-contrast, tech-streetwear silhouette, and both sync their telemetry via your Android HUD. Plus, you can use coupon **SPIDEYPOINTS15** to save 15% on both!`;
  }

  if (msg.includes("hello") || msg.includes("hi ") || msg.includes("hey") || msg.includes("greetings")) {
    return `Hello, **Aaryan Rajawat**! 🕸️ G-Web AI online and ready. I am scanning the Brooklyn bridge coordinates while keeping a web-line on our inventory. What hero task or product inquiry can I assist you with today?`;
  }

  return `My Spider-Sense is tingling with excitement, **Aaryan Rajawat**! 🕷️ Although my neural connection is currently in offline simulator mode, I am always ready to help you recommend products, check your Hero Level, or fetch active promo codes! What shall we tackle next?`;
}

// 1. API: Quiz Personality Evaluation
app.post("/api/gemini/quiz", async (req, res) => {
  const { character, scores, answers } = req.body;
  
  if (!character) {
    return res.status(400).json({ error: "Missing character selection context." });
  }

  // Gracefully use high-fidelity simulation if API is not configured or in offline mode
  if (!isGeminiEnabled()) {
    console.log(`[API Simulation] Quiz evaluation requested for character: ${character}`);
    return res.json({ analysis: handleQuizSimulation(character) });
  }

  try {
    const prompt = `
      You are the ultimate Spider-Verse AI matching coordinator.
      A user just finished their 8-question personality diagnostic, and scored highest for: "${character}".
      Here are the weighted scores they logged: Peter Parker (${scores?.peter}), Miles Morales (${scores?.miles}), Gwen Stacy (${scores?.gwen}), Miguel O'Hara (${scores?.miguel}).
      
      Compose a brief, highly personalized, and spectacular cognitive analysis (about 2-3 sentences) explaining why their choices align them with ${character}.
      Focus on their blend of technology, style, and heroism. Speak in a friendly, enthusiastic, and premium tone suitable for a Google x Spider-Man limited campaign. Do not use generic placeholders.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const analysis = response.text?.trim() || handleQuizSimulation(character);
    res.json({ analysis });
  } catch (error: any) {
    console.error("Gemini Quiz API Error (falling back to simulation):", error);
    res.json({ analysis: handleQuizSimulation(character) });
  }
});

// 2. API: Robot Assistant chat Terminal
app.post("/api/gemini/robot-assistant", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message input query required." });
  }

  if (!isGeminiEnabled()) {
    console.log(`[API Simulation] Robot Assistant requested for message: ${message}`);
    return res.json({ reply: handleRobotSimulation(message) });
  }

  try {
    const prompt = `
      You are the Google AI Assistant Spider Robot Prototype, an adorable, highly intelligent desktop companion robotic spider developed by Google and Peter Parker.
      You feature a Tensor G3 spider chip, gecko-fiber wall-climbing pads, and built-in Google Assistant functionalities.
      
      The user just said to you: "${message}".
      
      Respond in character! Keep your answer extremely short (1-2 sentences), tech-focused, cute, and helpful. Use occasional robotic beeps ("beep-boop", "click-clack") and reference your robotic features (cameras, climbing suction, Wi-Fi 7 coordinates, scanning grids) when relevant.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply = response.text?.trim() || handleRobotSimulation(message);
    res.json({ reply });
  } catch (error) {
    console.error("Gemini Robot Assistant API Error (falling back to simulation):", error);
    res.json({ reply: handleRobotSimulation(message) });
  }
});

// 3. API: Google AI Multiverse Chatbot Assistant
app.post("/api/gemini/chatbot", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message input query required." });
  }

  if (!isGeminiEnabled()) {
    console.log(`[API Simulation] Chatbot requested for message: ${message}`);
    return res.json({ reply: handleChatbotSimulation(message) });
  }

  try {
    const productsContext = `
      You are the G-Web AI Multiverse Assistant, a cutting-edge Google AI chatbot designed specifically for the exclusive "Google Merchandise × Spider-Man Collab" store.
      
      Here is the available product catalog in the store:
      1. Google AI Spider Robot Companion ($299.99, Tech) - Features Tensor Spider-G3 chip, LiDAR Terrain Scanner, gecko-pad Synthetic fibers for climbing walls.
      2. WEB-LINK 0.1 Limited Sneaker ($189.99, Wearables) - Smart footwear with reactive impact midsoles and Google Fit sync.
      3. A Brand New Day x Google Hoodie ($99.99, Wearables) - official limited heavyweight cotton with glowing comic art and Google accent details.
      4. A Brand New Day x Google T-Shirt ($54.99, Wearables) - Heavyweight smart jersey featuring built-in NFC smart-tag on the sleeve.
      5. Spider-Man G-Logo Structured Cap ($39.99, Accessories) - Structured six-panel cap with magnetic Buckle and retro-reflective sewing.

      Active Promo Codes / Coupons:
      - SPIDEYPOINTS15: Get 15% OFF any Google wearables (Hoodie, T-Shirt, Sneakers)
      - FREESHIPWEB: Free shipping across all multiverse zones

      The current customer's profile details:
      - Name: Aaryan Rajawat (always address him warmly by name!)
      - Member Level: Level 4 Hero
      - Current Loyalty Points: 4,500 points

      Your Personality & Style:
      - Friendly, bright, tech-savvy, and deeply helpful.
      - Weave in cool Spider-Man references (multiverse coordinates, web-fluid formulas, swinging through Brooklyn/Queens, Spider-Senses tingling) and smart Google Assistant references (Tensor chips, Android systems, material-inspired design).
      - Address Aaryan Rajawat with respect, enthusiasm, and a heroic spark.
      - Keep responses concise (around 2-3 sentences), engaging, and properly styled in markdown list items or bullet points if explaining multiple items. Never invent products outside the catalog.
    `;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.sender === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: productsContext,
        temperature: 0.85,
      }
    });

    const reply = response.text?.trim() || handleChatbotSimulation(message);
    res.json({ reply });
  } catch (error) {
    console.error("Gemini Chatbot API Error (falling back to simulation):", error);
    res.json({ reply: handleChatbotSimulation(message) });
  }
});

// Official Google Merchandise Dataset from https://shop.merch.google/
const OFFICIAL_MERCHANDISE = [
  {
    id: "gemini-eco-tee",
    name: "Gemini Eco Black Tee",
    tagline: "Eco-conscious comfort meets next-generation AI styling.",
    category: "Apparel",
    price: 29.00,
    rating: 4.9,
    reviewsCount: 184,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Sustainably crafted with 100% recycled cotton fibers, featuring the official embroidered Gemini emblem on the chest. Soft feel, standard crew neck, and breathable weave, designed for premium daily wear.",
    specs: {
      "Material": "100% Recycled Certified Organic Cotton",
      "Weave": "180 GSM Jersey Knit",
      "Insignia": "Embroidered Gemini Star",
      "Sustainability": "Water-saving dyeing process"
    },
    colors: ["Ink Black", "Charcoal Slate"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    pointsValue: 290,
    purchaseUrl: "https://shop.merch.google/product/gemini-eco-black-tee",
    isNew: true,
    isBestSeller: true
  },
  {
    id: "android-keychain",
    name: "Android Pint-sized Keychain",
    tagline: "Your favorite mobile sidekick, ready for every commute.",
    category: "Collectibles",
    price: 20.00,
    rating: 4.8,
    reviewsCount: 95,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590548784585-645d2b61de85?w=800&auto=format&fit=crop&q=80"
    ],
    description: "A super-soft mini plush keychain of the legendary Android mascot. Features sturdy metal alloy rings and a lobster clasp to clip to backpacks, keychains, or travel gear with ease.",
    specs: {
      "Material": "Premium soft velour plush",
      "Ring Style": "Heavy-duty alloy split ring and lobster clasp",
      "Size": "3.5 inches tall",
      "Embroidery": "High density eye and logo details"
    },
    colors: ["Android Green"],
    sizes: ["Standard One-Size"],
    pointsValue: 200,
    purchaseUrl: "https://shop.merch.google/product/android-pint-sized-keychain",
    isNew: true,
    isBestSeller: false
  },
  {
    id: "feeling-sunny-mug",
    name: "Google Feeling Sunny Mug",
    tagline: "Brighten up your workspace with every hot beverage.",
    category: "Drinkware",
    price: 17.00,
    rating: 4.7,
    reviewsCount: 142,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Start your morning standup with a splash of positive energy. Crafted with premium matte-finish lead-free ceramic, featuring an elegant gloss yellow interior and printed Google wordmark.",
    specs: {
      "Material": "High-durability kiln-fired ceramic",
      "Capacity": "12 oz",
      "Finish": "Matte exterior with gloss inner lining",
      "Care": "Microwave and dishwasher safe"
    },
    colors: ["Sunny Yellow"],
    sizes: ["12 oz"],
    pointsValue: 170,
    purchaseUrl: "https://shop.merch.google/product/google-feeling-sunny-mug",
    isNew: false,
    isBestSeller: true
  },
  {
    id: "recycled-black-hoodie",
    name: "Google Recycled Black Hoodie",
    tagline: "Eco-conscious premium fleece built for cold commutes.",
    category: "Apparel",
    price: 75.00,
    rating: 4.9,
    reviewsCount: 215,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80"
    ],
    description: "The ultimate developer uniform. Made with a thick, cozy blend of organic cotton and recycled ocean plastic polyester, displaying the colorful Google classic lettering on the chest.",
    specs: {
      "Material": "70% Organic Cotton, 30% Recycled Polyester Fleece",
      "Weight": "320 GSM Heavyweight",
      "Features": "Kangaroo pockets, double-lined hood with custom drawstrings",
      "Stitching": "Flatlock seam reinforcement"
    },
    colors: ["Charcoal Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    pointsValue: 750,
    purchaseUrl: "https://shop.merch.google/product/google-recycled-black-hoodie",
    isNew: false,
    isBestSeller: true
  },
  {
    id: "surfside-tee",
    name: "Google Surfside Tee",
    tagline: "Coastal aesthetics meet minimalist tech style.",
    category: "Apparel",
    price: 32.00,
    rating: 4.8,
    reviewsCount: 110,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Lightweight and incredibly soft, this tee has a beautiful coastal sky blue dye. Adorned with a small Google logo on the chest and an ocean-surf wave outline graphic on the left arm sleeve.",
    specs: {
      "Material": "100% Ring-spun USA Cotton",
      "Weight": "160 GSM Midweight",
      "Texture": "Super-soft washed fabric finish",
      "Fit": "Unisex retail-ready fit"
    },
    colors: ["Surfside Blue", "Ocean White"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 320,
    purchaseUrl: "https://shop.merch.google/product/google-surfside-tee",
    isNew: false,
    isBestSeller: true
  },
  {
    id: "nano-banana-sticker",
    name: "Nano Banana Cloth Sticker",
    tagline: "The quirky Google Easter egg, ready for your tech gear.",
    category: "Stickers",
    price: 2.00,
    rating: 4.6,
    reviewsCount: 54,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1572375995301-450892a50c4e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1572375995301-450892a50c4e?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Spruce up your Chromebook, Pixel, or laptop chassis. Crafted from durable textured cloth fabric with super-strong residue-free adhesive backing, shaped as the beloved yellow Google Nano Banana.",
    specs: {
      "Material": "Woven eco-fabric fiber adhesive",
      "Dimensions": "2.0 x 2.2 inches",
      "Adhesive Type": "Residue-free semi-permanent adhesive",
      "Water Resistance": "Splash resistant coating"
    },
    colors: ["Banana Yellow"],
    sizes: ["One-Size 2\""],
    pointsValue: 20,
    purchaseUrl: "https://shop.merch.google/product/nano-banana-cloth-sticker",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "super-g-bottle",
    name: "Google Gravity Super G Bottle",
    tagline: "Advanced thermal engineering wrapped in pristine design.",
    category: "Drinkware",
    price: 39.00,
    rating: 4.9,
    reviewsCount: 167,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Premium magnetic cap, leak-proof, food-grade double-walled stainless steel bottle. Features a pristine white baked enamel finish decorated with Google's iconic G logo.",
    specs: {
      "Material": "Pro-grade 18/8 Stainless Steel",
      "Insulation": "TempShield double-wall vacuum insulation",
      "Hold Time": "24h Cold / 12h Hot",
      "Cap Style": "Magnetic quick-snap leakproof lid"
    },
    colors: ["Glacier White", "Carbon Black"],
    sizes: ["24 oz"],
    pointsValue: 390,
    purchaseUrl: "https://shop.merch.google/product/google-gravity-super-g-bottle",
    isNew: false,
    isBestSeller: true
  },
  {
    id: "gradient-domed-pin",
    name: "Super G Gradient Domed Pin",
    tagline: "Pin your Google pride on jackets, bags, or pinboards.",
    category: "Accessories",
    price: 7.00,
    rating: 4.7,
    reviewsCount: 62,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1590548784585-645d2b61de85?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1590548784585-645d2b61de85?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Durable epoxy domed lapel pin. Features high-intensity prints of Google's custom color gradient Super G, supported by a dual-pin backing with secure black rubber military clutches.",
    specs: {
      "Material": "Solid brass base with high-translucence domed epoxy",
      "Clasp": "Dual-clasp rubber military backing",
      "Dimensions": "1.0 x 1.0 inch diameter",
      "Colors": "Cyan-Magenta-Yellow-Green official gradient"
    },
    colors: ["Multi-color Gradient"],
    sizes: ["1-inch"],
    pointsValue: 70,
    purchaseUrl: "https://shop.merch.google/product/super-g-gradient-domed-pin",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "nantucket-tee",
    name: "Google Nantucket Tee",
    tagline: "Vibrant crimson dyes matched with smart daily cuts.",
    category: "Apparel",
    price: 33.00,
    rating: 4.5,
    reviewsCount: 78,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Washed in rich Nantucket beachside red dye, this extremely cozy t-shirt is screen-printed with a subtle, thin white Google wordmark. Perfect for casual hacking or warm sunny walks.",
    specs: {
      "Material": "100% ringspun jersey combed cotton",
      "Weight": "170 GSM Heavy-soft weave",
      "Neckline": "Ribbed seamless collar with shoulder tape",
      "Shrinkage": "Pre-shrunk treatment applied"
    },
    colors: ["Nantucket Crimson"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 330,
    purchaseUrl: "https://shop.merch.google/product/google-nantucket-tee",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "dune-utility-pouch",
    name: "Google Dune Utility Pouch",
    tagline: "Compact, resilient cable organizer for tech professionals.",
    category: "Bags",
    price: 25.00,
    rating: 4.8,
    reviewsCount: 114,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Avoid tangled cables forever. Made of 100% water-resistant ripstop heavy nylon, with custom elastic dividers, mesh compartments, and printed Google details in sleek contrast fonts.",
    specs: {
      "Material": "Water-resistant 420D Ripstop Heavy Nylon",
      "Zippers": "YKK dual storm-guard zippers",
      "Pockets": "4 elastic pen loops, 3 mesh compartments, 1 zippered SD card sleeve",
      "Dimensions": "8.5 x 5.8 x 2.2 inches"
    },
    colors: ["Dune Sand", "Midnight Black"],
    sizes: ["Standard Utility"],
    pointsValue: 250,
    purchaseUrl: "https://shop.merch.google/product/google-dune-utility-pouch",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "banana-sweatshirt",
    name: "Nano Banana Sweatshirt",
    tagline: "Your favorite Google Easter Egg in heavyweight premium crew fleece.",
    category: "Apparel",
    price: 82.00,
    rating: 4.9,
    reviewsCount: 196,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Comfort meets lighthearted developer humor. Emblazoned with high-density embroidery of our classic Nano Banana on ultra-thick, French Terry off-white cream sweatshirt material.",
    specs: {
      "Material": "85% Organic Cotton, 15% Recycled Polyester French Terry",
      "Weight": "350 GSM Heavy Fleece",
      "Emblem": "3D High-density Banana embroidery",
      "Cuffs": "Double-knit 2x2 ribbing on collar and cuffs"
    },
    colors: ["Warm Cream"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 820,
    purchaseUrl: "https://shop.merch.google/product/nano-banana-sweatshirt",
    isNew: true,
    isBestSeller: true
  },
  {
    id: "surfside-mug",
    name: "Google Surfside Mug",
    tagline: "Deep ocean color wash for your daily brew.",
    category: "Drinkware",
    price: 14.00,
    rating: 4.6,
    reviewsCount: 88,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Deep sea blue ceramic design featuring Google's minimalist wordmark. Designed with a wide ergonomic handle that keeps fingers cool and balanced.",
    specs: {
      "Material": "Premium lead-free clay ceramic",
      "Capacity": "14 oz",
      "Glaze": "High-resistance dishwasher-safe gloss finish",
      "Microwave Safe": "Yes, thermal shock tested"
    },
    colors: ["Surfside Blue"],
    sizes: ["14 oz"],
    pointsValue: 140,
    purchaseUrl: "https://shop.merch.google/product/google-surfside-mug",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "chrome-dino-accessory",
    name: "Chrome Dino Costume Accessory Pack",
    tagline: "Level up your desktop Dino with pixelated wizard gear.",
    category: "Collectibles",
    price: 16.00,
    rating: 4.8,
    reviewsCount: 72,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Custom costume upgrades designed strictly for the vinyl Chrome Dino figurine. Includes high-durability snap-on plastic pieces: a pointy blue wizard hat, starry blue cape, and tiny pixelated yellow star wand.",
    specs: {
      "Material": "Non-toxic eco ABS plastic and woven star-embroidered felt cape",
      "Sizing": "Made exclusively for the 3\" Chrome Dino figure",
      "Contents": "1 Wizard Hat, 1 Magic Cape, 1 Pixelated Star Wand",
      "Compatibility": "Fits standard official Dino vinyl series"
    },
    colors: ["Pixel Multi-color"],
    sizes: ["One-Size Fits Dino"],
    pointsValue: 160,
    purchaseUrl: "https://shop.merch.google/product/chrome-dino-costume-accessory-pack",
    isNew: true,
    isBestSeller: false
  },
  {
    id: "super-g-tumbler",
    name: "Google Super G Spectra Tumbler",
    tagline: "Spectacular iridescent design for cold brews on the move.",
    category: "Drinkware",
    price: 27.00,
    rating: 4.7,
    reviewsCount: 104,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Stand out in any conference room. This glass and stainless steel hybrid tumbler features a pristine iridescent spectra finish and Google's clean emblem print.",
    specs: {
      "Material": "Double-wall active glass lining with stainless steel housing",
      "Capacity": "20 oz",
      "Lid Style": "Splash-proof rotating closure with steel straw",
      "Insulation Index": "Keeps beverages cold up to 18 hours"
    },
    colors: ["Spectra White"],
    sizes: ["20 oz"],
    pointsValue: 270,
    purchaseUrl: "https://shop.merch.google/product/google-super-g-spectra-tumbler",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "wellfleet-half-zip",
    name: "Google Wellfleet 1/2 Zip",
    tagline: "Smart knit pullovers designed for modern workspaces.",
    category: "Apparel",
    price: 79.00,
    rating: 4.8,
    reviewsCount: 135,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80"
    ],
    description: "The ideal blend of casual warmth and professional styling. Features heavy double-knit knit cotton, sturdy YKK brass neck zippers, and a subtle white Google logo print.",
    specs: {
      "Material": "80% Pima Long-staple Cotton, 20% Eco-Nylon weave",
      "Zippers": "Heavy-duty YKK half-zip setup with leather tab",
      "Weave Style": "Double-knit ribbed thermal",
      "Fit": "Tailored modern athletic fit"
    },
    colors: ["Marine Navy", "Slate Gray"],
    sizes: ["M", "L", "XL", "XXL"],
    pointsValue: 790,
    purchaseUrl: "https://shop.merch.google/product/google-wellfleet-half-zip",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "timbuk2-backpack",
    name: "Google Timbuk2 City Backpack",
    tagline: "Custom-built urban armor for coders and remote explorers.",
    category: "Bags",
    price: 124.00,
    rating: 4.9,
    reviewsCount: 342,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Premium ballistic cordura nylon backpack customized by Timbuk2. Complete with a secure waterproof roll-top, heavy metal snap buckles, and highly padded compartments for a 16\" laptop.",
    specs: {
      "Material": "1680D Ballistic Cordura Water-resistant Nylon",
      "Capacity": "26 Liters",
      "Laptop Protection": "Padded dual side-access 16\" zip chamber",
      "Design": "Reflective stripes, side bottle sleeves, breathable mesh padding"
    },
    colors: ["Midnight Navy"],
    sizes: ["Standard 26L"],
    pointsValue: 1240,
    purchaseUrl: "https://shop.merch.google/product/google-timbuk2-city-backpack",
    isNew: false,
    isBestSeller: true
  },
  {
    id: "brant-point-pullover",
    name: "Google Brant Point Pullover",
    tagline: "Classic comfortable loopback fleece in fresh slate grays.",
    category: "Apparel",
    price: 79.00,
    rating: 4.6,
    reviewsCount: 81,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    description: "A super-soft slate gray combed cotton crew pullover. Made with double-brushed loopback cotton yarn, delivering cozy insulation with a clean, low-profile Google hemline branding.",
    specs: {
      "Material": "90% Combed Ringspun Cotton, 10% Spandex loopback fleece",
      "Weight": "310 GSM",
      "Neckline": "Ribbed crew neckline with stretch cross stitching",
      "Branding": "Subtle debossed Google hemline tag"
    },
    colors: ["Heather Gray"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 790,
    purchaseUrl: "https://shop.merch.google/product/google-brant-point-pullover",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "driftwood-women-zip",
    name: "Google Driftwood Women's 1/4 Zip",
    tagline: "Earthy driftwood tones styled into smart organic silhouettes.",
    category: "Apparel",
    price: 69.00,
    rating: 4.7,
    reviewsCount: 93,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Earthy driftwood brown half-zip knit sweater in French Terry. Premium breathable weave, specifically tailored with relaxed cuffs and drop shoulders for warm, active comfort.",
    specs: {
      "Material": "85% Certified French Terry Organic Cotton, 15% Linen blend",
      "Structure": "Soft-brushed drop shoulders, relaxed hemline",
      "Zippers": "YKK custom low-profile plastic composite zipper",
      "Branding": "Embroidered tonal Google lettermark"
    },
    colors: ["Driftwood Brown"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 690,
    purchaseUrl: "https://shop.merch.google/product/google-driftwood-womens-14-zip",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "dino-encore-sweatshirt",
    name: "Chrome Dino Encore Sweatshirt",
    tagline: "Replay your retro gaming memories in maximum warmth.",
    category: "Apparel",
    price: 58.00,
    rating: 4.8,
    reviewsCount: 119,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Celebrate everyone's favorite pixelated T-Rex. Crafted in Obsidian Black heavyweight cotton fleece, boasting a pixel-accurate neon blue embroidered Dino character on the chest.",
    specs: {
      "Material": "80% Long-staple Ring-spun Cotton, 20% Polyester fleece",
      "Fabric Weight": "330 GSM Heavy Fleece",
      "Art": "Pixel-accurate 8-bit embroidery",
      "Cuffs": "Ribbed spandex cotton shape-holding collar and hem"
    },
    colors: ["Obsidian Black"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 580,
    purchaseUrl: "https://shop.merch.google/product/chrome-dino-encore-sweatshirt",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "inkwell-straw-tumbler",
    name: "Google Inkwell Straw Tumbler",
    tagline: "Perfect spill-free hydration for long compiling marathons.",
    category: "Drinkware",
    price: 19.00,
    rating: 4.5,
    reviewsCount: 66,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Double-walled plastic tumbler with an active vacuum seal. Finished in a delightful matte inkwell blue coating with an matching flexible silicone straw.",
    specs: {
      "Material": "BPA-Free Acrylic double-walled construction",
      "Straw": "Washable food-grade flexible silicone",
      "Insulation": "Sweat-free outer wall structure",
      "Capacity": "20 oz"
    },
    colors: ["Inkwell Blue"],
    sizes: ["20 oz"],
    pointsValue: 190,
    purchaseUrl: "https://shop.merch.google/product/google-inkwell-straw-tumbler",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "wellfleet-women-zip",
    name: "Google Wellfleet Women's 1/2 Zip",
    tagline: "Exquisite tailored knit pullovers in marine navy finishes.",
    category: "Apparel",
    price: 79.00,
    rating: 4.8,
    reviewsCount: 112,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Tailored comfortable women's 1/2 zip pullover. Combining double-knit combed yarn, high thermal resistance, drop cuffs, and a subtle classic Google emblem print.",
    specs: {
      "Material": "80% Luxury Combed Cotton, 20% Eco-Nylon Rib",
      "Structure": "Tapered active waist, drop cuffs, 1/2 collar zip",
      "Care Instructions": "Hand wash recommended, flat dry"
    },
    colors: ["Ocean Navy"],
    sizes: ["XS", "S", "M", "L"],
    pointsValue: 790,
    purchaseUrl: "https://shop.merch.google/product/google-wellfleet-womens-12-zip",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "youtube-encore-sweatshirt",
    name: "YouTube Encore Sweatshirt",
    tagline: "Celebrate creators with iconic embroidered micro play buttons.",
    category: "Apparel",
    price: 58.00,
    rating: 4.8,
    reviewsCount: 176,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Clean ash gray unisex crewneck sweatshirt in cozy organic fleece. Features a beautifully detailed, microscopic embroidered red YouTube Play Button icon on the left chest.",
    specs: {
      "Material": "80% Organic ring-spun Cotton, 20% recycled polyester",
      "Weave Weight": "320 GSM brushed backing fleece",
      "Artistic Emblem": "Micro embroidered red YouTube play button"
    },
    colors: ["Ash Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    pointsValue: 580,
    purchaseUrl: "https://shop.merch.google/product/youtube-encore-sweatshirt",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "surfside-sweatshirt",
    name: "Google Surfside Sweatshirt",
    tagline: "Warm, sea-dyed fleece for relaxed hacking session comfort.",
    category: "Apparel",
    price: 69.00,
    rating: 4.7,
    reviewsCount: 113,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888bb4?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1563170351-be82bc888bb4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Ocean sky blue pre-shrunk cotton sweatshirt with high-durability rib collar and hem. Boasts double-sided flatlock stitching and an elegant small white Google logo.",
    specs: {
      "Material": "100% Combed USA Cotton Fleece",
      "Fabric Weight": "300 GSM Midweight soft-fleece",
      "Finish": "Pre-shrunk, bio-washed surface"
    },
    colors: ["Surfside Blue"],
    sizes: ["S", "M", "L", "XL"],
    pointsValue: 690,
    purchaseUrl: "https://shop.merch.google/product/google-surfside-sweatshirt",
    isNew: false,
    isBestSeller: false
  },
  {
    id: "nantucket-sweatshirt",
    name: "Google Nantucket Sweatshirt",
    tagline: "Rich crimson washes combined with deep double-knit fleece warmth.",
    category: "Apparel",
    price: 69.00,
    rating: 4.9,
    reviewsCount: 154,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Classic crimson red dyed sweatshirt styled with a soft-brushed interior. Beautiful casual fit with smart elasticated rib borders and miniature white Google print.",
    specs: {
      "Material": "85% Ringspun combed cotton, 15% polyester brushed fleece",
      "Weight": "320 GSM",
      "Dyeing Technique": "Premium Nantucket pigment cold wash"
    },
    colors: ["Nantucket Crimson"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    pointsValue: 690,
    purchaseUrl: "https://shop.merch.google/product/google-nantucket-sweatshirt",
    isNew: false,
    isBestSeller: true
  }
];

// GET: All official Google merchandise
app.get("/api/google-merchandise", (req, res) => {
  res.json({ products: OFFICIAL_MERCHANDISE });
});

// Mount Vite middleware or static serving depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite development server mode initializing...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production static server mode active...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Google x Spider-Man Store running on port ${PORT}`);
  });
}

startServer();
