import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { 
  RotateCw, 
  Eye, 
  HelpCircle, 
  Grid3X3, 
  Moon, 
  Sun,
  Maximize2,
  RefreshCw,
  Info
} from "lucide-react";

interface ProductViewer3DProps {
  productId: string;
  productName: string;
  category: string;
  selectedColor?: string;
}

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  productId,
  productName,
  category,
  selectedColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI State
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"shaded" | "wireframe" | "blueprint">("shaded");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.005);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // References to animate Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Mouse interaction state for manual orbit (custom lightweight orbit controls)
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Map product names / options to actual 3D Hex colors
  const getColorHex = (colorName?: string): string => {
    if (!colorName) colorName = "";
    const lower = colorName.toLowerCase();
    if (lower.includes("yellow") || lower.includes("sunny") || lower.includes("banana")) return "#FBBC04";
    if (lower.includes("blue") || lower.includes("surfside") || lower.includes("bay") || lower.includes("spectra")) return "#4285F4";
    if (lower.includes("red") || lower.includes("crimson") || lower.includes("nantucket")) return "#EA4335";
    if (lower.includes("green") || lower.includes("android")) return "#3DDC84";
    if (lower.includes("gray") || lower.includes("grey") || lower.includes("slate") || lower.includes("ash")) return "#70757a";
    if (lower.includes("black") || lower.includes("obsidian") || lower.includes("inkwell") || lower.includes("charcoal")) return "#1a1a1a";
    if (lower.includes("cream") || lower.includes("white") || lower.includes("warm cream") || lower.includes("glacier")) return "#f5f5f5";
    if (lower.includes("sand") || lower.includes("dune")) return "#D2B48C";
    
    // Default fallback based on category
    if (category === "Drinkware") return "#FBBC04"; // Default sunny yellow mug vibe
    if (category === "Apparel") return "#1a1a1a"; // Default sleek black hoodie vibe
    if (category === "Collectibles") return "#3DDC84"; // Android green
    return "#4285F4"; // Google blue
  };

  // Build high-fidelity dynamic branding texture dynamically on a canvas!
  const createBrandTexture = (type: "google" | "gemini" | "android" | "youtube" | "banana"): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Clear with transparent background
      ctx.clearRect(0, 0, 512, 512);

      if (type === "google") {
        // Draw elegant Google "G" or Google text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 72px 'Inter', sans-serif";
        
        // Draw a neat white background disk for contrast
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(256, 256, 120, 0, Math.PI * 2);
        ctx.fill();

        // Draw "G"
        ctx.font = "black 160px 'Inter', sans-serif";
        ctx.fillStyle = "#4285F4"; // Google Blue
        ctx.fillText("G", 256, 250);
        
        // Subtle detail ring
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 6;
        ctx.stroke();
      } else if (type === "gemini") {
        // Draw the sparkling Gemini Star shape
        ctx.fillStyle = "white";
        ctx.beginPath();
        // Draw four-pointed star with bezier curves
        ctx.moveTo(256, 136);
        ctx.quadraticCurveTo(256, 256, 376, 256);
        ctx.quadraticCurveTo(256, 256, 256, 376);
        ctx.quadraticCurveTo(256, 256, 136, 256);
        ctx.quadraticCurveTo(256, 256, 256, 136);
        ctx.fill();

        // Draw a mini glowing aura
        ctx.fillStyle = "rgba(138, 180, 248, 0.3)";
        ctx.beginPath();
        ctx.arc(256, 256, 80, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "android") {
        // Android simple wordmark or eyes
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "black 80px monospace";
        ctx.fillStyle = "#3DDC84";
        ctx.fillText("ANDROID", 256, 256);
      } else if (type === "youtube") {
        // YouTube play button
        ctx.fillStyle = "#FF0000";
        // rounded rect
        ctx.beginPath();
        ctx.roundRect(146, 186, 220, 140, 30);
        ctx.fill();

        // white triangle
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(236, 216);
        ctx.lineTo(296, 256);
        ctx.lineTo(236, 296);
        ctx.closePath();
        ctx.fill();
      } else if (type === "banana") {
        // Pixel or smooth yellow banana
        ctx.font = "140px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍌", 256, 256);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Generate beautiful, high-fidelity procedural 3D models
  const buildProceduralModel = (scene: THREE.Scene, pid: string, colorHex: string): THREE.Group => {
    const mainGroup = new THREE.Group();
    mainGroup.name = "GoogleMerchItem";

    const materialColor = new THREE.Color(colorHex);
    
    // Core material variations
    const glossyMaterial = new THREE.MeshStandardMaterial({
      color: materialColor,
      roughness: 0.15,
      metalness: 0.25,
      bumpScale: 0.05,
      side: THREE.DoubleSide
    });

    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: materialColor,
      roughness: 0.85,
      metalness: 0.05,
      bumpScale: 0.1,
      side: THREE.DoubleSide
    });

    const metallicMaterial = new THREE.MeshStandardMaterial({
      color: materialColor,
      roughness: 0.2,
      metalness: 0.85,
      side: THREE.DoubleSide
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      side: THREE.DoubleSide
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.1,
      metalness: 0.95
    });

    // Determine brand type for decals
    let brandType: "google" | "gemini" | "android" | "youtube" | "banana" = "google";
    if (pid.includes("gemini")) brandType = "gemini";
    else if (pid.includes("android")) brandType = "android";
    else if (pid.includes("youtube")) brandType = "youtube";
    else if (pid.includes("banana")) brandType = "banana";

    const brandTexture = createBrandTexture(brandType);

    // 1. MUG / CUP MODELS (e.g., feeling-sunny-mug, surfside-mug)
    if (category === "Drinkware" || pid.includes("mug") || pid.includes("tumbler") || pid.includes("bottle")) {
      if (pid.includes("bottle") || pid.includes("tumbler")) {
        // --- PREMIUM VACUUM BOTTLE / SLIM TUMBLER ---
        const bottleGroup = new THREE.Group();
        bottleGroup.name = "Water Bottle";

        // Flask Lower Body Cylinder
        const bodyGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.2, 32);
        const bodyMesh = new THREE.Mesh(bodyGeo, metallicMaterial);
        bodyMesh.position.y = -0.1;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        bottleGroup.add(bodyMesh);

        // Dynamic Decal wrapping for the body
        const decalGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.8, 32, 1, true);
        const decalMat = new THREE.MeshBasicMaterial({
          map: brandTexture,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.NormalBlending
        });
        const decalMesh = new THREE.Mesh(decalGeo, decalMat);
        decalMesh.position.y = -0.1;
        bottleGroup.add(decalMesh);

        // Tapered Flask Shoulder
        const shoulderGeo = new THREE.CylinderGeometry(0.45, 0.75, 0.5, 32);
        const shoulderMesh = new THREE.Mesh(shoulderGeo, metallicMaterial);
        shoulderMesh.position.y = 1.25;
        bottleGroup.add(shoulderMesh);

        // Bottle Neck
        const neckGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.4, 32);
        const neckMesh = new THREE.Mesh(neckGeo, chromeMaterial);
        neckMesh.position.y = 1.6;
        bottleGroup.add(neckMesh);

        // Snap-on Cap
        const capGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 32);
        const capMesh = new THREE.Mesh(capGeo, glossyMaterial);
        capMesh.position.y = 1.95;
        capMesh.castShadow = true;
        bottleGroup.add(capMesh);

        // Tiny carrying metal ring loop
        const loopGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 24);
        const loopMesh = new THREE.Mesh(loopGeo, chromeMaterial);
        loopMesh.position.set(0, 2.1, 0.2);
        loopMesh.rotation.x = Math.PI / 2;
        bottleGroup.add(loopMesh);

        mainGroup.add(bottleGroup);
      } else {
        // --- PREMIUM CERAMIC MUG ---
        const mugGroup = new THREE.Group();
        mugGroup.name = "Ceramic Mug";

        // Main outer cylinder
        const outerGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 32);
        const outerMesh = new THREE.Mesh(outerGeo, glossyMaterial);
        outerMesh.castShadow = true;
        outerMesh.receiveShadow = true;
        mugGroup.add(outerMesh);

        // Hollow inner cavity cylinder (painted contrast black/coffee color or smooth white)
        const innerGeo = new THREE.CylinderGeometry(0.88, 0.88, 2.05, 32);
        const innerColor = pid.includes("sunny") ? new THREE.Color("#fff") : new THREE.Color("#1a1a1a");
        const innerMat = new THREE.MeshStandardMaterial({
          color: innerColor,
          roughness: 0.1,
          metalness: 0.1,
          side: THREE.BackSide
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        innerMesh.position.y = 0.08;
        mugGroup.add(innerMesh);

        // Coffee surface level inside the mug
        const coffeeGeo = new THREE.CylinderGeometry(0.87, 0.87, 0.05, 32);
        const coffeeMat = new THREE.MeshStandardMaterial({
          color: 0x3d2314, // Rich coffee brown!
          roughness: 0.08,
          metalness: 0.1
        });
        const coffeeMesh = new THREE.Mesh(coffeeGeo, coffeeMat);
        coffeeMesh.position.y = 0.75; // near the top!
        mugGroup.add(coffeeMesh);

        // Rounded top ring rim
        const rimGeo = new THREE.TorusGeometry(0.94, 0.06, 8, 32);
        const rimMesh = new THREE.Mesh(rimGeo, glossyMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.1;
        mugGroup.add(rimMesh);

        // Ergonomic handle
        const handleGeo = new THREE.TorusGeometry(0.7, 0.14, 16, 32, Math.PI * 1.3);
        const handleMesh = new THREE.Mesh(handleGeo, glossyMaterial);
        handleMesh.position.set(-0.95, 0, 0);
        handleMesh.rotation.z = -Math.PI * 0.15;
        mugGroup.add(handleMesh);

        // Dynamic branding logo badge overlay on front face
        const logoQuadGeo = new THREE.PlaneGeometry(0.7, 0.7);
        const logoQuadMat = new THREE.MeshBasicMaterial({
          map: brandTexture,
          transparent: true,
          side: THREE.DoubleSide
        });
        const logoQuad = new THREE.Mesh(logoQuadGeo, logoQuadMat);
        logoQuad.position.set(0, 0, 1.02); // placed on front
        mugGroup.add(logoQuad);

        mainGroup.add(mugGroup);
      }
    }

    // 2. APPAREL MODELS (e.g., gemini-eco-tee, recycled-black-hoodie, sweatshirts)
    else if (category === "Apparel" || pid.includes("tee") || pid.includes("hoodie") || pid.includes("sweatshirt") || pid.includes("zip")) {
      const apparelGroup = new THREE.Group();
      apparelGroup.name = "Apparel Torso";

      // Stylized modern t-shirt torso
      // Chest cylinder
      const torsoGeo = new THREE.CylinderGeometry(0.95, 0.85, 1.8, 32);
      const torsoMesh = new THREE.Mesh(torsoGeo, fabricMaterial);
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
      apparelGroup.add(torsoMesh);

      // Curved shoulders / sleeves
      const leftSleeveGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.6, 16);
      const leftSleeve = new THREE.Mesh(leftSleeveGeo, fabricMaterial);
      leftSleeve.position.set(0.95, 0.55, 0);
      leftSleeve.rotation.z = -Math.PI / 4;
      apparelGroup.add(leftSleeve);

      const rightSleeveGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.6, 16);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, fabricMaterial);
      rightSleeve.position.set(-0.95, 0.55, 0);
      rightSleeve.rotation.z = Math.PI / 4;
      apparelGroup.add(rightSleeve);

      // Hoodie hood (only if it's a hoodie!)
      if (pid.includes("hoodie")) {
        const hoodGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.85);
        const hoodMesh = new THREE.Mesh(hoodGeo, fabricMaterial);
        hoodMesh.position.set(0, 1.15, -0.15);
        apparelGroup.add(hoodMesh);

        // Hanging drawstrings
        const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
        const string1 = new THREE.Mesh(stringGeo, chromeMaterial);
        string1.position.set(0.15, 0.6, 0.3);
        string1.rotation.z = -0.05;
        apparelGroup.add(string1);

        const string2 = new THREE.Mesh(stringGeo, chromeMaterial);
        string2.position.set(-0.15, 0.6, 0.3);
        string2.rotation.z = 0.05;
        apparelGroup.add(string2);
      } else {
        // Simple crew neckline collar
        const neckCollarGeo = new THREE.TorusGeometry(0.38, 0.06, 8, 32);
        const neckCollar = new THREE.Mesh(neckCollarGeo, fabricMaterial);
        neckCollar.rotation.x = Math.PI / 2;
        neckCollar.position.y = 0.9;
        apparelGroup.add(neckCollar);
      }

      // Large brand print flat panel overlay on chest
      const decalGeo = new THREE.PlaneGeometry(0.85, 0.85);
      const decalMat = new THREE.MeshBasicMaterial({
        map: brandTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const decalMesh = new THREE.Mesh(decalGeo, decalMat);
      decalMesh.position.set(0, 0.25, 0.96); // slightly projected in front of torso chest
      apparelGroup.add(decalMesh);

      // Bottom ribbed hem
      const hemGeo = new THREE.CylinderGeometry(0.87, 0.87, 0.15, 32);
      const hemMesh = new THREE.Mesh(hemGeo, fabricMaterial);
      hemMesh.position.y = -0.95;
      apparelGroup.add(hemMesh);

      mainGroup.add(apparelGroup);
    }

    // 3. COLLECTIBLES & FIGURINES (e.g., android-keychain, android-classic-fig)
    else if (category === "Collectibles" || pid.includes("android") || pid.includes("fig") || pid.includes("keychain")) {
      const androidGroup = new THREE.Group();
      androidGroup.name = "Android Figurine";

      // Android Green Gloss Material
      const androidGreenMat = new THREE.MeshStandardMaterial({
        color: 0x3DDC84,
        roughness: 0.15,
        metalness: 0.15
      });

      // Capsule body (built from cylinder and half-sphere bottom)
      const bodyGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.9, 32);
      const bodyMesh = new THREE.Mesh(bodyGeo, androidGreenMat);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      androidGroup.add(bodyMesh);

      const bodyBottomGeo = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bodyBottom = new THREE.Mesh(bodyBottomGeo, androidGreenMat);
      bodyBottom.position.y = -0.45;
      androidGroup.add(bodyBottom);

      // Head (Semi-sphere on top)
      const headGeo = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const headMesh = new THREE.Mesh(headGeo, androidGreenMat);
      headMesh.position.y = 0.52;
      headMesh.castShadow = true;
      androidGroup.add(headMesh);

      // Eyes (White small dots)
      const eyeGeo = new THREE.SphereGeometry(0.06, 16, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(0.22, 0.78, 0.54);
      androidGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(-0.22, 0.78, 0.54);
      androidGroup.add(rightEye);

      // Antennas (Angled Cylinders)
      const antennaGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
      
      const leftAntenna = new THREE.Mesh(antennaGeo, androidGreenMat);
      leftAntenna.position.set(0.24, 1.15, 0.1);
      leftAntenna.rotation.z = -Math.PI / 6;
      leftAntenna.rotation.x = Math.PI / 12;
      androidGroup.add(leftAntenna);

      const rightAntenna = new THREE.Mesh(antennaGeo, androidGreenMat);
      rightAntenna.position.set(-0.24, 1.15, 0.1);
      rightAntenna.rotation.z = Math.PI / 6;
      rightAntenna.rotation.x = Math.PI / 12;
      androidGroup.add(rightAntenna);

      // Floating Arms (Capsules on sides)
      const armGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16);
      const armEndGeo = new THREE.SphereGeometry(0.14, 16, 8);

      const buildArm = (xOffset: number): THREE.Group => {
        const arm = new THREE.Group();
        const armCyl = new THREE.Mesh(armGeo, androidGreenMat);
        const topCap = new THREE.Mesh(armEndGeo, androidGreenMat);
        const botCap = new THREE.Mesh(armEndGeo, androidGreenMat);
        
        topCap.position.y = 0.275;
        botCap.position.y = -0.275;
        arm.add(armCyl);
        arm.add(topCap);
        arm.add(botCap);
        arm.position.set(xOffset, 0.05, 0);
        return arm;
      };

      const leftArm = buildArm(0.85);
      const rightArm = buildArm(-0.85);
      androidGroup.add(leftArm);
      androidGroup.add(rightArm);

      // Legs (Small vertical capsules at base)
      const legGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.35, 16);
      const legBottom = new THREE.SphereGeometry(0.14, 16, 8);

      const buildLeg = (xOffset: number): THREE.Group => {
        const leg = new THREE.Group();
        const legCyl = new THREE.Mesh(legGeo, androidGreenMat);
        const cap = new THREE.Mesh(legBottom, androidGreenMat);
        cap.position.y = -0.175;
        leg.add(legCyl);
        leg.add(cap);
        leg.position.set(xOffset, -0.9, 0);
        return leg;
      };

      const leftLeg = buildLeg(0.24);
      const rightLeg = buildLeg(-0.24);
      androidGroup.add(leftLeg);
      androidGroup.add(rightLeg);

      // Keychain Elements
      if (pid.includes("keychain")) {
        const keychainGroup = new THREE.Group();
        keychainGroup.name = "Key Ring";

        // Metal shaft extending from top of head
        const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
        const shaft = new THREE.Mesh(shaftGeo, chromeMaterial);
        shaft.position.y = 1.25;
        keychainGroup.add(shaft);

        // Torus Ring
        const ringGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 24);
        const ring = new THREE.Mesh(ringGeo, chromeMaterial);
        ring.position.y = 1.55;
        ring.rotation.x = Math.PI / 2;
        keychainGroup.add(ring);

        // Small Lobster Clasp connector
        const claspGeo = new THREE.TorusGeometry(0.09, 0.025, 8, 16);
        const clasp = new THREE.Mesh(claspGeo, chromeMaterial);
        clasp.position.set(0, 1.8, 0);
        keychainGroup.add(clasp);

        androidGroup.add(keychainGroup);
      }

      mainGroup.add(androidGroup);
    }

    // 4. BAGS & UTILITY POUCHES (e.g., timbuk2-backpack, utility-pouch)
    else if (category === "Bags" || pid.includes("backpack") || pid.includes("pouch") || pid.includes("bag")) {
      const bagGroup = new THREE.Group();
      bagGroup.name = "Backpack Armor";

      // Rounded soft box representing the main compartment
      const bagMainGeo = new THREE.BoxGeometry(1.2, 1.7, 0.75);
      const bagMesh = new THREE.Mesh(bagMainGeo, fabricMaterial);
      bagMesh.castShadow = true;
      bagMesh.receiveShadow = true;
      bagGroup.add(bagMesh);

      // Outer zip pouch pocket
      const pocketGeo = new THREE.BoxGeometry(0.95, 0.85, 0.25);
      const pocketMesh = new THREE.Mesh(pocketGeo, fabricMaterial);
      pocketMesh.position.set(0, -0.3, 0.48);
      pocketMesh.castShadow = true;
      bagGroup.add(pocketMesh);

      // Top curved carrying handle
      const handleGeo = new THREE.TorusGeometry(0.24, 0.05, 8, 24, Math.PI);
      const handleMesh = new THREE.Mesh(handleGeo, fabricMaterial);
      handleMesh.position.set(0, 0.85, 0);
      bagGroup.add(handleMesh);

      // Dynamic branding logo badge overlay on the pocket
      const logoQuadGeo = new THREE.PlaneGeometry(0.55, 0.55);
      const logoQuadMat = new THREE.MeshBasicMaterial({
        map: brandTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const logoQuad = new THREE.Mesh(logoQuadGeo, logoQuadMat);
      logoQuad.position.set(0, -0.3, 0.61); // placed in front of pocket
      bagGroup.add(logoQuad);

      // Side elastic water bottle mesh pockets
      const leftPocketGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
      const leftPocket = new THREE.Mesh(leftPocketGeo, glossyMaterial);
      leftPocket.position.set(0.61, -0.3, 0);
      bagGroup.add(leftPocket);

      const rightPocketGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
      const rightPocket = new THREE.Mesh(rightPocketGeo, glossyMaterial);
      rightPocket.position.set(-0.61, -0.3, 0);
      bagGroup.add(rightPocket);

      mainGroup.add(bagGroup);
    }

    // 5. STICKERS & ACCESSORIES (e.g., banana-sticker, gradient-domed-pin)
    else {
      // --- STICKER / ENAMEL LAPEL PIN ---
      const accessoryGroup = new THREE.Group();
      accessoryGroup.name = "Sticker Pin";

      if (pid.includes("pin")) {
        // Enamel lapel pin setup (Golden metal casing with shiny epoxy domed layer)
        const pinBaseGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 32);
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xD4AF37, // Beautiful premium gold casing!
          roughness: 0.15,
          metalness: 0.9
        });
        const pinBase = new THREE.Mesh(pinBaseGeo, goldMat);
        pinBase.rotation.x = Math.PI / 2;
        pinBase.castShadow = true;
        accessoryGroup.add(pinBase);

        // Inner graphic face
        const innerFaceGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.02, 32);
        const faceMat = new THREE.MeshStandardMaterial({
          map: brandTexture,
          roughness: 0.2,
          metalness: 0.1
        });
        const innerFace = new THREE.Mesh(innerFaceGeo, faceMat);
        innerFace.rotation.x = Math.PI / 2;
        innerFace.position.z = 0.06;
        accessoryGroup.add(innerFace);

        // Shiny curved transparent glass dome
        const domeGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
        const domeMesh = new THREE.Mesh(domeGeo, glassMaterial);
        domeMesh.position.z = 0.05;
        domeMesh.rotation.x = Math.PI / 2;
        accessoryGroup.add(domeMesh);

        // Back military clutch pin needle
        const pinNeedleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
        const pinNeedle = new THREE.Mesh(pinNeedleGeo, chromeMaterial);
        pinNeedle.position.set(0, 0, -0.2);
        pinNeedle.rotation.x = Math.PI / 2;
        accessoryGroup.add(pinNeedle);
      } else {
        // Sticker or other floating card item
        const stickerSheetGeo = new THREE.BoxGeometry(1.5, 1.5, 0.04);
        const sheetMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.5,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
        const sheetMesh = new THREE.Mesh(stickerSheetGeo, sheetMat);
        sheetMesh.castShadow = true;
        accessoryGroup.add(sheetMesh);

        // Brand print on the sticker front
        const stickerFrontGeo = new THREE.PlaneGeometry(1.4, 1.4);
        const stickerFrontMat = new THREE.MeshBasicMaterial({
          map: brandTexture,
          transparent: true,
          side: THREE.DoubleSide
        });
        const stickerFront = new THREE.Mesh(stickerFrontGeo, stickerFrontMat);
        stickerFront.position.z = 0.025;
        accessoryGroup.add(stickerFront);

        // Peel backing layer subtle line
        const backingGeo = new THREE.PlaneGeometry(1.48, 1.48);
        const backingMat = new THREE.MeshBasicMaterial({
          color: 0xf0f0f0,
          side: THREE.DoubleSide
        });
        const backing = new THREE.Mesh(backingGeo, backingMat);
        backing.position.z = -0.025;
        backing.rotation.y = Math.PI;
        accessoryGroup.add(backing);
      }

      mainGroup.add(accessoryGroup);
    }

    return mainGroup;
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // 1. SETUP SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Subtle dark space background matching the Google Dark/Neon aesthetic
    scene.background = new THREE.Color("#0c0c16");
    scene.fog = new THREE.FogExp2("#0c0c16", 0.12);

    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);
    cameraRef.current = camera;

    // 2. SETUP RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 3. AMBIENT & LIGHTING RIG (Beautiful cinematic rim and directional keys)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Warm Key Light (representing google yellow/amber)
    const keyLight = new THREE.DirectionalLight(0xfff3d6, 1.2);
    keyLight.position.set(5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool Rim Light (representing google blue)
    const rimLight = new THREE.DirectionalLight(0x8ab4f8, 1.5);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Top soft overhead light
    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // Subtle bottom glow
    const bottomGlow = new THREE.DirectionalLight(0x3ddc84, 0.3);
    bottomGlow.position.set(0, -5, 0);
    scene.add(bottomGlow);

    // 4. FLOATING HOLOGRAPHIC STUDIO GRID & PARTICLES
    const gridColor = isWireframe ? new THREE.Color("#4285F4") : new THREE.Color("#2d2d3d");
    const gridHelper = new THREE.GridHelper(10, 20, gridColor, gridColor);
    gridHelper.position.y = -1.35;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Ambient floating sparks/dust particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;     // x
      positions[i + 1] = (Math.random() - 0.5) * 4; // y
      positions[i + 2] = (Math.random() - 0.5) * 6; // z
    }
    
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const sparkColor = getColorHex(selectedColor);
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(sparkColor),
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 5. BUILD MODEL MESH BASED ON PRODUCT DETAILS
    const activeColorHex = getColorHex(selectedColor);
    const modelGroup = buildProceduralModel(scene, productId, activeColorHex);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Position model slightly hovering over grid
    modelGroup.position.set(0, 0, 0);

    // 6. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Auto rotation logic (smooth orbital sweep)
      if (modelGroupRef.current) {
        if (autoRotate && !isDragging.current) {
          modelGroupRef.current.rotation.y += rotationSpeed;
          // Soft hovering bounce
          modelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        }
      }

      // Floating dust rotation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.04;
        particlesRef.current.rotation.x = elapsedTime * 0.02;
      }

      renderer.render(scene, camera);
    };

    setIsLoading(false);
    animate();

    // 7. RESPONSIVE RESIZE OBSERVER
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [productId, selectedColor, category]);

  // Wireframe / blueprint toggle side effect
  useEffect(() => {
    if (!modelGroupRef.current) return;

    modelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.wireframe = isWireframe;
            }
          });
        }
      }
    });

    if (gridHelperRef.current) {
      gridHelperRef.current.visible = isWireframe || activeTab === "blueprint";
    }
  }, [isWireframe, activeTab]);

  // Custom tab change handling
  const handleTabChange = (tab: "shaded" | "wireframe" | "blueprint") => {
    setActiveTab(tab);
    if (tab === "wireframe" || tab === "blueprint") {
      setIsWireframe(true);
    } else {
      setIsWireframe(false);
    }

    if (sceneRef.current) {
      if (tab === "blueprint") {
        sceneRef.current.background = new THREE.Color("#05051a");
        if (gridHelperRef.current) gridHelperRef.current.visible = true;
      } else {
        sceneRef.current.background = new THREE.Color("#0c0c16");
      }
    }
  };

  // Drag-to-rotate interaction handlers (mouse or touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !modelGroupRef.current) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.current.x,
      y: e.clientY - previousMousePosition.current.y
    };

    // Orbit/rotate the object based on pointer move deltas
    modelGroupRef.current.rotation.y += deltaMove.x * 0.01;
    modelGroupRef.current.rotation.x += deltaMove.y * 0.01;

    // Cap vertical tilt to prevent looking completely upside down
    modelGroupRef.current.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, modelGroupRef.current.rotation.x));

    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Zoom controls directly manipulating camera
  const handleZoom = (direction: "in" | "out") => {
    if (!cameraRef.current) return;
    const step = direction === "in" ? -0.4 : 0.4;
    cameraRef.current.position.z = Math.max(2.0, Math.min(8.0, cameraRef.current.position.z + step));
  };

  // Reset rotation and camera coordinates
  const handleReset = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
      modelGroupRef.current.position.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.2, 4.5);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-80 bg-[#0c0c16] rounded-2xl overflow-hidden border border-white/10 select-none flex flex-col justify-between"
      id="3d-viewer-container"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
        style={{ touchAction: "none" }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-[#0c0c16] flex flex-col items-center justify-center space-y-3 font-mono">
          <RefreshCw className="w-8 h-8 text-google-blue animate-spin" />
          <span className="text-xs text-gray-400">Loading Holographic Engine...</span>
        </div>
      )}

      {/* Dynamic Part Hover Info Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none font-mono">
        <div className="bg-black/75 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] space-y-0.5 shadow-xl">
          <div className="text-gray-400 flex items-center gap-1.5 uppercase font-bold">
            <Maximize2 className="w-3 h-3 text-google-yellow" />
            <span>Interactive 3D Stage</span>
          </div>
          <div className="text-white text-xs font-black uppercase truncate max-w-[150px]">
            {productName}
          </div>
        </div>
      </div>

      {/* Right control buttons (Zoom, Rotation speed, Reset) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col space-y-2">
        {/* Reset View */}
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-2 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-xl border border-white/10 backdrop-blur-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => handleZoom("in")}
          title="Zoom In"
          className="p-2 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-xl border border-white/10 backdrop-blur-sm transition-all text-xs font-black font-mono leading-none"
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => handleZoom("out")}
          title="Zoom Out"
          className="p-2 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-xl border border-white/10 backdrop-blur-sm transition-all text-xs font-black font-mono leading-none"
        >
          -
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
          className={`p-2 rounded-xl border backdrop-blur-sm transition-all ${
            autoRotate 
              ? "bg-google-blue/20 border-google-blue/30 text-google-blue hover:bg-google-blue/30" 
              : "bg-black/60 border-white/10 text-gray-300 hover:text-white hover:bg-black/90"
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
        </button>
      </div>

      {/* Drag instruction overlay (fades in slightly on load) */}
      <div className="absolute inset-x-0 bottom-14 z-10 pointer-events-none flex justify-center">
        <span className="bg-black/60 border border-white/5 px-3 py-1 rounded-full text-[9px] font-mono text-gray-400 backdrop-blur-sm tracking-wider uppercase animate-pulse">
          Drag to orbit • Scroll to zoom
        </span>
      </div>

      {/* Render Mode Tabs (Footer of the 3D Stage) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between items-center bg-black/70 border border-white/10 backdrop-blur-md p-1 rounded-xl shadow-lg">
        <div className="flex space-x-1">
          {(["shaded", "wireframe", "blueprint"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "shaded" ? "Solid" : tab === "wireframe" ? "Wireframe" : "Blueprint"}
            </button>
          ))}
        </div>

        {/* Selected Color indicator inside the stage */}
        {selectedColor && (
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            <span 
              className="w-2.5 h-2.5 rounded-full border border-white/15" 
              style={{ backgroundColor: getColorHex(selectedColor) }} 
            />
            <span className="text-[9px] font-mono text-gray-300 uppercase truncate max-w-[80px]">
              {selectedColor}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
