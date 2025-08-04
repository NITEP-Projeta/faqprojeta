'use client'

import { Avatar } from 'primereact/avatar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@/src/firebase/firebase"; // seu arquivo de config
import { LogOut } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/firebase/firebase";

import { ProtectedRoute } from "@/components/ProtectedRoute";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true)
  const [isApplicationOpen, setIsApplicationOpen] = useState(true)

  const pathname = usePathname()

  // Rotas onde NÃO queremos exibir a Sidebar
  const noSidebarRoutes = ['/login', '/register', '/forgot-password']

  // Se a rota atual estiver na lista, não renderiza a Sidebar
  const hideSidebar = noSidebarRoutes.includes(pathname)

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const auth = getAuth(app);

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
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  };

  const handleLogout = async () => {
  await signOut(auth);
  router.replace("/login"); // redireciona para login após logout
  };
  return (
    <ProtectedRoute>
    <div className="flex min-h-screen">
      {/* SIDEBAR FIXA */}
      {isSidebarOpen && (
        <aside className="w-[280px] bg-[#F5F5F5] border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 left-0 shadow-sm z-20 transition-all duration-300">
          {/* TOPO COM LOGO */}
          <div className="px-5 py-4 flex items-center justify-between bg-[#F5F5F5] shadow-sm gap-23">
            <div className="flex items-center gap-3">
              <img 
                src="/Logotipo_Projeta_1.png" 
                alt="logo" 
                className="w-32 max-w-[140px] object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-black hover:text-[#dc2e1c] p-2 rounded-full transition-all duration-300"
            >
              <i className="pi pi-times text-lg cursor-pointer"></i>
            </button>
          </div>

          {/* MENU */}
          <div className="overflow-y-auto flex-1 px-4 py-4 text-sm border-t-4 border-[#dc2e1c]">
            {/* FAVORITES */}
            <div className="mb-4">
              <button
                onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                className="text-[#EAEAEA] font-medium mb-2 flex items-center justify-between w-full focus:outline-none cursor-pointer"
              >
                <span className='text-lg font-extrabold text-black'>Biblioteca Corporativa</span>
                <i
                  className={`pi ${isFavoritesOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform text-[#EAEAEA] hover:text-[#F2C14E] duration-300`}
                ></i>
              </button>

              {isFavoritesOpen && (
              <ul className="space-y-1 transition-all text-black font-medium">
                  <li>
                      <Link
                          href="/"
                          aria-label="Ir para a página principal"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-home" />
                          <span className="font-medium">Início</span>
                      </Link>
                  </li>

                  <li>
                      <Link
                          href="/manualColaborador"
                          aria-label="Abrir Manual do Colaborador"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-book"></i>
                          <span className="font-medium">Manual do Colaborador</span>
                      </Link>
                  </li>

                  <li>
                      <Link
                          href="/manualInterno"
                          aria-label="Abrir Manual Interno"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-file"></i>
                          <span className="font-medium">Manual Interno</span>
                      </Link>
                  </li>

                  <li>
                      <Link
                          href="/diretrizesInternas"
                          aria-label="Abrir Diretrizes Internas"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-align-justify"></i>
                          <span className="font-medium">Diretrizes Internas</span>
                      </Link>
                  </li>

                  <li>
                      <Link
                          href="/sipoc"
                          aria-label="Abrir SIPOC"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-sitemap"></i>
                          <span className="font-medium">SIPOC</span>
                      </Link>
                  </li>

                  <li>
                      <Link
                          href="/termoVeiculos"
                          aria-label="Abrir Termo Veículos"
                          className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#dfe0db] hover:scale-[1.03] hover:text-[#AF1B1B]"
                      >
                          <i className="pi pi-car"></i>
                          <span className="font-medium">Termo Veículos</span>
                      </Link>
                  </li>
                  <li>
                    <Link
                        href="/cadernoCargos"
                        aria-label="Abrir Caderno de Cargos"
                        className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]"
                    >
                        <i className="pi pi-briefcase"></i>
                        <span className="font-medium">Caderno de Cargos</span>
                    </Link>
                  </li>
              </ul>
              )}
            </div>

            {/* APPLICATION */}
            <div>
              <button
                onClick={() => setIsApplicationOpen(!isApplicationOpen)}
                className="text-[#EAEAEA] font-medium mb-2 flex items-center justify-between w-full focus:outline-none cursor-pointer"
              >
                <span className='text-lg font-extrabold text-black'>Painel de Controle</span>
                <i
                  className={`pi ${isApplicationOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform text-[#EAEAEA] hover:text-[#F2C14E] duration-300`}
                ></i>
              </button>

              {isApplicationOpen && (
                <ul className="space-y-1 text-black">
                    <li>
                        <Link
                            href="/admin"
                            aria-label="Ir para a página de Dashboard"
                            className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]"
                        >
                            <i className="pi pi-chart-bar"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/chat"
                            aria-label="Ir para a página de Chat"
                            className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#AF1B1B]"
                        >
                            <i className="pi pi-comments"></i>
                            <span>Chat</span>
                        </Link>
                    </li>
                </ul>
              )}
            </div>
          </div>

          {/* RODAPÉ COM USUÁRIO */}
          <div className="p-4 bg-[#1A1A1A] border-t border-neutral-800">
            <div className="flex items-center justify-between gap-3">
              {/* Avatar e nome */}
              <div className="flex items-center gap-3">
                <Avatar
                  image={user?.photoURL || "/Logo_Projeta.png"}
                  shape="circle"
                  className="w-9 h-9 border border-neutral-500"
                />
                <span className="text-sm font-medium text-gray-200 truncate max-w-[120px]">
                  {displayName || "Usuário"}
                </span>
              </div>

              {/* Botão de sair */}
              <button
                onClick={handleLogout}
                title="Sair"
                className="p-2 rounded-md hover:bg-[#dc2e1c]/10 transition-colors text-gray-300 hover:text-[#dc2e1c] cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* BOTÃO DE REABRIR SIDEBAR */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-[#8B0D0D] border border-[#d4a72c] shadow-md p-3 rounded-md text-white font-bold hover:bg-[#1A1A1A] hover:text-[#F2C14E] transition-all duration-300 cursor-pointer"
        >
          <i className="pi pi-bars"></i>
        </button>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 bg-[#F5F5F5] p-4 overflow-y-auto">{children}</main>
    </div>
    </ProtectedRoute>
  )
}
