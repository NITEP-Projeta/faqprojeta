"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ElementType, useEffect, useState } from "react";

import {
  BarChart3,
  Book,
  Car,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Contact,
  FileText,
  Home,
  LogOut,
  Menu,
  Newspaper,
  Notebook,
  PlayCircle,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { db, app } from "@/src/firebase/firebase";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import useUnreadBadge from "@/hooks/useUnreadBadge";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const auth = getAuth(app);

type NavItem = {
  label: string;
  href?: string;
  icon: ElementType;
  action?: "open-vagas";
  badge?: number;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { isAdmin } = useCurrentUser();
  const unread = useUnreadBadge(isAdmin);

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [libraryOpen, setLibraryOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  /* ============================================================
     USUÁRIO
  ============================================================ */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: User | null) => {
        if (!user) {
          setDisplayName(null);
          return;
        }

        try {
          const userDoc = await getDoc(
            doc(db, "users", user.uid)
          );

          if (userDoc.exists()) {
            setDisplayName(
              userDoc.data().nome as string
            );
          } else {
            setDisplayName(
              user.displayName ||
                user.email ||
                "Usuário"
            );
          }
        } catch (error) {
          console.error(
            "Erro ao carregar usuário:",
            error
          );

          setDisplayName(
            user.displayName ||
              user.email ||
              "Usuário"
          );
        }
      }
    );

    return () => unsubscribe();
  }, []);

  /* ============================================================
     SIDEBAR DESKTOP
  ============================================================ */

  useEffect(() => {
    const stored =
      localStorage.getItem("sidebarState");

    if (stored !== null) {
      setDesktopSidebarOpen(
        stored === "true"
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "sidebarState",
      String(desktopSidebarOpen)
    );
  }, [desktopSidebarOpen]);

  /* ============================================================
     MOBILE
  ============================================================ */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen || openForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, openForm]);

  /* ============================================================
     LOGOUT
  ============================================================ */

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error(
        "Erro ao sair do sistema:",
        error
      );
    }
  }

  /* ============================================================
     ITENS
  ============================================================ */

  const libraryItems: NavItem[] = [
    {
      label: "Início",
      href: "/",
      icon: Home,
    },
    {
      label: "Manual",
      href: "/manualColaborador",
      icon: Book,
    },
    {
      label: "Segurança",
      href: "/segurancaTrabalho",
      icon: TriangleAlert,
    },
    {
      label: "SIPOC",
      href: "/sipoc",
      icon: Notebook,
    },
    {
      label: "Veículos",
      href: "/termoVeiculos",
      icon: Car,
    },
    {
      label: "Cargos",
      href: "/cadernoCargos",
      icon: Contact,
    },
    {
      label: "Treinamentos",
      href: "/tutorial",
      icon: PlayCircle,
    },
    {
      label: "Projeta News",
      href: "/projeta-news",
      icon: Newspaper,
    },
    {
      label: "Vagas Internas",
      icon: FileText,
      action: "open-vagas",
    },
  ];

  if (!isAdmin) {
    libraryItems.push({
      label: "Tira Dúvidas",
      href: "/faq",
      icon: CircleHelp,
    });
  }

  const adminItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard-confimacoes",
      icon: BarChart3,
    },
    {
      label: "Dúvidas",
      href: "/admDuvidas",
      icon: CircleHelp,
      badge: unread,
    },
  ];

  /* ============================================================
     ITEM
  ============================================================ */

  function isItemActive(item: NavItem) {
    if (!item.href) return false;

    if (item.href === "/") {
      return pathname === "/";
    }

    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
    );
  }

  function renderNavItem(
    item: NavItem,
    index: number
  ) {
    const Icon = item.icon;
    const active = isItemActive(item);

    const classes = `
      projeta-nav-item
      group
      relative
      flex
      min-h-[40px]
      w-full
      items-center
      gap-2.5
      rounded-lg
      px-2.5
      text-[13px]
      font-medium

      ${
        active
          ? "bg-[#AF1B1B]/10 text-[#AF1B1B]"
          : "text-[#333333] hover:bg-[#ECECEB] hover:text-[#AF1B1B]"
      }
    `;

    const content = (
      <>
        {active && (
          <span className="projeta-active-line absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#AF1B1B]" />
        )}

        <div
          className={`
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            ${
              active
                ? "text-[#AF1B1B]"
                : "text-[#444444] group-hover:text-[#AF1B1B]"
            }
          `}
        >
          <Icon className="h-[17px] w-[17px]" />
        </div>

        <span className="min-w-0 flex-1 truncate text-left">
          {item.label}
        </span>

        {item.badge !== undefined &&
          item.badge > 0 && (
            <span className="projeta-notification-pulse flex min-w-[19px] items-center justify-center rounded-full bg-[#AF1B1B] px-1.5 py-[3px] text-[9px] font-bold leading-none text-white">
              {item.badge > 99
                ? "99+"
                : item.badge}
            </span>
          )}
      </>
    );

    if (item.action === "open-vagas") {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            setOpenForm(true);
            setMobileMenuOpen(false);
          }}
          className={classes}
          style={{
            animationDelay: `${index * 20}ms`,
          }}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href || "#"}
        className={classes}
        style={{
          animationDelay: `${index * 20}ms`,
        }}
      >
        {content}
      </Link>
    );
  }

  /* ============================================================
     CONTEÚDO DA SIDEBAR
  ============================================================ */

  function SidebarContent({
    mobile = false,
  }: {
    mobile?: boolean;
  }) {
    return (
      <>
        {/* LOGO */}

        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <img
            src="/Logotipo_Projeta_1.png"
            alt="Projeta"
            className="w-[112px] object-contain"
          />

          <button
            type="button"
            onClick={() => {
              if (mobile) {
                setMobileMenuOpen(false);
              } else {
                setDesktopSidebarOpen(false);
              }
            }}
            aria-label="Fechar menu"
            className="projeta-button flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-[#AF1B1B]"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </header>

        <div className="h-[3px] shrink-0 bg-[#AF1B1B]" />

        {/* MENU */}

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-3">
          {/* BIBLIOTECA */}

          <section>
            <button
              type="button"
              onClick={() =>
                setLibraryOpen(
                  (current) => !current
                )
              }
              className="flex h-8 w-full items-center justify-between px-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                Biblioteca
              </span>

              {libraryOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              )}
            </button>

            <div
              className={`
                grid
                transition-[grid-template-rows,opacity]
                duration-300
                ease-out

                ${
                  libraryOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="overflow-hidden">
                <div className="mt-1 space-y-[2px]">
                  {libraryItems.map(
                    (item, index) =>
                      renderNavItem(
                        item,
                        index
                      )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ADMIN */}

          {isAdmin && (
            <section className="mt-4 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() =>
                  setAdminOpen(
                    (current) => !current
                  )
                }
                className="flex h-8 w-full items-center justify-between px-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Administração
                </span>

                {adminOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>

              <div
                className={`
                  grid
                  transition-[grid-template-rows,opacity]
                  duration-300
                  ease-out

                  ${
                    adminOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 space-y-[2px]">
                    {adminItems.map(
                      (item, index) =>
                        renderNavItem(
                          item,
                          index
                        )
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </nav>

        {/* PERFIL */}

        <footer
          className="shrink-0 border-t border-gray-200 bg-white p-2.5"
          style={{
            paddingBottom: mobile
              ? "max(10px, env(safe-area-inset-bottom))"
              : undefined,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#AF1B1B] text-[11px] font-bold uppercase text-white">
              {displayName
                ?.trim()
                .charAt(0) || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[12px] font-semibold text-[#202020]"
                title={displayName || "Usuário"}
              >
                {displayName || "Usuário"}
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                {isAdmin
                  ? "Administrador"
                  : "Colaborador"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="projeta-button flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-[#AF1B1B]/10 hover:text-[#AF1B1B]"
            >
              <LogOut className="h-[16px] w-[16px]" />
            </button>
          </div>
        </footer>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5] lg:flex">
        {/* =====================================================
            SIDEBAR DESKTOP
        ===================================================== */}

        <aside
          className={`
            hidden
            h-screen
            shrink-0
            overflow-hidden
            border-r
            border-gray-200
            bg-[#F8F8F7]
            transition-[width]
            duration-300
            ease-out

            lg:sticky
            lg:left-0
            lg:top-0
            lg:flex
            lg:flex-col

            ${
              desktopSidebarOpen
                ? "lg:w-[220px]"
                : "lg:w-0 lg:border-r-0"
            }
          `}
        >
          <div className="flex h-full w-[220px] min-w-[220px] flex-col">
            <SidebarContent />
          </div>
        </aside>

        {/* =====================================================
            BOTÃO REABRIR DESKTOP
        ===================================================== */}

        {!desktopSidebarOpen && (
          <button
            type="button"
            onClick={() =>
              setDesktopSidebarOpen(true)
            }
            aria-label="Abrir menu"
            className="projeta-menu-enter projeta-button fixed left-4 top-4 z-30 hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#AF1B1B] shadow-md hover:bg-[#AF1B1B] hover:text-white lg:flex"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        )}

        {/* =====================================================
            MOBILE TOPBAR
        ===================================================== */}

        <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between border-b border-gray-200 bg-white/95 px-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#AF1B1B] active:bg-[#AF1B1B]/10"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <img
            src="/Logotipo_Projeta_1.png"
            alt="Projeta"
            className="w-[105px] object-contain"
          />

          <div className="h-10 w-10" />
        </header>

        {/* =====================================================
            MOBILE BACKDROP
        ===================================================== */}

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="projeta-fade fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* =====================================================
            DRAWER MOBILE
        ===================================================== */}

        <aside
          className={`
            fixed
            inset-y-0
            left-0
            z-50
            flex
            h-[100dvh]
            w-[84vw]
            max-w-[285px]
            flex-col
            border-r
            border-gray-200
            bg-[#F8F8F7]
            shadow-2xl
            transition-transform
            duration-300
            ease-out

            lg:hidden

            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          <SidebarContent mobile />
        </aside>

        {/* =====================================================
            CONTEÚDO
        ===================================================== */}

        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#F5F5F5]">
          {children}
        </main>

        {/* =====================================================
            MODAL
        ===================================================== */}

        {openForm && (
          <div
            className="projeta-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/75 sm:p-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vagas-title"
          >
            <div className="projeta-modal-content flex h-[100dvh] w-screen flex-col overflow-hidden bg-white sm:h-[94vh] sm:max-w-6xl sm:rounded-2xl sm:shadow-2xl">
              <div className="flex min-h-[64px] shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#AF1B1B]">
                    Oportunidades
                  </p>

                  <h2
                    id="vagas-title"
                    className="mt-0.5 text-base font-bold text-[#171717]"
                  >
                    Vagas Internas
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpenForm(false)
                  }
                  className="projeta-button flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-[#AF1B1B] hover:text-white"
                  aria-label="Fechar formulário"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <iframe
                  src="https://forms.office.com/Pages/ResponsePage.aspx?id=aggIEcw610KuWinVc3B1mZq4vipk6y1MssYGpwNGf0JUNldZTDNKM1pTMTdSV1lNRDZTNUNPNTdLWS4u&embed=true"
                  title="Formulário de Vagas Internas"
                  className="h-full w-full"
                  style={{ border: "none" }}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}