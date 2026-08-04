import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Cpu, Power, Wifi, ShieldAlert } from "lucide-react";

export default function TechnologyPlayground() {
  const [messages, setMessages] = useState<{ sender: "user" | "robot"; text: string }[]>([
    { sender: "robot", text: "beep-boop! Google AI Spider Robot Prototype initialized. System diagnostics: green. Ready for your vocal parameters or coordinate sweeps!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState({
    battery: 100,
    temp: 34,
    altitude: 0,
    speed: 0,
    camState: "Standby"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate telemetry fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        battery: Math.max(12, prev.battery - (Math.random() > 0.8 ? 1 : 0)),
        temp: Math.min(42, Math.max(30, prev.temp + (Math.random() > 0.5 ? 1 : -1))),
        altitude: Math.min(250, Math.max(0, prev.altitude + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 5 : -5) : 0))),
        speed: Math.random() > 0.6 ? Math.floor(Math.random() * 8) : 0,
        camState: Math.random() > 0.85 ? "Scanning Grid" : prev.camState
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    // Call server-side Gemini robot route
    try {
      const response = await fetch("/api/gemini/robot-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { sender: "robot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "robot", text: "beep-boop. Cognitive connection frequency dropped. Retry coordinate sweep." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "robot", text: "boop-beep. Multiverse signal error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Upper header */}
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-google-blue/10 border border-google-blue/20 text-google-blue text-[10px] font-mono tracking-widest uppercase">
          <Cpu className="w-3.5 h-3.5 text-google-blue animate-spin" />
          <span>Active Prototyping Sandbox</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          AI Spider Robot Interface
        </h1>
        <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
          Establish diagnostic server bridges to interact in real-time with the Tensor G3 arachnid-assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Metrics & Live diagnostic render */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Main Visual Display Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/8 relative overflow-hidden flex flex-col justify-between aspect-square">
            
            {/* Robot prototype generated asset background */}
            <img
              src="/src/assets/images/spider_robot_companion_1784213791365.jpg"
              alt="Spider assistant prototype"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen pointer-events-none"
              referrerPolicy="no-referrer"
            />
            
            {/* Diagnostics headers */}
            <div className="flex items-center justify-between text-xs z-10 font-mono">
              <div className="flex items-center space-x-1.5 text-google-green">
                <span className="w-2 h-2 bg-google-green rounded-full animate-ping" />
                <span className="font-bold">SYSTEMS STATUS: ALIVE</span>
              </div>
              <span className="text-gray-400">CHASSIS: SPID-R3</span>
            </div>

            {/* Simulated target overlay overlay scopes */}
            <div className="absolute inset-x-0 top-1/3 bottom-1/3 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-20 h-20 border border-dashed border-spider-red/40 rounded-full flex items-center justify-center animate-spin" />
              <div className="text-[10px] text-spider-red/80 font-mono uppercase tracking-widest mt-2">
                Scanning target: Active
              </div>
            </div>

            {/* Diagnostic meter metrics footer */}
            <div className="grid grid-cols-3 gap-3 z-10 text-center font-mono">
              <div className="p-2 rounded-lg bg-black/80 border border-white/5 space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Power Cell</div>
                <div className="text-xs font-bold text-white">{telemetry.battery}%</div>
              </div>
              <div className="p-2 rounded-lg bg-black/80 border border-white/5 space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Temperature</div>
                <div className="text-xs font-bold text-white">{telemetry.temp}°C</div>
              </div>
              <div className="p-2 rounded-lg bg-black/80 border border-white/5 space-y-0.5">
                <div className="text-[8px] text-gray-500 uppercase">Scan Coordinate</div>
                <div className="text-xs font-bold text-white truncate text-google-blue">
                  {telemetry.altitude}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Terminal Sandbox chat terminal */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl glass-panel border border-white/8 overflow-hidden min-h-[450px]">
          
          {/* Console top header */}
          <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-white">
              <Terminal className="w-4 h-4 text-spider-red" />
              <span className="font-bold uppercase tracking-wider">Arachnid AI Console</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400">
              <span className="flex items-center space-x-1">
                <Power className="w-3.5 h-3.5 text-google-green" />
                <span>ON</span>
              </span>
              <span className="flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 text-google-blue" />
                <span>Wi-Fi 7</span>
              </span>
            </div>
          </div>

          {/* Messages list body area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs max-h-[350px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col space-y-1 ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                  {m.sender === "user" ? "USER COORDS" : "ROBOT ASSISTANT"}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-md ${
                    m.sender === "user"
                      ? "bg-google-blue/15 text-white border border-google-blue/20"
                      : "bg-white/5 text-gray-300 border border-white/5"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col space-y-1 items-start animate-pulse">
                <span className="text-[9px] text-gray-500 uppercase font-bold">ROBOT ASSISTANT</span>
                <div className="p-3 rounded-2xl bg-white/5 text-gray-500 font-mono">
                  Synthesizing vocal response parameters...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input console at bottom */}
          <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type assistant query... (e.g. Scan coordinates, climb wall, etc.)"
              className="flex-1 bg-white/5 text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-spider-red font-mono disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-spider-red text-white hover:bg-spider-red/90 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
