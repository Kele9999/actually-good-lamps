import { useEffect, useMemo, useState, useCallback } from "react";
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
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import { addWishlistItem, removeWishlistItem } from "../../firebase/wishlist";

const GUEST_WISHLIST_KEY = "guest_wishlist";

export default function MyState({ children }) {

  // Authentication state: user object, role (guest, customer, admin), loading state for authentication check

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [authLoading, setAuthLoading] = useState(true);


  // Products state
 
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

 
  // Filters for products page (not admin filters)
 
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


  // Cart state for logged in users (localStorage) and guests (sessionStorage)
 
const CART_KEY_GUEST = "cart_guest";
const CART_KEY_USER = (uid) => `agl_cart_user_${uid}`;

const [cartItems, setCartItems] = useState(() => {
  try {
    // if logged in, load their cart key; else load guest key
    const key = user ? CART_KEY_USER(user.uid) : CART_KEY_GUEST;
    return JSON.parse((user ? localStorage : sessionStorage).getItem(key) || "[]");
  } catch {
    return [];
  }
});

const mergeCarts = (guest, userCart) => {
  const map = new Map();

  // start with user cart
  for (const item of userCart) {
    map.set(item.id, { ...item, quantity: Number(item.quantity) || 1 });
  }

  // merge guest cart
  for (const item of guest) {
    const qty = Number(item.quantity) || 1;
  if (map.has(item.id)) {
    map.set(item.id, { ...map.get(item.id), quantity: map.get(item.id).quantity + qty });
  } else {
    map.set(item.id, { ...item, quantity: qty });
  }
}

return Array.from(map.values());
};


  // Admin

  const [categories, setCategories] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");


  // orders for admin dashboard
 
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);


  // Wishlist statwe for logged in users (from Firestore) and guests (from sessionStorage)
 
  const [wishlist, setWishlist] = useState([]); // firestore wishlist docs
  const [guestWishlist, setGuestWishlist] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // keep guest wishlist in session storage
  useEffect(() => {
    sessionStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist));
  }, [guestWishlist]);

 
  // Authentication state listener and role loading on mount. We set role to "guest" by default
  // and only update it if we find a logged in user with a role in Firestore. 
  // This way we avoid a flash of "customer" role for guests while we check auth state.
 
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


  // Load products on mount (no real-time listener here since we don't expect products to change often;
  // admin dashboard handles real-time updates for product management)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setProductsError(null);
      } catch (err) {
        setProductsError(err?.message || "Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);


  // Firestore listener for wishlist changes for logged in user (real-time sync)
 
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const ref = collection(db, "users", user.uid, "wishlist");
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWishlist(list);
    });

    return () => unsub();
  }, [user]);


  // Admin orders listener - only load if admin (no need to load orders for customers in this simple app)
  
  useEffect(() => {
    if (role !== "admin") {
      setOrders([]); 
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
      setOrdersLoading(false);
    });

    return () => unsub();
  }, [role]);


  // Authentication actions: signup, login, logout
  
  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

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


  // Cart logic: we store cart in localStorage for logged in users and in sessionStorage for guests.
  // On login, we merge guest cart into user cart and clear guest cart. On logout, 
  // we keep user cart in localStorage and switch to guest cart in sessionStorage.
  

  useEffect(() => {
    try {
      const key = user ? CART_KEY_USER(user.uid) : CART_KEY_GUEST;
      const storage = user ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart:", e); 
    }
  }, [cartItems, user]);

  useEffect(() => {
  try {
    // 1) If user is logged out: load guest cart from sessionStorage
    if (!user) {
      const guestCart = JSON.parse(sessionStorage.getItem(CART_KEY_GUEST) || "[]");
      setCartItems(guestCart);
      return;
    }

    // 2) If user islogged in: merge guest cart -> user cart (localStorage)
    const guestCart = JSON.parse(sessionStorage.getItem(CART_KEY_GUEST) || "[]");
    const userKey = CART_KEY_USER(user.uid);
    const userCart = JSON.parse(localStorage.getItem(userKey) || "[]");

    const merged = mergeCarts(guestCart, userCart);

    // save merged into user's localStorage cart
    localStorage.setItem(userKey, JSON.stringify(merged));

    // clear guest cart after merge
    sessionStorage.removeItem(CART_KEY_GUEST);

    // update state
    setCartItems(merged);
  } catch (e) {
    console.error("Failed to load/merge cart:", e);
    setCartItems([]); // if there is an error, we start with an empty cart to avoid blocking the user with a broken cart state
  }
}, [user]);

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


  // Place order - firestore
 
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
          status: "pending",
          createdAt: serverTimestamp(),
        });

        setCartItems([]);
        return { ok: true, orderId: orderRef.id };
      } catch (err) {
        console.error(err);
        return { ok: false, message: err?.message || "Order failed" };
      }
    },
    [user, cartItems, cartTotal]
  );

 
  // Admin categories crud
 
  const fetchCategories = useCallback(async () => {
    setAdminError("");
    try {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setCategories(list);
    } catch (e) {
      console.error(e);
      setAdminError(e?.message || "Failed to fetch categories");
    }
  }, []);

