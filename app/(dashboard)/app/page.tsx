// src/app/(dashboard)/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useHousehold } from "@/context/HouseholdContext";
import { getMonthlyTransactions } from "@/services/transactionService";
import { getBudgets } from "@/services/budgetService";
import { format, addMonths, subMonths, isSameMonth, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { 
  Wallet, 
  CreditCard, 
  Zap, 
  PieChart, 
  ArrowRight,
  Target,
  History
} from "lucide-react";

// Componente simples de Donut para reutilizar nos cards
const MiniDonut = ({ percent, colorClass }: { percent: number, colorClass: string }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
         <circle
           cx="24" cy="24" r={radius}
           stroke="currentColor" strokeWidth="5" fill="transparent"
           className="text-gray-800"
         />
         <circle
           cx="24" cy="24" r={radius}
           stroke="currentColor" strokeWidth="5" fill="transparent"
           strokeDasharray={circumference}
           strokeDashoffset={strokeDashoffset}
           strokeLinecap="round"
           className={`${colorClass} transition-all duration-1000 ease-out`}
         />
      </svg>
    </div>
  );
};

export default function DashboardPage() {
  const { household } = useHousehold();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState({
    income: 0,
    fixed: 0,
    installments: 0,
    variableReal: 0,
    variablePlanned: 0,
    variableRecentAverage: 0,
    nextMonthFixed: 0
  });

  const loadDashboardData = async () => {
    if (!household) return;
    setLoading(true);
    
    try {
      const income = household.settings.monthlyIncome || 0;
      const today = new Date();

      const refMonth1 = today;
      const refMonth2 = subMonths(today, 1);

      const [
        viewTxs,
        ref1Txs,
        ref2Txs,
        budgets
      ] = await Promise.all([
        getMonthlyTransactions(household.id, currentDate),
        getMonthlyTransactions(household.id, refMonth1),
        getMonthlyTransactions(household.id, refMonth2),
        getBudgets(household.id)
      ]);

      const fixed = viewTxs.filter(t => t.type === 'FIXED').reduce((acc, t) => acc + t.amount, 0);
      const installments = viewTxs.filter(t => t.type === 'INSTALLMENT').reduce((acc, t) => acc + t.amount, 0);
      const variableReal = viewTxs.filter(t => t.type === 'VARIABLE').reduce((acc, t) => acc + t.amount, 0);
      const variablePlanned = budgets.reduce((acc, b) => acc + b.limit, 0);

      const var1 = ref1Txs.filter(t => t.type === 'VARIABLE').reduce((acc, t) => acc + t.amount, 0);
      const var2 = ref2Txs.filter(t => t.type === 'VARIABLE').reduce((acc, t) => acc + t.amount, 0);
      const variableRecentAverage = (var1 + var2) / 2;

      setData({
        income,
        fixed,
        installments,
        variableReal,
        variablePlanned,
        variableRecentAverage,
        nextMonthFixed: 0
      });

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [household, currentDate]);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!household) return <div className="p-8 text-center">Carregando família...</div>;

  // --- CÁLCULOS ---
  const today = new Date();
  const isFutureMonth = isAfter(currentDate, today) && !isSameMonth(currentDate, today);

  const balanceReal = data.income - (data.fixed + data.installments + data.variableReal);
  
  const expenseUsedForProjection = isFutureMonth 
    ? data.variableRecentAverage 
    : Math.max(data.variableReal, data.variableRecentAverage);

  const balancePredicted = data.income - (data.fixed + data.installments + expenseUsedForProjection);
  const balancePlanned = data.income - (data.fixed + data.installments + data.variablePlanned);

  const healthColor = balanceReal > 0 ? "text-green-400" : "text-red-500";
  const percentSpent = Math.min(((data.fixed + data.installments + data.variableReal) / data.income) * 100, 100);

  // Card Comprometido (Fixo + Parcelas)
  const totalCommitted = data.fixed + data.installments;
  const percentCommitted = data.income > 0 ? (totalCommitted / data.income) * 100 : 0;
  
  // Percentuais Individuais (para os cards inferiores)
  const pctFixed = data.income > 0 ? (data.fixed / data.income) * 100 : 0;
  const pctInstallments = data.income > 0 ? (data.installments / data.income) * 100 : 0;
  const pctVariable = data.variablePlanned > 0 ? (data.variableReal / data.variablePlanned) * 100 : 0;

  // Donut Principal (Card Comprometido)
  const radiusCommitted = 18;
  const circCommitted = 2 * Math.PI * radiusCommitted;
  const offsetCommitted = circCommitted - (Math.min(percentCommitted, 100) / 100) * circCommitted;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded-full border border-gray-800 shadow-lg">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white transition">&lt;</button>
          <span className="capitalize font-semibold w-32 text-center text-sm">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white transition">&gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CARD 1: SALDO REAL */}
        <div className="lg:col-span-3 bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition duration-500 transform group-hover:scale-110">
            <Wallet size={150} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isFutureMonth ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`}></span>
                {isFutureMonth ? "Saldo Projetado" : "Saldo Atual (Na Conta)"}
              </p>
              <h2 className={`text-5xl font-bold tracking-tight ${healthColor}`}>
                R$ {balanceReal.toFixed(2)}
              </h2>
            </div>

            <div className="w-full md:w-1/3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Renda Comprometida Total</span>
                <span>{percentSpent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${balanceReal < 0 ? 'bg-red-600' : 'bg-green-500'}`}
                  style={{ width: `${percentSpent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: PREVISÃO */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-yellow-500/30 transition group">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                <History size={20} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Saldo Previsto</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">R$ {balancePredicted.toFixed(2)}</p>
              <div className="flex items-center justify-between text-xs mt-2 bg-gray-950 p-2 rounded-xl border border-gray-800">
                <span className="text-gray-500">Média variáveis:</span>
                <span className="text-yellow-500 font-bold">R$ {expenseUsedForProjection.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: PLANEJADO */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-blue-500/30 transition group">
          <div>
             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Target size={20} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Saldo Planejado</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">R$ {balancePlanned.toFixed(2)}</p>
              <div className="flex items-center justify-between text-xs mt-2 bg-gray-950 p-2 rounded-xl border border-gray-800">
                <span className="text-gray-500">Teto cotas:</span>
                <span className="text-blue-500 font-bold">R$ {data.variablePlanned.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: COMPROMETIDO (FIXO + PARCELAS) */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-purple-500/30 transition group">
          <div>
             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Zap size={20} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Comprometido Total</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-bold text-white tracking-tighter">{percentCommitted.toFixed(0)}%</span>
                <p className="text-xs text-gray-500 font-medium">da renda total</p>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full">
                   <circle cx="28" cy="28" r={radiusCommitted} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800" />
                   <circle cx="28" cy="28" r={radiusCommitted} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circCommitted} strokeDashoffset={offsetCommitted} strokeLinecap="round" className="text-purple-500 transition-all duration-1000 ease-out" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 bg-gray-950 p-2 rounded-xl border border-gray-800">
            <span className="text-gray-500">Fixo + Parcelas:</span>
            <span className="text-purple-500 font-bold">R$ {totalCommitted.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* --- BARRAS DE CATEGORIAS (LINKS CLICKÁVEIS COM GRÁFICO E PORCENTAGEM) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        
        {/* 1. Link para FIXOS */}
        <Link 
          href="/fixed-costs" 
          className="block bg-gray-900 p-5 rounded-xl border border-gray-800 hover:bg-gray-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 text-xs flex items-center gap-1 font-bold uppercase tracking-wider group-hover:text-purple-400 transition-colors">
              <Zap size={14}/> Custos Fixos
            </p>
            <ArrowRight size={14} className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="flex items-center justify-between">
             <div>
               <p className="text-xl font-bold text-white">R$ {data.fixed.toFixed(2)}</p>
               <p className="text-xs text-gray-500 mt-1">{pctFixed.toFixed(0)}% da Renda</p>
             </div>
             {/* Gráfico Donut */}
             <MiniDonut percent={pctFixed} colorClass="text-purple-600" />
          </div>
        </Link>

        {/* 2. Link para PARCELAS */}
        <Link 
          href="/purchases"
          className="block bg-gray-900 p-5 rounded-xl border border-gray-800 hover:bg-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 text-xs flex items-center gap-1 font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">
              <CreditCard size={14}/> Parcelas
            </p>
            <ArrowRight size={14} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="flex items-center justify-between">
             <div>
               <p className="text-xl font-bold text-white">R$ {data.installments.toFixed(2)}</p>
               <p className="text-xs text-gray-500 mt-1">{pctInstallments.toFixed(0)}% da Renda</p>
             </div>
             <MiniDonut percent={pctInstallments} colorClass="text-blue-600" />
          </div>
        </Link>

        {/* 3. Link para VARIÁVEIS */}
        <Link 
          href="/variable-expenses"
          className="block bg-gray-900 p-5 rounded-xl border border-gray-800 hover:bg-gray-800 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
             <p className="text-gray-400 text-xs flex items-center gap-1 font-bold uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
              <PieChart size={14}/> Variáveis
            </p>
            <ArrowRight size={14} className="text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="flex items-center justify-between">
             <div>
               <p className="text-xl font-bold text-white">R$ {data.variableReal.toFixed(2)}</p>
               <p className="text-xs text-gray-500 mt-1">{pctVariable.toFixed(0)}% da Meta</p>
             </div>
             <MiniDonut percent={pctVariable} colorClass="text-yellow-500" />
          </div>
        </Link>
      </div>
      
    </div>
  );
}