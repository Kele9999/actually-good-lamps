import { useEffect, useMemo, useState, useCallback } from "react";
import MyContext from "./myContext";
import { fetchProducts } from "../../firebase/products";
import { createOrder } from "../../firebase/orders";

export default function MyState({ children }) {
 
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
  search: "",
  minPrice: "",
  maxPrice: "",
  category: "All",
  lightQuality: "All",
  material: "All",
  features: [], // array
  inStockOnly: false,
  sort: "featured",
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

const filteredProducts = useMemo(() => {
  const q = filters.search.trim().toLowerCase();
  const min = filters.minPrice === "" ? null : Number(filters.minPrice);
  const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

  const filtered = products.filter((p) => {
    // search
    if (q) {
      const hay = `${p.name || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // price
    const price = Number(p.price) || 0;
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;

    // category
    if (filters.category !== "All" && p.category !== filters.category) return false;

    // lightQuality
    if (filters.lightQuality !== "All" && p.lightQuality !== filters.lightQuality) return false;

    // material
    if (filters.material !== "All" && p.material !== filters.material) return false;

    // features
    if (filters.features.length > 0) {
      const feats = Array.isArray(p.features) ? p.features : [];
      const ok = filters.features.every((f) => feats.includes(f));
      if (!ok) return false;
    }

    // stock
    if (filters.inStockOnly && (Number(p.stock) || 0) <= 0) return false;

    return true;
  });

  // ✅ Sorting (make a copy so we don't mutate state)
  const sorted = [...filtered];

  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case "name-asc":
      sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      break;
    case "featured":
    default:
      // keep original order
      break;
  }

  return sorted;
}, [products, filters]);

  useEffect(() => {
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setProductsError(null);
    } catch (err) {
      setProductsError(err.message || "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  loadProducts();
  }, []);


  const addToCart = (product, qty = 1) => { //this method is the cart logic.
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

 
  const placeOrder = useCallback(
  async (customer) => {
    if (cartItems.length === 0) return { ok: false, message: "Cart is empty" };

    try {
      const orderId = await createOrder({
        items: cartItems,
        total: cartTotal,
        customer,
      });

      // keeping this local list for the dashboard.
      const localOrder = {
        id: orderId,
        items: cartItems,
        total: cartTotal,
        customer,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setOrders((prev) => [localOrder, ...prev]);

      setCartItems([]); // clear cart on successful order
      return { ok: true, orderId };
    } catch (err) {
      return { ok: false, message: err?.message || "Failed to place order" };
    }
  },
  [cartItems, cartTotal]
);

  const value = useMemo(
    () => ({
      products,
      productsLoading,
      productsError,
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,
      orders,
      placeOrder,
      filters,
      setFilters,
      filteredProducts,
    }),
    [products, productsLoading, productsError, cartItems, cartCount, cartTotal, orders, placeOrder, filters, filteredProducts]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}