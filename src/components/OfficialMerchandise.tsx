import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Star, 
  ShoppingBag, 
  ExternalLink, 
  X, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  SlidersHorizontal,
  ChevronRight,
  Truck,
  ShieldCheck,
  Package,
  Info
} from "lucide-react";
import { Product } from "../types";
import { ProductViewer3D } from "./ProductViewer3D";
import { Rotate3d } from "lucide-react";

export interface OfficialProduct {
  id: string;
  name: string;
  tagline: string;
  category: "Apparel" | "Drinkware" | "Accessories" | "Bags" | "Stickers" | "Collectibles";
  price: number;
  rating?: number;
  reviewsCount?: number;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  colors: string[];
  sizes?: string[];
  pointsValue: number;
  purchaseUrl: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface OfficialMerchandiseProps {
  onAddToCart: (product: Product, selectedVariants: Record<string, string>) => void;
  onNavigate: (view: string) => void;
}

export default function OfficialMerchandise({ onAddToCart, onNavigate }: OfficialMerchandiseProps) {
  const [products, setProducts] = useState<OfficialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<OfficialProduct | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addSuccess, setAddSuccess] = useState(false);
  const [view3D, setView3D] = useState(false);

  // Fetch official products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/google-merchandise");
        if (!response.ok) {
          throw new Error("Failed to load official merchandise catalog.");
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while fetching items.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Map OfficialProduct to Standard App Product type for local cart checkout
  const mapToStandardProduct = (op: OfficialProduct): Product => ({
    id: op.id,
    name: op.name,
    tagline: op.tagline || "",
    description: op.description,
    category: op.category,
    price: op.price,
    rating: op.rating || 5,
    reviewsCount: op.reviewsCount || 10,
    image: op.image,
    images: op.images,
    specs: op.specs,
    variants: [
      ...(op.colors && op.colors.length > 0 ? [{ name: "Color", options: op.colors }] : []),
      ...(op.sizes && op.sizes.length > 0 ? [{ name: "Size", options: op.sizes }] : [])
    ],
    pointsValue: op.pointsValue,
    inventory: op.availability === "Out of Stock" ? 0 : (op.availability === "Low Stock" ? 3 : 50),
    isNew: op.isNew,
    isBestSeller: op.isBestSeller
  });

  const handleLocalAddToCart = (op: OfficialProduct) => {
    // Validate that variants are selected
    const requiredVariants: Record<string, string> = {};
    if (op.colors && op.colors.length > 0) {
      requiredVariants["Color"] = selectedVariants["Color"] || op.colors[0];
    }
    if (op.sizes && op.sizes.length > 0) {
      requiredVariants["Size"] = selectedVariants["Size"] || op.sizes[0];
    }

    const standardProd = mapToStandardProduct(op);
    onAddToCart(standardProd, requiredVariants);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  };

  // Extract all unique colors and sizes for filter lists
  const allColors = Array.from(
    new Set(products.flatMap((p) => p.colors || []).map((c) => c.toLowerCase()))
  ) as string[];
  const allSizes = Array.from(
    new Set(products.flatMap((p) => p.sizes || []))
  ) as string[];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPriceRange("All");
    setSelectedColor("All");
    setSelectedSize("All");
    setSortBy("Featured");
  };

  // Filter application
  const filteredProducts = products.filter((p) => {
    // Search filter
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    // Price filter
    let matchesPrice = true;
    if (selectedPriceRange !== "All") {
      if (selectedPriceRange === "under-15") matchesPrice = p.price < 15;
      else if (selectedPriceRange === "15-30") matchesPrice = p.price >= 15 && p.price <= 30;
      else if (selectedPriceRange === "30-60") matchesPrice = p.price >= 30 && p.price <= 60;
      else if (selectedPriceRange === "over-60") matchesPrice = p.price > 60;
    }

    // Color filter
    const matchesColor = selectedColor === "All" || 
      p.colors.some((c) => c.toLowerCase().includes(selectedColor.toLowerCase()));

    // Size filter
    const matchesSize = selectedSize === "All" || 
      (p.sizes && p.sizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase())));

