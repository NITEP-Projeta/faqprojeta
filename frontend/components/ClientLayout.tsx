'use client'

import Link from 'next/link';

import { Home, Book, List, ShieldCheck, Notebook, Car, Contact, CalendarCheck2, LogOut } from "lucide-react";

import { useEffect, useState } from "react";

import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/src/firebase/firebase";

import { useCurrentUser } from '@/hooks/useCurrentUser';

import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import useUnreadBadge from '@/hooks/useUnreadBadge';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Router para navegação
  const router = useRouter();

  // Auth para autenticação
  const auth = getAuth(app);

  // Estados para controle de visibilidade da sidebar e seções
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true)
  const [isApplicationOpen, setIsApplicationOpen] = useState(true)

  // Estado para armazenar o nome do usuário
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Hook para verificar se o usuário é admin
  const { isAdmin } = useCurrentUser();

  const unread = useUnreadBadge(isAdmin);

  // Hook para verificar se o usuário está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().nome as string);
        } else {
          setDisplayName(user.displayName || user.email || "Usuário");
        }
      } else {
        setDisplayName(null);
      }});

    return () => unsubscribe();
  }, []);

  // Logout do usuário
  const handleLogout = async () => {
  router.replace("/login");
  setTimeout(() => {
    signOut(auth)}, 3000);
 };

  return (
    // ProtectedRoute para garantir que apenas usuários autenticados acessem o layout
    <ProtectedRoute>
    {/* Div principal */}
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      {isSidebarOpen && (
        <aside className="w-[280px] bg-[#F5F5F5] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 left-0 shadow-sm z-20 transition-all duration-300">
          {/* TOPO COM LOGO */}
          <div className="px-5 py-4 flex items-center justify-between bg-[#F5F5F5] shadow-sm gap-23">
            <div className="flex items-center gap-3">
              <img 
                src="/Logotipo_Projeta_1.png" 
                alt="logo" 
                className="w-32 max-w-[140px] object-contain transition-transform duration-300 hover:scale-105"/>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-black hover:text-[#dc2e1c] p-2 rounded-full transition-all duration-300">
              <i className="pi pi-times text-lg cursor-pointer"></i>
            </button>
          </div>
          {/* MENU */}
          <div className="overflow-y-auto flex-1 px-4 py-4 text-sm border-t-4 border-[#dc2e1c]">
            {/* Favoritos */}
            <div className="mb-4">
              <button
                onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                className="text-[#EAEAEA] font-medium mb-2 flex items-center justify-between w-full focus:outline-none cursor-pointer">
                <span className='text-lg font-extrabold text-black'>Biblioteca Corporativa</span>
                <i className={`pi ${isFavoritesOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform text-black hover:text-[#AF1B1B] duration-300`}></i>
              </button>
              {/* Verificando se o botão está aberto e exibindo os favoritos */}
              {isFavoritesOpen && (
              <ul className="space-y-1 transition-all text-black font-medium">
                  <li>
                      <Link href="/" aria-label="Ir para a página principal" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Início</span>
                      </Link>
                  </li>
                  <li>
                      <Link href="/manualColaborador" aria-label="Abrir Manual do Colaborador" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <Book className="w-5 h-5" />
                        <span className="font-medium">Manual do Colaborador</span>
                      </Link>
                  </li>
                  <li>
                      <Link href="/manualInterno" aria-label="Abrir Manual Interno" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <List className="w-5 h-5" />
                        <span className="font-medium">Manual Interno</span>
                      </Link>
                  </li>
                  <li>
                      <Link href="/diretrizesInternas" aria-label="Abrir Diretrizes Internas" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-medium">Diretrizes Internas</span>
                      </Link>
                  </li>
                  <li>
                      <Link href="/sipoc" aria-label="Abrir SIPOC" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <Notebook className="w-5 h-5" />
                        <span className="font-medium">SIPOC</span>
                      </Link>
                  </li>
                  <li>
                      <Link href="/termoVeiculos" aria-label="Abrir Termo Veículos" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <Car className="w-5 h-5" />
                        <span className="font-medium">Termo Veículos</span>
                      </Link>
                  </li>
                  <li>
                    <Link href="/cadernoCargos" aria-label="Abrir Caderno de Cargos" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                      <Contact className="w-5 h-5" />
                      <span className="font-medium">Caderno de Cargos</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/ponto" aria-label="Manual de Ponto" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                      <CalendarCheck2 className="w-5 h-5" />
                      <span className="font-medium">Manual de Ponto</span>
                    </Link>
                  </li>
                  {!isAdmin && (
                    <li>
                      <Link href="/chat" aria-label="Ir para a página de Chat" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                        <i className="pi pi-comments"></i>
                        <span>Chat</span>
                          {unread.total > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-[#AF1B1B] text-white">
                              {unread.total}
                            </span>
                          )}
                      </Link>
                    </li>
                  )}
              </ul>
              )}
            </div>
            {/* Controle de ADM */}
            {isAdmin && (
            <div>
              <button onClick={() => setIsApplicationOpen(!isApplicationOpen)} className="text-[#EAEAEA] font-medium mb-2 flex items-center justify-between w-full focus:outline-none cursor-pointer">
                <span className='text-lg font-extrabold text-black'>Painel de Controle</span>
                <i className={`pi ${isApplicationOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform text-black hover:text-[#AF1B1B] duration-300`}></i>
              </button>
              {/* Verificando se o botão está aberto e exibindo as opções de administração */}
              {isApplicationOpen && (
                <ul className="space-y-1 text-black">
                  <li>
                    <Link href="/admin" aria-label="Ir para a página de Dashboard" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                      <i className="pi pi-chart-bar"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admDuvidas" aria-label="Ir para a página de Dashboard" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                      <i className="pi pi-question-circle"></i>
                      <span>Duvidas</span>
                    </Link>
                  </li>                  
                  <li>
                    <Link href="/admin/chat" aria-label="Ir para a página de Chat" className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]">
                      <i className="pi pi-comments"></i>
                      <span>Chat</span>
                        {unread.total > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-[#AF1B1B] text-white">
                            {unread.total}
                          </span>
                        )}
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            )}
          </div>
          {/* RODAPÉ COM USUÁRIO */}
          <div className="p-4 bg-[#AF1B1B] hover:bg-[#8C1616] transition-colors duration-300 text-white">
            <div className="flex items-center justify-between gap-3">
              {/* Nome e Botão Logout*/}
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white truncate max-w-[180px]">
                  {displayName || "Desconhecido"}
                </span>
              </div>
              <button onClick={handleLogout} title="Sair" className="p-2 rounded-md hover:bg-black transition-colors text-white hover:text-[#dc2e1c] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
      )}
      {/* REABRIR SIDEBAR */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 z-50 bg-[#EAEAEA] p-2 shadow-md border-4 border-[#AF1B1B] border-solid rounded-md transition-all duration-300 cursor-pointer">
          <i className="pi pi-bars text-[#AF1B1B]"></i>
        </button>
      )}
      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 bg-[#F5F5F5] p-5 overflow-y-auto">{children}</main>
    </div>
    </ProtectedRoute>
  )
}
