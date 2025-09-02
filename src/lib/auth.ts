import { auth, googleProvider } from "./firebaseClient";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

export function signInGoogle(): Promise<void> {
  return signInWithPopup(auth, googleProvider).then(() => undefined);
}
export function signOutGoogle(): Promise<void> {
  return signOut(auth);
}
export function onUser(cb: (u: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
