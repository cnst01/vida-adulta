// src/app/(dashboard)/fixed-costs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { 
  addSimpleTransaction, 
  getMonthlyTransactions, 
  toggleTransactionStatus, 
  deleteTransaction 
} from "@/services/transactionService";
import { Transaction } from "@/types/finance"; // Certifique-se de ter os tipos
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale"; // Para nomes dos meses em PT
import { Trash2, CheckCircle, Circle, Plus } from "lucide-react";

export default function FixedCostsPage() {
  const { user } = useAuth();
  const { household } = useHousehold();
  
  // Estado
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(""); // Dia do vencimento

  // Carregar dados
  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      const data = await getMonthlyTransactions(household.id, currentDate);
      // Filtra apenas FIXED no frontend (ou poderia ser na query)
      const fixed = data.filter(t => t.type === 'FIXED');
      setTransactions(fixed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  // Actions
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !household) return;

    // Cria a data de vencimento baseada no mês atual selecionado
    const dueDay = parseInt(newDate) || 10;
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dueDay);

    await addSimpleTransaction(user.uid, household.id, {
      description: newTitle,
      amount: parseFloat(newAmount),
      date: dueDate,
      category: "Custo Fixo",
      type: "FIXED"
    });

    setNewTitle("");
    setNewAmount("");
    loadData(); // Recarrega a lista
  };

  const handleTogglePay = async (id: string, isPaid: boolean) => {
    // Atualiza localmente para feedback instantâneo (Otimista)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !isPaid } : t) as any);
    await toggleTransactionStatus(id, isPaid);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    await deleteTransaction(id);
    loadData();
  };

  // Cálculos
  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPaid = transactions.filter((t: any) => t.isPaid).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* HEADER: Navegação de Mês */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt; Anterior</button>
        <h2 className="text-xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">Próximo &gt;</button>
      </div>

      {/* FORMULÁRIO DE ADIÇÃO RÁPIDA */}
      <form onSubmit={handleAdd} className="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end border border-gray-700">
        <div className="flex-1 w-full">
          <label className="text-xs text-gray-400">Descrição</label>
          <input 
            required
            type="text" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Ex: Aluguel"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs text-gray-400">Valor (R$)</label>
          <input 
            required
            type="number" 
            step="0.01"
            value={newAmount} 
            onChange={e => setNewAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div className="w-full md:w-24">
          <label className="text-xs text-gray-400">Dia Venc.</label>
          <input 
            required
            type="number" 
            min="1" max="31"
            value={newDate} 
            onChange={e => setNewDate(e.target.value)}
            placeholder="Dia"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center">
          <Plus size={24} />
        </button>
      </form>

      {/* RESUMO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Total Previsto</p>
          <p className="text-xl font-bold text-white">R$ {total.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Total Pago</p>
          <p className="text-xl font-bold text-green-400">R$ {totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* LISTA DE CONTAS */}
      <div className="space-y-2">
        {loading ? <p className="text-center text-gray-500">Carregando...</p> : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma conta fixa cadastrada neste mês.</p>
        ) : (
          transactions.map((t: any) => (
            <div key={t.id} className={`flex items-center justify-between p-4 rounded-lg border ${t.isPaid ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-gray-900 border-gray-700'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => handleTogglePay(t.id, t.isPaid)} className="text-gray-400 hover:text-green-500 transition">
                  {t.isPaid ? <CheckCircle className="text-green-500" /> : <Circle />}
                </button>
                <div>
                  <h3 className={`font-semibold ${t.isPaid ? 'line-through text-gray-500' : 'text-white'}`}>{t.description}</h3>
                  <p className="text-xs text-gray-400">Vence dia {format(t.date, 'dd')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold">R$ {t.amount.toFixed(2)}</span>
                <button onClick={() => handleDelete(t.id)} className="text-red-900 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}