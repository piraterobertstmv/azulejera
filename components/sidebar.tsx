'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      show: true
    },
    {
      href: "/pedidos",
      label: "Pedidos",
      show: true
    },
    {
      href: "/admin",
      label: "Administración",
      show: session?.user?.role === 'superadmin'
    }
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 transition-all"
      >
        {isCollapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-gradient-to-b from-card/95 to-background/95 
          backdrop-blur-xl border-r border-white/10
          transition-all duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-72'}
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="block group">
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Cursor Manager
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">Business Management System</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              if (!item.show) return null;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-2xl
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-foreground border border-purple-500/30 shadow-lg shadow-purple-500/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }
                  `}
                >
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <div className="mb-6">
            {!isCollapsed && (
              <Button 
                asChild 
                className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 border-0 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all"
              >
                <Link href="/pedidos/nuevo" className="flex items-center justify-center">
                  <span className="font-semibold">Nuevo Pedido</span>
                </Link>
              </Button>
            )}
          </div>

          {/* User Section */}
          <div className={`pt-6 border-t border-white/10 ${isCollapsed ? 'space-y-2' : ''}`}>
            {!isCollapsed ? (
              <div className="glass-card rounded-2xl p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {session?.user?.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="w-full p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Collapse Toggle - Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex mt-4 w-full justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

