// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  LogOut, 
  User, 
  Mail, 
  Shield, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  Users, 
  Send,
  DollarSign,
  Save
} from "lucide-react";

export default function SettingsPage() {
  const { user, logOut } = useAuth();
  const { household } = useHousehold();
  const router = useRouter();

  // States
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false); 

  // States de Join
  const [joinId, setJoinId] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);

  // States de Renda
  const [income, setIncome] = useState("");
  const [savingIncome, setSavingIncome] = useState(false);
  const [incomeSaved, setIncomeSaved] = useState(false);

  // Carrega a renda atual quando o household carrega
  useEffect(() => {
    if (household?.settings?.monthlyIncome) {
      setIncome(household.settings.monthlyIncome.toString());
    }
  }, [household]);

  // Verifica share nativo
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  const handleCopyId = () => {
    if (household?.id) {
      navigator.clipboard.writeText(household.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!household?.id) return;
    try {
      await navigator.share({
        title: 'Junte-se à minha família no Vida Adulta',
        text: `Use este código para entrar na minha família: ${household.id}`,
      });
    } catch (error) {
      console.log('Cancelado/Erro share', error);
    }
  };

  const handleSaveIncome = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!household?.id) return;

    setSavingIncome(true);
    try {
      const numIncome = parseFloat(income.replace(",", ".")); // Aceita virgula ou ponto
      if (isNaN(numIncome)) return;

      const householdRef = doc(db, "households", household.id);
      await updateDoc(householdRef, {
        "settings.monthlyIncome": numIncome
      });

      setIncomeSaved(true);
      setTimeout(() => setIncomeSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar renda", error);
      alert("Erro ao salvar.");
    } finally {
      setSavingIncome(false);
    }
  };

  const handleJoinHousehold = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!user || !joinId.trim()) return;
    
    if (!confirm("Atenção: Ao entrar em outra família, você deixará de ver os dados atuais. Deseja continuar?")) return;

    setLoadingJoin(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        householdId: joinId.trim()
      });

      alert("Você entrou na nova família! A página será recarregada.");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao entrar na família", error);
      alert("Erro ao entrar. Verifique se o ID está correto.");
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-gray-400">Gerencie sua conta e sua família.</p>
      </div>

      {/* CARD DE PERFIL */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800 shadow-xl shrink-0">
          {user?.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt="Avatar" 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
              <User size={40} />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2 w-full">
          <h2 className="text-2xl font-bold text-white truncate">{user?.displayName || "Usuário"}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
            <Mail size={16} className="shrink-0" />
            <span className="truncate">{user?.email}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-green-400 text-sm bg-green-900/20 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
             <Shield size={14} />
             <span>Conta Ativa</span>
          </div>
        </div>
      </div>

      {/* --- NOVO: RENDA MENSAL --- */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-green-400">
          <DollarSign size={24} />
          <h3 className="font-bold text-lg">Renda Mensal Familiar</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Defina o valor total que entra na conta todo mês. Isso será usado para calcular o quanto da sua renda já está comprometido.
        </p>

        <form onSubmit={handleSaveIncome} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
           {/* Container vira Flex para alinhar os itens lado a lado */}
          <div className="w-full flex items-center bg-gray-950 border border-gray-700 rounded-xl focus-within:border-green-500 transition-all overflow-hidden">
            
            {/* O R$ é um bloco fixo com padding */}
            <span className="pl-4 pr-1 text-gray-500 font-bold select-none">
              R$
            </span>

            {/* O Input perde a borda e o fundo para se fundir ao container */}
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00"
              className="w-full bg-transparent border-none outline-none text-white font-mono text-lg py-3 ml-2 pr-4 placeholder-gray-600"
              value={income}
              onChange={e => setIncome(e.target.value)}
            />
          </div>
           
           <button 
             type="submit"
             disabled={savingIncome}
             className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 ${
                incomeSaved 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
             }`}
           >
             {savingIncome ? (
               <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>
             ) : incomeSaved ? (
               <> <Check size={20} /> Salvo! </>
             ) : (
               <> <Save size={20} /> Salvar </>
             )}
           </button>
        </form>
      </div>

      {/* --- ÁREA DE FAMÍLIA (COMPARTILHAMENTO) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LADO 1: CONVIDAR */}
        <div className="bg-linear-to-br from-blue-900/20 to-gray-900 border border-blue-500/30 rounded-2xl p-6 shadow-md relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full pointer-events-none"></div>

           <div className="flex items-center gap-3 mb-4 text-blue-400 relative z-10">
             <Share2 size={24} />
             <h3 className="font-bold text-lg">Convidar Parceiro(a)</h3>
           </div>
           <p className="text-sm text-gray-400 mb-6 relative z-10 leading-relaxed">
             Envie este código para quem vai dividir as contas com você.
           </p>
           
           <div className="flex flex-col gap-3 relative z-10">
             <div className="bg-black/40 p-3 rounded-xl border border-blue-500/20 text-center">
               <code className="font-mono text-white tracking-wider text-sm sm:text-base break-all">
                 {household?.id || "Carregando..."}
               </code>
             </div>

             <div className="flex gap-2">
               <button 
                  type="button"
                  onClick={handleCopyId}
                  className={`flex-1 p-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-900/20 ${
                    copied 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  }`}
               >
                 {copied ? <Check size={18} /> : <Copy size={18} />}
                 <span>{copied ? "Copiado!" : "Copiar"}</span>
               </button>

               {canShare && (
                 <button 
                    type="button"
                    onClick={handleNativeShare}
                    className="flex-1 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-900/30"
                 >
                   <Send size={18} />
                   <span>Enviar</span>
                 </button>
               )}
             </div>
           </div>
        </div>

        {/* LADO 2: ENTRAR */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-4 text-gray-300">
             <Users size={24} />
             <h3 className="font-bold text-lg">Entrar em outra Família</h3>
           </div>
           <p className="text-sm text-gray-400 mb-6 leading-relaxed">
             Tem um código? Cole aqui para sincronizar os dados.
           </p>

           <form onSubmit={handleJoinHousehold} className="flex flex-col sm:flex-row gap-3">
             <input 
               type="text" 
               placeholder="Cole o ID aqui..."
               className="w-full flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
               value={joinId}
               onChange={e => setJoinId(e.target.value)}
             />
             <button 
               type="submit" 
               disabled={loadingJoin || !joinId}
               className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center shrink-0 border border-gray-700"
             >
               {loadingJoin ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <ArrowRight size={20} />}
             </button>
           </form>
        </div>

      </div>

      {/* --- BOTÃO SAIR --- */}
      <div className="pt-6 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="group w-full bg-gray-900 border border-red-900/30 hover:border-red-500/50 hover:bg-red-900/10 rounded-xl p-4 flex items-center justify-between transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0">
              <LogOut size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-red-400 group-hover:text-red-300 transition-colors">Sair da Conta</h3>
              <p className="text-sm text-gray-500 group-hover:text-red-400/60">Encerrar sessão neste dispositivo</p>
            </div>
          </div>
        </button>
      </div>

    </div>
  );
}