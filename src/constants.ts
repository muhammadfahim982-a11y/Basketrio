import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Fresh Produce', icon: 'Apple', slug: 'fresh-produce' },
  { id: '2', name: 'Dairy & Eggs', icon: 'Milk', slug: 'dairy-eggs' },
  { id: '3', name: 'Bakery', icon: 'Croissant', slug: 'bakery' },
  { id: '4', name: 'Meat & Seafood', icon: 'Beef', slug: 'meat-seafood' },
  { id: '5', name: 'Frozen Foods', icon: 'IceCream', slug: 'frozen-foods' },
  { id: '6', name: 'Pantry', icon: 'Container', slug: 'pantry' },
  { id: '7', name: 'Beverages', icon: 'Coffee', slug: 'beverages' },
  { id: '8', name: 'Household', icon: 'Home', slug: 'household' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Bananas',
    description: 'Fresh, organic bananas from local farms. Perfect for snacks or baking.',
    price: 1.29,
    originalPrice: 1.59,
    category: 'Fresh Produce',
    image: 'https://picsum.photos/seed/banana/400/400',
    rating: 4.8,
    reviews: 124,
    stock: 50,
    unit: 'lb',
    tags: ['Organic', 'Fresh'],
    nutrition: { calories: '105', fat: '0.4g', carbs: '27g', protein: '1.3g' }
  },
  {
    id: 'p2',
    name: 'Whole Milk (1 Gallon)',
    description: 'Farm-fresh whole milk with essential nutrients.',
    price: 3.49,
    category: 'Dairy & Eggs',
    image: 'https://picsum.photos/seed/milk/400/400',
    rating: 4.9,
    reviews: 89,
    stock: 20,
    unit: 'gal',
    tags: ['Fresh', 'Essential']
  },
  {
    id: 'p3',
    name: 'Sourdough Bread',
    description: 'Artisan sourdough bread, baked fresh daily with a crispy crust.',
    price: 4.99,
    originalPrice: 5.50,
    category: 'Bakery',
    image: 'https://picsum.photos/seed/bread/400/400',
    rating: 4.7,
    reviews: 56,
    stock: 15,
    unit: 'loaf',
    tags: ['Fresh Baked', 'Artisan']
  },
  {
    id: 'p4',
    name: 'Free-Range Chicken Breast',
    description: 'High-quality free-range chicken breast, no antibiotics.',
    price: 8.99,
    category: 'Meat & Seafood',
    image: 'https://picsum.photos/seed/chicken/400/400',
    rating: 4.6,
    reviews: 210,
    stock: 12,
    unit: 'lb',
    tags: ['High Protein', 'Free Range']
  },
  {
    id: 'p5',
    name: 'Avocado (Pack of 3)',
    description: 'Ripe and ready to eat avocados. Great for guacamole or toast.',
    price: 4.49,
    originalPrice: 5.99,
    category: 'Fresh Produce',
    image: 'https://picsum.photos/seed/avocado/400/400',
    rating: 4.5,
    reviews: 145,
    stock: 30,
    unit: 'pack',
    tags: ['Healthy', 'Fresh']
  },
  {
    id: 'p6',
    name: 'Greek Yogurt (32oz)',
    description: 'Creamy Greek yogurt, high in protein and probiotics.',
    price: 5.29,
    category: 'Dairy & Eggs',
    image: 'https://picsum.photos/seed/yogurt/400/400',
    rating: 4.8,
    reviews: 78,
    stock: 25,
    unit: 'tub',
    tags: ['Probiotic', 'Healthy']
  },
  {
    id: 'p7',
    name: 'Frozen Blueberries (1lb)',
    description: 'Wild frozen blueberries, perfect for smoothies.',
    price: 6.99,
    category: 'Frozen Foods',
    image: 'https://picsum.photos/seed/blueberries/400/400',
    rating: 4.9,
    reviews: 34,
    stock: 40,
    unit: 'bag',
    tags: ['Frozen', 'Antioxidant']
  },
  {
    id: 'p8',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed extra virgin olive oil for cooking and salads.',
    price: 12.99,
    originalPrice: 15.99,
    category: 'Pantry',
    image: 'https://picsum.photos/seed/oliveoil/400/400',
    rating: 4.7,
    reviews: 112,
    stock: 18,
    unit: 'bottle',
    tags: ['Pantry', 'Healthy Fat']
  }
];
