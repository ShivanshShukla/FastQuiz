import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  currentQuestion: number;
  totalQuestions: number;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
  currentQuestion,
  totalQuestions,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 dark:bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-[#EF4444]/15 border border-rose-300 dark:border-[#EF4444]/30 text-rose-600 dark:text-[#EF4444] flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 font-headline">
          Pause this attempt?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mb-6 leading-relaxed">
          Your current progress (Question {currentQuestion} of {totalQuestions}) and remaining time will be saved. You can resume anytime from your dashboard.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E2433] border border-slate-300 dark:border-[#262F40] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#262F40] text-xs font-semibold transition-all cursor-pointer"
          >
            Keep Going
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)] active:translate-y-0.5 transition-all cursor-pointer"
          >
            Exit to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