const addCategory = useCallback(
  async (name) => {
    const clean = name.trim();
    if (!clean) return;

    const lower = clean.toLowerCase();

    setAdminLoading(true);
    setAdminError("");

    try {
      // check for duplicate category (case-insensitive) before adding
      const q = query(collection(db, "categories"), where("nameLower", "==", lower));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setAdminError("That category already exists.");
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: clean,
        nameLower: lower,
        createdAt: serverTimestamp(),
      });

      await fetchCategories();
    } catch (e) {
      setAdminError(e?.message || "Failed to add category");
    } finally {
      setAdminLoading(false);
    }
  },
  [fetchCategories]
);

  const updateCategory = useCallback(
    async (id, name) => {
      const clean = name.trim();
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
    [fetchCategories]
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
    [fetchCategories]
  );


  // Admin crud for products (add, update, delete). We don't refetch products after these actions; instead we rely on realtime updates from Firestore to keep the UI in sync. This is more efficient and provides instant feedback in the admin dashboard. However, it does mean that any Firestore errors won't be reflected in the UI immediately.
 
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
      setAdminError(e?.message || "Failed to add product");
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
      // only include tags field if it's an array (to avoid overwriting with invalid data)
      ...(Array.isArray(updates.tags) ? { tags: updates.tags } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    setAdminError(e?.message || "Failed to update product");
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
      setAdminError(e?.message || "Failed to delete product");
    } finally {
      setAdminLoading(false);
    }
  };


  // wishlist items for logged in user (from Firestore) or guest (from sessionStorage)

  const wishlistItems = useMemo(() => {
    return user ? wishlist : guestWishlist;
  }, [user, wishlist, guestWishlist]);

  const wishlistIds = useMemo(() => {
    return new Set(wishlistItems.map((w) => w.productId || w.id));
  }, [wishlistItems]);

  const toggleWishlist = useCallback(
    async (product) => {
      const id = product.id;

      // Guest user: session wishlist

      if (!user) {
        setGuestWishlist((prev) => {
          const exists = prev.find((p) => p.id === id);
          if (exists) return prev.filter((p) => p.id !== id);
          return [...prev, product];
        });
        return { ok: true };
      }

      // Logged in user: Firestore wishlist

      const saved = wishlistIds.has(id);
      if (saved) {
        await removeWishlistItem(user.uid, id);
        return { ok: true, saved: false };
      } else {
        await addWishlistItem(user.uid, product);
        return { ok: true, saved: true };
      }
    },
    [user, wishlistIds]
  );


  // Filtered and sorted products based on filters
 
  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const min = filters.minPrice === "" ? null : Number(filters.minPrice);
    const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    const filtered = products.filter((p) => {
      if (q) {
        const hay = `${p.name || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      const price = Number(p.price) || 0;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;

      const cat = p.categoryName || p.category || "";
      if (filters.category !== "All" && cat !== filters.category) return false;
      if (filters.lightQuality !== "All" && p.lightQuality !== filters.lightQuality) return false;
      if (filters.material !== "All" && p.material !== filters.material) return false;

      if (filters.features.length > 0) {
        const feats = Array.isArray(p.features) ? p.features : [];
        const ok = filters.features.every((f) => feats.includes(f));
        if (!ok) return false;
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
      case "featured":
      default:
        break;
    }

    return sorted;
  }, [products, filters]);


  // Context value
  
  const value = useMemo(
    () => ({
      // products
      products,
      productsLoading,
      productsError,
      filteredProducts,

      // filters
      filters,
      setFilters,

      // cart
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,

      // orders
      placeOrder,
      orders,
      ordersLoading,

      // authentication
      user,
      role,
      authLoading,
      signup,
      login,
      logout,

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

      // wishlist (use wishlistItems in components to get correct list based on auth state) 

      wishlistItems,
      wishlistIds,
      toggleWishlist,
    }),
    [
      products,
      productsLoading,
      productsError,
      filteredProducts,
      filters,
      cartItems,
      cartCount,
      cartTotal,
      placeOrder,
      orders,
      ordersLoading,
      user,
      role,
      authLoading,
      categories,
      fetchCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      adminLoading,
      adminError,
      wishlistItems,
      wishlistIds,
      toggleWishlist,
    ]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}