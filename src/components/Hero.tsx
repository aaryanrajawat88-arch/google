import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Gamepad2, Info } from "lucide-react";

interface HeroProps {
  onNavigate: (view: string) => void;
  onOpenQuiz: () => void;
}

export default function Hero({ onNavigate, onOpenQuiz }: HeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);
  const [flickers, setFlickers] = useState<boolean[]>(Array(12).fill(false));
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize background stars
  useEffect(() => {
    const starCount = 45;
    const initialStars = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(initialStars);

    // Dynamic looping flicker for building lights (every 2-3 seconds)
    const interval = setInterval(() => {
      setFlickers((prev) =>
        prev.map(() => Math.random() > 0.7)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Parallax tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x, y });
  };

  // Safe reset when mouse leaves
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen flex items-center justify-center bg-[#07070a] overflow-hidden pt-16 select-none"
    >
      {/* 1. Deep Space Layer (Far Back) */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -4}px) scale(1.05)`,
        }}
      >
        {/* Starry night sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-[#090911] to-[#07070c]" />
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white shadow-[0_0_4px_white]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Cinematic Red Nebulous Glow */}
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-spider-red/5 blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-google-blue/5 blur-[120px] mix-blend-screen" />
      </div>

      {/* 2. Mid Skyline Layer (Middle Distance) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none transition-transform duration-500 ease-out opacity-40"
        style={{
          transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -10}px) scale(1.1)`,
        }}
      >
        {/* Overlapping mid-ground vector buildings */}
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full fill-[#050508]">
          <rect x="100" y="80" width="120" height="240" />
          <rect x="290" y="140" width="100" height="180" />
          <rect x="450" y="50" width="140" height="270" />
          <rect x="670" y="110" width="130" height="210" />
          <rect x="880" y="70" width="150" height="250" />
          <rect x="1100" y="130" width="110" height="190" />
        </svg>
      </div>

      {/* 3. Foreground Skyline Layer with Dynamic Lights */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[38%] pointer-events-none transition-transform duration-500 ease-out z-10"
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -18}px) scale(1.15)`,
        }}
      >
        {/* Fore buildings */}
        <svg viewBox="0 0 1440 280" className="absolute bottom-0 w-full h-full fill-[#0c0c14] drop-shadow-[0_-12px_24px_rgba(0,0,0,0.8)]">
          {/* Building 1 */}
          <rect x="0" y="60" width="160" height="220" />
          {/* Building 2 with spire */}
          <polygon points="260,20 280,20 270,0" />
          <rect x="220" y="20" width="100" height="260" />
          {/* Building 3 */}
          <rect x="380" y="90" width="220" height="190" />
          {/* Building 4 (Oscorp spire-like) */}
          <rect x="680" y="40" width="140" height="240" />
          <polygon points="740,40 760,40 750,-20" />
          {/* Building 5 */}
          <rect x="900" y="110" width="180" height="170" />
          {/* Building 6 */}
          <rect x="1160" y="50" width="200" height="230" />
        </svg>

        {/* Dynamic Lighted Windows Overlay (Using fixed pixel offsets overlaid on the SVG skyline) */}
        <div className="absolute inset-0 w-full h-full">
          {/* Windows on Spire Building */}
          <div className="absolute bottom-[20%] left-[23.5%] grid grid-cols-2 gap-2 opacity-80">
            {flickers.slice(0, 4).map((f, i) => (
              <div
                key={`win-b2-${i}`}
                className={`w-1.5 h-2 rounded-sm transition-all duration-500 ${
                  f ? "bg-google-yellow shadow-[0_0_8px_#FBBC05]" : "bg-[#181824]"
                }`}
              />
            ))}
          </div>

          {/* Windows on Tall Spire Building (Oscorp-like) */}
          <div className="absolute bottom-[18%] left-[54.5%] grid grid-cols-3 gap-2 opacity-80">
            {flickers.slice(4, 10).map((f, i) => (
              <div
                key={`win-b4-${i}`}
                className={`w-1.5 h-2 rounded-sm transition-all duration-300 ${
                  f ? "bg-spider-red shadow-[0_0_8px_#E62429]" : "bg-[#181824]"
                }`}
              />
            ))}
          </div>

          {/* Windows on Building 6 */}
          <div className="absolute bottom-[30%] left-[88%] grid grid-cols-4 gap-1.5 opacity-90">
            {flickers.slice(8, 12).map((f, i) => (
              <div
                key={`win-b6-${i}`}
                className={`w-1.5 h-1.5 rounded-sm transition-all duration-700 ${
                  f ? "bg-google-blue shadow-[0_0_6px_#4285F4]" : "bg-[#181824]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Atmospheric Fog & Ambient Particles (Overlay) */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#07070a] via-[#07070a]/80 to-transparent pointer-events-none z-20" />
      
      {/* 5. Center Call-to-Action Content */}
      <div className="relative max-w-4xl mx-auto px-4 text-center z-30 flex flex-col items-center">
        {/* Limited tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-google-blue/10 border border-google-blue/20 text-google-blue text-[10px] font-mono tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(66,133,244,0.15)]">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-google-yellow" />
          <span>Multiverse Capsule Launch</span>
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
          Spider-Man: <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-spider-red via-google-red to-google-yellow bg-clip-text text-transparent">
            Brand New Day
          </span>{" "}
          <span className="text-white">× </span>
          <span className="inline-block tracking-tight">
            <span className="text-google-blue">G</span>
            <span className="text-google-red">o</span>
            <span className="text-google-yellow">o</span>
            <span className="text-google-blue">g</span>
            <span className="text-google-green">l</span>
            <span className="text-google-red">e</span>
          </span>
        </h1>

        {/* Supporting description */}
        <p className="text-gray-400 font-mono text-xs sm:text-sm max-w-xl mb-10 leading-relaxed uppercase tracking-wider">
          Smart Technology. Heroic Style. Discover an exclusive limited-edition ecosystem of wearable AI, smart garments, and accessories engineered for the spectacular.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {/* Shop collection */}
          <button
            onClick={() => onNavigate("shop")}
            className="w-full sm:w-auto px-8 py-3.5 bg-google-blue hover:bg-google-blue/90 text-white font-extrabold text-xs tracking-widest uppercase rounded-full shadow-[0_0_24px_rgba(66,133,244,0.4)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          {/* Interactive Spider-Verse quiz */}
          <button
            onClick={onOpenQuiz}
            className="w-full sm:w-auto px-8 py-3.5 glass-panel hover:bg-white/10 hover:border-google-green/40 text-white font-bold text-xs tracking-widest uppercase rounded-full transition-all border border-white/15 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-google-yellow" />
            <span>Spider-Verse Quiz</span>
          </button>
        </div>

        {/* Scroll helper */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-60">
          <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
            Scroll to browse
          </span>
          <div className="w-[1.5px] h-8 bg-gradient-to-b from-white/30 to-transparent mt-2 animate-[bounce_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}
