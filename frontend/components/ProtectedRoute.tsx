'use client';

import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState, Suspense } from "react";
import { app } from "@/src/firebase/firebase";

const auth = getAuth(app);

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setLogado(true);
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (carregando) {
    return <div className="p-8 text-center">Verificando autenticação...</div>;
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      {logado ? children : null}
    </Suspense>
  );
}
