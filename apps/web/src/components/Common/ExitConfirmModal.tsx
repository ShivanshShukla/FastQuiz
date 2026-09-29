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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-6 shadow-xl relative text-left space-y-4">
        <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div>
          <h3 id="modal-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Exit Assessment?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Your progress (Question {currentQuestion} of {totalQuestions}) and answers will be saved. You can resume this session anytime from your dashboard.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Continue Assessment
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Exit to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
