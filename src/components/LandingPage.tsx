// src/components/LandingPage.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Users, 
  CreditCard, 
  CalendarClock, 
  PieChart, 
  Share2, 
  CheckCircle2 
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500 selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="container mx-auto p-6 flex justify-between items-center relative z-10 border-b border-white/5">
        <div className="flex items-center gap-2">
            <Image 
                src="/logo.png" 
                alt="Vida Adulta Logo" 
                width={40}  // Define largura fixa
                height={40} // Define altura fixa
                className="rounded-lg shadow-lg shadow-blue-900/50 object-cover"
            />
            <span className="text-xl font-bold tracking-tight">Vida Adulta</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="hidden md:block text-gray-400 hover:text-white font-medium transition">
            Entrar
          </Link>
          <Link 
            href="/login" 
            className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            Começar <span className="hidden md:inline">Agora</span> <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        {/* Efeito de fundo (Glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />

        <div className="container mx-auto px-6 text-center relative z-10">
          
          {/* Tagline Inclusiva */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Para sua jornada financeira, solo ou em família.
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            A vida adulta é difícil.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Seu dinheiro não precisa ser.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Organize gastos fixos, domine as compras parceladas e defina metas reais. 
            Uma plataforma simples para quem quer paz no fim do mês.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login" 
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              Criar Conta Grátis <ArrowRight size={20} />
            </Link>
            <a href="#como-funciona" className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 transition flex justify-center">
              Ver como funciona
            </a>
          </div>
        </div>
      </header>

      {/* --- COMO FUNCIONA (Feature Grid) --- */}
      <section id="como-funciona" className="py-24 bg-gray-900/30 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como o Vida Adulta te ajuda?</h2>
            <p className="text-gray-400">Um fluxo pensado para a realidade brasileira de parcelas e boletos.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Passo 1: Família */}
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                <Users size={100} />
              </div>
              <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Crie seu Núcleo</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ao entrar, você cria um "Household" (Família). Se mora sozinho, é seu controle pessoal. Se mora junto, basta compartilhar o ID e os dois gerenciam a mesma carteira.
              </p>
            </div>

            {/* Passo 2: Parcelas */}
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                <CreditCard size={100} />
              </div>
              <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Projeção de Parcelas</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Comprou uma TV em 10x? Lance apenas uma vez. O sistema cria as cobranças futuras automaticamente e te avisa quanto da renda do Natal já está comprometida em Março.
              </p>
            </div>

            {/* Passo 3: Recorrência */}
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                <CalendarClock size={100} />
              </div>
              <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center mb-4 text-green-400 group-hover:bg-green-600 group-hover:text-white transition">
                <CalendarClock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Contas Recorrentes</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Aluguel, internet, energia. Gere todas as contas fixas até o fim do ano com um clique. Edite valores individuais quando a conta de luz vier mais cara.
              </p>
            </div>

            {/* Passo 4: Cotas */}
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                <PieChart size={100} />
              </div>
              <div className="w-12 h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4 text-yellow-400 group-hover:bg-yellow-600 group-hover:text-white transition">
                <PieChart size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">4. Cotas e Limites</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Defina limites para "Uber", "Mercado" ou "Lazer". Acompanhe com barras de progresso e saiba a hora exata de parar de gastar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- DETALHE DA FAMÍLIA (Feature Highlight) --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block p-3 rounded-lg bg-blue-900/20 text-blue-400 mb-2">
                <Share2 size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Finanças a dois, sem brigas.</h2>
              <p className="text-gray-400 text-lg">
                O Vida Adulta foi desenhado para ser colaborativo. 
                Ao criar sua conta, você recebe um <strong>ID Único</strong>.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span>Sincronização em tempo real entre dispositivos</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span>Visualização unificada da renda familiar</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span>Transparência total nos gastos</span>
                </li>
              </ul>
            </div>
            
            {/* Ilustração Visual do ID */}
            <div className="flex-1 w-full max-w-md bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
              <div className="text-center">
                 <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Seu ID de Família</p>
                 <div className="bg-black/50 border border-gray-600 rounded-lg p-4 font-mono text-2xl text-green-400 tracking-wider mb-4">
                   8f3a-22b1-9c
                 </div>
                 <p className="text-sm text-gray-500">
                   Basta enviar este código para seu parceiro(a) colar na área de configurações. Pronto! Vocês estão conectados.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 border-t border-gray-900 bg-black text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para organizar a casa?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Junte-se a quem já entendeu que a vida adulta é melhor com boletos pagos e metas definidas.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            Começar Gratuitamente
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-gray-900 bg-gray-950 text-center">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Vida Adulta. Feito com ☕ e 💻 para sobreviver ao caos.
        </p>
      </footer>
    </div>
  );
}