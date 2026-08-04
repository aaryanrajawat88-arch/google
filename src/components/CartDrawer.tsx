import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Ticket, Gift, Sparkles, ShoppingBag } from "lucide-react";
import { CartItem, Coupon } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onApplyCoupon: (code: string) => void;
  activeCoupon: Coupon | null;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  activeCoupon,
  onCheckout
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [giftOption, setGiftOption] = useState(false);
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  // Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Calculate Points
  const projectedPoints = cartItems.reduce((acc, item) => {
    return acc + item.product.pointsValue * item.quantity;
  }, 0);

  // Apply Coupon Discount
  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === "percent") {
      discount = subtotal * (activeCoupon.value / 100);
    } else if (activeCoupon.discountType === "fixed") {
      discount = activeCoupon.value;
    }
  }

  // Gift Option cost
  const giftCost = giftOption ? 4.99 : 0;

  // Shipping Calculation
  const isFreeShipping = activeCoupon?.discountType === "free-shipping" || subtotal > 150;
  const shippingCost = cartItems.length === 0 ? 0 : isFreeShipping ? 0 : 9.99;

  // Total
  const total = Math.max(0, subtotal - discount + giftCost + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    // Simulate simple checks
    if (couponCode.toUpperCase() === "SPIDEYPOINTS15" || couponCode.toUpperCase() === "FREESHIPWEB") {
      onApplyCoupon(couponCode.toUpperCase());
      setCouponError("");
    } else {
      setCouponError("Invalid multiverse frequency.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end select-none">
      {/* Dark backdrop overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Cart Container Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#09090f] border-l border-white/8 flex flex-col justify-between shadow-2xl z-10 animate-[slideLeft_0.3s_ease-out]">
        
        {/* Header section */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-spider-red" />
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Multiverse Cart ({cartItems.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content list body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
              <ShoppingBag className="w-12 h-12 text-gray-700 animate-bounce" />
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Your Web is Empty
              </div>
              <p className="text-xs text-gray-500 max-w-xs font-mono">
                Sling some exclusive collaborative products here to checkout.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl glass-panel border border-white/5 flex space-x-3.5 hover:border-white/10 transition-colors"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg bg-white/5 object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    {/* Description details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-white truncate pr-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-500 hover:text-spider-red p-0.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Selected Variants display */}
                        <div className="flex flex-wrap gap-x-2 text-[9px] text-gray-400 font-mono mt-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span key={k}>
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity adjusting + Price row */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center space-x-2 bg-white/5 border border-white/5 rounded-lg px-1 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-white px-1 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-white">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer calculation section */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-white/5 bg-[#07070a] space-y-4">
            
            {/* Projected Points Loyalty tag */}
            <div className="p-3 bg-google-yellow/5 border border-google-yellow/10 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-google-yellow">
                <Sparkles className="w-4 h-4 text-google-yellow" />
                <span className="font-bold">Multiverse Points</span>
              </div>
              <span className="font-mono font-black text-white">+{projectedPoints} earned</span>
            </div>

            {/* Gift wrap option toggle */}
            <label className="flex items-center justify-between p-1 cursor-pointer">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Gift className="w-4 h-4 text-google-blue" />
                <span className="font-semibold">Add Premium Web Gift Wrap</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-500 font-mono">+$4.99</span>
                <input
                  type="checkbox"
                  checked={giftOption}
                  onChange={(e) => setGiftOption(e.target.checked)}
                  className="rounded bg-white/5 border-white/10 text-spider-red focus:ring-spider-red focus:ring-0"
                />
              </div>
            </label>

            {/* Promo Voucher input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. SPIDEYPOINTS15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!activeCoupon}
                  className="flex-1 bg-white/5 text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-spider-red disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!!activeCoupon}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                </button>
              </div>
              {couponError && <p className="text-[10px] text-spider-red font-mono pl-1">{couponError}</p>}
              {activeCoupon && (
                <div className="flex items-center justify-between p-1.5 bg-google-green/5 border border-google-green/10 rounded-lg text-[10px] font-mono text-google-green">
                  <span>Voucher [{activeCoupon.code}] Active!</span>
                  <span>{activeCoupon.description}</span>
                </div>
              )}
            </form>

            {/* Pricing Summary */}
            <div className="space-y-1.5 text-xs border-t border-white/5 pt-3.5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-google-green">
                  <span>Applied Discount</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              {giftOption && (
                <div className="flex justify-between text-gray-400">
                  <span>Gift Wrapping</span>
                  <span className="font-mono">${giftCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fee</span>
                <span className="font-mono">
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/5">
                <span>Total Amount</span>
                <span className="font-mono text-spider-red">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Trigger */}
            <button
              onClick={onCheckout}
              className="w-full mt-2 py-4 bg-spider-red hover:bg-spider-red/90 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(230,36,41,0.3)] hover:shadow-[0_0_25px_rgba(230,36,41,0.55)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Secure Multiverse Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
