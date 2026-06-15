import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

export async function login(email, senha) {
  try {
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

    console.log("Logado:", userCredential.user);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function loginWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);

    console.log("Logado com Google:", userCredential.user);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}