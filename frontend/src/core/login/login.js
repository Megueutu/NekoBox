import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.js";

async function login(email, senha) {
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
  }
}