// src/app/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useHousehold } from "@/context/HouseholdContext";
import { getMonthlyTransactions } from "@/services/transactionService";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Wallet, 
  TrendingDown, 
  CreditCard, 
  Zap, 
  PieChart, 
  ArrowRight,
  AlertTriangle
} from "lucide-react";

export default function DashboardPage() {
  const { household } = useHousehold();
  
  // Estado
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Totais
  const [totals, setTotals] = useState({
    fixed: 0,
    installments: 0,
    variable: 0,
    totalSpent: 0,
    balance: 0
  });

  // Dados do Próximo Mês (para projeção)
  const [nextMonthTotal, setNextMonthTotal] = useState(0);

  const loadDashboardData = async () => {
    if (!household) return;
    setLoading(true);
    
    try {
      // 1. Busca dados deste mês
      const transactions = await getMonthlyTransactions(household.id, currentDate);
      
      const fixed = transactions.filter(t => t.type === 'FIXED').reduce((acc, t) => acc + t.amount, 0);
      const installments = transactions.filter(t => t.type === 'INSTALLMENT').reduce((acc, t) => acc + t.amount, 0);
      const variable = transactions.filter(t => t.type === 'VARIABLE').reduce((acc, t) => acc + t.amount, 0);
      
      const totalSpent = fixed + installments + variable;
      const income = household.settings.monthlyIncome || 0;

      setTotals({
        fixed,
        installments,
        variable,
        totalSpent,
        balance: income - totalSpent
      });

      // 2. Busca dados do PRÓXIMO mês (apenas previsão de fixos e parcelas)
      // Nota: Variáveis são difíceis de prever, então somamos 0 ou uma média (aqui usaremos 0 para ser conservador)
      const nextDate = addMonths(currentDate, 1);
      const nextTransactions = await getMonthlyTransactions(household.id, nextDate);
      const nextTotal = nextTransactions.reduce((acc, t) => acc + t.amount, 0);
      setNextMonthTotal(nextTotal);

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [household, currentDate]);

  if (loading) return <div className="p-8 text-center text-gray-500">Calculando finanças...</div>;
  if (!household) return <div className="p-8 text-center">Carregando família...</div>;

  const income = household.settings.monthlyIncome || 0;
  const healthColor = totals.balance > 0 ? "text-green-400" : "text-red-500";
  const percentSpent = Math.min((totals.totalSpent / income) * 100, 100);

  return (
    <div className="space-y-6 pb-20">
      {/* --- HEADER: Navegação de Mês --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
          <span className="capitalize font-semibold w-32 text-center">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
        </div>
      </div>

      {/* --- CARD PRINCIPAL: SALDO --- */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden">
        {/* Background Decorativo */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={120} />
        </div>

        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">Saldo Restante (Previsto)</p>
          <h2 className={`text-4xl font-bold mb-2 ${healthColor}`}>
            R$ {totals.balance.toFixed(2)}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            de uma renda de R$ {income.toFixed(2)}
          </p>

          {/* Barra de Progresso Geral */}
          <div className="w-full bg-black/40 rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${totals.balance < 0 ? 'bg-red-600' : 'bg-green-500'}`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>{percentSpent.toFixed(0)}% da renda comprometida</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* --- CARDS DE CATEGORIAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Fixos */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Zap size={12}/> Custos Fixos</p>
            <p className="text-xl font-bold">R$ {totals.fixed.toFixed(2)}</p>
          </div>
          <div className="h-10 w-1 bg-blue-500/20 rounded-full">
            <div className="bg-blue-500 w-full rounded-full" style={{ height: `${(totals.fixed/totals.totalSpent)*100}%` }}></div>
          </div>
        </div>

        {/* Card 2: Parcelas */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><CreditCard size={12}/> Parcelas</p>
            <p className="text-xl font-bold">R$ {totals.installments.toFixed(2)}</p>
          </div>
          <div className="h-10 w-1 bg-purple-500/20 rounded-full">
            <div className="bg-purple-500 w-full rounded-full" style={{ height: `${(totals.installments/totals.totalSpent)*100}%` }}></div>
          </div>
        </div>

        {/* Card 3: Variáveis */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><PieChart size={12}/> Variáveis</p>
            <p className="text-xl font-bold">R$ {totals.variable.toFixed(2)}</p>
          </div>
          <div className="h-10 w-1 bg-yellow-500/20 rounded-full">
            <div className="bg-yellow-500 w-full rounded-full" style={{ height: `${(totals.variable/totals.totalSpent)*100}%` }}></div>
          </div>
        </div>
      </div>

      {/* --- ALERTA / PROJEÇÃO PRÓXIMO MÊS --- */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="text-blue-400" />
          <h3 className="font-bold text-lg">Projeção Futura</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Gastos já agendados para o próximo mês</p>
            <p className="text-xs text-gray-500">(Fixos + Parcelas)</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">R$ {nextMonthTotal.toFixed(2)}</p>
          </div>
        </div>

        {nextMonthTotal > income && (
          <div className="mt-4 bg-red-900/30 text-red-300 p-3 rounded flex items-center gap-2 text-sm border border-red-900/50">
            <AlertTriangle size={16} />
            Cuidado: Os gastos fixos do próximo mês já superam sua renda atual!
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Ver detalhes do próximo mês <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}