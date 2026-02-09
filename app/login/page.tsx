// src/app/login/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { user, googleSignIn } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/app");
    }
  }, [user, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />

      {/* Botão Voltar */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition group z-20 cursor-pointer"
      >
        <div className="p-2 rounded-full bg-gray-900 border border-gray-800 group-hover:border-gray-600 transition">
          <ArrowLeft size={18} />
        </div>
        <span className="text-sm font-medium">Voltar para o início</span>
      </Link>

      <div className="w-full max-w-md p-4 relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 md:p-10">
          
          {/* LOGO CORRIGIDA (Sem 'fill', com tamanho fixo) */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <Image 
                 src="/logo.png" 
                 alt="Vida Adulta Logo" 
                 width={80} // Tamanho fixo para garantir que apareça
                 height={80} 
                 className="rounded-xl shadow-lg shadow-blue-900/20 object-cover"
                 priority // Carrega mais rápido
               />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acesse sua conta</h1>
            <p className="text-gray-400 text-sm">
              Sua liberdade financeira começa com organização.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="text-green-500 shrink-0" size={18} />
              <span>Controle unificado de gastos do casal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="text-blue-500 shrink-0" size={18} />
              <span>Projeção automática de parcelas futuras</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="text-purple-500 shrink-0" size={18} />
              <span>Definição de cotas e limites mensais</span>
            </div>
          </div>
          
          {/* BOTÃO CORRIGIDO (Cursor pointer e Hover mais forte) */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-900 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              // SVG do Google
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{isLoggingIn ? "Conectando..." : "Entrar com Google"}</span>
          </button>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
             <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                <ShieldCheck size={14} />
                <span>Ambiente Seguro</span>
             </div>
             <p className="text-xs text-gray-600">
               Ao continuar, você concorda com os Termos de Uso do Vida Adulta.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}