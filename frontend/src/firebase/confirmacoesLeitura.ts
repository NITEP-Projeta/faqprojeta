import { auth, db } from "./firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

/**
 * Gera ID fixo: uid__documentoSlug
 */
function buildConfirmDocId(uid: string, documentoSlug: string) {
  return `${uid}__${encodeURIComponent(documentoSlug)}`;
}

/**
 * Verifica se o usuário já confirmou leitura do documento
 */
export async function jaConfirmouLeitura(
  uid: string,
  documentoSlug: string
): Promise<boolean> {
  const docId = buildConfirmDocId(uid, documentoSlug);
  const ref = doc(db, "confirmacoesLeitura", docId);
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * Registra confirmação de leitura (ÚNICA)
 * - Se já existir, NÃO cria de novo
 */
export async function registrarConfirmacaoLeituraUnica(
  documentoSlug: string,
  pagina: string
) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("Usuário não autenticado.");
  }

  const docId = buildConfirmDocId(user.uid, documentoSlug);
  const ref = doc(db, "confirmacoesLeitura", docId);

  // Bloqueia duplicidade já no client
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { jaExistia: true };
  }

  // Busca nome/e-mail do users/{uid}
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : {};

  await setDoc(ref, {
    uid: user.uid,
    nome: userData?.nome ?? "",
    email: user.email,

    documentoSlug,
    pagina,

    acessadoEm: serverTimestamp(),
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : null,
    pagePath:
      typeof window !== "undefined" ? window.location.pathname : "",
  });

  return { jaExistia: false };
}