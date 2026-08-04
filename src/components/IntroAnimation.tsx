import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles } from "lucide-react";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [skipped, setSkipped] = useState(false);
  const [webShot, setWebShot] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);

  useEffect(() => {
    // Check session storage
    if (sessionStorage.getItem("spidey-intro-skipped") === "true") {
      onComplete();
      return;
    }

    // Sequence timer management
    // Scene 1 -> 2 (Entrance) at 0.5s
    const t2 = setTimeout(() => {
      setScene(2);
    }, 500);

    // Scene 2 -> 3 (Web Launch) at 2s
    const t3 = setTimeout(() => {
      setScene(3);
      setWebShot(true);
      setCameraShake(true);
      // turn off shake after 400ms
      setTimeout(() => setCameraShake(false), 400);
    }, 2000);

    // Scene 3 -> 4 (Reveal) at 3.2s
    const t4 = setTimeout(() => {
      setScene(4);
    }, 3200);

    // Intro complete at 4.5s
    const t5 = setTimeout(() => {
      handleComplete();
    }, 4800);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleSkip = () => {
    setSkipped(true);
    sessionStorage.setItem("spidey-intro-skipped", "true");
    onComplete();
  };

  const handleComplete = () => {
    sessionStorage.setItem("spidey-intro-skipped", "true");
    onComplete();
  };

  if (skipped) return null;

  return (
    <div className={`fixed inset-0 bg-[#060608] z-[999999] flex flex-col justify-center items-center overflow-hidden transition-all duration-300 ${cameraShake ? "animate-[bounce_0.2s_infinite]" : ""}`}>
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-semibold text-white tracking-widest uppercase transition-colors pointer-events-auto z-[9999999] cursor-pointer"
      >
        Skip Intro
      </button>

      {/* Background glowing spiderweb lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50%" cy="50%" r="100" stroke="#E62429" strokeWidth="1" fill="none" />
          <circle cx="50%" cy="50%" r="200" stroke="#E62429" strokeWidth="0.8" fill="none" />
          <circle cx="50%" cy="50%" r="350" stroke="#E62429" strokeWidth="0.5" fill="none" />
          <circle cx="50%" cy="50%" r="500" stroke="#E62429" strokeWidth="0.3" fill="none" />
          <line x1="50%" y1="50%" x2="0" y2="0" stroke="#E62429" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="100%" y2="0" stroke="#E62429" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="0" y2="100%" stroke="#E62429" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="100%" y2="100%" stroke="#E62429" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="50%" y2="0" stroke="#E62429" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="50%" y2="100%" stroke="#E62429" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Scene 1: Opening (Soft Ambient glow) */}
        {scene === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <Shield className="w-12 h-12 text-spider-red animate-pulse" />
            <div className="text-sm font-mono tracking-[0.4em] text-gray-400 uppercase">
              Initializing Multiverse Collab...
            </div>
          </motion.div>
        )}

        {/* Scene 2 & 3: Hero Swing Entrance and Web Launch */}
        {(scene === 2 || scene === 3) && (
          <div className="absolute inset-0 w-full h-full">
            {/* Swinger Pendulum Rope and Character */}
            <motion.div
              initial={{ x: "-20%", y: "-10%", rotate: -45 }}
              animate={
                scene === 3
                  ? { x: "120%", y: "40%", rotate: 20 }
                  : { x: "40%", y: "65%", rotate: -5 }
              }
              transition={{
                duration: 2.2,
                ease: [0.25, 1, 0.5, 1], // Custom pendulum-inspired glide
              }}
              className="absolute top-0 left-0 w-32 h-32 flex flex-col items-center origin-top-left"
            >
              {/* Web thread rope */}
              <div className="w-[1.5px] h-[300px] bg-gradient-to-b from-white/10 to-white shadow-[0_0_8px_white]" />
              
              {/* Stylized Spider-Man SVG vector */}
              <div className="relative w-16 h-16 mt-[-10px] transform rotate-45 select-none pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_#E62429]">
                  {/* Suit Body */}
                  <path d="M20,50 Q50,95 80,50 Q50,45 20,50" fill="#E62429" />
                  <path d="M20,50 Q50,20 80,50" fill="#4285F4" />
                  {/* Big Spider Eyes */}
                  <polygon points="35,42 48,45 40,55" fill="black" />
                  <polygon points="37,44 46,46 40,52" fill="white" />
                  <polygon points="65,42 52,45 60,55" fill="black" />
                  <polygon points="63,44 54,46 60,52" fill="white" />
                  {/* Chest Spider emblem */}
                  <path d="M50,48 L50,58 M50,52 L44,50 M50,52 L56,50 M50,55 L42,57 M50,55 L58,57" stroke="black" strokeWidth="2.5" />
                </svg>
                {/* Dynamic Wind Gush Particles */}
                <span className="absolute -left-6 top-1/2 w-4 h-[2px] bg-white/40 blur-[1px] animate-pulse" />
                <span className="absolute -left-4 top-1/3 w-6 h-[2px] bg-white/40 blur-[1px] animate-pulse" />
              </div>
            </motion.div>

            {/* Web Shoot line to center logo on Scene 3 */}
            {webShot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {/* Shooting path from Right swing point to Center Logo */}
                <svg className="absolute inset-0 w-full h-full">
                  <motion.line
                    x1="80%"
                    y1="45%"
                    x2="50%"
                    y2="50%"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="shadow-[0_0_12px_rgba(255,255,255,1)]"
                  />
                </svg>
                {/* Particle burst at Center Logo on impact */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center">
                  <div className="absolute w-20 h-20 border border-white rounded-full animate-ping opacity-60" />
                  <div className="absolute w-12 h-12 border border-spider-red rounded-full animate-ping opacity-80" />
                  <Sparkles className="w-8 h-8 text-white animate-spin" />
                </div>
              </motion.div>
            )}

            {/* Glowing Logo placeholder appearing at the center for a split second */}
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center space-x-3 px-6 py-3 rounded-2xl glass-panel border border-white/15 shadow-[0_0_30px_rgba(230,36,41,0.2)]"
              >
                <div className="w-8 h-8 bg-spider-red rounded-full flex items-center justify-center font-bold text-white text-base shadow-[0_0_10px_rgba(230,36,41,0.5)]">
                  G
                </div>
                <span className="text-white text-lg font-bold tracking-widest">
                  GOOGLE × SPIDER-MAN
                </span>
              </motion.div>
            </div>
          </div>
        )}

        {/* Scene 4: Web Retracting Curtain Reveal */}
        {scene === 4 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col justify-center items-center bg-[#060608]"
          >
            {/* The web split-curtain animation opening outwards */}
            <div className="absolute inset-0 flex pointer-events-none">
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-1/2 h-full bg-[#060608] border-r border-white/10 relative flex items-center justify-end"
              >
                {/* Visual threads pulling left */}
                <div className="absolute right-0 h-full w-[2px] bg-gradient-to-b from-white/10 via-white/50 to-white/10" />
              </motion.div>
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-1/2 h-full bg-[#060608] border-l border-white/10 relative"
              >
                {/* Visual threads pulling right */}
                <div className="absolute left-0 h-full w-[2px] bg-gradient-to-b from-white/10 via-white/50 to-white/10" />
              </motion.div>
            </div>

            {/* Revealed Text Content in the background layer */}
            <div className="text-center z-10 max-w-xl px-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-xs font-mono tracking-[0.5em] text-spider-red uppercase"
              >
                LIMITED MULTIVERSE MERCHANDISE
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none"
              >
                A Brand New Day <br />
                <span className="bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
                  × Google
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-gray-400 font-mono text-sm max-w-sm mx-auto"
              >
                Smart Technology. Heroic Style.
              </motion.p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
