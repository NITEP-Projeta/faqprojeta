"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/src/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AdminDuvidas } from "@/components/AdminDuvidas";

export default function AdminDuvidasPage() {
  const auth = getAuth();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const flag = !!snap.data()?.isAdmin;
        setIsAdmin(flag);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [auth, router]);

  if (checking) return <p>Verificando acesso…</p>;
  if (!isAdmin) return <p>Acesso negado.</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Painel De Dúvidas</h1>
      <AdminDuvidas />
    </div>
  );
}
