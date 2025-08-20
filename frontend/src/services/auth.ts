// services/auth.ts
import { auth } from "@/src/firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut} from "firebase/auth";

export const loginComEmailESenha = async (email: string, senha: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, senha);  // <— corrige o nome
    console.log("Login realizado com sucesso!");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const cadastrarComEmailESenha = async (email: string, senha: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    console.log("Usuário cadastrado com sucesso! UID:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    throw error;
  }
};

export const enviarEmailDeRecuperacao = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Email de recuperação enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    throw error;
  }
}

export const logout = async () => {
  try {
    await signOut(auth);  // <— agora usa a função importada
    console.log("Logout realizado com sucesso!");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};
export { auth };

