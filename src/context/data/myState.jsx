import { useCallback, useEffect, useMemo, useState } from "react";
import MyContext from "./myContext";

import { fetchProducts } from "../../firebase/products";
import { auth, db } from "../../firebase/firebase";

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  where,
  query,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getFunctionsBaseUrl() {
  const customBase = String(import.meta.env.VITE_FUNCTIONS_BASE_URL || "").trim();
  if (customBase) return customBase.replace(/\/+$/, "");

  const useEmu =
    String(import.meta.env.VITE_USE_EMULATORS || "").toLowerCase() === "true";

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing VITE_FIREBASE_PROJECT_ID");

  if (useEmu) return `http://127.0.0.1:5001/${projectId}/us-central1`;
  return `https://us-central1-${projectId}.cloudfunctions.net`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

// ─── MyState ────────────────────────────────────────────────────────────────

export default function MyState({ children }) {

  // ── Auth ──
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [authLoading, setAuthLoading] = useState(true);

  // ── Products ──
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // ── Filters ──
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

  // ── AI Search ──
  const [aiQuery, setAiQuery] = useState("");
  const [aiResultIds, setAiResultIds] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const clearAiResults = useCallback(() => {
    setAiQuery("");
    setAiResultIds([]);
    setAiError("");
    setAiLoading(false);
  }, []);

  // ── Cart ──
  const [cartItems, setCartItems] = useState([]);

  const cartStorageKey = useMemo(() => {
    return `agl_cart_v1:${user?.uid || "guest"}`;
  }, [user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartStorageKey);
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    }
  }, [cartStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems, cartStorageKey]);

  // ── Admin ──
  const [categories, setCategories] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // User order history (for customer role)
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  // ── Wishlist ──
  const GUEST_WISHLIST_KEY = "agl_guest_wishlist_v1";
  const [guestWishlist, setGuestWishlist] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(GUEST_WISHLIST_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist));
    } catch {
      // ignore
    }
  }, [guestWishlist]);

  const [wishlist, setWishlist] = useState([]);

  // ── Auth listener ──
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
          await setDoc(ref, {
            email: u.email,
            role: "customer",
            createdAt: serverTimestamp(),
          });
          setRole("customer");
        }
      } catch (e) {
        console.error("Role load failed:", e);
        setRole("customer");
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ── User orders listener ──

  useEffect(() => {
  if (!user) { setUserOrders([]); return; }

  setUserOrdersLoading(true);
  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid)
  );

  const unsub = onSnapshot(q, (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    setUserOrders(list);
    setUserOrdersLoading(false);
  });

  return () => unsub();
}, [user]);

  // ── Wishlist listener ──
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const ref = collection(db, "users", user.uid, "wishlist");
    const unsub = onSnapshot(ref, (snap) => {
      setWishlist(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  const wishlistItems = useMemo(() => {
    return user ? wishlist : guestWishlist;
  }, [user, wishlist, guestWishlist]);

  const wishlistIds = useMemo(() => {
    return new Set(wishlistItems.map((w) => w.productId || w.id));
  }, [wishlistItems]);

  const toggleWishlist = useCallback(
    async (product) => {
      const id = product?.id;
      if (!id) return;

      if (!user) {
        setGuestWishlist((prev) => {
          const exists = prev.find((p) => p.id === id);
          return exists ? prev.filter((p) => p.id !== id) : [...prev, product];
        });
        return;
      }

      const saved = wishlistIds.has(id);
      const ref = doc(db, "users", user.uid, "wishlist", id);

      if (saved) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, {
          productId: id,
          name: product.name || "",
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl || "",
          categoryId: product.categoryId || "",
          categoryName: product.categoryName || "",
          createdAt: serverTimestamp(),
        });
      }
    },
    [user, wishlistIds],
  );

  // ── Products load ──
  useEffect(() => {
    const load = async () => {
      try {
        setProductsLoading(true);
        const data = await fetchProducts();
        setProducts(data || []);
        setProductsError(null);
      } catch (err) {
        setProductsError(err?.message || "Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, []);

  // ── Filtered products ──
  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const min = filters.minPrice === "" ? null : Number(filters.minPrice);
    const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    const filtered = products.filter((p) => {
      if (q) {
        const hay = `${p.name || ""} ${p.description || ""} ${p.categoryName || ""} ${p.material || ""} ${
          Array.isArray(p.tags) ? p.tags.join(" ") : ""
        } ${Array.isArray(p.features) ? p.features.join(" ") : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      const price = Number(p.price) || 0;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;

      if (filters.category !== "All") {
        const productCategoryId = p.categoryId || "";
        const productCategoryName = p.categoryName || p.category || "";
        if (
          filters.category !== productCategoryId &&
          filters.category !== productCategoryName
        ) {
          return false;
        }
      }

      if (filters.lightQuality !== "All" && p.lightQuality !== filters.lightQuality)
        return false;
      if (filters.material !== "All" && p.material !== filters.material)
        return false;

      if (filters.features.length > 0) {
        const feats = Array.isArray(p.features) ? p.features : [];
        if (!filters.features.every((f) => feats.includes(f))) return false;
      }

      if (filters.inStockOnly && (Number(p.stock) || 0) <= 0) return false;

      return true;
    });

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
      default:
        break;
    }

    return sorted;
  }, [products, filters]);

  // ── AI results → real products ──
  const aiResultsProducts = useMemo(() => {
    if (!aiResultIds.length) return [];
    const map = new Map(products.map((p) => [p.id, p]));
    return aiResultIds.map((id) => map.get(id)).filter(Boolean);
  }, [aiResultIds, products]);

  // ── AI text search ──
  const aiSearch = useCallback(async (query) => {
    const q = String(query || "").trim();
    if (!q) return { ok: false, message: "Missing query" };

    setAiLoading(true);
    setAiError("");
    setAiQuery(q);

    try {
      const base = getFunctionsBaseUrl();
      const res = await fetch(`${base}/aiProductSearch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        const msg = data?.message || `AI search failed (${res.status})`;
        setAiError(msg);
        setAiResultIds([]);
        return { ok: false, message: msg };
      }

      const ids = Array.isArray(data?.ids) ? data.ids : [];
      setAiResultIds(ids);
      return { ok: true, ids };
    } catch (e) {
      const msg = e?.message || "AI search failed";
      setAiError(msg);
      setAiResultIds([]);
      return { ok: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  }, []);

  // ── AI image search ──
  const aiImageSearch = useCallback(async (file, query = "") => {
    if (!file) return { ok: false, message: "Missing image file" };
    if (!String(file.type || "").startsWith("image/"))
      return { ok: false, message: "Please upload an image file" };

    setAiLoading(true);
    setAiError("");

    try {
      const base = getFunctionsBaseUrl();
      const imageDataUrl = await fileToDataUrl(file);

      const res = await fetch(`${base}/aiImageSearch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, query: String(query || "").trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        const msg = data?.message || `AI image search failed (${res.status})`;
        setAiError(msg);
        setAiResultIds([]);
        return { ok: false, message: msg };
      }

      const ids = Array.isArray(data?.ids) ? data.ids : [];
      setAiResultIds(ids);
      return { ok: true, ids, extractedQuery: String(data?.extractedQuery || "") };
    } catch (e) {
      const msg = e?.message || "AI image search failed";
      setAiError(msg);
      setAiResultIds([]);
      return { ok: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  }, []);

  const generateProduct = useCallback(async (prompt) => {
  try {
    const base = getFunctionsBaseUrl();
    const res = await fetch(`${base}/generateProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data; // { ok: true, product: {...} } or { ok: false, message: "..." }
  } catch (e) {
    return { ok: false, message: e?.message || "Network error" };
  }
}, []);

  // ── Cart actions ──
  const addToCart = useCallback((product, qty = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setCartItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: safeQty } : it)),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
    [cartItems],
  );

  // ── Orders ──
  useEffect(() => {
    if (role !== "admin") return;

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setOrdersLoading(false);
    });

    return () => unsub();
  }, [role]);

  const placeOrder = useCallback(
    async (customer) => {
      if (!user) return { ok: false, message: "Not logged in" };
      if (cartItems.length === 0) return { ok: false, message: "Cart is empty" };

      try {
        const orderRef = await addDoc(collection(db, "orders"), {
          userId: user.uid,
          userEmail: user.email,
          items: cartItems,
          total: cartTotal,
          customer,
          status: "pending_payment",
          createdAt: serverTimestamp(),
        });
        setCartItems([]);
        return { ok: true, orderId: orderRef.id };
      } catch (err) {
        return { ok: false, message: err?.message || "Order failed" };
      }
    },
    [user, cartItems, cartTotal],
  );

  // ── Auth actions ──
  const signup = useCallback(async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "customer",
      createdAt: serverTimestamp(),
    });
    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  // ── Admin: Categories ──
  const fetchCategories = useCallback(async () => {
    setAdminError("");
    try {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setCategories(list);
    } catch (e) {
      setAdminError(e?.message || "Failed to fetch categories");
    }
  }, []);

  const addCategory = useCallback(
    async (name) => {
      const clean = String(name || "").trim();
      if (!clean) return;
      setAdminLoading(true);
      setAdminError("");
      try {
        await addDoc(collection(db, "categories"), { name: clean, createdAt: serverTimestamp() });
        await fetchCategories();
      } catch (e) {
        setAdminError(e?.message || "Failed to add category");
      } finally {
        setAdminLoading(false);
      }
    },
    [fetchCategories],
  );

  const updateCategory = useCallback(
    async (id, name) => {
      const clean = String(name || "").trim();
      if (!clean) return;
      setAdminLoading(true);
      setAdminError("");
      try {
        await updateDoc(doc(db, "categories", id), { name: clean });
        await fetchCategories();
      } catch (e) {
        setAdminError(e?.message || "Failed to update category");
      } finally {
        setAdminLoading(false);
      }
    },
    [fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id) => {
      setAdminLoading(true);
      setAdminError("");
      try {
        await deleteDoc(doc(db, "categories", id));
        await fetchCategories();
      } catch (e) {
        setAdminError(e?.message || "Failed to delete category");
      } finally {
        setAdminLoading(false);
      }
    },
    [fetchCategories],
  );

  // ── Admin: Products ──
  const addProduct = useCallback(async (product) => {
    setAdminLoading(true);
    setAdminError("");
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        tags: Array.isArray(product.tags) ? product.tags : [],
        features: Array.isArray(product.features) ? product.features : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });
    } catch (e) {
      setAdminError(e?.message || "Failed to add product");
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    setAdminLoading(true);
    setAdminError("");
    try {
      await updateDoc(doc(db, "products", id), {
        ...updates,
        tags: Array.isArray(updates.tags) ? updates.tags : [],
        features: Array.isArray(updates.features) ? updates.features : [],
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      setAdminError(e?.message || "Failed to update product");
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setAdminLoading(true);
    setAdminError("");
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      setAdminError(e?.message || "Failed to delete product");
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // ── Context value ──
  const value = useMemo(
    () => ({
      // auth
      user,
      role,
      authLoading,
      signup,
      login,
      logout,

      // products
      products,
      productsLoading,
      productsError,

      // filters
      filters,
      setFilters,
      filteredProducts,

      // cart
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,

      // wishlist
      wishlist: wishlistItems,
      wishlistIds,
      toggleWishlist,

      // orders
      orders,
      ordersLoading,
      placeOrder,

      // admin
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
      generateProduct,

      // AI search
      aiSearch,
      aiImageSearch,
      aiQuery,
      aiLoading,
      aiError,
      aiResultIds,
      aiResultsProducts,
      clearAiResults,

      // user order history
      userOrders,
      userOrdersLoading,
    }),
    [
      user, role, authLoading, signup, login, logout,
      products, productsLoading, productsError,
      filters, filteredProducts,
      cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
      wishlistItems, wishlistIds, toggleWishlist,
      orders, ordersLoading, placeOrder,
      categories, fetchCategories, addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct, adminLoading, adminError,
      aiSearch, aiImageSearch, aiQuery, aiLoading, aiError,
      aiResultIds, aiResultsProducts, clearAiResults, userOrders, userOrdersLoading, generateProduct,
    ],
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}