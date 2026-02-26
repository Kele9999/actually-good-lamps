import { useContext, useEffect, useState } from "react";
import MyContext from "../../../context/data/myContext";

export default function Dashboard() {
  const {
    products,
    categories,
    orders,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useContext(MyContext);

  const [tab, setTab] = useState("products");

 useEffect(() => {
  fetchCategories();
}, [fetchCategories]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={() => setTab("products")}>Products</button>
        <button onClick={() => setTab("categories")}>Categories</button>
        <button onClick={() => setTab("orders")}>Orders</button>
      </div>

      {tab === "categories" && (
        <CategoriesSection
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
        />
      )}

      {tab === "products" && (
        <ProductsSection
          products={products}
          categories={categories}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
        />
      )}

      {tab === "orders" && (
  <OrdersSection orders={orders} />
)}

    </div>
  );
}

function OrdersSection({ orders }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2>Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 12,
            borderRadius: 8
          }}>
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> R {order.total}</p>
            <p><strong>User:</strong> {order.userEmail}</p>

            <div style={{ marginTop: 8 }}>
              <strong>Items:</strong>
              {order.items.map((item) => (
                <div key={item.id}>
                  {item.name} — {item.quantity} × R {item.price}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CategoriesSection({ categories, addCategory, updateCategory, deleteCategory }) {
  const [name, setName] = useState("");

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Categories</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            addCategory(name);
            setName("");
          }}
        >
          Add Category
        </button>
      </div>

      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          cat={cat}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
        />
      ))}
    </div>
  );
}

function CategoryRow({ cat, updateCategory, deleteCategory }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(cat.name);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      {edit ? (
        <>
          <input value={val} onChange={(e) => setVal(e.target.value)} />
          <button
            onClick={() => {
              updateCategory(cat.id, val);
              setEdit(false);
            }}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <span style={{ flex: 1 }}>{cat.name}</span>
          <button onClick={() => setEdit(true)}>Rename</button>
        </>
      )}

      <button onClick={() => deleteCategory(cat.id)}>Delete</button>
    </div>
  );
}

function ProductsSection({
  products,
  categories,
  addProduct,
  updateProduct,
  deleteProduct,
}) {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "",
    imageUrl: "",
    description: "",
    stock: 10,
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    if (editingId) {
      await updateProduct(editingId, payload);
      setEditingId(null);
    } else {
      await addProduct(payload);
    }

    setForm({
      name: "",
      price: 0,
      category: "",
      imageUrl: "",
      description: "",
      stock: 10,
    });
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm(product);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Products</h2>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => handleChange("stock", e.target.value)}
        />

        <select
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 8,
          }}
        >
          <strong>{p.name}</strong> — R {p.price}
          <div style={{ marginTop: 6 }}>
            <button onClick={() => startEdit(p)}>Edit</button>
            <button onClick={() => deleteProduct(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}