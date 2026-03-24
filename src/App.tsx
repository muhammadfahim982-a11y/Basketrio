import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Zap,
  Apple,
  Milk,
  Croissant,
  Beef,
  IceCream,
  Container,
  Coffee,
  Home as HomeIcon,
  Heart,
  ArrowLeft,
  Sparkles,
  ChefHat,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category } from './types';
import { cn } from './lib/utils';
import { getSmartSuggestions, getRecipeRecommendations } from './services/gemini';

// --- Context / State Management ---
// For simplicity in this single-file-ish approach, we'll pass props or use a simple context-like pattern

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
            <Route path="/category/:slug" element={<CategoryPage onAddToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} total={cartTotal} />} />
          </Routes>
        </main>

        <Footer />

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          onUpdateQty={updateQuantity} 
          onRemove={removeFromCart}
          total={cartTotal}
        />
      </div>
    </Router>
  );
}

// --- Components ---

function Header({ cartCount, onOpenCart }: { cartCount: number, onOpenCart: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        const res = await getSmartSuggestions(searchQuery);
        setSuggestions(res);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-line">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Apple size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-ink hidden sm:block">FreshCart</span>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fresh groceries..." 
              className="w-full bg-background border border-line rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isSearching ? <Loader2 className="animate-spin text-primary" size={20} /> : <Search className="text-ink-muted" size={20} />}
            </div>

            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl border border-line shadow-2xl overflow-hidden"
                >
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest border-b border-line mb-1">
                      <Sparkles size={12} /> AI Suggestions
                    </div>
                    {suggestions.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setSearchQuery(s);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-background rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
                      >
                        <Search size={16} className="text-ink-muted" />
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-ink hover:bg-background rounded-full transition-colors">
              <User size={24} />
            </button>
            <button 
              onClick={onOpenCart}
              className="p-2 text-ink hover:bg-background rounded-full transition-colors relative"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-ink hover:bg-background rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-line overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-background border border-line rounded-full py-2 pl-10 pr-4 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
              </div>
              <nav className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-background rounded-xl text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <CategoryIcon name={cat.icon} size={18} />
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HomePage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
            alt="Fresh Groceries" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative h-full flex flex-col justify-center text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <span className="inline-block bg-primary px-4 py-1 rounded-full text-sm font-bold mb-6">
              FREE DELIVERY ON FIRST ORDER
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Fresh Groceries <br />
              <span className="text-primary">Delivered Fast</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Shop the freshest produce, dairy, and essentials from local farms delivered straight to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary text-lg px-8">Shop Now</button>
              <button className="btn bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-8">
                Browse Deals
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Within 2 hours' },
            { icon: ShieldCheck, title: 'Fresh Guarantee', desc: '100% money back' },
            { icon: Zap, title: 'Best Prices', desc: 'Daily discounts' },
            { icon: CheckCircle2, title: 'Local Farms', desc: 'Fresh & Organic' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-6 bg-surface rounded-2xl border border-line">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="text-xs text-ink-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-ink">Shop by Category</h2>
          <Link to="/categories" className="text-primary font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center p-6 bg-surface rounded-3xl border border-line hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-ink-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
                <CategoryIcon name={cat.icon} size={32} />
              </div>
              <span className="text-sm font-bold text-center group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-ink">Flash Deals</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
              ENDING SOON
            </span>
          </div>
          <Link to="/deals" className="text-primary font-bold flex items-center gap-1 hover:underline">
            See All Deals <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.filter(p => p.originalPrice).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-ink rounded-[2rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&q=80&w=1000" alt="Pattern" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="relative p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get <span className="text-primary">$20 OFF</span> Your First Weekly Box
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Join our subscription plan and get fresh groceries delivered every week with extra savings.
              </p>
              <button className="btn btn-primary text-lg px-10">Get Started</button>
            </div>
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold">1</div>
                <p className="font-medium">Choose your preferences</p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold">2</div>
                <p className="font-medium">Select delivery frequency</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold">3</div>
                <p className="font-medium">Enjoy fresh groceries!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-ink">Best Sellers</h2>
          <Link to="/best-sellers" className="text-primary font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryPage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const { slug } = useParams();
  const category = CATEGORIES.find(c => c.slug === slug);
  const products = PRODUCTS.filter(p => p.category === category?.name);

  if (!category) return <div className="p-20 text-center">Category not found</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <span className="text-ink font-medium">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.slug}`}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                    cat.slug === slug ? "bg-primary/10 text-primary font-bold" : "hover:bg-background text-ink-muted"
                  )}
                >
                  {cat.name}
                  <span className="text-[10px] bg-background px-2 py-0.5 rounded-full border border-line">
                    {PRODUCTS.filter(p => p.category === cat.name).length}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Price Range</h3>
            <div className="space-y-4">
              <input type="range" className="w-full accent-primary" />
              <div className="flex items-center justify-between text-sm font-medium">
                <span>$0</span>
                <span>$50+</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Dietary Needs</h3>
            <div className="space-y-2">
              {['Organic', 'Gluten Free', 'Vegan', 'Sugar Free'].map(tag => (
                <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded border-line text-primary focus:ring-primary" />
                  <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">{category.name}</h1>
              <p className="text-ink-muted">{products.length} products found</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-ink-muted">Sort by:</span>
              <select className="bg-surface border border-line rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [qty, setQty] = useState(1);

  if (!product) return <div className="p-20 text-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-12">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/category/${CATEGORIES.find(c => c.name === product.category)?.slug}`} className="hover:text-primary">
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface rounded-[2.5rem] border border-line overflow-hidden group relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {product.originalPrice && (
              <span className="absolute top-6 left-6 bg-red-500 text-white font-bold px-4 py-1 rounded-full text-sm">
                SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-surface rounded-2xl border border-line overflow-hidden cursor-pointer hover:border-primary transition-colors">
                <img src={product.image} alt="" className="w-full h-full object-cover opacity-60 hover:opacity-100" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
              <Star size={16} fill="currentColor" />
              <span>{product.rating}</span>
              <span className="text-ink-muted font-medium">({product.reviews} reviews)</span>
            </div>
            <h1 className="text-5xl font-bold text-ink mb-4">{product.name}</h1>
            <p className="text-lg text-ink-muted leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-2xl text-ink-muted line-through mb-1">${product.originalPrice}</span>
            )}
            <span className="text-ink-muted mb-1">/ {product.unit}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-background border border-line rounded-full p-1">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface rounded-full transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-ink hover:bg-surface rounded-full transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <button 
              onClick={() => {
                for(let i=0; i<qty; i++) onAddToCart(product);
              }}
              className="btn btn-primary flex-1 text-lg h-14"
            >
              Add to Cart
            </button>
            <button className="w-14 h-14 border-2 border-line rounded-full flex items-center justify-center text-ink-muted hover:text-red-500 hover:border-red-500 transition-all">
              <Heart size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-line">
            <div className="flex items-center gap-3">
              <Truck className="text-primary" size={24} />
              <div>
                <p className="text-sm font-bold">Free Delivery</p>
                <p className="text-xs text-ink-muted">Orders over $35</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24} />
              <div>
                <p className="text-sm font-bold">1 Year Warranty</p>
                <p className="text-xs text-ink-muted">Freshness guaranteed</p>
              </div>
            </div>
          </div>

          {product.nutrition && (
            <div className="bg-background rounded-3xl p-8 border border-line">
              <h3 className="font-bold text-lg mb-6">Nutritional Facts</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-ink">{product.nutrition.calories}</p>
                  <p className="text-xs text-ink-muted uppercase font-bold tracking-wider">Calories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">{product.nutrition.fat}</p>
                  <p className="text-xs text-ink-muted uppercase font-bold tracking-wider">Fat</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">{product.nutrition.carbs}</p>
                  <p className="text-xs text-ink-muted uppercase font-bold tracking-wider">Carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">{product.nutrition.protein}</p>
                  <p className="text-xs text-ink-muted uppercase font-bold tracking-wider">Protein</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, total }: { cart: CartItem[], total: number }) {
  const navigate = useNavigate();
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-ink mb-12">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Info */}
          <section className="bg-surface rounded-3xl border border-line p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-2xl font-bold">Shipping Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-muted">First Name</label>
                <input type="text" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-muted">Last Name</label>
                <input type="text" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-ink-muted">Address</label>
                <input type="text" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-muted">City</label>
                <input type="text" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-muted">Postal Code</label>
                <input type="text" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="bg-surface rounded-3xl border border-line p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-2xl font-bold">Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {['Credit Card', 'PayPal', 'Apple Pay'].map(method => (
                <button key={method} className="p-4 border-2 border-line rounded-2xl text-center font-bold hover:border-primary hover:bg-primary/5 transition-all">
                  {method}
                </button>
              ))}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-muted">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-muted">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-muted">CVV</label>
                  <input type="text" placeholder="000" className="w-full bg-background border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="space-y-8">
          <div className="bg-surface rounded-3xl border border-line p-8 sticky top-32">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">x{item.quantity}</span>
                    <span className="text-ink font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-8 border-t border-line">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Delivery</span>
                <span className="text-primary font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-ink pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-8 h-14 text-lg">
              Place Order
            </button>
            <p className="text-center text-xs text-ink-muted mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Secure encrypted payment
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product) => void, key?: string }) {
  const navigate = useNavigate();

  return (
    <div className="card group">
      <div 
        className="aspect-square overflow-hidden cursor-pointer relative"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.originalPrice && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-ink-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Heart size={20} />
        </button>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-secondary">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        </div>
        <h3 
          className="font-bold text-ink leading-tight hover:text-primary cursor-pointer transition-colors line-clamp-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="text-xs text-ink-muted line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-ink">${product.price}</span>
            <span className="text-[10px] text-ink-muted">per {product.unit}</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ isOpen, onClose, cart, onUpdateQty, onRemove, total }: { 
  isOpen: boolean, 
  onClose: () => void, 
  cart: CartItem[], 
  onUpdateQty: (id: string, d: number) => void,
  onRemove: (id: string) => void,
  total: number
}) {
  const navigate = useNavigate();
  const freeDeliveryThreshold = 35;
  const progress = Math.min(100, (total / freeDeliveryThreshold) * 100);
  const [recipe, setRecipe] = useState<{ title: string, ingredients: string[], instructions: string[] } | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const fetchRecipe = async () => {
    if (cart.length === 0) return;
    setIsLoadingRecipe(true);
    const res = await getRecipeRecommendations(cart.map(i => i.name));
    setRecipe(res);
    setIsLoadingRecipe(false);
  };

  useEffect(() => {
    if (isOpen && cart.length > 0 && !recipe) {
      fetchRecipe();
    }
  }, [isOpen, cart.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Your Cart <span className="text-ink-muted text-sm font-medium">({cart.length} items)</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-ink-muted">
                    <ShoppingCart size={40} />
                  </div>
                  <p className="text-lg font-bold">Your cart is empty</p>
                  <button onClick={onClose} className="btn btn-primary">Start Shopping</button>
                </div>
              ) : (
                <>
                  {/* Free Delivery Progress */}
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      {total >= freeDeliveryThreshold ? (
                        <span className="text-primary flex items-center gap-1">
                          <CheckCircle2 size={16} /> Free delivery unlocked!
                        </span>
                      ) : (
                        <span>Add <span className="text-primary">${(freeDeliveryThreshold - total).toFixed(2)}</span> more for free delivery</span>
                      )}
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 bg-background rounded-2xl border border-line group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                            <button 
                              onClick={() => onRemove(item.id)}
                              className="text-ink-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-ink-muted">${item.price} / {item.unit}</p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center bg-surface border border-line rounded-lg p-0.5">
                              <button 
                                onClick={() => onUpdateQty(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-background rounded transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQty(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-background rounded transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Recipe Suggestion */}
                  <div className="bg-ink rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ChefHat size={80} />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                        <Sparkles size={14} /> AI Recipe Suggestion
                      </div>
                      {isLoadingRecipe ? (
                        <div className="flex items-center gap-3 py-4">
                          <Loader2 className="animate-spin text-primary" size={20} />
                          <span className="text-sm text-white/60 italic">Thinking of something delicious...</span>
                        </div>
                      ) : recipe ? (
                        <div className="space-y-4">
                          <h4 className="text-xl font-bold">{recipe.title}</h4>
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Instructions</p>
                            <p className="text-xs text-white/80 line-clamp-3">{recipe.instructions[0]}</p>
                          </div>
                          <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                            View Full Recipe <ChevronRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={fetchRecipe} className="text-sm text-white/60 hover:text-white transition-colors">
                          Get a recipe based on your cart
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upsell */}
                  <div className="pt-6 border-t border-line">
                    <h4 className="font-bold text-sm mb-4">Frequently Bought Together</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {PRODUCTS.filter(p => !cart.find(c => c.id === p.id)).slice(0, 3).map(p => (
                        <div key={p.id} className="min-w-[140px] bg-background rounded-xl p-3 border border-line text-center space-y-2">
                          <img src={p.image} alt={p.name} className="w-12 h-12 mx-auto rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <p className="text-[10px] font-bold line-clamp-1">{p.name}</p>
                          <p className="text-xs font-bold text-primary">${p.price}</p>
                          <button className="w-full py-1 bg-primary text-white text-[10px] font-bold rounded-lg">Add</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-surface border-t border-line space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted font-medium">Subtotal</span>
                  <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="btn btn-primary w-full h-14 text-lg flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <Apple size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight">FreshCart</span>
            </Link>
            <p className="text-white/60 leading-relaxed">
              Your neighborhood grocery store, delivered to your door. Fresh, organic, and fast.
            </p>
            <div className="flex gap-4">
              {['FB', 'TW', 'IG', 'LI'].map(s => (
                <div key={s} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/60">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="hover:text-primary transition-colors">Daily Deals</Link></li>
              <li><Link to="/subscription" className="hover:text-primary transition-colors">Subscription</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-white/60">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/track" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-white/60 text-sm">Subscribe to get $10 off your first order.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/40 text-sm">
          <p>© 2026 FreshCart. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CategoryIcon({ name, size = 24 }: { name: string, size?: number, key?: string }) {
  switch (name) {
    case 'Apple': return <Apple size={size} />;
    case 'Milk': return <Milk size={size} />;
    case 'Croissant': return <Croissant size={size} />;
    case 'Beef': return <Beef size={size} />;
    case 'IceCream': return <IceCream size={size} />;
    case 'Container': return <Container size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Home': return <HomeIcon size={size} />;
    default: return <Apple size={size} />;
  }
}

export default App;
