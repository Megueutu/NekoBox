import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";

export async function logout() {
  await signOut(auth);
}