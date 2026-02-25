import { useEffect, useMemo, useState, useCallback } from "react";
import MyContext from "./myContext";
import { fetchProducts } from "../../firebase/products";

export default function MyState({ children }) {
 
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

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

 
  const placeOrder = useCallback((customer) => { //this is the order logic, it creates a new order and adds it to the orders state, then clears the cart.
  if (cartItems.length === 0)
    return { ok: false, message: "Cart is empty" };

  const newOrder = {
    id: `order-${Date.now()}`,
    items: cartItems,
    total: cartTotal,
    customer,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  setOrders((prev) => [newOrder, ...prev]);
  setCartItems([]);

  return { ok: true, orderId: newOrder.id };
}, [cartItems, cartTotal]);


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
    }),
    [products, productsLoading, productsError, cartItems, cartCount, cartTotal, orders, placeOrder]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}