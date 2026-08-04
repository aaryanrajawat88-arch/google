import { useState } from "react";
import { ChevronLeft, Sparkles, Gamepad2, RotateCcw, Box, Ticket, CheckCircle, HelpCircle, AlertCircle } from "lucide-react";
import { QUIZ_QUESTIONS, SPIDER_CHARACTERS } from "../data";
import { SpiderCharacter, Coupon } from "../types";

interface GamificationProps {
  onClose: () => void;
  onClaimCoupon: (coupon: Coupon) => void;
  onAddPoints: (points: number) => void;
  ownedCoupons: string[];
}

export default function Gamification({
  onClose,
  onClaimCoupon,
  onAddPoints,
  ownedCoupons
}: GamificationProps) {
  const [activeGame, setActiveGame] = useState<"menu" | "quiz" | "spinner" | "huntdoc">("menu");

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<SpiderCharacter | null>(null);
  const [quizAnalysis, setQuizAnalysis] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  // Spinner states
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinnerAngle, setSpinnerAngle] = useState(0);
  const [spinnerResult, setSpinnerResult] = useState("");
  const [claimedSpinnerReward, setClaimedSpinnerReward] = useState(false);

  // 1. LUCKY SPINNER WHEEL
  const spinnerSectors = [
    { text: "15% Voucher", rewardCode: "SPIDEYPOINTS15" },
    { text: "+500 Points", points: 500 },
    { text: "Free Delivery", rewardCode: "FREESHIPWEB" },
    { text: "Try Again", retry: true },
    { text: "10% Voucher", rewardCode: "SPIDEYPOINTS15" },
    { text: "+1000 Points", points: 1000 },
  ];

  const handleSpin = () => {
    if (isSpinning || claimedSpinnerReward) return;
    setIsSpinning(true);
    setSpinnerResult("");

    // Random spin angle
    const targetSector = Math.floor(Math.random() * spinnerSectors.length);
    const degreePerSector = 360 / spinnerSectors.length;
    // multiple full spins + target alignment
    const spinToDeg = 1800 + (360 - targetSector * degreePerSector) - degreePerSector / 2;

    setSpinnerAngle(spinToDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const sector = spinnerSectors[targetSector];
      setSpinnerResult(sector.text);

      // Reward deposit logic
      if (sector.points) {
        onAddPoints(sector.points);
      } else if (sector.rewardCode) {
        const coupon: Coupon = {
          code: sector.rewardCode,
          discountType: sector.rewardCode === "FREESHIPWEB" ? "free-shipping" : "percent",
          value: sector.rewardCode === "FREESHIPWEB" ? 0 : 15,
          description: sector.rewardCode === "FREESHIPWEB" ? "Free shipping reward!" : "15% off reward!",
        };
        onClaimCoupon(coupon);
      }
    }, 4000);
  };

  // 2. SPIDER-VERSE CHARACTER PERSONALITY QUIZ
  const handleAnswerSelect = (optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [quizIndex]: optionIndex,
    }));

    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      // Calculate final matches based on point weighting
      handleCalculateQuizResult({ ...quizAnswers, [quizIndex]: optionIndex });
    }
  };

  const handleCalculateQuizResult = async (finalAnswers: Record<number, number>) => {
    setQuizLoading(true);

    const scores = { peter: 0, miles: 0, gwen: 0, miguel: 0 };
    
    // Sum points for each character
    Object.entries(finalAnswers).forEach(([qIdx, optIdx]) => {
      const option = QUIZ_QUESTIONS[Number(qIdx)].options[optIdx];
      scores.peter += option.points.peter;
      scores.miles += option.points.miles;
      scores.gwen += option.points.gwen;
      scores.miguel += option.points.miguel;
    });

    // Find highest scoring spider character
    let winnerId: "peter" | "miles" | "gwen" | "miguel" = "peter";
    let maxVal = -1;
    Object.entries(scores).forEach(([char, val]) => {
      if (val > maxVal) {
        maxVal = val;
        winnerId = char as any;
      }
    });

    const character = SPIDER_CHARACTERS.find((c) => c.id === winnerId) || SPIDER_CHARACTERS[0];
    setQuizResult(character);

    // Call server-side Gemini API to generate custom analysis of their character match!
    try {
      const response = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: character.name,
          scores: scores,
          answers: finalAnswers
        }),
      });
      const data = await response.json();
      if (data.analysis) {
        setQuizAnalysis(data.analysis);
      } else {
        setQuizAnalysis(character.description);
      }
    } catch (e) {
      setQuizAnalysis(character.description);
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizAnalysis("");
    setQuizLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Return back header */}
      <button
        onClick={onClose}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white font-mono tracking-wider mb-8 uppercase cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-spider-red" />
        <span>Return to Account</span>
      </button>

      {activeGame === "menu" && (
        /* MENU INTERFACE DISPLAY */
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              🕷️ Spider Gamification Center
            </h1>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider leading-relaxed">
              Synthesize limited tokens and exclusive portal coupons by completing our interactive challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Quiz launcher */}
            <div
              onClick={() => setActiveGame("quiz")}
              className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-spider-red/30 cursor-pointer hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-spider-red/15 flex items-center justify-center font-bold text-spider-red">
                  ❓
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-spider-red transition-colors">
                  Spider-Verse Personality Quiz
                </h3>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Discover which Spider-Man aligns with your cognitive coordinates. Dynamic server-side AI evaluation included.
                </p>
              </div>
              <span className="text-[10px] text-spider-red font-mono font-bold tracking-widest uppercase">
                Launch Quiz →
              </span>
            </div>

            {/* Spinner Launcher */}
            <div
              onClick={() => setActiveGame("spinner")}
              className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-google-blue/30 cursor-pointer hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-google-blue/15 flex items-center justify-center font-bold text-google-blue">
                  🎡
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-google-blue transition-colors">
                  Lucky Web Spinner Wheel
                </h3>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Spin the lucky web strands once per session to receive loyalty points or checkout voucher percentages.
                </p>
              </div>
              <span className="text-[10px] text-google-blue font-mono font-bold tracking-widest uppercase">
                Launch Spinner →
              </span>
            </div>

            {/* Hidden web hunt launcher */}
            <div
              onClick={() => setActiveGame("huntdoc")}
              className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-google-yellow/30 cursor-pointer hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-google-yellow/15 flex items-center justify-center font-bold text-google-yellow">
                  🕸️
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-google-yellow transition-colors">
                  Hidden Web Hunt
                </h3>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Tiny, interactive spider icons are hidden across the store. Tap them as you browse to earn instant point rewards.
                </p>
              </div>
              <span className="text-[10px] text-google-yellow font-mono font-bold tracking-widest uppercase">
                Browse Rules →
              </span>
            </div>
          </div>
        </div>
      )}

      {activeGame === "quiz" && (
        /* QUIZ CHALLENGE INTERFACE */
        <div className="max-w-2xl mx-auto glass-panel border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Gamepad2 className="w-4 h-4 text-spider-red" />
              <span>Spider-Verse Personality Diagnostic</span>
            </h2>
            <button
              onClick={() => {
                setActiveGame("menu");
                resetQuiz();
              }}
              className="text-xs text-gray-500 hover:text-white font-mono cursor-pointer"
            >
              Exit
            </button>
          </div>

          {!quizResult ? (
            /* ACTIVE QUIZ SCREEN */
            <div className="space-y-6">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                <span>Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>Coordinates: Synced</span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-spider-red transition-all"
                  style={{ width: `${((quizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Current Question */}
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {QUIZ_QUESTIONS[quizIndex].question}
              </h3>

              {/* Options buttons */}
              <div className="space-y-3">
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(oIdx)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-spider-red/40 transition-all text-xs font-semibold text-gray-200 cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* COMPLETE RESULT SCREEN WITH AI EVALUATION */
            <div className="space-y-6 animate-fadeIn text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                <img
                  src={quizResult.image}
                  alt={quizResult.name}
                  className="w-24 h-24 rounded-2xl border border-white/10 object-cover flex-shrink-0 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-spider-red uppercase tracking-widest">
                    Your matched Spider-Hero is:
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                    {quizResult.name}
                  </h3>
                  <div className="text-[11px] text-gray-400 font-mono">
                    {quizResult.alias}
                  </div>
                </div>
              </div>

              {/* AI evaluation text boxes */}
              <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-3 text-xs leading-relaxed text-gray-300">
                <div className="flex items-center space-x-1.5 text-google-blue font-bold font-mono tracking-widest uppercase text-[10px]">
                  <Sparkles className="w-4 h-4 text-google-blue animate-pulse" />
                  <span>AI Cognitive Diagnosis</span>
                </div>
                {quizLoading ? (
                  <div className="py-4 text-center space-y-2">
                    <div className="w-5 h-5 border-2 border-spider-red border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      Formulating neural summary via Gemini...
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed font-sans">{quizAnalysis}</p>
                )}
              </div>

              {/* Recommended Merchandise item */}
              <div className="p-4 bg-google-yellow/5 border border-google-yellow/15 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-left">
                  <div className="text-[9px] font-mono text-google-yellow uppercase tracking-widest mb-0.5">
                    Recommended gear
                  </div>
                  <div className="text-xs font-bold text-white uppercase truncate">
                    Spidey Custom Prototype Drone
                  </div>
                  <p className="text-[10px] text-gray-400">Perfect fit for your creative coordinates.</p>
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Retake Diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeGame === "spinner" && (
        /* LUCKY WHEEL SPINNER WHEEL */
        <div className="max-w-md mx-auto glass-panel border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <RotateCcw className="w-4 h-4 text-google-blue" />
              <span>Lucky Web Spinner Wheel</span>
            </h2>
            <button
              onClick={() => {
                setActiveGame("menu");
                setSpinnerResult("");
                setClaimedSpinnerReward(false);
              }}
              className="text-xs text-gray-500 hover:text-white font-mono cursor-pointer"
            >
              Exit
            </button>
          </div>

          {/* SVG wheel visualizer rotating */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4 select-none">
            {/* Pointer peg */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-spider-red clip-path-polygon z-20 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full mt-[-4px]" />
            </div>

            {/* Main rotatable circle wheel */}
            <div
              className="w-full h-full rounded-full border-[6px] border-[#161622] overflow-hidden shadow-2xl relative transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.1, 1)"
              style={{
                transform: `rotate(${spinnerAngle}deg)`,
              }}
            >
              {/* Spinner wheel face using SVG slices */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 6 colored sectors */}
                <path d="M50,50 L50,0 A50,50 0 0,1 93.3,25 Z" fill="#E62429" opacity="0.9" />
                <path d="M50,50 L93.3,25 A50,50 0 0,1 93.3,75 Z" fill="#4285F4" opacity="0.9" />
                <path d="M50,50 L93.3,75 A50,50 0 0,1 50,100 Z" fill="#EA4335" opacity="0.9" />
                <path d="M50,50 L50,100 A50,50 0 0,1 6.7,75 Z" fill="#FBBC05" opacity="0.9" />
                <path d="M50,50 L6.7,75 A50,50 0 0,1 6.7,25 Z" fill="#34A853" opacity="0.9" />
                <path d="M50,50 L6.7,25 A50,50 0 0,1 50,0 Z" fill="#111827" opacity="0.9" />
              </svg>

              {/* Sectors text tags layered absolute */}
              <div className="absolute inset-0 w-full h-full pointer-events-none text-[8px] font-mono font-bold text-white flex items-center justify-center">
                {spinnerSectors.map((sec, idx) => {
                  const angle = idx * 60 + 30;
                  return (
                    <div
                      key={idx}
                      className="absolute origin-center"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-22px)`,
                      }}
                    >
                      {sec.text}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center spinning triggering pin button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || claimedSpinnerReward}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white hover:bg-gray-100 text-[#111827] font-black text-xs uppercase tracking-tight flex items-center justify-center shadow-xl disabled:opacity-50 cursor-pointer z-10"
            >
              SPIN
            </button>
          </div>

          {/* Result details message */}
          {spinnerResult && (
            <div className="p-4 bg-google-green/5 border border-google-green/15 rounded-2xl w-full text-center space-y-1.5 animate-fadeIn">
              <div className="text-xs font-mono text-google-green flex items-center justify-center space-x-1 uppercase tracking-widest font-bold">
                <CheckCircle className="w-4 h-4 text-google-green" />
                <span>Award Dispensed!</span>
              </div>
              <p className="text-sm font-black text-white uppercase">{spinnerResult}</p>
              <p className="text-[10px] text-gray-500">Credited to your active account variables immediately.</p>
            </div>
          )}
        </div>
      )}

      {activeGame === "huntdoc" && (
        /* HUNT GAMIFICATION DOCUMENTATION RULES */
        <div className="max-w-2xl mx-auto glass-panel border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-google-yellow" />
              <span>Hidden Web Hunt Protocols</span>
            </h2>
            <button
              onClick={() => setActiveGame("menu")}
              className="text-xs text-gray-500 hover:text-white font-mono cursor-pointer"
            >
              Exit
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-300">
            <p>
              As a gold loyalty agent, you have active spider scanner variables in your browsing frame.
            </p>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2.5">
              <div className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1">
                <span>🕷️ HOW TO PLAY:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
                <li>Tiny interactive spider icons appear randomly on different subpages (like Shop grid, Technology playground, or About).</li>
                <li>Tap them to catch them!</li>
                <li>Each caught spider adds <strong className="text-google-yellow">+250 Points</strong> immediately into your account.</li>
                <li>Catching all hidden spiders triggers a secret <strong className="text-google-green">FREE SHIPPING VOUCHER</strong>.</li>
              </ul>
            </div>

            <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">
              Scan state: Active • Keep browsing the store catalog to find them!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
