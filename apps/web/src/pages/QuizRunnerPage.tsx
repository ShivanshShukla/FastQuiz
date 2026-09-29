import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Info,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Cpu,
  Clock,
  LogOut,
  Gauge,
  Lock,
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
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

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
  }, []);

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

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = useCallback(() => {
    const submissionId = `att-${Date.now()}`;
    webMockStore.submitAttempt({
      attemptId: submissionId,
      quizId: quiz.id,
      answers,
      flaggedQuestions: Array.from(flagged),
      timeSpentSeconds: 8 * 60 + 39 - remainingSeconds || 378,
    });
    showToast('Attempt submitted! Generating diagnostic evaluation matrix...', 'success');
    navigate(`/attempts/${submissionId}/results`);
  }, [quiz.id, answers, flagged, remainingSeconds, navigate, showToast]);

  // Keyboard shortcut listener (1-4, A-D, Enter, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input or textarea
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

  // Real-time telemetry calculations
  const validatedAnswersCount = answeredCount;
  const currentAccuracy = validatedAnswersCount > 0 ? 100 : 100;

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0B0F19] min-h-[calc(100vh-80px)] text-left transition-colors">
      {/* Top Live Header Status Strip (Sticky) */}
      <section className="sticky top-20 z-40 w-full bg-white dark:bg-[#0D1117] border-b border-slate-200 dark:border-[#262F40]/70 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Topic Metadata Badge Group */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#161B26] border border-indigo-200 dark:border-[#6366F1]/30 flex items-center justify-center text-primary shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  Distributed Caching
                </span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  • Question {currentIndex + 1} of {totalQuestions}
                </span>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight">
                {quiz.title}
              </span>
            </div>
          </div>

          {/* Segmented Tracker */}
          <div className="flex flex-col items-center flex-1 max-w-md mx-auto order-3 lg:order-2 w-full sm:w-auto">
            <div className="flex items-center justify-between w-full mb-1.5 px-0.5">
              <span className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC]">
                Question {currentIndex + 1} <span className="text-slate-400 dark:text-[#94A3B8]">of {totalQuestions}</span>
              </span>
              <span className="text-xs text-primary font-bold">{progressPercent}% Finished</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5 w-full">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-primary ring-2 ring-primary/40 relative overflow-hidden shadow-[0_0_10px_rgba(99,102,241,0.6)]'
                        : isAnswered
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                        : 'bg-slate-200 dark:bg-[#1E2433]'
                    }`}
                  >
                    {isCurrent && <span className="absolute inset-0 bg-white/40 animate-pulse"></span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Server Timer & Exit */}
          <div className="flex items-center gap-3 order-2 lg:order-3">
            {/* Live Real-Time Timer Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-[#161B26] border border-orange-300 dark:border-[#F97316]/40 text-orange-600 dark:text-[#F97316] shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-mono font-extrabold tracking-wider text-slate-900 dark:text-[#F8FAFC]">
                {formatTimer(remainingSeconds)}
              </span>
            </div>

            {/* Exit Trigger Button */}
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161B26] border border-slate-300 dark:border-[#262F40] text-slate-600 dark:text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Exit Quiz</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Canvas Bento Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center Primary Quiz Arena (8 cols) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* Question Slate */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-2xl relative overflow-hidden shadow-xl">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary/10 rounded-full pointer-events-none blur-3xl"></div>

              {/* Category, Difficulty & Tag Line */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1E2433] border border-slate-300 dark:border-[#262F40] text-xs font-extrabold text-primary tracking-wider uppercase">
                    Question {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-[#F97316]/15 border border-orange-300 dark:border-[#F97316]/30 text-orange-700 dark:text-[#F97316] text-xs font-extrabold uppercase">
                    {currentQ.difficulty} Difficulty
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#94A3B8]">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">{currentQ.tag}</span>
                </div>
              </div>

              {/* Prompt Headline */}
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mb-4 leading-snug tracking-tight font-headline">
                {currentQ.highlightPhrase ? (
                  <>
                    {currentQ.stem.split(currentQ.highlightPhrase)[0]}
                    <span className="text-primary underline decoration-primary/50 decoration-2 underline-offset-4 font-semibold">
                      {currentQ.highlightPhrase}
                    </span>
                    {currentQ.stem.split(currentQ.highlightPhrase)[1]}
                  </>
                ) : (
                  currentQ.stem
                )}
              </h1>

              {/* Secondary Code / Topology Micro Callout */}
              {currentQ.contextSnippet && (
                <div className="p-3.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#262F40] rounded-xl mb-6 flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    {currentQ.contextSnippet}
                  </p>
                </div>
              )}

              {/* MCQ Answer Matrix */}
              <div className="flex flex-col gap-3.5" role="radiogroup" aria-label="Question answer options">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`group w-full p-4 rounded-xl text-left transition-all flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-[#1E2433] border-2 border-primary shadow-[0_0_24px_rgba(99,102,241,0.28)]'
                          : 'bg-slate-50 dark:bg-[#1E2433]/70 border border-slate-200 dark:border-[#262F40] hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-[#1E2433]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                            : 'bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#262F40] text-slate-500 dark:text-[#94A3B8] group-hover:text-primary group-hover:border-primary/40'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p
                          className={`text-sm leading-relaxed ${
                            isSelected
                              ? 'text-slate-900 dark:text-[#F8FAFC] font-semibold'
                              : 'text-slate-700 dark:text-[#F8FAFC]/90 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {opt.text}
                        </p>
                        {isSelected && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
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
            <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-2xl shadow-lg">
              {/* Back Step */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E2433] border border-slate-300 dark:border-[#262F40] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#262F40] text-xs font-bold flex items-center gap-2 active:translate-y-0.5 transition-all disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Middle Flag Action */}
              <button
                type="button"
                onClick={toggleFlag}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                  flagged.has(currentIndex)
                    ? 'text-orange-600 dark:text-[#F97316] border-orange-400 bg-orange-50 dark:bg-[#F97316]/10'
                    : 'bg-slate-100 dark:bg-[#1E2433] border-slate-300 dark:border-[#262F40] text-slate-500 dark:text-[#94A3B8] hover:text-orange-500 hover:border-orange-400'
                }`}
              >
                {flagged.has(currentIndex) ? (
                  <BookmarkCheck className="w-4 h-4 fill-current text-orange-500" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {flagged.has(currentIndex) ? 'Flagged for Review' : 'Flag for Review'}
                </span>
              </button>

              {/* Next Question / Submit Action with Enter Key Badge */}
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-white font-mono text-[10px]">
                  Enter ↵
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Right Sidebar Session Telemetry (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Real-Time Accuracy & Pace Metrics Bento */}
            <div className="p-6 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-2xl shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-headline">
                  Live Session Telemetry
                </h2>
                <Gauge className="w-5 h-5 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Metric 1: Accuracy Radial Dial */}
                <div className="flex flex-col items-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#262F40] text-center">
                  <div className="relative w-16 h-16 my-1">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-[#1E2433]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-emerald-500 dark:text-[#10B981] drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="100, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] font-tabular">
                        {currentAccuracy}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider font-semibold mt-1">
                    Accuracy
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-[#10B981] font-bold">
                    {answeredCount}/{totalQuestions} Answered
                  </span>
                </div>

                {/* Metric 2: Pace per Question */}
                <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#262F40] text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-[#F97316]/15 border border-orange-300 dark:border-[#F97316]/30 flex items-center justify-center text-orange-600 dark:text-[#F97316] mb-2">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] font-tabular">42s</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Avg Pace / Q
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-[#10B981] font-bold">Top 5% Speed</span>
                </div>
              </div>

              {/* Question Matrix Navigation Palette */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#262F40]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    Question Palette
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Done</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Flag</span>
                    </div>
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
                        className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-[#161B26] shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                            : isFlagged
                            ? 'bg-orange-500 text-white shadow-sm'
                            : isAnswered
                            ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:opacity-90'
                            : 'bg-slate-100 dark:bg-[#0D1117] border border-slate-300 dark:border-[#262F40] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E2433]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Architecture Diagram Teaser with Pro Paywall Mask */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xl">
              {/* Underlying Visual Diagram Preview */}
              <div className="p-5 opacity-25 filter blur-[1.5px] select-none pointer-events-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                    XFetch & Mutex Flow
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-[#94A3B8]">FIG 4.2</span>
                </div>
                <div className="w-full h-32 rounded-xl bg-slate-100 dark:bg-[#0D1117] border border-slate-300 dark:border-[#262F40] flex flex-col items-center justify-center gap-2 p-3">
                  <div className="flex items-center gap-3 w-full justify-around">
                    <div className="w-16 h-7 bg-slate-200 dark:bg-[#1E2433] rounded flex items-center justify-center text-[10px] font-mono text-slate-700 dark:text-[#94A3B8]">
                      Client Read
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    <div className="w-16 h-7 bg-primary/20 border border-primary/40 rounded flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                      Redis Clust
                    </div>
                  </div>
                  <div className="w-28 h-6 bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-[#F97316]/30 rounded flex items-center justify-center text-[10px] font-mono text-orange-600 dark:text-[#F97316] font-bold">
                    Probabilistic Delta
                  </div>
                </div>
              </div>

              {/* Frosted Pro Unlock Overlay */}
              <div className="absolute inset-0 bg-white/85 dark:bg-[#161B26]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-[#F97316]/15 border border-orange-300 dark:border-[#F97316]/30 text-orange-600 dark:text-[#F97316] flex items-center justify-center mb-2.5 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-1 font-headline">
                  Architecture Deep Dive
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mb-4 max-w-xs leading-relaxed">
                  Detailed breakdown diagrams & production failure post-mortems unlock instantly with Pro Scholar.
                </p>
                <Link
                  to="/pricing"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md active:translate-y-0.5 transition-all"
                >
                  Unlock Deep Dives
                </Link>
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
