import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Clock,
  LogOut,
  Sliders,
  Keyboard,
} from 'lucide-react';
import { webMockStore, QuestionData } from '../services/webMockStore';
import { ExitConfirmModal } from '../components/Common/ExitConfirmModal';
import { useToast } from '../context/ToastContext';

export const QuizRunnerPage: React.FC = () => {
  const { quizId = 'quiz-cache-1' } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const quiz = webMockStore.getQuiz(quizId) || webMockStore.getTopics()[0].quizzes[0];
  const questions: QuestionData[] = quiz.questions;

  // Active question index (0-based)
  const [currentIndex, setCurrentIndex] = useState(0);

  // User selections: { [questionIndex]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Flagged for review
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  // Countdown timer in seconds (starts at 15 mins = 900 seconds or 8 mins 39s)
  const [remainingSeconds, setRemainingSeconds] = useState(8 * 60 + 39);

  // Exit modal state
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSubmitQuiz = useCallback(() => {
    const submissionId = `att-${Date.now()}`;
    webMockStore.submitAttempt({
      attemptId: submissionId,
      quizId: quiz.id,
      answers,
      flaggedQuestions: Array.from(flagged),
      timeSpentSeconds: 8 * 60 + 39 - remainingSeconds || 378,
    });
    showToast('Assessment submitted. Generating diagnostic matrix...', 'success');
    navigate(`/attempts/${submissionId}/results`);
  }, [quiz.id, answers, flagged, remainingSeconds, navigate, showToast]);

  // Countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitQuiz]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
        showToast(`Removed flag from Question ${currentIndex + 1}`, 'info');
      } else {
        next.add(currentIndex);
        showToast(`Flagged Question ${currentIndex + 1} for review`, 'info');
      }
      return next;
    });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  }, [currentIndex, totalQuestions, handleSubmitQuiz]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard listener (1-4, A-D, Enter, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectOption(0);
      else if (key === '2' || key === 'B') handleSelectOption(1);
      else if (key === '3' || key === 'C') handleSelectOption(2);
      else if (key === '4' || key === 'D') handleSelectOption(3);
      else if (key === 'ENTER') handleNext();
      else if (key === 'ARROWLEFT') handlePrev();
      else if (key === 'ARROWRIGHT') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, handleNext, handlePrev]);

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-56px)] text-left transition-colors">
      {/* Top Test Session Strip (Sticky) */}
      <section className="sticky top-14 z-40 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Topic & Question Index */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider shrink-0">
              {quiz.title}
            </span>
            <span className="hidden sm:inline text-xs text-zinc-400">•</span>
            <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Segmented Question Progress Bar */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 max-w-xs mx-auto">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : isAnswered
                      ? 'bg-emerald-500/80'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                  aria-label={`Jump to question ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Timer & Exit Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Assessment Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Question Arena (8 cols) */}
          <section className="lg:col-span-8 flex flex-col gap-5">
            <div className="p-6 sm:p-7 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    Question {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-zinc-400 font-mono text-xs">/</span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                    {currentQ.difficulty}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                  <span>Topic: {currentQ.tag}</span>
                </div>
              </div>

              {/* Question Stem */}
              <h1 className="text-lg sm:text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-4 leading-relaxed font-sans">
                {currentQ.stem}
              </h1>

              {/* Context Code / Spec Snippet */}
              {currentQ.contextSnippet && (
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md mb-6 font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {currentQ.contextSnippet}
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-3" role="radiogroup" aria-label="Question options">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-md text-left transition-colors flex items-start gap-3.5 cursor-pointer border ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                            : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {opt.label}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isSelected
                              ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {opt.text}
                        </p>

                        {isSelected && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Current Selection</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={toggleFlag}
                className={`px-3 py-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  flagged.has(currentIndex)
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {flagged.has(currentIndex) ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
                <span>{flagged.has(currentIndex) ? 'Flagged for Review' : 'Flag for Review'}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                <span className="hidden sm:inline px-1 py-0.2 rounded bg-white/20 dark:bg-zinc-900/20 text-[10px] font-mono">
                  ↵
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* Right Sidebar: Telemetry & Palette (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Live Session Telemetry Card */}
            <div className="p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                  Live Session Telemetry
                </h2>
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Answered</span>
                  <div className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {answeredCount} <span className="text-xs text-zinc-400">/ {totalQuestions}</span>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Flagged</span>
                  <div className="text-lg font-semibold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                    {flagged.size}
                  </div>
                </div>
              </div>

              {/* Question Palette */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                    Question Palette
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Done
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => {
                    const isAnswered = answers[idx] !== undefined;
                    const isCurrent = idx === currentIndex;
                    const isFlagged = flagged.has(idx);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-8 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
                          isCurrent
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                            : isFlagged
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                            : isAnswered
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Reference Guide */}
            <div className="p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                <Keyboard className="w-3.5 h-3.5" />
                <span>KEYBOARD SHORTCUTS</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                <div className="py-1 flex items-center justify-between">
                  <span>Select Option</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-500">
                    A – D / 1 – 4
                  </kbd>
                </div>
                <div className="py-1 flex items-center justify-between">
                  <span>Next Question</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-500">
                    Enter ↵
                  </kbd>
                </div>
                <div className="py-1 flex items-center justify-between">
                  <span>Navigate Questions</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-500">
                    ← / →
                  </kbd>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={() => navigate('/')}
        currentQuestion={currentIndex + 1}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};
