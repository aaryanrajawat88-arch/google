import { useState } from "react";
import { CheckCircle, ShieldCheck, CreditCard, Lock, Sparkles, MapPin } from "lucide-react";
import { CartItem, Coupon, UserProfile } from "../types";

interface CheckoutPageProps {
  cartItems: CartItem[];
  activeCoupon: Coupon | null;
  userProfile: UserProfile;
  onPlaceOrder: (orderTotal: number, pointsEarned: number) => void;
  onBackToCart: () => void;
}

export default function CheckoutPage({
  cartItems,
  activeCoupon,
  userProfile,
  onPlaceOrder,
  onBackToCart
}: CheckoutPageProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Shipping & Delivery, 2: Payment Details
  const [addressId, setAddressId] = useState(userProfile.savedAddresses[0]?.id || "");
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [isSuccess, setIsSuccess] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState(userProfile.name);
  const [street, setStreet] = useState(userProfile.savedAddresses[0]?.street || "");
  const [city, setCity] = useState(userProfile.savedAddresses[0]?.city || "");
  const [state, setState] = useState(userProfile.savedAddresses[0]?.state || "");
  const [zip, setZip] = useState(userProfile.savedAddresses[0]?.zip || "");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleUseSavedAddress = (id: string) => {
    setAddressId(id);
    const addr = userProfile.savedAddresses.find((a) => a.id === id);
    if (addr) {
      setFullName(addr.name);
      setStreet(addr.street);
      setCity(addr.city);
      setState(addr.state);
      setZip(addr.zip);
    }
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === "percent") {
      discount = subtotal * (activeCoupon.value / 100);
    } else if (activeCoupon.discountType === "fixed") {
      discount = activeCoupon.value;
    }
  }

  const projectedPoints = cartItems.reduce((acc, item) => {
    return acc + item.product.pointsValue * item.quantity;
  }, 0);

  const isFreeShipping = activeCoupon?.discountType === "free-shipping" || subtotal > 150;
  const shippingCost = isFreeShipping ? 0 : 9.99;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const handleCompleteOrder = () => {
    setIsSuccess(true);
    // complete the transaction in parent state after 2.5s success visual
    setTimeout(() => {
      onPlaceOrder(total, projectedPoints);
    }, 2800);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
        
        {/* Giant floating web background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="200" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="50%" cy="50%" r="350" stroke="white" strokeWidth="0.5" fill="none" />
            <line x1="50%" y1="50%" x2="0" y2="0" stroke="white" strokeWidth="0.5" />
            <line x1="50%" y1="50%" x2="100%" y2="0" stroke="white" strokeWidth="0.5" />
            <line x1="50%" y1="50%" x2="0" y2="100%" stroke="white" strokeWidth="0.5" />
            <line x1="50%" y1="50%" x2="100%" y2="100%" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Success Modal Container */}
        <div className="relative text-center max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-[0_0_50px_rgba(230,36,41,0.25)] animate-zoomIn z-10">
          <div className="w-16 h-16 bg-google-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(52,168,83,0.4)]">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            WEB DISPATCH TRANSMITTED!
          </h2>
          <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed uppercase tracking-wider">
            Your limited gear order has been logged into standard database coordinates. Your delivery capsule is initializing.
          </p>

          {/* Points earned callout */}
          <div className="p-4 bg-google-yellow/5 border border-google-yellow/15 rounded-2xl flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1 text-google-yellow text-xs font-bold font-mono tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-google-yellow animate-spin" />
              <span>LOYALTY DEPOSIT</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              +{projectedPoints} POINTS
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
              Depositing to: {userProfile.email}
            </span>
          </div>

          {/* Trust lines */}
          <div className="flex items-center justify-center space-x-1.5 mt-6 text-[10px] text-gray-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-google-blue" />
            <span>Encrypted by Google Multiverse Guard</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Back button */}
      <button
        onClick={onBackToCart}
        className="text-xs text-gray-400 hover:text-white font-mono tracking-wider mb-8 uppercase cursor-pointer"
      >
        ← Modify Cart Items
      </button>

      {/* Progress indicators bar */}
      <div className="max-w-3xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-spider-red text-white flex items-center justify-center text-xs font-bold font-mono">
            1
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Portal Delivery
          </span>
        </div>
        <div className="flex-1 h-[1px] bg-white/10 mx-4" />
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${step === 2 ? "bg-spider-red text-white" : "bg-white/5 border border-white/10 text-gray-400"}`}>
            2
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? "text-white" : "text-gray-400"}`}>
            Secure Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Form inputs fields */}
        <div className="lg:col-span-7 space-y-6">
          {step === 1 ? (
            /* STEP 1: Delivery Coordinates */
            <div className="p-6 rounded-2xl glass-panel border border-white/8 space-y-5">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                📦 Transmit Coordinates
              </h2>

              {/* Predefined saved addresses buttons */}
              {userProfile.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    Select Quick Coordinates:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleUseSavedAddress(addr.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border flex items-center space-x-1.5 transition-all ${
                          addressId === addr.id
                            ? "bg-google-blue/15 border-google-blue text-white shadow-lg"
                            : "glass-panel text-gray-300 border-white/5"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-google-blue" />
                        <span>{addr.label} ({addr.city})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input details form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 177A Bleecker Street"
                    className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      Zip
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                    />
                  </div>
                </div>
              </div>

              {/* Proceed */}
              <button
                onClick={() => setStep(2)}
                disabled={!fullName || !street || !city || !zip}
                className="w-full py-3.5 bg-spider-red hover:bg-spider-red/90 disabled:opacity-50 text-white font-black text-xs tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_15px_rgba(230,36,41,0.25)] flex items-center justify-center cursor-pointer"
              >
                Proceed to Secure Payment
              </button>
            </div>
          ) : (
            /* STEP 2: Secure Payment details */
            <div className="p-6 rounded-2xl glass-panel border border-white/8 space-y-6">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                🔒 Secure Payment Frequency
              </h2>

              {/* Payment methods list selectors */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("gpay")}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === "gpay"
                      ? "bg-white/10 border-google-blue text-white shadow-lg"
                      : "glass-panel text-gray-400 border-white/5"
                  }`}
                >
                  <span className="font-bold text-sm tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span> Pay
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === "card"
                      ? "bg-white/10 border-spider-red text-white shadow-lg"
                      : "glass-panel text-gray-400 border-white/5"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-spider-red" />
                  <span className="font-bold text-xs">Credit Card</span>
                </button>
              </div>

              {/* Dynamic Payment Body */}
              {paymentMethod === "gpay" ? (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3.5 text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-google-blue/10 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-6 h-6 text-google-blue" />
                  </div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Google Pay Sandbox Mode Active
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono leading-relaxed uppercase tracking-wider max-w-xs mx-auto">
                    Transactions are proxied through mock sandbox credentials securely linked to: {userProfile.email}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userProfile.name}
                      className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 pl-9 border border-white/10 focus:outline-none focus:border-spider-red"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">
                        CVV Security
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="***"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 pl-9 border border-white/10 focus:outline-none focus:border-spider-red"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation CTAs */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={paymentMethod === "card" && (!cardNumber || !expiry || !cvv)}
                  className="flex-1 py-3.5 bg-spider-red hover:bg-spider-red/90 disabled:opacity-50 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(230,36,41,0.35)] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Place Multiverse Order</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary list */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/8 space-y-5">
          <h2 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
            🛒 Capsule Contents
          </h2>

          {/* Items list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const itemPrice = item.product.discountPrice ?? item.product.price;
              return (
                <div key={item.id} className="flex items-center space-x-3 text-xs py-1 border-b border-white/5 last:border-0 pb-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded bg-white/5 object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{item.product.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Qty: {item.quantity} • {Object.values(item.selectedVariants).join(", ")}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ${(itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing calculations details */}
          <div className="space-y-2.5 text-xs pt-3 border-t border-white/5 text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-google-green">
                <span>Voucher Savings</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Zone Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2.5 border-t border-white/5">
              <span className="uppercase font-sans font-black">Amount Payable</span>
              <span className="text-spider-red font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Projected loyalty points earned badge */}
          <div className="p-3.5 bg-google-yellow/5 border border-google-yellow/15 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-google-yellow">
              <Sparkles className="w-4 h-4 text-google-yellow animate-spin" />
              <span className="font-bold uppercase tracking-wider text-[10px]">Projected Points</span>
            </div>
            <span className="font-mono font-black text-white">+{projectedPoints} earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
