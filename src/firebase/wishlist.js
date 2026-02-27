import { db } from "./firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

// path: users/{uid}/wishlist/{productId}

export async function getWishlist(uid) {
  const snap = await getDocs(collection(db, "users", uid, "wishlist"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function isWishlisted(uid, productId) {
  const ref = doc(db, "users", uid, "wishlist", productId);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function addWishlistItem(uid, product) {
  const ref = doc(db, "users", uid, "wishlist", product.id);
  await setDoc(ref, {
    productId: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    createdAt: Date.now(),
  });
}

export async function removeWishlistItem(uid, productId) {
  const ref = doc(db, "users", uid, "wishlist", productId);
  await deleteDoc(ref);
}