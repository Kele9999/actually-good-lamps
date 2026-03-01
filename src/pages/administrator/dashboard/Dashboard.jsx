import { useContext, useEffect, useMemo, useRef, useState } from "react";
import MyContext from "../../../context/data/myContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../../../firebase/firebase";
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore";

/* ── Styles ── */
if (!document.getElementById("agl-dash-style")) {
  const style = document.createElement("style");
  style.id = "agl-dash-style";
  style.textContent = `
    :root {
      --balsamico: #150C0C; --burnt: #34150F; --honey: #85431E;
      --whiskey: #D39858; --champagne: #EACEAA;
      --font-display: 'Cormorant Garamond', serif; --font-body: 'Jost', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--balsamico); color: var(--champagne); font-family: var(--font-body); }

    .dash-shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; background: var(--balsamico); }

    .dash-sidebar { background: var(--burnt); border-right: 1px solid rgba(211,152,88,0.1); padding: 32px 0; position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; overflow-y: auto; }
    .dash-logo { padding: 0 24px 28px; border-bottom: 1px solid rgba(211,152,88,0.1); margin-bottom: 20px; }
    .dash-logo-main { font-family: var(--font-display); font-size: 22px; font-weight: 300; color: var(--champagne); letter-spacing: 0.08em; }
    .dash-logo-sub { font-size: 8px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--whiskey); opacity: 0.5; margin-top: 3px; }
    .dash-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 12px; }
    .dash-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 2px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--champagne); opacity: 0.45; cursor: pointer; transition: opacity 0.2s, background 0.2s; border: none; background: none; width: 100%; text-align: left; font-family: var(--font-body); }
    .dash-nav-item:hover { opacity: 0.8; background: rgba(211,152,88,0.06); }
    .dash-nav-item.active { opacity: 1; color: var(--whiskey); background: rgba(211,152,88,0.1); }
    .dash-sidebar-footer { padding: 16px 24px; border-top: 1px solid rgba(211,152,88,0.1); font-size: 10px; color: var(--champagne); opacity: 0.25; letter-spacing: 0.05em; }

    .dash-main { padding: 40px 48px 80px; overflow-y: auto; }
    .dash-page-header { margin-bottom: 36px; }
    .dash-page-title { font-family: var(--font-display); font-size: 38px; font-weight: 300; color: var(--champagne); letter-spacing: 0.04em; }
    .dash-page-sub { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--whiskey); opacity: 0.5; margin-top: 8px; }

    .dash-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 32px; }
    .dash-tile { background: var(--burnt); padding: 24px 22px; border: 1px solid rgba(211,152,88,0.06); }
    .dash-tile-label { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--whiskey); opacity: 0.6; margin-bottom: 10px; }
    .dash-tile-value { font-family: var(--font-display); font-size: 32px; font-weight: 300; color: var(--champagne); line-height: 1; }
    .dash-tile-sub { font-size: 10px; color: var(--champagne); opacity: 0.3; margin-top: 6px; letter-spacing: 0.05em; }

    .dash-section-title { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--whiskey); opacity: 0.6; margin-bottom: 16px; display: block; }
    .dash-divider { height: 1px; background: rgba(211,152,88,0.08); margin: 28px 0; }

    .dash-table { width: 100%; border-collapse: collapse; }
    .dash-table th { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--whiskey); opacity: 0.55; padding: 10px 14px; text-align: left; border-bottom: 1px solid rgba(211,152,88,0.1); }
    .dash-table td { padding: 13px 14px; font-size: 12px; color: var(--champagne); opacity: 0.75; border-bottom: 1px solid rgba(211,152,88,0.05); vertical-align: middle; }
    .dash-table tr:hover td { background: rgba(211,152,88,0.03); opacity: 1; }

    .dash-badge { display: inline-block; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; border-radius: 1px; }
    .dash-badge-pending  { background: rgba(211,152,88,0.12); color: var(--whiskey); }
    .dash-badge-complete { background: rgba(46,125,50,0.15); color: #81c784; }
    .dash-badge-cancelled{ background: rgba(192,57,43,0.15); color: #e57373; }
    .dash-badge-cod      { background: rgba(133,67,30,0.25); color: var(--champagne); }
    .dash-badge-card     { background: rgba(21,12,12,0.6); color: var(--champagne); border: 1px solid rgba(211,152,88,0.15); }
    .dash-badge-wallet   { background: rgba(52,21,15,0.8); color: var(--champagne); border: 1px solid rgba(211,152,88,0.15); }

    .dash-input, .dash-select, .dash-textarea { width: 100%; background: rgba(21,12,12,0.6); border: 1px solid rgba(211,152,88,0.18); color: var(--champagne); font-family: var(--font-body); font-size: 13px; padding: 11px 14px; border-radius: 2px; outline: none; transition: border-color 0.2s; }
    .dash-input::placeholder { color: rgba(234,206,170,0.25); }
    .dash-input:focus, .dash-select:focus, .dash-textarea:focus { border-color: rgba(211,152,88,0.5); }
    .dash-select option { background: var(--burnt); color: var(--champagne); }
    .dash-textarea { resize: vertical; min-height: 80px; }
    .dash-input-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--whiskey); opacity: 0.6; display: block; margin-bottom: 6px; }
    .dash-field { margin-bottom: 14px; }
    .dash-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .dash-btn { background: var(--whiskey); color: var(--balsamico); border: none; font-family: var(--font-body); font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; padding: 11px 20px; border-radius: 1px; cursor: pointer; transition: background 0.2s; }
    .dash-btn:hover { background: var(--champagne); }
    .dash-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .dash-btn-ghost { background: transparent; border: 1px solid rgba(211,152,88,0.25); color: var(--champagne); font-family: var(--font-body); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 10px 16px; border-radius: 1px; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
    .dash-btn-ghost:hover { background: rgba(211,152,88,0.08); border-color: rgba(211,152,88,0.5); }
    .dash-btn-danger { background: transparent; border: 1px solid rgba(192,57,43,0.3); color: #e57373; font-family: var(--font-body); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 10px 16px; border-radius: 1px; cursor: pointer; transition: background 0.2s; }
    .dash-btn-danger:hover { background: rgba(192,57,43,0.1); }

    .dash-panel { background: var(--burnt); border: 1px solid rgba(211,152,88,0.08); padding: 28px 24px; border-radius: 2px; }
    .dash-panel-title { font-family: var(--font-display); font-size: 20px; font-weight: 400; color: var(--champagne); margin-bottom: 20px; }

    .dash-search-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }

    /* ── AI Generator ── */
    .dash-ai-box { background: rgba(21,12,12,0.5); border: 1px solid rgba(211,152,88,0.2); border-radius: 2px; padding: 20px; margin-bottom: 20px; }
    .dash-ai-label { font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--whiskey); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    .dash-ai-label::before { content: '✦'; font-size: 11px; }
    .dash-ai-row { display: flex; gap: 10px; }
    .dash-ai-input { flex: 1; background: rgba(21,12,12,0.7); border: 1px solid rgba(211,152,88,0.2); color: var(--champagne); font-family: var(--font-body); font-size: 13px; padding: 11px 14px; border-radius: 2px; outline: none; transition: border-color 0.2s; }
    .dash-ai-input::placeholder { color: rgba(234,206,170,0.22); font-style: italic; }
    .dash-ai-input:focus { border-color: rgba(211,152,88,0.5); }
    .dash-ai-btn { background: var(--whiskey); color: var(--balsamico); border: none; font-family: var(--font-body); font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; padding: 11px 20px; border-radius: 1px; cursor: pointer; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
    .dash-ai-btn:hover { background: var(--champagne); }
    .dash-ai-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .dash-ai-generating { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--whiskey); opacity: 0.7; margin-top: 12px; letter-spacing: 0.08em; }
    .dash-ai-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--whiskey); animation: dash-ai-pulse 1.2s ease-in-out infinite; }
    .dash-ai-dot:nth-child(2) { animation-delay: 0.2s; }
    .dash-ai-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dash-ai-pulse { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
    .dash-ai-error { font-size: 11px; color: #e57373; margin-top: 10px; opacity: 0.85; }
    .dash-ai-success { font-size: 11px; color: #81c784; margin-top: 10px; opacity: 0.85; display: flex; align-items: center; gap: 6px; }
    .dash-ai-success::before { content: '✓'; font-size: 13px; }

    .dash-progress-track { background: rgba(211,152,88,0.1); border-radius: 2px; height: 4px; margin-top: 8px; }
    .dash-progress-fill { background: var(--whiskey); height: 4px; border-radius: 2px; transition: width 0.2s; }

    .dash-thumb { width: 52px; height: 52px; object-fit: cover; border-radius: 1px; background: #1e0f0a; display: block; }
    .dash-thumb-ph { width: 52px; height: 52px; background: #1e0f0a; border-radius: 1px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: rgba(234,206,170,0.15); }
    .dash-stock-low { color: #e57373 !important; }
    .dash-stock-ok  { color: #81c784 !important; }

    .dash-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .dash-overview-box { background: var(--burnt); border: 1px solid rgba(211,152,88,0.07); padding: 24px; }
    .dash-overview-box-title { font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--whiskey); opacity: 0.55; margin-bottom: 16px; display: block; }

    .dash-alert   { background: rgba(192,57,43,0.1); border: 1px solid rgba(192,57,43,0.2); border-radius: 2px; padding: 12px 16px; font-size: 12px; color: #e57373; margin-bottom: 16px; }
    .dash-success { background: rgba(46,125,50,0.1); border: 1px solid rgba(46,125,50,0.2); border-radius: 2px; padding: 12px 16px; font-size: 12px; color: #81c784; margin-bottom: 16px; }

    .dash-expand-row td { background: rgba(21,12,12,0.6) !important; }
    .dash-order-mini { display: flex; justify-content: space-between; font-size: 11px; padding: 7px 0; border-bottom: 1px solid rgba(211,152,88,0.05); opacity: 0.7; gap: 12px; }

    @media (max-width: 1100px) { .dash-tiles { grid-template-columns: repeat(2,1fr); } .dash-overview-grid { grid-template-columns: 1fr; } }
    @media (max-width: 800px) { .dash-shell { grid-template-columns: 1fr; } .dash-sidebar { position: relative; height: auto; } .dash-main { padding: 24px 20px 60px; } }
  `;
  document.head.appendChild(style);
}

