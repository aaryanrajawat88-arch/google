import React from "react";
import { Heart, Star, Sparkles, Plus } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (productId: string) => void;
  onAddToCart: (product: Product, variants: Record<string, string>) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  // Use discount price if active
  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pre-select first options of each variant as default for quick-add
    const defaultVariants: Record<string, string> = {};
    product.variants.forEach((v) => {
      defaultVariants[v.name] = v.options[0];
    });
    onAddToCart(product, defaultVariants);
  };

  return (
    <div
      onClick={() => onViewDetails(product.id)}
      className="group relative flex flex-col h-full rounded-2xl glass-panel border border-white/8 hover:border-google-blue/30 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(66,133,244,0.15)]"
    >
      {/* Product Tagging (New or Best Seller) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        {product.isNew && (
          <span className="bg-google-blue text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-md">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-spider-red text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-md">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Heart Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-full glass-panel hover:bg-white/10 text-gray-300 hover:text-spider-red transition-all active:scale-90"
        aria-label="Add to Wishlist"
      >
        <Heart
          className={`w-3.5 h-3.5 ${isWishlisted ? "fill-spider-red text-spider-red" : ""}`}
        />
      </button>

      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-[#0c0c12] overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic Dark Gradient Shader on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-transparent opacity-60" />

        {/* Points indicator tag */}
        <div className="absolute bottom-3 left-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-black/70 border border-white/5 text-[9px] font-mono tracking-wider text-google-yellow">
          <Sparkles className="w-3 h-3 text-google-yellow" />
          <span>+{product.pointsValue} Points</span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-1">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug mb-1 group-hover:text-google-blue transition-colors">
            {product.name}
          </h3>

          {/* Tagline snippet */}
          <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">
            {product.tagline}
          </p>

          {/* Ratings & reviews */}
          <div className="flex items-center space-x-1 mb-3">
            <Star className="w-3 h-3 fill-google-yellow text-google-yellow" />
            <span className="text-[10px] font-bold text-gray-300">{product.rating}</span>
            <span className="text-[10px] text-gray-500 font-mono">({product.reviewsCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          {/* Price container */}
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm font-black text-white">
              ${activePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-500 line-through font-mono">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Plus Add to Cart button */}
          <button
            onClick={handleQuickAdd}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-google-blue/20 text-white hover:text-white border border-white/10 hover:border-google-blue/30 transition-all active:scale-90 flex items-center justify-center cursor-pointer"
            title="Quick Add to Web"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
