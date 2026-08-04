import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Shield, Zap, Check, Loader2, Mail, User } from "lucide-react";

export default function LeadGenPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states - simplified to only Full Name and Email Address
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Trigger trackers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check local storage to ensure the popup is not displayed if already dismissed or submitted
    const isDismissed = localStorage.getItem("lead-popup-dismissed");
    const isSuccess = localStorage.getItem("lead-popup-submitted");

    if (isDismissed || isSuccess) {
      return;
    }

    // Trigger after 9 seconds (within the 8-12 seconds window)
    timerRef.current = setTimeout(() => {
      triggerPopup();
    }, 9000);

    // Trigger on reaching 45% scroll depth (within the 40-50% window)
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const scrollPercent = (scrollTop / docHeight) * 100;
        if (scrollPercent >= 45) {
          triggerPopup();
        }
      }
    };

    scrollListenerRef.current = handleScroll;
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (scrollListenerRef.current) window.removeEventListener("scroll", scrollListenerRef.current);
    };
  }, []);

  const triggerPopup = () => {
    setIsVisible(true);
    // Cleanup listeners so we don't trigger repeatedly
    if (timerRef.current) clearTimeout(timerRef.current);
    if (scrollListenerRef.current) {
      window.removeEventListener("scroll", scrollListenerRef.current);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("lead-popup-dismissed", "true");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate response transition with slight latency
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      localStorage.setItem("lead-popup-submitted", "true");
    }, 1500);
  };

  // Light particle array for custom interactive confetti
  const confettiParticles = Array.from({ length: 45 }).map((_, i) => {
    const colors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
    return {
      id: i,
      color: colors[i % colors.length],
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.75) * 220,
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360,
    };
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          id="lead-gen-popup-overlay"
        >
          {/* Subtle blurred background dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-[#06060c]/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Popup Card container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#0d0d15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-labelledby="popup-title"
            aria-describedby="popup-desc"
            id="lead-gen-popup-card"
          >
            {/* Top Google Branding Strip */}
            <div className="h-1.5 w-full flex shrink-0">
              <div className="h-full w-1/4 bg-google-blue" />
              <div className="h-full w-1/4 bg-google-red" />
              <div className="h-full w-1/4 bg-google-yellow" />
              <div className="h-full w-1/4 bg-google-green" />
            </div>

            {/* Micro spider-verse web hanging thread */}
            <div className="absolute top-1.5 left-10 pointer-events-none w-10 h-16 origin-top" id="animated-web-line">
              <svg width="2" height="40" className="stroke-white/15 stroke-[1.5] animate-pulse">
                <line x1="1" y1="0" x2="1" y2="40" strokeDasharray="2,2" />
              </svg>
              <div className="w-2.5 h-2.5 rounded-full bg-google-blue/40 border border-white/30 absolute -bottom-1 -left-0.5 animate-bounce" />
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all z-10 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable interior details */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Engaging Heading & Subtitle */}
                    <div className="text-center mb-6 pt-2">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-google-blue/10 border border-google-blue/20 text-google-blue text-[10px] font-mono tracking-widest uppercase mb-3">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-google-yellow" />
                        <span>Intelligence Network</span>
                      </div>
                      
                      <h2
                        id="popup-title"
                        className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none mb-3"
                      >
                        🎯 Wait! Before You <span className="text-google-red">Swing Away...</span>
                      </h2>
                      
                      <p
                        id="popup-desc"
                        className="text-xs text-gray-300 font-medium leading-relaxed max-w-sm mx-auto"
                      >
                        Stay up to date with our latest updates, AI innovations, product launches, exclusive insights, and special announcements. Join our community and never miss what's next.
                      </p>

                      {/* Playful Web Humor Accent */}
                      <div className="mt-4 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 font-mono italic max-w-xs mx-auto leading-relaxed">
                        "Every hero stays one step ahead. Be the first to discover what's coming next!" 🕸️
                      </div>
                    </div>

                    {/* Inputs form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name input */}
                      <div>
                        <label htmlFor="full-name" className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                          Full Name <span className="text-google-red">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-500" />
                          </span>
                          <input
                            type="text"
                            id="full-name"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                            }}
                            placeholder="Aaryan Rajawat"
                            className={`w-full bg-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white border transition-all focus:outline-none focus:bg-white/10 ${
                              errors.fullName ? "border-google-red/60 focus:border-google-red" : "border-white/10 focus:border-google-blue focus:shadow-[0_0_10px_rgba(66,133,244,0.15)]"
                            }`}
                          />
                        </div>
                        {errors.fullName && <p className="text-[10px] text-google-red mt-1 font-mono">{errors.fullName}</p>}
                      </div>

                      {/* Email input */}
                      <div>
                        <label htmlFor="email" className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                          Email Address <span className="text-google-red">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-500" />
                          </span>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                            }}
                            placeholder="aaryan@web-collab.com"
                            className={`w-full bg-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white border transition-all focus:outline-none focus:bg-white/10 ${
                              errors.email ? "border-google-red/60 focus:border-google-red" : "border-white/10 focus:border-google-blue focus:shadow-[0_0_10px_rgba(66,133,244,0.15)]"
                            }`}
                          />
                        </div>
                        {errors.email && <p className="text-[10px] text-google-red mt-1 font-mono">{errors.email}</p>}
                      </div>

                      {/* CTA Trigger */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="relative w-full overflow-hidden mt-6 px-6 py-3 bg-gradient-to-r from-google-blue via-[#4d8bf4] to-google-green text-white font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_20px_rgba(66,133,244,0.3)] hover:shadow-[0_4px_25px_rgba(66,133,244,0.45)] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Synchronizing Signal...</span>
                          </>
                        ) : (
                          <>
                            <span>🚀 Get More Updates</span>
                          </>
                        )}
                        {/* Interactive shimmer */}
                        <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-shimmer pointer-events-none" style={{ animationDuration: "1.5s" }} />
                      </button>

                      <p className="text-[10px] text-gray-400 text-center font-mono leading-normal mt-2">
                        No spam. Just valuable updates, exclusive news, and helpful insights.
                      </p>
                    </form>

                    {/* Trust indicators */}
                    <div className="border-t border-white/5 mt-6 pt-5 grid grid-cols-2 gap-3">
                      <div className="flex items-start space-x-2 text-[10px] text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-google-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="w-2.5 h-2.5 text-google-blue" />
                        </div>
                        <span className="leading-tight">📩 Exclusive updates and announcements</span>
                      </div>

                      <div className="flex items-start space-x-2 text-[10px] text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-google-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="w-2.5 h-2.5 text-google-green" />
                        </div>
                        <span className="leading-tight">🔒 Your information is secure</span>
                      </div>

                      <div className="flex items-start space-x-2 text-[10px] text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-google-yellow/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-2.5 h-2.5 text-google-yellow fill-google-yellow/10" />
                        </div>
                        <span className="leading-tight">⚡ Unsubscribe anytime</span>
                      </div>

                      <div className="flex items-start space-x-2 text-[10px] text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-google-red/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-google-red" />
                        </div>
                        <span className="leading-tight">🚀 Be first to know about features</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Confetti and Success message */
                  <motion.div
                    key="success-container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="text-center py-8 px-2 relative overflow-hidden"
                  >
                    {/* Animated Confetti Particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {confettiParticles.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ x: 0, y: 50, opacity: 1, scale: 0 }}
                          animate={{
                            x: p.x,
                            y: p.y,
                            opacity: [1, 1, 0],
                            scale: p.scale,
                            rotate: p.rotation,
                          }}
                          transition={{
                            duration: 2.0,
                            ease: "easeOut",
                          }}
                          className="absolute left-1/2 top-1/3 w-2 h-2 rounded-sm"
                          style={{ backgroundColor: p.color }}
                        />
                      ))}
                    </div>

                    {/* Circular Check */}
                    <div className="mx-auto w-14 h-14 rounded-full bg-google-green/15 border-2 border-google-green flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(52,168,83,0.3)] animate-pulse">
                      <Check className="w-7 h-7 text-google-green stroke-[3]" />
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                      🎉 You're all set!
                    </h3>

                    <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                      Thanks for subscribing, <strong className="text-white font-extrabold">{fullName || "Hero"}</strong>. You'll now receive our latest updates, exclusive announcements, and exciting news before everyone else.
                    </p>

                    <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 font-mono inline-block mb-6">
                      Coordinate: <span className="text-google-blue font-bold">{email}</span>
                    </div>

                    <div>
                      <button
                        onClick={handleDismiss}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] text-white font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Back to Store
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
