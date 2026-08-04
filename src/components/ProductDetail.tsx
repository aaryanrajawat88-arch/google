import React, { useState } from "react";
import { Star, Sparkles, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ChevronLeft, RotateCcw } from "lucide-react";
import { Product } from "../types";
import { PRODUCTS } from "../data";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, variants: Record<string, string>) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onViewProduct: (productId: string) => void;
}

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onViewProduct
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants.forEach((v) => {
      initial[v.name] = v.options[0];
    });
    return initial;
  });
  
  // 360-degree gallery drag rotation simulation
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariants);
  };

  // Simulate 360 drag rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!is360Mode) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !is360Mode) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 15) {
      // Rotate index based on dragging direction
      const step = diff > 0 ? -1 : 1;
      setRotationIndex((prev) => (prev + step + 8) % 8); // 8 simulated angles
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate simulated 360 images based on the category or seed
  const get360ImageSrc = (index: number) => {
    return `https://picsum.photos/seed/${product.id}-360-${index}/800/800`;
  };

  // Related products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 select-none">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white font-mono tracking-wider mb-8 transition-colors uppercase cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-google-blue" />
        <span>Return to Grid</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Media Gallery & 360-degree Interactive Frame */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative aspect-square w-full rounded-2xl glass-panel border border-white/8 bg-[#0a0a0f] overflow-hidden flex items-center justify-center">
            
            {/* 360 Rotation Mode vs Standard Image */}
            {is360Mode ? (
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full flex flex-col items-center justify-center cursor-ew-resize relative"
              >
                <img
                  src={get360ImageSrc(rotationIndex)}
                  alt="360 view product"
                  className="w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* 360 Indicator Overlay */}
                <div className="absolute top-4 left-4 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-google-blue text-[9px] font-mono tracking-widest uppercase">
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  <span>360° Interactive drag</span>
                </div>
              </div>
            ) : (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Loyalty points banner tag */}
            <div className="absolute bottom-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/80 border border-white/5 text-xs font-mono tracking-wider text-google-yellow shadow-lg">
              <Sparkles className="w-4 h-4 text-google-yellow" />
              <span>Earns +{product.pointsValue} Multiverse Points</span>
            </div>
          </div>

          {/* Thumbnail Gallery & 360 Switch */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-1.5">
            {/* 360 Activation Thumbnail */}
            <button
              onClick={() => setIs360Mode(true)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                is360Mode
                  ? "bg-google-blue/20 border-google-blue shadow-lg"
                  : "glass-panel border-white/10 hover:border-white/20"
              }`}
            >
              <RotateCcw className="w-4 h-4 text-white" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-300">
                360° View
              </span>
            </button>

            {/* Standard static images thumbnails */}
            {product.images.map((img, i) => (
              <button
                key={`thumb-${i}`}
                onClick={() => {
                  setIs360Mode(false);
                  setSelectedImage(img);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border transition-all ${
                  !is360Mode && selectedImage === img
                    ? "border-google-blue shadow-lg"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Info & Specifications */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Brand Category Tag */}
            <div className="text-[10px] font-mono tracking-[0.25em] text-google-blue uppercase mb-2">
              GOOGLE × SPIDER-MAN COLLAB
            </div>

            {/* Main title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 leading-none">
              {product.name}
            </h1>

            {/* Short slogan */}
            <p className="text-sm font-semibold text-google-blue mb-4">
              {product.tagline}
            </p>

            {/* Price section SECTION */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-3xl font-black text-white">
                ${activePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through font-mono">
                  ${product.price.toFixed(2)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-black text-google-green bg-google-green/10 border border-google-green/15 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Save ${(product.price - product.discountPrice!).toFixed(2)}
                </span>
              )}
            </div>

            {/* Long description */}
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Customizable interactive variants */}
            <div className="space-y-6 mb-8">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-2.5">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    Select {v.name}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleVariantSelect(v.name, opt)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedVariants[v.name] === opt
                            ? "bg-google-blue border-google-blue text-white shadow-[0_0_12px_rgba(66,133,244,0.3)]"
                            : "glass-panel text-gray-300 border-white/8 hover:bg-white/5"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Availability status */}
            <div className="flex items-center space-x-2 text-xs text-google-green font-mono mb-8 bg-google-green/5 border border-google-green/10 p-3 rounded-xl max-w-sm">
              <ShieldCheck className="w-4 h-4 text-google-green" />
              <span>In Stock • Ready to dispatch across multidimensional zones</span>
            </div>

            {/* Dual CTA Actions */}
            <div className="flex items-center space-y-0 gap-4 mb-8">
              {/* Add to Cart Bag */}
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-4 bg-google-blue hover:bg-google-blue/90 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(66,133,244,0.35)] hover:shadow-[0_0_25px_rgba(66,133,244,0.5)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Transmit to Cart</span>
              </button>

              {/* Wishlist Icon */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  isWishlisted
                    ? "bg-google-red/10 border-google-red text-google-red shadow-lg"
                    : "glass-panel border-white/8 text-gray-300 hover:text-white"
                }`}
                aria-label="Wishlist Detail"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-google-red" : ""}`} />
              </button>
            </div>

            {/* Quick Guarantees (Shipping and returns) */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-gray-400">
              <div className="flex items-start space-x-2 text-[11px]">
                <Truck className="w-4 h-4 text-google-blue flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">
                    Fast Portal Shipping
                  </div>
                  <div>Standard 2-4 day shipping across standard US states.</div>
                </div>
              </div>
              <div className="flex items-start space-x-2 text-[11px]">
                <RefreshCw className="w-4 h-4 text-google-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">
                    Multiverse Returns
                  </div>
                  <div>Enjoy free returns within 30 days of standard receipt.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Diagnostics specs table panel */}
      <div className="mt-16 border-t border-white/5 pt-12">
        <h3 className="text-base font-bold text-white uppercase tracking-widest mb-6 font-mono border-b border-white/5 pb-2">
          ⚙️ Technical Diagnostics & Specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between border-b border-white/5 py-2.5 text-xs">
              <span className="text-gray-400 font-medium">{key}</span>
              <span className="text-white font-mono text-right pl-4">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended products list underneath */}
      <div className="mt-20">
        <h3 className="text-lg font-black text-white tracking-tight mb-6">
          People also viewed
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((p) => {
            const relPrice = p.discountPrice ?? p.price;
            return (
              <div
                key={p.id}
                onClick={() => onViewProduct(p.id)}
                className="p-4 rounded-xl glass-panel border border-white/8 hover:border-spider-red/20 flex space-x-4 cursor-pointer transition-all hover:shadow-lg"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 rounded-lg bg-white/5 object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate mb-0.5">
                    {p.name}
                  </h4>
                  <div className="text-[10px] text-gray-400 line-clamp-1 mb-1.5">
                    {p.tagline}
                  </div>
                  <div className="text-xs font-black text-spider-red">
                    ${relPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
