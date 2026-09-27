import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  type AdminQuestionItem,
  type QuestionSourceType,
} from '@fastquiz/shared';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Users,
  PenTool,
  Clock,
  Mail,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  X,
  Keyboard,
} from 'lucide-react';

export const ReviewDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { client } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<AdminQuestionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Load question detail
  useEffect(() => {
    if (!questionId) return;

    let isMounted = true;
    const loadQuestion = async () => {
      setIsLoading(true);
      try {
        const data = await client.admin.getQuestion(questionId);
        if (isMounted) setQuestion(data);
      } catch (err: unknown) {
        if (isMounted) {
          toastError(err instanceof Error ? err.message : 'Question not found');
          navigate('/review');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadQuestion();
    return () => {
      isMounted = false;
    };
  }, [questionId, client, navigate, toastError]);

  // Handle Approve action
  const handleApprove = useCallback(async () => {
    if (!question || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await client.admin.approveQuestion(question.id);
      success('Question approved successfully and published to live pool!');
      navigate('/review');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to approve question');
    } finally {
      setIsSubmitting(false);
    }
  }, [question, isSubmitting, client, success, toastError, navigate]);

  // Handle Reject action
  const handleRejectConfirm = async () => {
    if (!question || isSubmitting) return;

    if (!rejectReason.trim()) {
      setRejectError('A rejection reason is required so authors/systems can improve content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await client.admin.rejectQuestion(question.id, rejectReason.trim());
      success(`Question rejected: "${rejectReason.trim()}"`);
      setShowRejectModal(false);
      navigate('/review');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to reject question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut listener: 'A' -> approve, 'R' -> reject, 'Escape' -> close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea or input
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        if (e.key === 'Escape') {
          setShowRejectModal(false);
        }
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setShowRejectModal(true);
      } else if (e.key === 'Escape') {
        setShowRejectModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleApprove]);

  const renderSourceBadge = (source: QuestionSourceType) => {
    switch (source) {
      case 'ai_generated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Generated
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            Community Contributed
          </span>
        );
      case 'self_authored':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <PenTool className="w-3.5 h-3.5 text-sky-600" />
            Self Authored
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading question for review...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
        <p className="text-sm text-slate-600">Question not found.</p>
        <button
          onClick={() => navigate('/review')}
          className="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded text-xs"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Bar with Breadcrumb and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/review')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </button>

        <div className="flex items-center gap-2">
          {/* Reject Button */}
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
            <kbd className="bg-white/80 border border-rose-300 px-1.5 py-0.5 rounded text-[10px] text-rose-800">
              R
            </kbd>
          </button>

          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Publish
            <kbd className="bg-emerald-800 border border-emerald-500 px-1.5 py-0.5 rounded text-[10px] text-emerald-100">
              A
            </kbd>
          </button>
        </div>
      </div>

      {/* Main Review Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Question Text, Options & Explanation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Question Text Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                Question Content
              </span>
              <span>ID: <code className="font-mono text-slate-600">{question.id}</code></span>
            </div>

            <h2 className="text-base font-semibold text-slate-900 leading-relaxed mb-6">
              {question.text}
            </h2>

            {/* MCQ Options */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Options ({question.options.length} Choices)
              </h3>
              {question.options.map((opt, idx) => {
                const isCorrect = idx === question.correct_option_index;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-400/40'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 pt-0.5 leading-relaxed">{opt}</span>
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct Option
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Explanation (Unlocked on user completion / purchase)
            </h3>
            <div className="p-4 rounded-lg bg-indigo-50/40 border border-indigo-100 text-slate-800 text-xs leading-relaxed">
              {question.explanation || (
                <span className="text-rose-500 italic">
                  Warning: No explanation provided for this question.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Metadata Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-4">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Question Metadata
            </h3>

            {/* Source */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Source Type
              </span>
              {renderSourceBadge(question.source_type)}
            </div>

            {/* Submitter */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Submitter Info
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{question.submitter_email || 'System Generator'}</span>
              </div>
            </div>

            {/* Topic & Parent Quiz */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Taxonomy
              </span>
              <p className="font-semibold text-slate-800">{question.topic_name || 'General'}</p>
              <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {question.quiz_title || 'Quiz'}
              </p>
            </div>

            {/* Submitted Date */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Submitted At
              </span>
              <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {question.submitted_at ? new Date(question.submitted_at).toLocaleString() : 'Recent'}
              </div>
            </div>

            {/* Review Status */}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                Status
              </span>
              <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-amber-100 text-amber-900 border border-amber-300">
                PENDING REVIEW
              </span>
            </div>
          </div>

          {/* Quick Helper Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
              <Keyboard className="w-4 h-4" />
              Power Reviewer Tips
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Press <kbd className="bg-emerald-800 px-1 py-0.5 rounded text-white font-mono">A</kbd> to immediately approve, or <kbd className="bg-rose-800 px-1 py-0.5 rounded text-white font-mono">R</kbd> to reject and give feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-rose-600 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Reject Question Confirmation</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-rose-200 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Rejecting this question will keep it hidden from user quizzes. Please specify a clear reason for the rejection (required):
              </p>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Incorrect Answer Key',
                  'Vague / Ambiguous Question Text',
                  'Insufficient Explanation',
                  'Duplicate Question',
                  'Grammar or Formatting Issue',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setRejectReason(tag);
                      setRejectError(null);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] text-slate-700 transition cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError(null);
                  }}
                  placeholder="Enter rejection reason or select a tag above..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  autoFocus
                />
                {rejectError && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{rejectError}</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
