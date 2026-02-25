import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchProducts() {
  const snap = await getDocs(collection(db, "products"));

  return snap.docs.map((doc) => ({
    id: doc.id,      // Firestore document ID
    ...doc.data(),   // name, price, category, imageUrl, description
  }));
}