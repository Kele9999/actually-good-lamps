import { useContext } from "react";
import MyContext from "../../../context/data/myContext";

function Dashboard() {
  const { orders } = useContext(MyContext);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>

      <h2 style={{ marginTop: 24 }}>Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> R {order.total}</p>
            <p><strong>Customer:</strong> {order.customer.fullName}</p>
            <p><strong>Phone:</strong> {order.customer.phone}</p>
            <p><strong>Address:</strong> {order.customer.address}</p>

            <div style={{ marginTop: 12 }}>
              <strong>Items:</strong>
              {order.items.map((item) => (
                <div key={item.id} style={{ marginLeft: 16 }}>
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

export default Dashboard;