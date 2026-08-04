import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Bot, User, Award, Ticket, HelpCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function GoogleAIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Greetings, **Aaryan Rajawat**! 🕸️ I am G-Web AI, your Google x Spider-Man Multiverse Assistant. Armed with a Tensor Spider-G3 intelligence model, I am here to assist your retail journey and level up your gear coordinates. How can I serve your mission today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation thread
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Handle message transmission
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map frontend messages to match backend structure
      const historyContext = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyContext
        })
      });

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: data.reply || "A sensory coordinate failure occurred. Running troubleshooting diagnostics.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot response failure:", error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: "bot",
        text: "My neural transmission link dropped. Let's fire up standard communications again!",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-configured Quick Action suggestions
  const SUGGESTIONS = [
    { label: "Recommend products 🕷️", text: "What exclusive products are in the Google x Spider-Man catalog?" },
    { label: "Check my Hero Level 🏆", text: "What is my current loyalty level and how many points do I have?" },
    { label: "Active Promo Codes 🎟️", text: "Are there any promo codes or coupons I can apply to my order?" },
    { label: "Suggest a Spider-Man fit sneaker 👟", text: "Can you recommend a stylish streetwear fit with the sneakers?" }
  ];

  // Markdown bullet lists helper rendering
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line;
      let isBullet = false;

      // Handle simple markdown bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        isBullet = true;
        content = line.trim().substring(2);
      } else if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ") || line.trim().startsWith("5. ")) {
        isBullet = true;
        content = line.trim().substring(3);
      }

      // Quick bold replacement (**text**)
      const boldParts = content.split("**");
      const renderedLine = boldParts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-extrabold text-white">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-gray-300 leading-relaxed mb-1">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-gray-300 leading-relaxed mb-2 last:mb-0">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="google-ai-chatbot-container">
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-[#0c0c12]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
            id="google-ai-chatbot-panel"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-google-red/10 via-google-yellow/5 to-google-blue/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-google-blue via-google-red to-google-yellow flex items-center justify-center text-white">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  {/* Status Indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-google-green rounded-full border-2 border-[#0c0c12]"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1">
                    G-Web AI <Sparkles className="w-3.5 h-3.5 text-google-yellow" />
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Tensor-G3 Multiverse Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-google-blue" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs shadow-md ${
                      msg.sender === "user"
                        ? "bg-google-blue text-white rounded-tr-none font-medium"
                        : "bg-white/5 border border-white/5 rounded-tl-none text-gray-200"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : (
                      renderMessageContent(msg.text)
                    )}
                    <span className="block text-[8px] mt-1.5 text-right opacity-50 font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loader */}
              {isLoading && (
                <div className="flex justify-start items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-google-blue" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-400 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-google-red rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-google-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-google-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            {messages.length < 4 && (
              <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0 select-none bg-[#0c0c12]/50">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.text)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 rounded-full transition-all flex items-center space-x-1 hover:border-google-blue/40 shrink-0 cursor-pointer"
                  >
                    <span>{sug.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-white/10 bg-[#0c0c12] flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask G-Web AI Multiverse Assistant..."
                className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-xs text-white border border-white/10 focus:outline-none focus:border-google-blue transition-all placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-google-blue hover:bg-google-blue/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Trigger Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-google-blue via-google-red to-google-yellow rounded-full shadow-lg hover:shadow-google-blue/35 text-white flex items-center justify-center relative cursor-pointer group"
        id="google-ai-chatbot-trigger"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-google-yellow rounded-full border-2 border-[#07070a] animate-ping"></span>
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-google-yellow rounded-full border-2 border-[#07070a]"></span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
