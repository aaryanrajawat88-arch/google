export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "Wearables" | "Collectibles" | "Tech" | "Accessories" | "Apparel" | "Drinkware" | "Bags" | "Stickers";
  price: number;
  discountPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string; // main image url
  images: string[]; // gallery images (for 360 viewer & details)
  specs: Record<string, string>;
  variants: {
    name: string; // e.g. "Size", "Color"
    options: string[]; // e.g. ["S", "M", "L"] or ["Midnight Black", "Spider Red"]
  }[];
  pointsValue: number;
  inventory: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + variants serialized)
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>; // e.g., { Size: "L", Color: "Spider Red" }
}

export interface Coupon {
  code: string;
  discountType: "percent" | "fixed" | "free-shipping";
  value: number;
  description: string;
  minSpend?: number;
}

export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Pending";
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    variants: Record<string, string>;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  pointsEarned: number;
}

export interface UserProfile {
  name: string;
  email: string;
  points: number;
  level: number;
  nextLevelPoints: number;
  avatar: string;
  savedAddresses: {
    id: string;
    label: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }[];
  paymentMethods: {
    id: string;
    type: string;
    last4: string;
    expiry: string;
  }[];
  unlockedWallpapers: string[];
  claimableCoupons: Coupon[];
  ownedCoupons: string[]; // list of active coupon codes
}

export interface SpiderQuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    points: {
      peter: number;
      miles: number;
      gwen: number;
      miguel: number;
    };
  }[];
}

export interface SpiderCharacter {
  id: string;
  name: string;
  alias: string;
  description: string;
  image: string;
  accentColor: string;
  recommendedProduct: string; // product ID
}
