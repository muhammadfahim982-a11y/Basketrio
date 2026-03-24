export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  unit: string;
  tags?: string[];
  nutrition?: {
    calories: string;
    fat: string;
    carbs: string;
    protein: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
}
