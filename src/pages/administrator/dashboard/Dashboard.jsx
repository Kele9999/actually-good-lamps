import { useContext, useEffect, useMemo, useState } from "react";
import MyContext from "../../../context/data/myContext";


function Dashboard() {
  const {
    // categories
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    // products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    // orders
    orders,
    ordersLoading,
    // admin ui
    adminLoading,
    adminError,
  } = useContext(MyContext);
  const [tab, setTab] = useState("categories");


  // Categories state

  const [newCat, setNewCat] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");


  // Products state 

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    costPrice: "",
    categoryId: "",
    tagsText: "", 
    imageUrl: "",
    description: "",
    material: "Metal",
    lightQuality: "Warm",
    featuresText: "", 
  });
  const [editingProductId, setEditingProductId] = useState(null);


  // Orders filters 

  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentType, setPaymentType] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // parse comma that handles extra spaces and empty values. It ignores white spaces and empty values.

  const parseComma = (text) =>
    text.split(",").map((s) => s.trim()).filter(Boolean);


  // category actions


  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    await addCategory(newCat);
    setNewCat("");
  };
  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name || "");
  };
  const saveEditCategory = async () => {
    if (!editingCatId) return;
    await updateCategory(editingCatId, editingCatName);
    setEditingCatId(null);
    setEditingCatName("");
  };

  // product actions

  const onPickCategory = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    setProductForm((p) => ({
      ...p,
      categoryId: catId,
      categoryName: cat?.name || "",
    }));
  };
  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      price: "",
      costPrice: "",
      categoryId: "",
      categoryName: "",
      tagsText: "",
      imageUrl: "",
      description: "",
      material: "Metal",
      lightQuality: "Warm",
      featuresText: "",
    });
  };
  const submitProduct = async () => {
    const cleanName = productForm.name.trim();
    if (!cleanName) return alert("Product name is required.");
    if (!productForm.categoryId) return alert("Pick a category.");
    const price = Number(productForm.price);
    const costPrice = Number(productForm.costPrice);
    if (Number.isNaN(price)) return alert("Price must be a number.");
    if (Number.isNaN(costPrice)) return alert("Cost price must be a number.");
    const payload = {
      name: cleanName,
      price,
      costPrice,
      categoryId: productForm.categoryId,
      categoryName: productForm.categoryName,
      tags: parseComma(productForm.tagsText),
      imageUrl: productForm.imageUrl.trim(),
      description: productForm.description.trim(),
      material: productForm.material,
      lightQuality: productForm.lightQuality,
      features: parseComma(productForm.featuresText),
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);

      setProductForm((p) => ({
        ...p,
        ...payload,
        price: String(payload.price),
        costPrice: String(payload.costPrice),
        tagsText: payload.tags.join(", "),
        featuresText: payload.features.join(", "),
      }));

      alert ("saved!");
    } else {
      await addProduct(payload);
    }
    resetProductForm();
  };

  const startEditProduct = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      costPrice: String(p.costPrice ?? ""),
      categoryId: p.categoryId || "",
      categoryName: p.categoryName || "",
      tagsText: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      imageUrl: p.imageUrl || "",
      description: p.description || "",
      material: p.material || "Metal",
      lightQuality: p.lightQuality || "Warm",
      featuresText: Array.isArray(p.features) ? p.features.join(", ") : "",
    });
    setTab("products");
  };

  // Orders filtering

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders
      .filter((o) => (orderStatus === "All" ? true : o.status === orderStatus))
      .filter((o) =>
        paymentType === "All" ? true : o.paymentType === paymentType,
      )
      .filter((o) => {
        if (!q) return true;
        const hay = `${o.id || ""} ${o.userEmail || ""}`.toLowerCase();
        return hay.includes(q);
      });
  }, [orders, orderStatus, paymentType, orderSearch]);

  // Reports

  const report = useMemo(() => {
    const totalSales = orders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0,
    );
    const totalCost = orders.reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const orderCost = items.reduce(
        (s, it) => s + (Number(it.costPrice) || 0) * (Number(it.quantity) || 0),
        0,
      );
      return sum + orderCost;
    }, 0);
    const profit = totalSales - totalCost;

  
    // this shows the best selling products


    const productCounts = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.id || it.productId || it.name;
        productCounts.set(
          key,
          (productCounts.get(key) || 0) + (Number(it.quantity) || 0),
        );
      });
    });
    const bestProduct = [...productCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    // this shows the best category

    const categoryCounts = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.categoryName || it.category || "Unknown";
        categoryCounts.set(
          key,
          (categoryCounts.get(key) || 0) + (Number(it.quantity) || 0),
        );
      });
    });
    const bestCategory = [...categoryCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    // this shows the best customer (by spend)

    const customerSpend = new Map();
    orders.forEach((o) => {
      const key = o.userEmail || o.userId || "Unknown";
      customerSpend.set(
        key,
        (customerSpend.get(key) || 0) + (Number(o.total) || 0),
      );
    });
    const bestCustomer = [...customerSpend.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];
    return {
      totalSales,
      totalCost,
      profit,
      bestProduct,
      bestCategory,
      bestCustomer,
    };
  }, [orders]);
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <div
        style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 16 }}
      >
        {["categories", "products", "orders", "reports"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: tab === t ? "#f3f3f3" : "white",
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      {adminError ? <p style={{ color: "red" }}>{adminError}</p> : null}
      {adminLoading ? <p>Working...</p> : null}

      {/* Categories tab */}

      {tab === "categories" && (
        <div style={{ maxWidth: 520 }}>
          <h2>Categories</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Add new category..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              style={{ flex: 1, padding: 10 }}
            />
            <button
              onClick={handleAddCategory}
              style={{ padding: "10px 12px" }}
            >
              Add
            </button>
          </div>
          {categories.length === 0 ? (
            <p>No categories yet.</p>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                {editingCatId === c.id ? (
                  <>
                    <input
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      style={{ flex: 1, padding: 8 }}
                    />
                    <button onClick={saveEditCategory}>Save</button>
                    <button
                      onClick={() => {
                        setEditingCatId(null);
                        setEditingCatName("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>{c.name}</div>
                    <button onClick={() => startEditCategory(c)}>Edit</button>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      style={{ color: "crimson" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Products tab */}

      {tab === "products" && (
        <div>
          <h2>Products</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "420px 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >

            {/* Form */}

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {editingProductId ? "Edit Product" : "Add Product"}
              </h3>
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  placeholder="Name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  style={{ padding: 10 }}
                />
                <input
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, price: e.target.value }))
                  }
                  style={{ padding: 10 }}
                />
                <input
                  placeholder="Cost price"
                  value={productForm.costPrice}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, costPrice: e.target.value }))
                  }
                  style={{ padding: 10 }}
                />
                <select
                  value={productForm.categoryId}
                  onChange={(e) => onPickCategory(e.target.value )}
                  style={{ padding: 10 }}
                >
                  <option value="">Pick category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder='Tags (comma separated) e.g. "premium, brass, dimmable"'
                  value={productForm.tagsText}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, tagsText: e.target.value }))
                  }
                  style={{ padding: 10 }}
                />
                <input
                  placeholder="Image URL"
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  style={{ padding: 10 }}
                />
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  style={{ padding: 10 }}
                />
                <select
                  value={productForm.material}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, material: e.target.value }))
                  }
                  style={{ padding: 10 }}
                >
                  {[
                    "Wood",
                    "Brass",
                    "Ceramic",
                    "Glass",
                    "Metal",
                    "Rattan",
                    "Marble",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={productForm.lightQuality}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      lightQuality: e.target.value,
                    }))
                  }
                  style={{ padding: 10 }}
                >
                  {["Warm", "Neutral", "Cool"].map((lq) => (
                    <option key={lq} value={lq}>
                      {lq}
                    </option>
                  ))}
                </select>
                <input
                  placeholder='Features (comma separated) e.g. "LED, Smart, Dimmable"'
                  value={productForm.featuresText}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      featuresText: e.target.value,
                    }))
                  }
                  style={{ padding: 10 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={submitProduct}
                    style={{ padding: "10px 12px" }}
                  >
                    {editingProductId ? "Save" : "Add"}
                  </button>
                  <button
                    onClick={resetProductForm}
                    style={{ padding: "10px 12px" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* List */}

            <div>
              {products.length === 0 ? (
                <p>No products yet.</p>
              ) : (
                products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          {p.categoryName} • R {p.price} • Cost R {p.costPrice}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          Tags:{" "}
                          {Array.isArray(p.tags) ? p.tags.join(", ") : "-"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <button onClick={() => startEditProduct(p)}>
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{ color: "crimson" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders tab */}

      {tab === "orders" && (
        <div>
          <h2>Orders</h2>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <input
              placeholder="Search by order id or email..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={{ padding: 10, minWidth: 260 }}
            />
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="All">All statuses</option>
              <option value="pending_payment">pending_payment</option>
              <option value="complete">complete</option>
            </select>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="All">All payment types</option>
              <option value="cod">COD</option>
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          {ordersLoading ? (
            <p>Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p>No orders match your filters.</p>
          ) : (
            filteredOrders.map((o) => (
              <div
                key={o.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>Order: {o.id}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {o.userEmail} • {o.status} • {o.paymentType} • R {o.total}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {(o.items || []).map((it) => (
                    <div key={it.id || it.name}>
                      {it.name} — {it.quantity} × R {it.price}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports tab */}

      {tab === "reports" && (
        <div>
          <h2>Reports</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Financial</h3>
              <p>
                Sales: <strong>R {report.totalSales.toFixed(2)}</strong>
              </p>
              <p>
                Cost of Sales: <strong>R {report.totalCost.toFixed(2)}</strong>
              </p>
              <p>
                Profit: <strong>R {report.profit.toFixed(2)}</strong>
              </p>
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Products</h3>
              <p>
                Best-selling product:{" "}
                <strong>
                  {report.bestProduct? `${report.bestProduct[0]} (${report.bestProduct[1]} sold)` : "N/A"}
                </strong>
              </p>
              <p>
                Best category:{" "}
                <strong>
                  {report.bestCategory? `${report.bestCategory[0]} (${report.bestCategory[1]} sold)` : "N/A"}
                </strong>
              </p>
            </div>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
}}
            >
              <h3 style={{ marginTop: 0 }}>Customers</h3>
              <p>
                Top customer:{" "}
                <strong>{report.bestCustomer ? `${report.bestCustomer[0]} (R ${report.bestCustomer[1].toFixed(2)})` : "N/A"}
                </strong>
              </p>
              <p style={{ fontSize: 12, opacity: 0.8 }}>
                (You can add demographics later if you capture it in signup/profile.)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
