// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingBag, 
  PieChart, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, path: "/" },
    { name: "Custos Fixos", icon: Zap, path: "/fixed-costs" },
    { name: "Compras", icon: ShoppingBag, path: "/purchases" },
    { name: "Variáveis", icon: PieChart, path: "/variable-expenses" },
    { name: "Ajustes", icon: Settings, path: "/settings" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* --- VERSÃO DESKTOP (Sidebar Lateral) --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 border-r border-gray-800 fixed left-0 top-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-500 tracking-wider">FINANÇAS</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => logOut()}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* --- VERSÃO MOBILE (Bottom Navigation) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive(item.path) ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}