import { signOut } from "firebase/auth";
import { auth } from "./firebase.js";

async function logout() {
  await signOut(auth);
}