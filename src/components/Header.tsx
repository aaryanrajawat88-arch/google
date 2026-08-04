import { useState, useEffect } from "react";
import { Search, ShoppingBag, Heart, User, ShieldAlert, Menu, X } from "lucide-react";
import { Product } from "../types";
import { PRODUCTS } from "../data";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  huntScore: number; // For spider web hunt gamification
}

export default function Header({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  huntScore
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor page scrolling to add background color to Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "official-merch", label: "Official Merchandise" },
    { id: "collections", label: "Collections" },
    { id: "technology", label: "Technology" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" }
  ];

  // Match search autocomplete suggestions
  const searchResults = searchQuery
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleProductSelect = (productId: string) => {
    onNavigate(`product-${productId}`);
    setSearchQuery("");
    setShowSearch(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || currentView !== "home"
            ? "glass-navbar py-3 shadow-lg"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              {/* Spinning spider silhouette logo */}
              <div className="w-8 h-8 bg-gradient-to-tr from-google-blue via-google-red to-google-green rounded-full flex items-center justify-center font-extrabold text-white text-base shadow-[0_0_12px_rgba(66,133,244,0.4)] group-hover:scale-105 transition-transform">
                G
              </div>
              <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">🕷️</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-black tracking-[0.25em] leading-none">
                <span className="text-google-blue">G</span>
                <span className="text-google-red">O</span>
                <span className="text-google-yellow">O</span>
                <span className="text-google-blue">G</span>
                <span className="text-google-green">L</span>
                <span className="text-google-red">E</span>
              </span>
              <span className="text-spider-red text-[9px] font-mono tracking-widest leading-none mt-1 uppercase">
                × Spider-Man
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 text-xs font-semibold tracking-wider uppercase transition-colors hover:text-white ${
                  currentView === item.id ? "text-white" : "text-gray-400"
                }`}
              >
                {item.label}
                {currentView === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-google-blue rounded-full shadow-[0_0_6px_rgba(66,133,244,0.6)]" />
                )}
              </button>
            ))}
          </nav>

          {/* Utility Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Search Icon toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1.5 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dynamic Autocomplete search modal */}
              {showSearch && (
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 shadow-xl z-50 border border-white/10 animate-fadeIn">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search collab gear..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 text-xs text-white placeholder-gray-500 rounded-lg px-3 py-2 pl-8 border border-white/10 focus:outline-none focus:border-spider-red transition-colors"
                      autoFocus
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Search Autocomplete Suggestions */}
                  <div className="mt-3 space-y-2">
                    {searchQuery ? (
                      searchResults.length > 0 ? (
                        <div>
                          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                            Matching Gear
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {searchResults.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => handleProductSelect(p.id)}
                                className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                              >
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-7 h-7 rounded bg-white/10 object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-white truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-mono">
                                    ${p.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-center py-4 text-gray-500 font-mono">
                          No parallel realities matched.
                        </div>
                      )
                    ) : (
                      <div>
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                          Popular Searches
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {["Spider Robot", "Sneaker", "Hoodie", "NFC T-Shirt"].map((s) => (
                            <button
                              key={s}
                              onClick={() => setSearchQuery(s)}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 rounded-md transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <button
              onClick={() => onNavigate("account")}
              className="relative p-1.5 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-google-red text-[8px] font-bold text-white w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[0_0_4px_rgba(234,67,53,0.6)]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account Portal Link */}
            <button
              onClick={() => onNavigate("account")}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-colors ${
                currentView === "account" ? "text-google-blue" : "text-gray-300 hover:text-white"
              }`}
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-google-blue text-[9px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(66,133,244,0.6)]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Secret Admin panel shortcut */}
            <button
              onClick={() => onNavigate("admin")}
              className={`hidden md:block p-1.5 rounded-full hover:bg-white/5 transition-colors ${
                currentView === "admin" ? "text-google-yellow" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Admin Dashboard"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden flex flex-col justify-center items-center space-y-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-lg font-bold uppercase tracking-wider ${
                currentView === item.id ? "text-spider-red" : "text-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate("admin");
              setMobileMenuOpen(false);
            }}
            className={`text-lg font-bold uppercase tracking-wider text-google-yellow`}
          >
            Secret Admin Panel
          </button>
        </div>
      )}
    </>
  );
}