const NAV = [
  { id: "overview",   label: "Overview",   icon: "⬡" },
  { id: "products",   label: "Products",   icon: "◈" },
  { id: "categories", label: "Categories", icon: "◇" },
  { id: "orders",     label: "Orders",     icon: "◎" },
  { id: "customers",  label: "Customers",  icon: "◉" },
  { id: "reports",    label: "Reports",    icon: "◌" },
];

const STATUS_CLS  = { pending_payment: "dash-badge-pending", complete: "dash-badge-complete", cancelled: "dash-badge-cancelled" };
const PAYMENT_CLS = { cod: "dash-badge-cod", card: "dash-badge-card", wallet: "dash-badge-wallet" };

const fmt      = (n) => Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => Number(n || 0).toLocaleString();

export default function Dashboard() {
  const {
    categories, fetchCategories, addCategory, updateCategory, deleteCategory,
    products, addProduct, updateProduct, deleteProduct,
    orders, ordersLoading, adminLoading, adminError,
    generateProduct,
  } = useContext(MyContext);

  // AI generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenMsg, setAiGenMsg] = useState({ type: "", text: "" });

  const [tab, setTab] = useState("overview");

  // customers
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
  const unsub = onSnapshot(collection(db, "users"), (snap) => {
    setCustomers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    setCustomersLoading(false);
  });
  return () => unsub();
}, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // category state
  const [newCat, setNewCat] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");

  // product state
  const emptyForm = { name:"", price:"", costPrice:"", stock:"", categoryId:"", categoryName:"", tagsText:"", imageUrl:"", description:"", material:"Metal", lightQuality:"Warm", featuresText:"", isActive:true };
  const [productForm, setProductForm] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productMsg, setProductMsg] = useState({ type:"", text:"" });

  // image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // order state
  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // customer search
  const [customerSearch, setCustomerSearch] = useState("");

  const parseComma = (t) => t.split(",").map((s) => s.trim()).filter(Boolean);

  // AI generate handler
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiGenMsg({ type: "", text: "" });
    const result = await generateProduct(aiPrompt.trim());
    setAiGenerating(false);
    if (!result?.ok) {
      setAiGenMsg({ type: "error", text: result?.message || "Generation failed." });
      return;
    }
    const p = result.product;
    setProductForm({
      name:         p.name         || "",
      price:        String(p.price  || ""),
      costPrice:    String(p.costPrice || ""),
      stock:        String(p.stock  || ""),
      categoryId:   p.categoryId   || "",
      categoryName: p.categoryName || "",
      tagsText:     Array.isArray(p.tags)     ? p.tags.join(", ")     : "",
      featuresText: Array.isArray(p.features) ? p.features.join(", ") : "",
      description:  p.description  || "",
      material:     p.material     || "Metal",
      lightQuality: p.lightQuality || "Warm",
      imageUrl:     "",
      isActive:     true,
    });
    setEditingProductId(null);
    setImageFile(null); setImagePreview("");
    setAiGenMsg({ type: "success", text: `"${p.name}" generated — review, add an image, then save.` });
    setAiPrompt("");
  };

  // image helpers
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
    setProductForm((p) => ({ ...p, imageUrl: "" }));
  };

  const uploadImage = (file, name) => new Promise((res, rej) => {
    const storage = getStorage();
    const safeName = name.trim().replace(/\s+/g, "-").toLowerCase();
    const task = uploadBytesResumable(ref(storage, `products/${safeName}-${Date.now()}`), file);
    setUploading(true); setUploadProgress(0);
    task.on("state_changed",
      (s) => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (e) => { setUploading(false); rej(e); },
      async () => { const url = await getDownloadURL(task.snapshot.ref); setUploading(false); setUploadProgress(0); res(url); }
    );
  });

  // category helpers
  const handleAddCategory = async () => { if (!newCat.trim()) return; await addCategory(newCat); setNewCat(""); };

  // product helpers
  const onPickCategory = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    setProductForm((p) => ({ ...p, categoryId: catId, categoryName: cat?.name || "" }));
  };

  const resetProductForm = () => {
    setEditingProductId(null); setImageFile(null); setImagePreview(""); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setProductForm(emptyForm); setProductMsg({ type:"", text:"" });
  };

  const submitProduct = async () => {
    const cleanName = productForm.name.trim();
    if (!cleanName) return setProductMsg({ type:"error", text:"Name required." });
    if (!productForm.categoryId) return setProductMsg({ type:"error", text:"Pick a category." });
    const price = Number(productForm.price), costPrice = Number(productForm.costPrice), stock = productForm.stock !== "" ? Number(productForm.stock) : 0;
    if (isNaN(price)) return setProductMsg({ type:"error", text:"Price must be a number." });

    let finalImageUrl = productForm.imageUrl;
    if (imageFile) {
      try { finalImageUrl = await uploadImage(imageFile, cleanName); }
      catch (err) { return setProductMsg({ type:"error", text:"Upload failed: " + (err?.message || "error") }); }
    }
    if (!finalImageUrl) return setProductMsg({ type:"error", text:"Please upload an image." });

    const payload = {
      name: cleanName, price, costPrice, stock,
      categoryId: productForm.categoryId, categoryName: productForm.categoryName,
      tags: parseComma(productForm.tagsText), imageUrl: finalImageUrl,
      description: productForm.description.trim(),
      material: productForm.material, lightQuality: productForm.lightQuality,
      features: parseComma(productForm.featuresText), isActive: productForm.isActive,
    };

    if (editingProductId) { await updateProduct(editingProductId, payload); setProductMsg({ type:"success", text:"Product updated." }); }
    else { await addProduct(payload); setProductMsg({ type:"success", text:"Product added." }); }
    resetProductForm();
  };

  const startEditProduct = (p) => {
    setEditingProductId(p.id); setImageFile(null); setImagePreview(p.imageUrl || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setProductForm({ name:p.name||"", price:String(p.price??""), costPrice:String(p.costPrice??""), stock:String(p.stock??""), categoryId:p.categoryId||"", categoryName:p.categoryName||"", tagsText:Array.isArray(p.tags)?p.tags.join(", "):"", imageUrl:p.imageUrl||"", description:p.description||"", material:p.material||"Metal", lightQuality:p.lightQuality||"Warm", featuresText:Array.isArray(p.features)?p.features.join(", "):"", isActive:p.isActive!==false });
    setProductMsg({ type:"", text:"" });
  };

  const updateOrderStatus = async (orderId, status) => await updateDoc(doc(db, "orders", orderId), { status });

  // computed
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders
      .filter((o) => orderStatus === "All" || o.status === orderStatus)
      .filter((o) => paymentFilter === "All" || (o.customer?.paymentMethod || o.paymentMethod) === paymentFilter)
      .filter((o) => !q || `${o.id} ${o.userEmail}`.toLowerCase().includes(q));
  }, [orders, orderStatus, paymentFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.categoryName} ${p.material}`.toLowerCase().includes(q));
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => `${c.email} ${c.uid}`.toLowerCase().includes(q));
  }, [customers, customerSearch]);

  const stats = useMemo(() => {
    const now = new Date().getTime();
    const day = 86400000;
    const inLast = (o, days) => (now - (o.createdAt?.toMillis?.() || 0)) < days * day;
    const sum = (arr) => arr.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const counts = new Map();
    orders.forEach((o) => (o.items || []).forEach((it) => { const k = it.name || it.id; counts.set(k, (counts.get(k) || 0) + (Number(it.quantity) || 0)); }));
    return {
      today: sum(orders.filter((o) => inLast(o, 1))),
      week:  sum(orders.filter((o) => inLast(o, 7))),
      month: sum(orders.filter((o) => inLast(o, 30))),
      totalOrders: orders.length,
      pending:  orders.filter((o) => o.status === "pending_payment"),
      lowStock: products.filter((p) => Number(p.stock) < 3),
      topProducts: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [orders, products]);

  const report = useMemo(() => {
    const totalSales = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalCost  = orders.reduce((s, o) => s + (o.items || []).reduce((ss, it) => ss + (Number(it.costPrice) || 0) * (Number(it.quantity) || 0), 0), 0);
    const catMap = new Map();
    orders.forEach((o) => (o.items || []).forEach((it) => { const k = it.categoryName || "Unknown"; catMap.set(k, (catMap.get(k) || 0) + (Number(it.price) || 0) * (Number(it.quantity) || 0)); }));
    const pmMap = new Map();
    orders.forEach((o) => { const k = o.customer?.paymentMethod || o.paymentMethod || "unknown"; pmMap.set(k, (pmMap.get(k) || 0) + 1); });
    const custMap = new Map();
    orders.forEach((o) => { const k = o.userEmail || "Guest"; custMap.set(k, (custMap.get(k) || 0) + (Number(o.total) || 0)); });
    return {
      totalSales, totalCost, profit: totalSales - totalCost,
      byCategory: [...catMap.entries()].sort((a, b) => b[1] - a[1]),
      byPayment:  [...pmMap.entries()].sort((a, b) => b[1] - a[1]),
      topCustomers: [...custMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [orders]);

  return (
    <div className="dash-shell">
      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="dash-logo" style={{ cursor: "pointer" }} onClick={() => setTab("overview")}>
          <div className="dash-logo-main">AGL</div>
          <div className="dash-logo-sub">Admin Console</div>
        </div>
        <nav className="dash-nav">
          {NAV.map((n) => (
            <button key={n.id} className={`dash-nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">Actually Good Lamps · Admin</div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        {adminError && <div className="dash-alert">{adminError}</div>}
        {adminLoading && <div style={{ fontSize: 11, color: "var(--whiskey)", opacity: 0.6, marginBottom: 12, letterSpacing: "0.1em" }}>Working…</div>}

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Overview</h1>
            <p className="dash-page-sub">Welcome back — here's what's happening</p>
          </div>

          <div className="dash-tiles">
            <div className="dash-tile"><div className="dash-tile-label">Sales Today</div><div className="dash-tile-value">R {fmt(stats.today)}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Sales 7 Days</div><div className="dash-tile-value">R {fmt(stats.week)}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Sales 30 Days</div><div className="dash-tile-value">R {fmt(stats.month)}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Total Orders</div><div className="dash-tile-value">{fmtShort(stats.totalOrders)}</div><div className="dash-tile-sub">{stats.pending.length} pending</div></div>
          </div>

          {stats.lowStock.length > 0 && (
            <div className="dash-alert">⚠ Low stock: {stats.lowStock.map((p) => `${p.name} (${p.stock ?? 0})`).join(", ")}</div>
          )}

          <div className="dash-overview-grid">
            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Top Selling Products</span>
              {stats.topProducts.length === 0 ? <p style={{ fontSize:12, opacity:0.3 }}>No sales yet</p> : (
                <table className="dash-table"><thead><tr><th>Product</th><th>Units</th></tr></thead>
                  <tbody>{stats.topProducts.map(([name, qty]) => <tr key={name}><td>{name}</td><td>{qty}</td></tr>)}</tbody>
                </table>
              )}
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Recent Orders</span>
              {orders.length === 0 ? <p style={{ fontSize:12, opacity:0.3 }}>No orders yet</p> : (
                <table className="dash-table">
                  <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} style={{ cursor:"pointer" }} onClick={() => { setExpandedOrder(o.id); setTab("orders"); }}>
                        <td style={{ fontFamily:"monospace", fontSize:11 }}>{o.id.slice(0,8)}…</td>
                        <td>{o.userEmail || "Guest"}</td>
                        <td>R {fmt(o.total)}</td>
                        <td><span className={`dash-badge ${STATUS_CLS[o.status] || "dash-badge-pending"}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Inventory Snapshot</span>
              <table className="dash-table">
                <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Total products</td><td>{products.length}</td></tr>
                  <tr><td>Active</td><td>{products.filter((p) => p.isActive !== false).length}</td></tr>
                  <tr><td>Draft</td><td>{products.filter((p) => p.isActive === false).length}</td></tr>
                  <tr><td>Low stock</td><td className="dash-stock-low">{stats.lowStock.length}</td></tr>
                  <tr><td>Categories</td><td>{categories.length}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Financial Summary</span>
              <table className="dash-table">
                <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                <tbody>
                  <tr><td>Total Revenue</td><td>R {fmt(report.totalSales)}</td></tr>
                  <tr><td>Cost of Sales</td><td>R {fmt(report.totalCost)}</td></tr>
                  <tr><td>Gross Profit</td><td style={{ color: report.profit >= 0 ? "#81c784" : "#e57373" }}>R {fmt(report.profit)}</td></tr>
                  <tr><td>Customers</td><td>{customers.filter((c) => c.role !== "admin").length}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {/* ══ PRODUCTS ══ */}
        {tab === "products" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Products</h1>
            <p className="dash-page-sub">{products.length} total products</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:24, alignItems:"start" }}>
            <div className="dash-panel">
              {/* ── AI Generator ── */}
              <div className="dash-ai-box">
                <div className="dash-ai-label">Generate with AI</div>
                <div className="dash-ai-row">
                  <input
                    className="dash-ai-input"
                    placeholder="e.g. a tall brass arc floor lamp, warm light, dimmable, R2800…"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !aiGenerating && handleGenerate()}
                    disabled={aiGenerating}
                  />
                  <button className="dash-ai-btn" onClick={handleGenerate} disabled={aiGenerating || !aiPrompt.trim()}>
                    {aiGenerating ? "Generating…" : "Generate ✦"}
                  </button>
                </div>
                {aiGenerating && (
                  <div className="dash-ai-generating">
                    <span className="dash-ai-dot" /><span className="dash-ai-dot" /><span className="dash-ai-dot" />
                    AI is crafting your product…
                  </div>
                )}
                {aiGenMsg.text && (
                  <div className={aiGenMsg.type === "error" ? "dash-ai-error" : "dash-ai-success"}>
                    {aiGenMsg.text}
                  </div>
                )}
              </div>

              <div className="dash-panel-title">{editingProductId ? "Edit Product" : "Add Product"}</div>
              {productMsg.text && <div className={productMsg.type === "error" ? "dash-alert" : "dash-success"}>{productMsg.text}</div>}

              <div className="dash-field"><label className="dash-input-label">Name</label><input className="dash-input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} /></div>

              <div className="dash-field dash-field-row">
                <div><label className="dash-input-label">Price (R)</label><input className="dash-input" placeholder="0" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} /></div>
                <div><label className="dash-input-label">Cost Price (R)</label><input className="dash-input" placeholder="0" value={productForm.costPrice} onChange={(e) => setProductForm((p) => ({ ...p, costPrice: e.target.value }))} /></div>
              </div>

              <div className="dash-field dash-field-row">
                <div><label className="dash-input-label">Stock</label><input className="dash-input" type="number" placeholder="0" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} /></div>
                <div><label className="dash-input-label">Status</label>
                  <select className="dash-select" value={productForm.isActive ? "active" : "draft"} onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.value === "active" }))}>
                    <option value="active">Active</option><option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="dash-field"><label className="dash-input-label">Category</label>
                <select className="dash-select" value={productForm.categoryId} onChange={(e) => onPickCategory(e.target.value)}>
                  <option value="">Pick category…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="dash-field dash-field-row">
                <div><label className="dash-input-label">Material</label>
                  <select className="dash-select" value={productForm.material} onChange={(e) => setProductForm((p) => ({ ...p, material: e.target.value }))}>
                    {["Wood","Brass","Ceramic","Glass","Metal","Rattan","Marble"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div><label className="dash-input-label">Light Quality</label>
                  <select className="dash-select" value={productForm.lightQuality} onChange={(e) => setProductForm((p) => ({ ...p, lightQuality: e.target.value }))}>
                    {["Warm","Neutral","Cool"].map((lq) => <option key={lq}>{lq}</option>)}
                  </select>
                </div>
              </div>

              <div className="dash-field"><label className="dash-input-label">Features (comma separated)</label><input className="dash-input" placeholder="LED, Dimmable, Smart" value={productForm.featuresText} onChange={(e) => setProductForm((p) => ({ ...p, featuresText: e.target.value }))} /></div>
              <div className="dash-field"><label className="dash-input-label">Tags (comma separated)</label><input className="dash-input" placeholder="premium, brass, modern" value={productForm.tagsText} onChange={(e) => setProductForm((p) => ({ ...p, tagsText: e.target.value }))} /></div>
              <div className="dash-field"><label className="dash-input-label">Description</label><textarea className="dash-textarea" placeholder="Product description…" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} /></div>

              <div className="dash-field">
                <label className="dash-input-label">Product Image</label>
                {imagePreview && <img src={imagePreview} alt="preview" style={{ width:"100%", height:160, objectFit:"cover", borderRadius:2, marginBottom:10 }} />}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ width:"100%", fontSize:12, color:"var(--champagne)", opacity:0.6 }} />
                {uploading && <div><div style={{ fontSize:10, color:"var(--whiskey)", marginBottom:4, marginTop:6, letterSpacing:"0.1em" }}>Uploading {uploadProgress}%</div><div className="dash-progress-track"><div className="dash-progress-fill" style={{ width:`${uploadProgress}%` }} /></div></div>}
                {!imageFile && productForm.imageUrl && <p style={{ fontSize:10, opacity:0.4, marginTop:6, wordBreak:"break-all" }}>Current: {productForm.imageUrl.slice(0,60)}…</p>}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button className="dash-btn" onClick={submitProduct} disabled={uploading}>{uploading ? "Uploading…" : editingProductId ? "Save Changes" : "Add Product"}</button>
                <button className="dash-btn-ghost" onClick={resetProductForm}>Clear</button>
              </div>
            </div>

            <div>
              <div className="dash-search-row">
                <input className="dash-input" style={{ maxWidth:320 }} placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
              </div>
              <table className="dash-table" style={{ background:"var(--burnt)" }}>
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.imageUrl ? <img src={p.imageUrl} className="dash-thumb" alt={p.name} /> : <div className="dash-thumb-ph">N/A</div>}</td>
                      <td style={{ fontWeight:500 }}>{p.name}</td>
                      <td>{p.categoryName || "—"}</td>
                      <td>R {fmtShort(p.price)}</td>
                      <td>R {fmtShort(p.costPrice)}</td>
                      <td className={Number(p.stock) < 3 ? "dash-stock-low" : "dash-stock-ok"}>{p.stock ?? "—"}</td>
                      <td><span className={`dash-badge ${p.isActive !== false ? "dash-badge-complete" : "dash-badge-cancelled"}`}>{p.isActive !== false ? "Active" : "Draft"}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:8 }}>
                          <button className="dash-btn-ghost" style={{ padding:"6px 12px", fontSize:9 }} onClick={() => startEditProduct(p)}>Edit</button>
                          <button className="dash-btn-danger" style={{ padding:"6px 12px", fontSize:9 }} onClick={() => deleteProduct(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {/* ══ CATEGORIES ══ */}
        {tab === "categories" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Categories</h1>
            <p className="dash-page-sub">{categories.length} categories</p>
          </div>
          <div style={{ maxWidth:540 }}>
            <div className="dash-panel" style={{ marginBottom:20 }}>
              <div className="dash-panel-title">Add Category</div>
              <div style={{ display:"flex", gap:10 }}>
                <input className="dash-input" placeholder="Category name…" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} />
                <button className="dash-btn" onClick={handleAddCategory}>Add</button>
              </div>
            </div>
            <table className="dash-table" style={{ background:"var(--burnt)" }}>
              <thead><tr><th>Name</th><th>Products</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{editingCatId === c.id
                      ? <input className="dash-input" value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} style={{ maxWidth:200 }} autoFocus />
                      : c.name}
                    </td>
                    <td>{products.filter((p) => p.categoryId === c.id).length}</td>
                    <td>
                      <div style={{ display:"flex", gap:8 }}>
                        {editingCatId === c.id ? <>
                          <button className="dash-btn" style={{ padding:"6px 12px", fontSize:9 }} onClick={async () => { await updateCategory(c.id, editingCatName); setEditingCatId(null); }}>Save</button>
                          <button className="dash-btn-ghost" style={{ padding:"6px 12px", fontSize:9 }} onClick={() => setEditingCatId(null)}>Cancel</button>
                        </> : <>
                          <button className="dash-btn-ghost" style={{ padding:"6px 12px", fontSize:9 }} onClick={() => { setEditingCatId(c.id); setEditingCatName(c.name); }}>Edit</button>
                          <button className="dash-btn-danger" style={{ padding:"6px 12px", fontSize:9 }} onClick={() => deleteCategory(c.id)}>Delete</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ══ ORDERS ══ */}
        {tab === "orders" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Orders</h1>
            <p className="dash-page-sub">{filteredOrders.length} of {orders.length} orders</p>
          </div>
          <div className="dash-search-row">
            <input className="dash-input" style={{ maxWidth:280 }} placeholder="Search by order ID or email…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
            <select className="dash-select" style={{ maxWidth:180 }} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="complete">Complete</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="dash-select" style={{ maxWidth:180 }} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="All">All payment types</option>
              <option value="cod">Cash on Delivery</option>
              <option value="card">Card</option>
              <option value="wallet">Digital Wallet</option>
            </select>
          </div>
          {ordersLoading ? <p style={{ fontSize:12, opacity:0.4 }}>Loading orders…</p> : filteredOrders.length === 0 ? <p style={{ fontSize:13, opacity:0.3, fontStyle:"italic" }}>No orders match your filters</p> : (
            <table className="dash-table" style={{ background:"var(--burnt)" }}>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {filteredOrders.flatMap((o) => {
                  const pm = o.customer?.paymentMethod || o.paymentMethod || "—";
                  const isOpen = expandedOrder === o.id;
                  return [
                    <tr key={o.id} style={{ cursor:"pointer" }} onClick={() => setExpandedOrder(isOpen ? null : o.id)}>
                      <td style={{ fontFamily:"monospace", fontSize:11 }}>{o.id.slice(0,10)}…</td>
                      <td>{o.userEmail || "Guest"}<br /><span style={{ fontSize:10, opacity:0.4 }}>{o.customer?.name}</span></td>
                      <td>{(o.items||[]).length}</td>
                      <td>R {fmt(o.total)}</td>
                      <td><span className={`dash-badge ${PAYMENT_CLS[pm] || "dash-badge-cod"}`}>{pm}</span></td>
                      <td>
                        <select className="dash-select" style={{ padding:"4px 8px", fontSize:10, width:"auto" }} value={o.status}
                          onClick={(e) => e.stopPropagation()} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                          <option value="pending_payment">Pending</option>
                          <option value="complete">Complete</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ fontSize:11, opacity:0.45 }}>{o.createdAt?.toDate?.()?.toLocaleDateString("en-ZA") || "—"}</td>
                      <td style={{ color:"var(--whiskey)", opacity:0.5, fontSize:12 }}>{isOpen ? "▲" : "▼"}</td>
                    </tr>,
                    isOpen && (
                      <tr key={o.id + "-x"} className="dash-expand-row">
                        <td colSpan={8} style={{ padding:"20px 24px" }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                            <div>
                              <span className="dash-section-title">Items</span>
                              {(o.items||[]).map((it, i) => (
                                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"7px 0", borderBottom:"1px solid rgba(211,152,88,0.06)", opacity:0.75 }}>
                                  <span>{it.name} × {it.quantity}</span>
                                  <span>R {fmt((Number(it.price)||0)*(Number(it.quantity)||0))}</span>
                                </div>
                              ))}
                              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, fontFamily:"var(--font-display)", fontSize:15 }}>
                                <span>Total</span><span>R {fmt(o.total)}</span>
                              </div>
                            </div>
                            <div>
                              <span className="dash-section-title">Delivery Details</span>
                              <div style={{ fontSize:12, opacity:0.7, lineHeight:1.85 }}>
                                <div>{o.customer?.name}</div>
                                <div>{o.customer?.phone}</div>
                                <div>{o.customer?.address}</div>
                                <div style={{ marginTop:8 }}>Payment: <strong>{pm}</strong></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          )}
        </>}

        {/* ══ CUSTOMERS ══ */}
        {tab === "customers" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Customers</h1>
            <p className="dash-page-sub">{customers.filter((c) => c.role !== "admin").length} registered customers</p>
          </div>
          <div className="dash-search-row">
            <input className="dash-input" style={{ maxWidth:320 }} placeholder="Search by email…" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
          </div>
          {customersLoading ? <p style={{ fontSize:12, opacity:0.4 }}>Loading…</p> : (
            <table className="dash-table" style={{ background:"var(--burnt)" }}>
              <thead><tr><th>Email</th><th>Role</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredCustomers.flatMap((c) => {
                  const custOrders = orders.filter((o) => o.userId === c.uid || o.userEmail === c.email);
                  const spent = custOrders.reduce((s, o) => s + (Number(o.total)||0), 0);
                  const isOpen = expandedCustomer === c.uid;
                  return [
                    <tr key={c.uid} style={{ cursor:"pointer" }} onClick={() => setExpandedCustomer(isOpen ? null : c.uid)}>
                      <td>{c.email}</td>
                      <td><span className={`dash-badge ${c.role === "admin" ? "dash-badge-complete" : "dash-badge-card"}`}>{c.role}</span></td>
                      <td>{custOrders.length}</td>
                      <td>R {fmt(spent)}</td>
                      <td style={{ fontSize:11, opacity:0.45 }}>{c.createdAt?.toDate?.()?.toLocaleDateString("en-ZA") || "—"}</td>
                      <td>
                        <div style={{ display:"flex", gap:8 }} onClick={(e) => e.stopPropagation()}>
                          {c.role !== "admin"
                            ? <button className="dash-btn-ghost" style={{ padding:"5px 10px", fontSize:9 }} onClick={() => updateDoc(doc(db,"users",c.uid),{ role:"admin" })}>Make Admin</button>
                            : <button className="dash-btn-ghost" style={{ padding:"5px 10px", fontSize:9 }} onClick={() => updateDoc(doc(db,"users",c.uid),{ role:"customer" })}>Revoke Admin</button>
                          }
                        </div>
                      </td>
                    </tr>,
                    isOpen && custOrders.length > 0 && (
                      <tr key={c.uid + "-x"} className="dash-expand-row">
                        <td colSpan={6} style={{ padding:"14px 24px" }}>
                          <span className="dash-section-title">Order History</span>
                          {custOrders.map((o) => (
                            <div key={o.id} className="dash-order-mini">
                              <span style={{ fontFamily:"monospace", fontSize:11 }}>{o.id.slice(0,12)}…</span>
                              <span>{(o.items||[]).length} items</span>
                              <span>R {fmt(o.total)}</span>
                              <span><span className={`dash-badge ${STATUS_CLS[o.status]||"dash-badge-pending"}`}>{o.status}</span></span>
                              <span style={{ fontSize:11, opacity:0.45 }}>{o.createdAt?.toDate?.()?.toLocaleDateString("en-ZA")||"—"}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          )}
        </>}

        {/* ══ REPORTS ══ */}
        {tab === "reports" && <>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Reports</h1>
            <p className="dash-page-sub">Based on all orders to date</p>
          </div>

          <div className="dash-tiles">
            <div className="dash-tile"><div className="dash-tile-label">Total Revenue</div><div className="dash-tile-value">R {fmt(report.totalSales)}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Cost of Sales</div><div className="dash-tile-value">R {fmt(report.totalCost)}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Gross Profit</div><div className="dash-tile-value" style={{ color: report.profit >= 0 ? "#81c784" : "#e57373" }}>R {fmt(report.profit)}</div><div className="dash-tile-sub">{report.totalSales > 0 ? `${((report.profit/report.totalSales)*100).toFixed(1)}% margin` : "—"}</div></div>
            <div className="dash-tile"><div className="dash-tile-label">Avg Order Value</div><div className="dash-tile-value">R {orders.length > 0 ? fmt(report.totalSales/orders.length) : "0"}</div></div>
          </div>

          <div className="dash-overview-grid">
            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Revenue by Category</span>
              {report.byCategory.length === 0 ? <p style={{ fontSize:12, opacity:0.3 }}>No data</p> : (
                <table className="dash-table">
                  <thead><tr><th>Category</th><th>Revenue</th><th>Share</th></tr></thead>
                  <tbody>{report.byCategory.map(([cat, rev]) => (
                    <tr key={cat}><td>{cat}</td><td>R {fmt(rev)}</td><td style={{ fontSize:11, opacity:0.5 }}>{report.totalSales > 0 ? `${((rev/report.totalSales)*100).toFixed(1)}%` : "—"}</td></tr>
                  ))}</tbody>
                </table>
              )}
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Top Customers by Spend</span>
              {report.topCustomers.length === 0 ? <p style={{ fontSize:12, opacity:0.3 }}>No data</p> : (
                <table className="dash-table">
                  <thead><tr><th>Customer</th><th>Total Spent</th><th>Orders</th></tr></thead>
                  <tbody>{report.topCustomers.map(([email, total]) => (
                    <tr key={email}><td style={{ fontSize:11 }}>{email}</td><td>R {fmt(total)}</td><td>{orders.filter((o) => o.userEmail === email).length}</td></tr>
                  ))}</tbody>
                </table>
              )}
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Orders by Payment Method</span>
              <table className="dash-table">
                <thead><tr><th>Method</th><th>Orders</th><th>Share</th></tr></thead>
                <tbody>{report.byPayment.map(([method, count]) => (
                  <tr key={method}>
                    <td><span className={`dash-badge ${PAYMENT_CLS[method]||"dash-badge-cod"}`}>{method}</span></td>
                    <td>{count}</td>
                    <td style={{ fontSize:11, opacity:0.5 }}>{orders.length > 0 ? `${((count/orders.length)*100).toFixed(1)}%` : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div className="dash-overview-box">
              <span className="dash-overview-box-title">Inventory Value</span>
              <table className="dash-table">
                <thead><tr><th>Product</th><th>Stock</th><th>Value @ Cost</th></tr></thead>
                <tbody>
                  {products.sort((a, b) => (Number(b.stock)||0) - (Number(a.stock)||0)).slice(0, 10).map((p) => (
                    <tr key={p.id}><td style={{ fontSize:11 }}>{p.name}</td><td className={Number(p.stock)<3?"dash-stock-low":""}>{p.stock??"—"}</td><td>R {fmt((Number(p.stock)||0)*(Number(p.costPrice)||0))}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop:14, fontSize:12, opacity:0.5, borderTop:"1px solid rgba(211,152,88,0.08)", paddingTop:12 }}>
                Total inventory value: <strong>R {fmt(products.reduce((s,p) => s + (Number(p.stock)||0)*(Number(p.costPrice)||0), 0))}</strong>
              </div>
            </div>
          </div>
        </>}
      </main>
    </div>
  );
}