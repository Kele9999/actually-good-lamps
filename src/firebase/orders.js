import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createOrder({ items, total, customer }) {
  const docRef = await addDoc(collection(db, "orders"), {
    items,
    total,
    customer, // { name, phone, address } etc
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}