// src/app/(dashboard)/purchases/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { 
  createInstallmentPurchase, 
  getMonthlyTransactions, 
  deleteTransaction, 
  toggleTransactionStatus 
} from "@/services/transactionService";
import { Transaction } from "@/types/finance";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, ShoppingBag, X, CheckCircle, Circle } from "lucide-react";

export default function PurchasesPage() {
  const { user } = useAuth();
  const { household } = useHousehold();

  // Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [desc, setDesc] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [installments, setInstallments] = useState("1"); // Padrão 1x
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("Outros");

  // Carregar Dados
  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      const data = await getMonthlyTransactions(household.id, currentDate);
      // Filtra apenas parcelas
      setTransactions(data.filter(t => t.type === 'INSTALLMENT'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  // Ações
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !household) return;

    try {
      await createInstallmentPurchase(user.uid, household.id, {
        description: desc,
        amountTotal: parseFloat(amountTotal),
        installments: parseInt(installments),
        startDate: new Date(date), // Data da primeira parcela
        category: category
      });
      
      setIsModalOpen(false);
      resetForm();
      loadData(); // Recarrega para ver se caiu alguma parcela neste mês
    } catch (error) {
      alert("Erro ao salvar compra");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    // TODO: No futuro, perguntar se quer deletar SÓ ESSA parcela ou TODAS
    if(!confirm("Deletar esta parcela?")) return;
    await deleteTransaction(id);
    loadData();
  };
  
  const handleTogglePay = async (id: string, isPaid: boolean) => {
      // Atualiza localmente para feedback instantâneo
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !isPaid } : t) as any);
      await toggleTransactionStatus(id, isPaid);
  };

  const resetForm = () => {
    setDesc("");
    setAmountTotal("");
    setInstallments("1");
    setCategory("Outros");
  };

  // Cálculos
  const totalMonth = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER: Navegação */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
        <div className="text-center">
          <h2 className="text-xl font-bold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
          <p className="text-xs text-gray-500">Fatura de Cartão / Parcelas</p>
        </div>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* RESUMO DO MÊS */}
      <div className="bg-gradient-to-r from-blue-900 to-gray-900 p-6 rounded-xl border border-blue-800 flex justify-between items-center">
        <div>
          <p className="text-blue-200 text-sm mb-1">Total em Parcelas este Mês</p>
          <h3 className="text-3xl font-bold text-white">R$ {totalMonth.toFixed(2)}</h3>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* LISTA DE COMPRAS */}
      <div className="space-y-3">
        {loading ? <p className="text-center text-gray-500">Carregando...</p> : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <ShoppingBag className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nenhuma parcela para este mês.</p>
          </div>
        ) : (
          transactions.map((t: any) => (
            <div key={t.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  {/* Botão de Pagar (opcional em compras, mas útil) */}
                 <button onClick={() => handleTogglePay(t.id, t.isPaid)} className="text-gray-400 hover:text-green-500 transition">
                   {t.isPaid ? <CheckCircle className="text-green-500" size={20} /> : <Circle size={20} />}
                 </button>

                 <div>
                  <h4 className="font-semibold text-white">{t.description}</h4>
                  <div className="flex gap-2 text-xs text-gray-400 mt-1">
                    <span className="bg-gray-800 px-2 py-0.5 rounded">{t.category}</span>
                    <span>{format(t.date, "dd/MM")}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">R$ {t.amount.toFixed(2)}</p>
                <p className="text-xs text-blue-400">
                   {t.installmentCurrent} / {t.installmentTotal}
                </p>
              </div>
              {/* Botão Deletar (Cuidado: Deleta só a parcela do mês por enquanto) */}
              <button onClick={() => handleDelete(t.id)} className="ml-4 text-gray-600 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE NOVA COMPRA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-xl border border-gray-800 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Nova Compra Parcelada</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">O que você comprou?</label>
                <input required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                  placeholder="Ex: iPhone 15"
                  value={desc} onChange={e => setDesc(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Valor TOTAL (R$)</label>
                  <input required type="number" step="0.01" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    placeholder="5000.00"
                    value={amountTotal} onChange={e => setAmountTotal(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Parcelas</label>
                  <input required type="number" min="1" max="48" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    value={installments} onChange={e => setInstallments(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Categoria</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1"
                    value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Outros</option>
                    <option>Eletrônicos</option>
                    <option>Roupas</option>
                    <option>Casa</option>
                    <option>Viagem</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">1ª Parcela em</label>
                  <input required type="date" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    value={date} onChange={e => setDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                  Lançar Compra
                </button>
                {amountTotal && installments && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Serão {installments} parcelas de R$ {(parseFloat(amountTotal)/parseInt(installments)).toFixed(2)}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}