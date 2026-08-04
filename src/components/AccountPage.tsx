import { useState } from "react";
import { User, ShoppingBag, ShieldCheck, Ticket, Download, Compass, Plus } from "lucide-react";
import { UserProfile, Order } from "../types";

interface AccountPageProps {
  userProfile: UserProfile;
  orders: Order[];
  onOpenGamification: () => void;
}

export default function AccountPage({
  userProfile,
  orders,
  onOpenGamification
}: AccountPageProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "addresses" | "wallpapers">("dashboard");

  // Calculate dynamic level progress percent
  const levelProgress = (userProfile.points / userProfile.nextLevelPoints) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Upper Profile banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-white/8 overflow-hidden mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Glowing background */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-spider-red/5 blur-[100px] pointer-events-none" />

        {/* User identification */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-20 h-20 rounded-full border-2 border-spider-red/40 shadow-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">
              {userProfile.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono tracking-wider">
              ID Coordinate: {userProfile.email}
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-google-yellow mt-1.5">
              <span>MULTIVERSE GOLD AGENT</span>
            </div>
          </div>
        </div>

        {/* Dynamic Loyalty Meter */}
        <div className="w-full md:w-80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold font-mono">Tier Level {userProfile.level}</span>
            <span className="text-white font-mono font-bold">
              {userProfile.points} / {userProfile.nextLevelPoints} Points
            </span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-spider-red via-google-yellow to-google-green rounded-full shadow-[0_0_8px_#E62429]"
              style={{ width: `${Math.min(100, levelProgress)}%` }}
            />
          </div>

          <div className="text-[10px] text-right text-gray-500 font-mono uppercase tracking-widest">
            {userProfile.nextLevelPoints - userProfile.points} points left to level {userProfile.level + 1}
          </div>
        </div>
      </div>

      {/* Launcher banner for the Spidey Gamification Hub */}
      <div
        onClick={onOpenGamification}
        className="p-6 rounded-3xl bg-gradient-to-r from-spider-red/20 via-google-blue/10 to-[#0e0e1a] border border-spider-red/35 flex flex-col sm:flex-row items-center justify-between gap-5 cursor-pointer hover:border-spider-red/50 hover:shadow-[0_0_30px_rgba(230,36,41,0.15)] transition-all duration-300 mb-10 group"
      >
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-12 h-12 bg-spider-red rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-[0_0_12px_rgba(230,36,41,0.4)] animate-[bounce_2s_infinite]">
            🕷️
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-spider-red transition-colors">
              SPIDER-VERSE GAMIFICATION CENTER
            </h3>
            <p className="text-xs text-gray-400 font-mono leading-relaxed uppercase tracking-wider">
              Earn voucher codes, spin the web spinner, find hidden spiders, and take the character quiz.
            </p>
          </div>
        </div>
        <button className="px-5 py-2.5 bg-spider-red text-white text-[10px] font-black tracking-widest uppercase rounded-xl flex items-center space-x-1.5 transition-all group-hover:scale-105 cursor-pointer">
          <Compass className="w-4 h-4 text-white" />
          <span>Launch Hub</span>
        </button>
      </div>

      {/* Main Content Tabs row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar menu */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeTab === "dashboard"
                ? "bg-white/10 border-spider-red text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="w-4 h-4 text-spider-red" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeTab === "orders"
                ? "bg-white/10 border-spider-red text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-google-blue" />
            <span>Active Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeTab === "addresses"
                ? "bg-white/10 border-spider-red text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4 text-google-yellow" />
            <span>Saved Coordinates</span>
          </button>

          <button
            onClick={() => setActiveTab("wallpapers")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeTab === "wallpapers"
                ? "bg-white/10 border-spider-red text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket className="w-4 h-4 text-google-green" />
            <span>Wallpapers Download</span>
          </button>
        </div>

        {/* Tab display view */}
        <div className="lg:col-span-9 p-6 rounded-2xl glass-panel border border-white/8 min-h-[300px]">
          
          {activeTab === "dashboard" && (
            /* Tab 1: Dashboard */
            <div className="space-y-6">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                🏠 Agent Control Dashboard
              </h2>

              {/* Coupons list */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  Active Vouchers In Wallet
                </div>
                {userProfile.ownedCoupons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userProfile.claimableCoupons
                      .filter((c) => userProfile.ownedCoupons.includes(c.code))
                      .map((c) => (
                        <div
                          key={c.code}
                          className="p-4 rounded-xl bg-google-green/5 border border-google-green/15 flex items-start space-x-3"
                        >
                          <Ticket className="w-5 h-5 text-google-green flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-white text-xs font-mono">{c.code}</div>
                            <p className="text-[11px] text-gray-400 mt-0.5">{c.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 font-mono">No active vouchers yet. Enter the Gamification hub to claim!</div>
                )}
              </div>

              {/* Security info */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start space-x-3.5">
                <ShieldCheck className="w-5 h-5 text-google-blue flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white uppercase tracking-wider mb-0.5">Secure Account</div>
                  <div className="text-gray-400 leading-normal">
                    This browser terminal is authenticated. Point balances and active order history are synced directly to our secure Cloud Run coordinates.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            /* Tab 2: Orders history */
            <div className="space-y-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                📜 Active Order Records
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 text-gray-700 mx-auto animate-pulse" />
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">No orders found</div>
                  <p className="text-[11px] text-gray-600 max-w-xs mx-auto">Place a secure multiverse checkout to log records.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-white/5 gap-2 font-mono">
                        <div>
                          <span className="text-gray-400 uppercase font-bold">Record ID:</span>{" "}
                          <span className="text-white font-bold">{order.id}</span>
                        </div>
                        <div className="text-gray-500">{order.date}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">
                              {item.productName} (x{item.quantity})
                            </span>
                            <span className="text-white font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 font-mono">
                        <div className="text-google-yellow font-bold uppercase">
                          +{order.pointsEarned} Web Points Added
                        </div>
                        <div className="text-white font-extrabold text-sm">
                          Total: <span className="text-spider-red">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            /* Tab 3: Addresses coordinates list */
            <div className="space-y-5">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                📍 Saved Portal Coordinates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userProfile.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 relative"
                  >
                    <div className="text-[10px] font-mono text-google-blue uppercase tracking-widest">
                      {addr.label}
                    </div>
                    <div className="text-xs font-bold text-white">{addr.name}</div>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                      {addr.street} <br />
                      {addr.city}, {addr.state} {addr.zip} <br />
                      {addr.country}
                    </p>
                  </div>
                ))}
                <div className="p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all min-h-[140px]">
                  <Plus className="w-5 h-5 text-gray-500" />
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Add coordinates
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallpapers" && (
            /* Tab 4: Wallpapers */
            <div className="space-y-5">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                🎨 Premium Digital Wallpapers
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-mono uppercase tracking-wider">
                Download exclusive cinematic wallpapers unlocked via your Multiverse loyalty points tier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userProfile.unlockedWallpapers.map((wp, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden aspect-video border border-white/5 group shadow-lg"
                  >
                    <img
                      src={wp}
                      alt={`Wallpaper ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <a
                        href={wp}
                        download={`spidey-wallpaper-${idx + 1}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
                        title="Download Wallpaper"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
