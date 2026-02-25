import { useMemo, useState } from "react";
import MyContext from "./myContext";

const starterProducts = [
  {
    id: "lamp-001",
    name: "Warm Glow Table Lamp",
    price: 799,
    category: "Table Lamps",
    imageUrl: "https://via.placeholder.com/300",
    description: "A cozy lamp for your bedside or desk.",
  },
  {
    id: "lamp-002",
    name: "Minimalist Floor Lamp",
    price: 1299,
    category: "Floor Lamps",
    imageUrl: "https://via.placeholder.com/300",
    description: "Clean lines, soft light, modern vibe.",
  },
];

export default function MyState({ children }) {
  const [products, setProducts] = useState(starterProducts);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  

  const addToCart = (product, qty = 1) => {
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

  const placeOrder = (customer) => {
    if (cartItems.length === 0) return { ok: false, message: "Cart is empty" };

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
  };

  const value = {
    products,
    setProducts,
    cartItems,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartCount,
    cartTotal,
    orders,
    placeOrder,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}