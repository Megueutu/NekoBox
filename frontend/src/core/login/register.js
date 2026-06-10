import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.js";

async function cadastrar(email, senha) {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

    console.log("Usuário criado:", userCredential.user);
  } catch (error) {
    console.error(error.message);
  }
}