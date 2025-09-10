"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { rtdb } from "@/src/firebase/firebase";

export default function ChatEntry() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        router.replace("/login?next=/chat");
        return;
      }

      try {
        // ID determinístico para o chat de suporte desse usuário
        const chatId = `support-${user.uid}`;
        const chatRef = ref(rtdb, `chats/${chatId}`);
        
        // Verifica se o chat já existe no Realtime Database
        const snap = await get(chatRef);
        
        if (!snap.exists()) {
          // Cria o chat no Realtime Database
          await update(chatRef, {
            participants: [user.uid],
            isAdminChat: true,
            lastMessage: "",
            lastMessageTime: null,
            lastMessageTimeClient: Date.now(), // fallback para ordenação
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: user.uid,
          });
        } else {
          // Chat existe, apenas atualiza o timestamp de acesso
          await update(chatRef, {
            updatedAt: serverTimestamp(),
          });
        }

        // Redireciona para o chat específico
        router.replace(`/chat/${chatId}`);
      } catch (error) {
        console.error("Erro ao criar/acessar chat:", error);
        // Em caso de erro, ainda tenta redirecionar
        const chatId = `support-${user.uid}`;
        router.replace(`/chat/${chatId}`);
      }
    });

    return () => unsub();
  }, [router]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
        <div className="text-sm text-gray-600">Abrindo o chat…</div>
      </div>
    </div>
  );
}