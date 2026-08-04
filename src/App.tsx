import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Github, ExternalLink, RefreshCw, Mail, Compass } from "lucide-react";
import { Product, CartItem, Order, UserProfile, Coupon } from "./types";
import { PRODUCTS, INITIAL_USER_PROFILE } from "./data";

// Component imports
import SpiderCursor from "./components/SpiderCursor";
import WebClickEffect from "./components/WebClickEffect";
import IntroAnimation from "./components/IntroAnimation";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import CheckoutPage from "./components/CheckoutPage";
import AccountPage from "./components/AccountPage";
import Gamification from "./components/Gamification";
import AdminDashboard from "./components/AdminDashboard";
import TechnologyPlayground from "./components/TechnologyPlayground";
import GoogleAIChatBot from "./components/GoogleAIChatBot";
import LeadGenPopup from "./components/LeadGenPopup";
import OfficialMerchandise from "./components/OfficialMerchandise";

export default function App() {
  // App view state routing
  const [currentView, setCurrentView] = useState<string>("home");
  const [isIntroFinished, setIsIntroFinished] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // E-commerce & Store reactive state
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Hidden Spider Web hunt score
  const [huntScore, setHuntScore] = useState(0);

  // Load intro skip preference from sessionStorage
  useEffect(() => {
    const skipped = sessionStorage.getItem("spidey_intro_skipped");
    if (skipped === "true") {
      setIsIntroFinished(true);
    }
  }, []);

  // Sync scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  // Handle Add to Cart
  const handleAddToCart = (product: Product, selectedVariants: Record<string, string>) => {
    // Generate unique key based on selected variants
    const variantString = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}:${v}`)
      .join("-");
    const cartItemId = `${product.id}-${variantString}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: cartItemId, product, quantity: 1, selectedVariants }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Applied coupon code
  const handleApplyCoupon = (code: string) => {
    const matched = userProfile.claimableCoupons.find((c) => c.code === code);
    if (matched) {
      setActiveCoupon(matched);
      // Auto register to user's wallet
      if (!userProfile.ownedCoupons.includes(code)) {
        setUserProfile((prev) => ({
          ...prev,
          ownedCoupons: [...prev.ownedCoupons, code],
        }));
      }
    }
  };

  const handleClaimCoupon = (coupon: Coupon) => {
    if (!userProfile.ownedCoupons.includes(coupon.code)) {
      setUserProfile((prev) => ({
        ...prev,
        ownedCoupons: [...prev.ownedCoupons, coupon.code],
      }));
    }
  };

  // Wishlist actions
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Loyalty Points addition with Dynamic Tier Level Up checks
  const handleAddPoints = (points: number) => {
    setUserProfile((prev) => {
      const updatedPoints = prev.points + points;
      let updatedLevel = prev.level;
      let nextThreshold = prev.nextLevelPoints;

      if (updatedPoints >= nextThreshold) {
        updatedLevel += 1;
        nextThreshold = Math.floor(nextThreshold * 1.5);
      }

      return {
        ...prev,
        points: updatedPoints,
        level: updatedLevel,
        nextLevelPoints: nextThreshold,
      };
    });
  };

  // Place secure order action
  const handlePlaceOrder = (orderTotal: number, pointsEarned: number) => {
    const subtotal = cart.reduce((acc, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return acc + price * item.quantity;
    }, 0);
    const discount = activeCoupon ? (activeCoupon.discountType === "percent" ? subtotal * (activeCoupon.value / 100) : activeCoupon.value) : 0;
    const isFreeShipping = activeCoupon?.discountType === "free-shipping" || subtotal > 150;
    const shipping = isFreeShipping ? 0 : 9.99;

    const newOrder: Order = {
      id: `GP-${Math.floor(Math.random() * 900000) + 100000}`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "Processing",
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.discountPrice ?? item.product.price,
        variants: item.selectedVariants
      })),
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: orderTotal,
      pointsEarned: pointsEarned,
    };

    setOrders((prev) => [newOrder, ...prev]);
    handleAddPoints(pointsEarned);
    setCart([]); // Clear cart
    setActiveCoupon(null);
    setCurrentView("account"); // Redirect to account dashboard order history
  };

  // Back-office Inventory sync updates
  const handleUpdateInventory = (productId: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inventory: qty } : p))
    );
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-white overflow-hidden flex flex-col justify-between selection:bg-spider-red/30">
      
      {/* Interactive visual cursors and click effects */}
      <SpiderCursor enabled={true} />
      <WebClickEffect />
      <GoogleAIChatBot />
      <LeadGenPopup />

      {/* Intro sequence blocker */}
      {!isIntroFinished && (
        <IntroAnimation
          onComplete={() => {
            setIsIntroFinished(true);
            sessionStorage.setItem("spidey_intro_skipped", "true");
          }}
        />
      )}

      {/* Constant Sticky Header Navbar */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        huntScore={huntScore}
      />

      {/* Side sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onApplyCoupon={handleApplyCoupon}
        activeCoupon={activeCoupon}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView("checkout");
        }}
      />

      {/* Main viewport frame router */}
      <main className="flex-grow pt-16">
        
        {currentView === "home" && (
          /* HOME SECTION */
          <div className="space-y-20">
            {/* Cinematic hero section */}
            <Hero
              onNavigate={(view) => setCurrentView(view)}
              onOpenQuiz={() => setCurrentView("gamification")}
            />

            {/* CURATED CLOTHING BENTO GRID */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <span className="text-xs font-mono text-google-blue uppercase tracking-widest font-black">Curated Alignments</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">The Character Capsule Bento</h2>
                <p className="text-xs text-gray-400 font-mono">Explore character-inspired visual fits crafted in modular aesthetic blocks.</p>
              </div>

              {/* Bento panels */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Panel 1: Stark Tech Classic (Peter Parker) - Red */}
                <div
                  onClick={() => setCurrentView("collections")}
                  className="md:col-span-8 p-8 rounded-3xl glass-panel border border-white/8 hover:border-google-red/25 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-google-red/10 to-transparent pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] font-mono tracking-widest text-google-red font-black uppercase">Classic Stark Tech</span>
                    <h3 className="text-xl font-black text-white uppercase">Peter Parker Collection</h3>
                    <p className="text-xs text-gray-400 max-w-sm font-mono leading-relaxed">
                      Classic blue-red alignments combined with intelligent thermal threading and smart NFC integration.
                    </p>
                  </div>
                  <span className="text-xs text-google-red font-mono font-bold tracking-widest uppercase mt-4 group-hover:translate-x-1.5 transition-transform inline-flex items-center space-x-1.5 z-10">
                    <span>Enter Stark Terminal</span>
                    <span>→</span>
                  </span>
                </div>

                {/* Panel 2: Bio-Electric Volt (Miles Morales) - Yellow */}
                <div
                  onClick={() => setCurrentView("collections")}
                  className="md:col-span-4 p-8 rounded-3xl glass-panel border border-white/8 hover:border-google-yellow/20 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] font-mono tracking-widest text-google-yellow font-black uppercase">Cyber Volt Neon</span>
                    <h3 className="text-xl font-black text-white uppercase">Miles Morales</h3>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                      Sleek matte-black hoodies with volt-electric yellow stitchings.
                    </p>
                  </div>
                  <span className="text-xs text-google-yellow font-mono font-bold tracking-widest uppercase mt-4 group-hover:translate-x-1.5 transition-transform inline-flex items-center space-x-1.5 z-10">
                    <span>Enter Volt Grid</span>
                    <span>→</span>
                  </span>
                </div>

                {/* Panel 3: Kinetic Cyber (Spider-Gwen) - Blue */}
                <div
                  onClick={() => setCurrentView("collections")}
                  className="md:col-span-4 p-8 rounded-3xl glass-panel border border-white/8 hover:border-google-blue/20 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest text-google-blue font-black uppercase">Kinetic Cyberwave</span>
                    <h3 className="text-xl font-black text-white uppercase">Spider-Gwen Fits</h3>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                      Futuristic pink, white, and teal sleek caps and technical windbreakers.
                    </p>
                  </div>
                  <span className="text-xs text-google-blue font-mono font-bold tracking-widest uppercase mt-4 group-hover:translate-x-1.5 transition-transform inline-flex items-center space-x-1.5">
                    <span>Enter Cyber Portal</span>
                    <span>→</span>
                  </span>
                </div>

                {/* Panel 4: Alchemax futuristic (Miguel 2099) - Green */}
                <div
                  onClick={() => setCurrentView("collections")}
                  className="md:col-span-8 p-8 rounded-3xl glass-panel border border-white/8 hover:border-google-green/25 relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-google-green/10 to-transparent pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] font-mono tracking-widest text-google-green font-black uppercase">Alchemax Neo-Strap</span>
                    <h3 className="text-xl font-black text-white uppercase">Miguel O'Hara 2099</h3>
                    <p className="text-xs text-gray-400 max-w-sm font-mono leading-relaxed">
                      Sleek futuristic cyber apparel styled with hyper-durable straps and deep-crimson neon graphics.
                    </p>
                  </div>
                  <span className="text-xs text-google-green font-mono font-bold tracking-widest uppercase mt-4 group-hover:translate-x-1.5 transition-transform inline-flex items-center space-x-1.5 z-10">
                    <span>Enter Neo-Zone</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </section>

            {/* CURATED CATALOG SECTIONS */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div className="text-left space-y-1.5">
                  <span className="text-xs font-mono text-spider-red uppercase tracking-widest font-black">Exclusive Gear</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Trending Multiverse Tech</h2>
                  <p className="text-xs text-gray-400 font-mono">Limited quantities. Engineered with smart Google-fabrics.</p>
                </div>
                <button
                  onClick={() => setCurrentView("shop")}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl border border-white/10 flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span>View All Shop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 3).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onViewDetails={(id) => setCurrentView(`product-${id}`)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(p.id)}
                  />
                ))}
              </div>
            </section>

            {/* DYNAMIC CAMPAIGN TIMELINE DISCLOSURE */}
            <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 border-t border-white/5">
              <div className="text-center mb-10 space-y-1.5">
                <span className="text-xs font-mono text-google-blue uppercase tracking-widest font-bold">Smart Innovation</span>
                <h2 className="text-2xl font-black text-white uppercase">Google Wearable Labs Timeline</h2>
              </div>
              <div className="space-y-6 font-mono text-xs text-gray-400">
                <div className="flex space-x-4 items-start border-l border-google-blue pl-4 pb-4">
                  <div className="text-google-blue font-bold">Phase 01</div>
                  <div>
                    <h4 className="text-white font-bold uppercase text-[11px] mb-0.5">Synthesizing Arachnid smart-fiber</h4>
                    <p>Fusing Google's thermal smart-yarn structures with micro-carbon threads to simulate organic webbing protection.</p>
                  </div>
                </div>
                <div className="flex space-x-4 items-start border-l border-spider-red pl-4 pb-4">
                  <div className="text-spider-red font-bold">Phase 02</div>
                  <div>
                    <h4 className="text-white font-bold uppercase text-[11px] mb-0.5">NFC Multiverse sync chips</h4>
                    <p>Integrating contactless micro-chips into hoodies to unlock virtual content on user terminals.</p>
                  </div>
                </div>
                <div className="flex space-x-4 items-start border-l border-google-yellow pl-4">
                  <div className="text-google-yellow font-bold">Phase 03</div>
                  <div>
                    <h4 className="text-white font-bold uppercase text-[11px] mb-0.5">Desktop Robot Assist Companion</h4>
                    <p>Initializing desktop arachnid-robot prototype with server-side Tensor G3 and custom Gemini core processing.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === "shop" && (
          /* PRODUCT LISTING PAGE (PLP) */
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">The Capsule Store Catalog</h1>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                Browse limited garments and collaborative collectibles.
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onViewDetails={(id) => setCurrentView(`product-${id}`)}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === "collections" && (
          /* CHARACTER COLLECTIONS SPECIAL PAGE */
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">The Multiverse Alignments</h1>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                Explore dedicated collections representing key coordinates in the spider-verse.
              </p>
            </div>

            <div className="space-y-12">
              {/* Collection 1 */}
              <div className="p-8 rounded-3xl glass-panel border border-white/8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-spider-red uppercase font-black">PETER PARKER</span>
                    <h3 className="text-xl font-black text-white uppercase">Classic Stark Tech Alignment</h3>
                  </div>
                  <button
                    onClick={() => setCurrentView("shop")}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer self-start sm:self-auto"
                  >
                    Browse Peter's Gear
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400 font-mono">
                  <p>Designed with standard red/blue accents paired with smart tech features.</p>
                  <p>Includes built-in NFC alignment, temperature balancing, and durable wear.</p>
                </div>
              </div>

              {/* Collection 2 */}
              <div className="p-8 rounded-3xl glass-panel border border-white/8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-google-yellow uppercase font-black">MILES MORALES</span>
                    <h3 className="text-xl font-black text-white uppercase">Neon Bio-Electric Volt</h3>
                  </div>
                  <button
                    onClick={() => setCurrentView("shop")}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer self-start sm:self-auto"
                  >
                    Browse Miles' Gear
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400 font-mono">
                  <p>Sleek dark apparel detailed with electric volt-yellow stitching.</p>
                  <p>Featuring hyper-flexible cotton threads and athletic hoods.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "technology" && (
          /* TECHNOLOGY PLAYGROUND (ROBOT CHAT) */
          <TechnologyPlayground />
        )}

        {currentView === "official-merch" && (
          /* OFFICIAL GOOGLE MERCHANDISE SECTION */
          <OfficialMerchandise 
            onAddToCart={handleAddToCart} 
            onNavigate={(view) => setCurrentView(view)} 
          />
        )}

        {currentView === "about" && (
          /* ABOUT THE COLLABORATION PAGE */
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-24 select-none space-y-8 leading-relaxed text-gray-300 text-xs sm:text-sm">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight text-center">About Google × Spider-Man</h1>
            <p className="text-center text-xs text-gray-500 font-mono uppercase tracking-widest mt-2 mb-8">
              A premium technical apparel and collectable campaign.
            </p>

            <div className="space-y-6">
              <p>
                The <strong>Google x Spider-Man: Brand New Day</strong> clothing campaign represents a groundbreaking collaboration between Google's Material Wearable Labs and Marvel's ultimate web-slinger.
              </p>
              <p>
                Our objective was to design custom-fit apparel and smart devices that incorporate Google’s signature smart-fiber yarns alongside Spider-Man's thematic and structural visual identity.
              </p>

              <div className="p-5 rounded-2xl bg-white/3 border border-white/5 space-y-2">
                <h3 className="text-white font-bold uppercase text-[11px] font-mono">🔑 CREDITS & CREDENTIALS:</h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400 font-mono uppercase">
                  <li>Store Front: Google Merchandise Store</li>
                  <li>Campaign licensing: Marvel Characters, Inc.</li>
                  <li>Fiber tech: Google Material Wearables Lab, Mountain View</li>
                  <li>Core Processor: Tensor G3 Smart Chip Core</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentView === "contact" && (
          /* CONTACT PORTAL FORM */
          <div className="max-w-xl mx-auto px-4 md:px-6 py-24 select-none space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Portal Support</h1>
              <p className="text-xs text-gray-400 font-mono uppercase">Transmit queries directly to standard support databases.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Query successfully transmitted into support records!");
                setCurrentView("home");
              }}
              className="p-6 rounded-2xl glass-panel border border-white/8 space-y-4 text-xs font-mono"
            >
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Support ID Email</label>
                <input
                  type="email"
                  defaultValue={userProfile.email}
                  required
                  className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Transmit Query</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your multiverse query..."
                  className="w-full bg-white/5 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-spider-red"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-spider-red text-white hover:bg-spider-red/90 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Transmit message</span>
              </button>
            </form>
          </div>
        )}

        {currentView === "checkout" && (
          /* CHECKOUT INTERFACE */
          <CheckoutPage
            cartItems={cart}
            activeCoupon={activeCoupon}
            userProfile={userProfile}
            onPlaceOrder={handlePlaceOrder}
            onBackToCart={() => setCurrentView("shop")}
          />
        )}

        {currentView === "account" && (
          /* USER ACCOUNT DASHBOARD */
          <AccountPage
            userProfile={userProfile}
            orders={orders}
            onOpenGamification={() => setCurrentView("gamification")}
          />
        )}

        {currentView === "gamification" && (
          /* GAMIFICATION HUB */
          <Gamification
            onClose={() => setCurrentView("account")}
            onClaimCoupon={handleClaimCoupon}
            onAddPoints={handleAddPoints}
            ownedCoupons={userProfile.ownedCoupons}
          />
        )}

        {currentView === "admin" && (
          /* ADMIN BACKOFFICE PANEL */
          <AdminDashboard
            products={products}
            orders={orders}
            userProfile={userProfile}
            onUpdateInventory={handleUpdateInventory}
            onClose={() => setCurrentView("home")}
          />
        )}

        {currentView.startsWith("product-") && (
          /* PRODUCT DETAILS PDP */
          (() => {
            const prodId = currentView.split("product-")[1];
            const foundProd = products.find((p) => p.id === prodId);
            if (!foundProd) {
              return (
                <div className="py-24 text-center text-xs font-mono text-gray-500">
                  Target Product Code not found in local catalog parameters.
                </div>
              );
            }
            return (
              <ProductDetail
                product={foundProd}
                onBack={() => setCurrentView("shop")}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.includes(foundProd.id)}
                onViewProduct={(id) => setCurrentView(`product-${id}`)}
              />
            );
          })()
        )}
      </main>

      {/* Aesthetic Footer segment */}
      <footer className="border-t border-white/5 bg-[#040406] py-10 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white font-bold uppercase text-[10px] tracking-wider mb-1">
              Google Merchandise × Spider-Man Collab
            </span>
            <span>All exclusive garments are limited prototypes under licensing protocols.</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={() => setCurrentView("about")} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={() => setCurrentView("contact")} className="hover:text-white transition-colors">
              Support
            </button>
            <button onClick={() => setCurrentView("admin")} className="hover:text-white transition-colors flex items-center space-x-1 text-google-yellow">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Back-office</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