    return matchesSearch && matchesCategory && matchesPrice && matchesColor && matchesSize;
  });

  // Sort application
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Newest") return (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0); // items tagged isNew first
    if (sortBy === "Best Selling") return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    // Featured (Default): Best Sellers first, then Newest, then others
    if (a.isBestSeller !== b.isBestSeller) {
      return a.isBestSeller ? -1 : 1;
    }
    if (a.isNew !== b.isNew) {
      return b.isNew ? 1 : -1;
    }
    return 0;
  });

  // Open modal and pre-select first color/size
  const handleOpenDetails = (prod: OfficialProduct) => {
    setSelectedProduct(prod);
    setActiveImageIdx(0);
    setView3D(false);
    setSelectedVariants({
      Color: prod.colors?.[0] || "",
      Size: prod.sizes?.[0] || ""
    });
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12 select-none" id="official-merch-section">
      
      {/* 1. Header Hero Banner */}
      <div 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0c16] to-[#121225] border border-white/5 p-8 md:p-12 shadow-2xl"
        id="official-merch-hero"
      >
        {/* Dynamic color grid dots in background */}
        <div className="absolute inset-0 bg-[radial-gradient(#4285F4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        
        {/* Decorative giant Google colors blurs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-google-blue/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-google-green/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-white">
              Official <span className="text-google-blue">G</span><span className="text-google-red">o</span><span className="text-google-yellow">o</span><span className="text-google-blue">g</span><span className="text-google-green">l</span><span className="text-google-red">e</span> Merchandise
            </h1>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-black tracking-widest uppercase animate-pulse">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Best Sellers</span>
            </span>
          </div>

          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            Discover Google's most popular official merchandise, including apparel, drinkware, accessories, collectibles, and exclusive products loved by the community. Synchronized directly with <a href="https://shop.merch.google/" target="_blank" rel="noreferrer" className="text-google-blue hover:underline inline-flex items-center space-x-1 font-bold"><span>shop.merch.google</span> <ExternalLink className="w-3 h-3" /></a>.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs text-gray-400">
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Truck className="w-4 h-4 text-google-green" />
              <span>Free Shipping Over $50</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-google-blue" />
              <span>100% Genuine Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter, and Sort Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="shop-catalog-frame">
        
        {/* Desktop Filter Sidebar (3 columns) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 bg-white/3 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-google-blue" />
              <span>Filters</span>
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Category</label>
            <div className="flex flex-col space-y-1">
              {["All", "Apparel", "Drinkware", "Accessories", "Bags", "Stickers", "Collectibles"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat 
                      ? "bg-google-blue/15 text-google-blue border-l-2 border-google-blue pl-2.5" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Price Range</label>
            <div className="flex flex-col space-y-1">
              {[
                { id: "All", label: "All Prices" },
                { id: "under-15", label: "Under $15" },
                { id: "15-30", label: "$15 - $30" },
                { id: "30-60", label: "$30 - $60" },
                { id: "over-60", label: "Over $60" }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedPriceRange(range.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPriceRange === range.id 
                      ? "bg-google-green/15 text-google-green border-l-2 border-google-green pl-2.5" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Primary Color</label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedColor("All")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
                  selectedColor === "All" 
                    ? "border-google-blue bg-google-blue/10 text-google-blue" 
                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                All
              </button>
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors capitalize ${
                    selectedColor.toLowerCase() === color.toLowerCase() 
                      ? "border-google-yellow bg-google-yellow/10 text-google-yellow" 
                      : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          {allSizes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Sizing Options</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedSize("All")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
                    selectedSize === "All" 
                      ? "border-google-blue bg-google-blue/10 text-google-blue" 
                      : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  All
                </button>
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
                      selectedSize === size 
                        ? "border-google-red bg-google-red/10 text-google-red" 
                        : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Catalog Search & Grid Area (9 columns) */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Top Control Bar (Search + Mobile filter toggle + Sort) */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/3 p-4 rounded-2xl border border-white/5">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search official Google gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090911] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 border border-white/10 focus:outline-none focus:border-google-blue transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Sort selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#090911] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-google-blue transition-colors"
                >
                  <option>Featured</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeleton Loader */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-[#0b0b14] border border-white/5 rounded-2xl p-4 space-y-4 animate-pulse">
                  <div className="w-full h-48 bg-white/5 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <div className="h-9 bg-white/10 rounded-xl flex-1" />
                    <div className="h-9 bg-white/10 rounded-xl flex-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white/3 border border-white/5 rounded-2xl p-6">
              <p className="text-google-red font-mono text-xs mb-3">⚠️ Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
              >
                Retry Load
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
              <Package className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider">No matching products found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No items match your selected filters. Try broadening your criteria or reset the search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-google-blue/20 border border-google-blue/30 text-google-blue text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* 3. Product Display Grid (4-cols Desktop, 2-cols Tablet, 1-col Mobile) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="google-merch-grid">
              {sortedProducts.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={p.id}
                  className="group relative bg-[#0c0c16] border border-white/5 hover:border-white/15 rounded-2xl shadow-xl hover:shadow-[0_4px_25px_rgba(66,133,244,0.06)] overflow-hidden flex flex-col transition-all duration-300"
                >
                  {/* Category & Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-wider uppercase text-gray-300">
                      {p.category}
                    </span>
                    {p.isNew && (
                      <span className="px-2.5 py-0.5 rounded-full bg-google-blue text-white text-[9px] font-black tracking-widest uppercase">
                        New
                      </span>
                    )}
                    {p.isBestSeller && (
                      <span className="px-2.5 py-0.5 rounded-full bg-google-yellow text-black text-[9px] font-black tracking-widest uppercase">
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Rating indicator */}
                  {p.rating && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-10 pointer-events-none">
                      <Star className="w-3 h-3 text-google-yellow fill-google-yellow" />
                      <span className="text-[10px] font-bold text-white">{p.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Product Image Holder */}
                  <div className="relative w-full h-56 bg-white/3 overflow-hidden cursor-pointer" onClick={() => handleOpenDetails(p)}>
                    {/* Lazy-loaded primary product image with safety attributes */}
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dark gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c16]/90 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Product Metadata details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 cursor-pointer" onClick={() => handleOpenDetails(p)}>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-sm uppercase text-white group-hover:text-google-blue transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <span className="font-mono text-sm text-google-green font-bold shrink-0">
                          ${p.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono tracking-tight line-clamp-1">
                        {p.tagline}
                      </p>
                      <p className="text-xs text-gray-500 leading-normal line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Availability Label */}
                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-3">
                        <span className="text-gray-500 uppercase">Availability:</span>
                        <span className={`font-bold uppercase ${
                          p.availability === "Out of Stock" ? "text-google-red" : (p.availability === "Low Stock" ? "text-google-yellow" : "text-google-green")
                        }`}>
                          {p.availability}
                        </span>
                      </div>

                      {/* Direct CTA Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenDetails(p)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[10px] text-white font-bold tracking-wider uppercase rounded-xl border border-white/5 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <a
                          href={p.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-google-blue hover:bg-google-blue/90 text-[10px] text-white font-extrabold tracking-wider uppercase rounded-xl flex items-center justify-center space-x-1 transition-all"
                        >
                          <span>Buy Now</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. You Might Also Like Recommended Products Section */}
      <div className="border-t border-white/5 pt-12 space-y-6" id="you-might-also-like-section">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-google-yellow" />
            <span>You Might Also Like</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono">Curated official Google gear selected for your collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            .filter((p) => !p.isBestSeller)
            .slice(0, 4)
            .map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenDetails(p)}
                className="group bg-[#0c0c16]/80 hover:bg-[#121225]/80 border border-white/5 hover:border-white/15 rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                <div className="relative w-full h-36 bg-white/3 rounded-xl overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-mono uppercase text-gray-300">
                    {p.category}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase text-gray-200 group-hover:text-google-blue transition-colors truncate">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1 font-mono">{p.tagline}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-xs font-bold text-google-green font-mono">${p.price.toFixed(2)}</span>
                  <span className="text-[9px] font-mono text-google-blue flex items-center gap-1 group-hover:underline">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 4. Product Details Overlay Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" id="product-details-overlay">
            
            {/* Blurred backdrop dim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-[#06060c]/85 backdrop-blur-md"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="relative w-full max-w-4xl bg-[#0d0d16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Material Top Strip */}
              <div className="h-1 w-full flex shrink-0">
                <div className="h-full w-1/4 bg-google-blue" />
                <div className="h-full w-1/4 bg-google-red" />
                <div className="h-full w-1/4 bg-google-yellow" />
                <div className="h-full w-1/4 bg-google-green" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Inside Panel */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                
                {/* Product Layout Grid (2 columns: images left, options right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                 {/* Left Column: Image Gallery with lazy thumbnails and 3D Studio Toggle */}
                  <div className="space-y-4">
                    
                    {/* View Mode Switcher tabs */}
                    <div className="flex bg-white/3 border border-white/5 rounded-2xl p-1.5 justify-between items-center text-xs font-mono">
                      <div className="flex space-x-1.5 w-full">
                        <button
                          onClick={() => setView3D(false)}
                          className={`flex-1 py-2 rounded-xl text-center font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                            !view3D 
                              ? "bg-white/10 text-white shadow-lg" 
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-google-red" />
                          <span>2D Photos</span>
                        </button>
                        <button
                          onClick={() => setView3D(true)}
                          className={`flex-1 py-2 rounded-xl text-center font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                            view3D 
                              ? "bg-white/10 text-white shadow-lg" 
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <Rotate3d className={`w-3.5 h-3.5 text-google-green ${view3D ? "animate-pulse" : ""}`} />
                          <span>3D Hologram</span>
                        </button>
                      </div>
                    </div>

                    {/* Active preview stage or 3D interactive viewer */}
                    {view3D ? (
                      <ProductViewer3D
                        productId={selectedProduct.id}
                        productName={selectedProduct.name}
                        category={selectedProduct.category}
                        selectedColor={selectedVariants["Color"] || undefined}
                      />
                    ) : (
                      <div className="relative w-full h-80 bg-white/3 rounded-2xl overflow-hidden border border-white/5">
                        <img
                          src={selectedProduct.images[activeImageIdx] || selectedProduct.image}
                          alt={selectedProduct.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover animate-fade-in"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-400 uppercase">
                          Image {activeImageIdx + 1} of {selectedProduct.images.length}
                        </div>
                      </div>
                    )}

                    {/* Thumbnail slider */}
                    <div className="flex space-x-2.5 overflow-x-auto pb-1.5 custom-scrollbar">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveImageIdx(idx);
                            setView3D(false);
                          }}
                          className={`w-16 h-16 rounded-xl overflow-hidden border transition-all cursor-pointer shrink-0 ${
                            activeImageIdx === idx && !view3D
                              ? "border-google-blue shadow-[0_0_10px_rgba(66,133,244,0.3)] bg-white/5" 
                              : "border-white/5 hover:border-white/15 bg-white/3"
                          }`}
                        >
                          <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Descriptions & Selectors */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-google-blue/10 border border-google-blue/20 text-google-blue text-[9px] font-mono uppercase">
                        <span>{selectedProduct.category}</span>
                      </div>
                      
                      <h2 className="text-2xl font-black uppercase text-white leading-tight">
                        {selectedProduct.name}
                      </h2>
                      
                      <p className="text-xs text-google-blue font-mono">
                        {selectedProduct.tagline}
                      </p>

                      <div className="flex items-center space-x-4 pt-1">
                        <span className="text-xl font-bold text-google-green">
                          ${selectedProduct.price.toFixed(2)}
                        </span>
                        
                        {selectedProduct.rating && (
                          <div className="flex items-center space-x-1 text-xs text-gray-300">
                            <Star className="w-3.5 h-3.5 text-google-yellow fill-google-yellow" />
                            <span><strong>{selectedProduct.rating}</strong> ({selectedProduct.reviewsCount} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-gray-300 leading-relaxed font-medium bg-white/3 p-4 rounded-xl border border-white/5">
                      {selectedProduct.description}
                    </p>

                    {/* Dynamic Variant Selectors */}
                    <div className="space-y-4">
                      {/* Color Selector */}
                      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            Available Colors: <span className="text-white font-bold">{selectedVariants["Color"]}</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.colors.map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedVariants(prev => ({ ...prev, Color: color }))}
                                className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                                  selectedVariants["Color"] === color
                                    ? "border-google-yellow bg-google-yellow/10 text-google-yellow"
                                    : "border-white/5 bg-white/3 text-gray-400 hover:text-white hover:border-white/10"
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size Selector */}
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            Available Sizes: <span className="text-white font-bold">{selectedVariants["Size"]}</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedVariants(prev => ({ ...prev, Size: size }))}
                                className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                                  selectedVariants["Size"] === size
                                    ? "border-google-red bg-google-red/10 text-google-red"
                                    : "border-white/5 bg-white/3 text-gray-400 hover:text-white hover:border-white/10"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stock status indicator details */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-xs font-mono">
                      <span className="text-gray-400">Stock Status:</span>
                      <span className={`font-bold uppercase ${
                        selectedProduct.availability === "Out of Stock" ? "text-google-red" : (selectedProduct.availability === "Low Stock" ? "text-google-yellow animate-pulse" : "text-google-green")
                      }`}>
                        {selectedProduct.availability}
                      </span>
                    </div>

                    {/* Dual Action CTAs: Direct Deep Link and local cart addition */}
                    <div className="space-y-3">
                      {/* Direct purchase out to shop.merch.google */}
                      <a
                        href={selectedProduct.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 bg-google-blue hover:bg-google-blue/90 text-white font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_20px_rgba(66,133,244,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Buy on Official Google Shop</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Add to local cart mapping */}
                      <button
                        onClick={() => handleLocalAddToCart(selectedProduct)}
                        disabled={selectedProduct.availability === "Out of Stock"}
                        className={`w-full py-3.5 font-bold text-xs tracking-wider uppercase rounded-xl border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          addSuccess 
                            ? "bg-google-green border-google-green text-white" 
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {addSuccess ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Successfully Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Local Cart (+{selectedProduct.pointsValue} Points)</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Lower detailed section: specifications & shipping information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8 font-mono text-xs text-gray-400 leading-relaxed">
                  
                  {/* Specifications */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-white flex items-center space-x-1.5 border-b border-white/5 pb-2">
                      <SlidersHorizontal className="w-4 h-4 text-google-yellow" />
                      <span>Product Specifications</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.specs).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/3 pb-1.5">
                          <span className="text-gray-500 uppercase text-[10px]">{key}:</span>
                          <span className="text-gray-300 text-right font-medium pl-4">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Support */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-white flex items-center space-x-1.5 border-b border-white/5 pb-2">
                      <Truck className="w-4 h-4 text-google-green" />
                      <span>Shipping & Diagnostics</span>
                    </h4>
                    <div className="bg-white/3 border border-white/5 p-4 rounded-xl space-y-3 text-[11px]">
                      <p>
                        📦 <strong>Logistics Fulfillment:</strong> Items ship directly from official Google fulfillment hubs in Mountain View, California and Dublin, Ireland.
                      </p>
                      <p>
                        ⏱️ <strong>Estimated Transit:</strong> Domestic shipments arrive in 3-5 business days. International locations average 7-10 business days.
                      </p>
                      <p>
                        🔄 <strong>Loyalty Sync:</strong> Purchasing this item locally earns you <strong className="text-google-yellow">{selectedProduct.pointsValue} loyalty points</strong>, syncing directly into your Level 4 profile!
                      </p>
                    </div>
                  </div>

                </div>

                {/* 5. Related Products Section */}
                <div className="border-t border-white/5 pt-8 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-google-blue" />
                    <span>Related Official Gear</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {products
                      .filter((rp) => rp.id !== selectedProduct.id && rp.category === selectedProduct.category)
                      .slice(0, 3)
                      .map((rp) => (
                        <div 
                          key={rp.id}
                          onClick={() => handleOpenDetails(rp)}
                          className="p-3 bg-white/3 hover:bg-white/5 rounded-xl border border-white/5 cursor-pointer transition-all flex items-center space-x-3 group"
                        >
                          <img src={rp.image} alt={rp.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-lg bg-white/10" />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-white truncate uppercase group-hover:text-google-blue transition-colors">{rp.name}</h5>
                            <span className="text-[10px] font-mono text-google-green">${rp.price.toFixed(2)}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Drawer Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#0d0d16] border-l border-white/10 p-6 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center space-x-2 text-white">
                  <SlidersHorizontal className="w-4 h-4 text-google-blue" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Category</label>
                <div className="flex flex-col space-y-1">
                  {["All", "Apparel", "Drinkware", "Accessories", "Bags", "Stickers", "Collectibles"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat 
                          ? "bg-google-blue/15 text-google-blue border-l-2 border-google-blue pl-2.5" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Price Range</label>
                <div className="flex flex-col space-y-1">
                  {[
                    { id: "All", label: "All Prices" },
                    { id: "under-15", label: "Under $15" },
                    { id: "15-30", label: "$15 - $30" },
                    { id: "30-60", label: "$30 - $60" },
                    { id: "over-60", label: "Over $60" }
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedPriceRange === range.id 
                          ? "bg-google-green/15 text-google-green border-l-2 border-google-green pl-2.5" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color Filter */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest">Primary Color</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setSelectedColor("All")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
                      selectedColor === "All" 
                        ? "border-google-blue bg-google-blue/10 text-google-blue" 
                        : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    All
                  </button>
                  {allColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors capitalize ${
                        selectedColor.toLowerCase() === color.toLowerCase() 
                          ? "border-google-yellow bg-google-yellow/10 text-google-yellow" 
                          : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              {/* Reset & Apply Buttons */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="py-2.5 bg-google-blue hover:bg-google-blue/90 text-white font-extrabold text-xs uppercase rounded-xl transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
