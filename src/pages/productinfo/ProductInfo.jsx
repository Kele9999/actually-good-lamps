import { useContext } from "react";
import { useParams } from "react-router-dom";
import MyContext from "../../context/data/myContext";

function ProductInfo() {
  const { id } = useParams();
  const { products, addToCart } = useContext(MyContext);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Product not found</h1>
        <p>That lamp doesn’t exist (yet).</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{ width: "100%", maxWidth: 500, borderRadius: 10, objectFit: "cover" }}
      />

      <div>
        <h1>{product.name}</h1>
        <p style={{ fontSize: 18 }}>R {product.price}</p>
        <p style={{ fontSize: 12 }}>{product.category}</p>
        <p>{product.description}</p>

        <button onClick={() => addToCart(product, 1)}>
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;