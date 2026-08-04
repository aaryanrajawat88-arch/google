import { useState } from "react";
import { ChevronLeft, BarChart3, ShoppingBag, Users, Layers, Award, Tag } from "lucide-react";
import { Product, Order, UserProfile } from "../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  userProfile: UserProfile;
  onUpdateInventory: (productId: string, newQty: number) => void;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  userProfile,
  onUpdateInventory,
  onClose
}: AdminDashboardProps) {
  const [activeSec, setActiveSec] = useState<"analytics" | "inventory" | "orders">("analytics");

  // Calculations
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalPointsGiven = orders.reduce((acc, o) => acc + o.pointsEarned, 0) + userProfile.points;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Upper Back Actions */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white font-mono tracking-wider uppercase cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-google-yellow" />
          <span>Exit Office</span>
        </button>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-google-yellow/10 border border-google-yellow/20 text-google-yellow text-[10px] font-mono tracking-widest uppercase">
          <span>Google Multiverse Admin Control</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Admin menu items */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          <button
            onClick={() => setActiveSec("analytics")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeSec === "analytics"
                ? "bg-white/10 border-google-yellow text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-google-yellow" />
            <span>Dashboard Stats</span>
          </button>

          <button
            onClick={() => setActiveSec("inventory")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeSec === "inventory"
                ? "bg-white/10 border-google-yellow text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4 text-google-blue" />
            <span>Manage Inventory</span>
          </button>

          <button
            onClick={() => setActiveSec("orders")}
            className={`flex-shrink-0 w-full text-left px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 transition-all ${
              activeSec === "orders"
                ? "bg-white/10 border-google-yellow text-white"
                : "glass-panel border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-spider-red" />
            <span>Transacted Logs</span>
          </button>
        </div>

        {/* Tab display view panel */}
        <div className="lg:col-span-9 p-6 rounded-2xl glass-panel border border-white/8 min-h-[400px]">
          
          {activeSec === "analytics" && (
            /* ANALYTICS STATS HOME */
            <div className="space-y-6">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                📊 Multiverse Sales Diagnostics
              </h2>

              {/* Stats bento cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Multiverse Revenue
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    ${totalSales.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Dispatched Shipments
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {orders.length} Orders
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Loyalty Points Deposited
                  </div>
                  <div className="text-2xl font-black text-white font-mono text-google-yellow">
                    {totalPointsGiven} Points
                  </div>
                </div>
              </div>

              {/* User overview list */}
              <div className="space-y-3 mt-6">
                <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-widest">
                  👤 Active Multiverse Customers
                </h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-8 h-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-white">{userProfile.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{userProfile.email}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white">Tier Level {userProfile.level}</div>
                    <div className="text-[10px] text-google-yellow">{userProfile.points} Points</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSec === "inventory" && (
            /* MANAGE INVENTORY PRODUCT SLIDERS */
            <div className="space-y-6">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                ⚙️ Coordinate Inventory Allocations
              </h2>

              <div className="space-y-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded bg-white/10 object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: {p.id}</div>
                      </div>
                    </div>

                    {/* Inventory Adjusting slider */}
                    <div className="flex items-center space-x-4 min-w-[200px]">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={p.inventory}
                        onChange={(e) => onUpdateInventory(p.id, parseInt(e.target.value))}
                        className="flex-1 accent-google-yellow cursor-pointer h-1 rounded-full bg-white/10"
                      />
                      <span className="w-12 text-right text-xs font-mono font-bold text-white">
                        {p.inventory} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSec === "orders" && (
            /* ALL TRANSACTED LOGS TABLE */
            <div className="space-y-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                📋 Multiverse Dispatched Registers
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  No transacted registers logged inside this terminal yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3"
                    >
                      <div className="font-mono">
                        <div className="font-bold text-white">{o.id}</div>
                        <div className="text-[10px] text-gray-500">{o.date}</div>
                      </div>
                      <div className="text-left sm:text-right font-mono">
                        <div className="font-black text-spider-red">${o.total.toFixed(2)}</div>
                        <div className="text-[10px] text-google-yellow">+{o.pointsEarned} Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
