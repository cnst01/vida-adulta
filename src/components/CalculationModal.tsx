// src/components/CalculationModal.tsx
import { ReactNode, useEffect } from "react";
import { X, Calculator } from "lucide-react";

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  example: ReactNode;
}

export function CalculationModal({ isOpen, onClose, title, description, example }: CalculationModalProps) {
  // Bloqueia o scroll da página quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Fundo escurecido e desfocado (Backdrop)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose} // Fecha ao clicar fora
    >
      {/* Container do Modal */}
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()} // Evita que clique dentro feche o modal
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Calculator size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo: Descrição */}
        <div className="p-6 space-y-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {description}
          </p>

          {/* Área do Exemplo (Fragmento React) */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">A Matemática:</p>
            <div className="bg-black/50 border border-gray-800 rounded-xl p-4 font-mono text-sm shadow-inner">
              {example}
            </div>
          </div>
        </div>

        {/* Rodapé: Botão de fechar */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/50">
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}