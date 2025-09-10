"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/firebase/firebase";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setIsAdmin(snap.exists() && !!snap.data().isAdmin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, isAdmin, loading };
}
