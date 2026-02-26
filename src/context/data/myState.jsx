import { useEffect, useMemo, useState, useCallback } from "react";
import MyContext from "./myContext";
import { fetchProducts } from "../../firebase/products";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, deleteDoc, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { SiGnuprivacyguard } from "react-icons/si";


export default function MyState({ children }) {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest"); // this is my default role.
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
  search: "",
  minPrice: "",
  maxPrice: "",
  category: "All",
  lightQuality: "All",
  material: "All",
  features: [],
  inStockOnly: false,
  sort: "featured",
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

useEffect(() => {
  if (role !== "admin") return;

  const unsub = onSnapshot(collection(db, "orders"), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setOrders(list);
    setOrdersLoading(false);
  });

  return () => unsub();
}, [role]);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    setUser(u);

    if (!u) {
      setRole("guest");
      setAuthLoading(false);
      return;
    }

    try {
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRole(snap.data().role || "customer");
      } else {
        // If user exists in Auth but not in Firestore, create default customer record
        await setDoc(ref, {
          email: u.email,
          role: "customer",
          createdAt: serverTimestamp(),
        });
        setRole("customer");
      }
    } catch (e) {
      console.error("Role load failed:", e);
      setRole("customer"); // safe fallback
    } finally {
      setAuthLoading(false);
    }
  });

  return () => unsub();
}, []);

const signup = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Create user profile doc with default role
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role: "customer",
    createdAt: serverTimestamp(),
  });

  return cred.user;
};

const login = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

const logout = async () => {
  await signOut(auth);
};

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

 
  const placeOrder = useCallback(async (customer) => {
  if (!user) return { ok: false, message: "Not logged in" };
  if (cartItems.length === 0) return { ok: false, message: "Cart is empty" };

  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userEmail: user.email,
      items: cartItems,
      total: cartTotal,
      customer,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setCartItems([]);
    return { ok: true, orderId: orderRef.id };
  } catch (err) {
    console.error(err);
    return { ok: false, message: err.message };
  }
}, [user, cartItems, cartTotal]);

  const fetchCategories = async () => {
    setAdminError("");
    try {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort by name for nice dropdowns
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setCategories(list);
    } catch (e) {
      console.error(e);
      setAdminError(e.message);
    }
  };

const addCategory = useCallback(async (name) => {
  const clean = name.trim();
  if (!clean) return;

  setAdminLoading(true);
  setAdminError("");
  try {
    await addDoc(collection(db, "categories"), {
      name: clean,
      createdAt: serverTimestamp(),
    });
    await fetchCategories();
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
}, []);

const updateCategory = useCallback(async (id, name) => {
  const clean = name.trim();
  if (!clean) return;

  setAdminLoading(true);
  setAdminError("");

  try {
    await updateDoc(doc(db, "categories", id), {
      name: clean,
    });

    await fetchCategories();
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
}, []);

const deleteCategory = useCallback(async (id) => {
  setAdminLoading(true);
  setAdminError("");

  try {
    await deleteDoc(doc(db, "categories", id));
    await fetchCategories();
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
}, []);

const addProduct = async (product) => {
  setAdminLoading(true);
  setAdminError("");
  try {
    await addDoc(collection(db, "products"), {
      ...product,
      tags: product.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
};

const updateProduct = async (id, updates) => {
  setAdminLoading(true);
  setAdminError("");
  try {
    await updateDoc(doc(db, "products", id), {
      ...updates,
      tags: updates.tags || [],
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
};

const deleteProduct = async (id) => {
  setAdminLoading(true);
  setAdminError("");
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (e) {
    setAdminError(e.message);
  } finally {
    setAdminLoading(false);
  }
};

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
      ordersLoading,
      placeOrder,
      filters,
      setFilters,
      filteredProducts,
      user,
      role,
      authLoading,
      signup,
      login,
      logout,
      categories,
      fetchCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      adminLoading,
      adminError,
    }),
    [products, productsLoading, productsError, cartItems, cartCount, cartTotal, orders, placeOrder, filters, filteredProducts, user, role, authLoading, categories, adminLoading, adminError, addCategory, deleteCategory, updateCategory, ordersLoading ]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}