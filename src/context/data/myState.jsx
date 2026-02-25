import { useEffect, useMemo, useState, useCallback } from "react";
import MyContext from "./myContext";
import { fetchProducts } from "../../firebase/products";
import { createOrder } from "../../firebase/orders";

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
    }),
    [products, productsLoading, productsError, cartItems, cartCount, cartTotal, orders, placeOrder]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}