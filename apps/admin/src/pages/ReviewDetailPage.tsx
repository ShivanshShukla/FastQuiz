import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  type AdminQuestionItem,
} from '@fastquiz/shared';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  AlertTriangle,
  X,
  Check,
  Verified,
  Eye,
  FileCode,
  ArrowRight,
  GitCommit,
  PlusCircle,
  Bot,
  Zap,
} from 'lucide-react';

export const ReviewDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<AdminQuestionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'candidate' | 'raw'>('candidate');

  // Checklist states
  const [checklist, setChecklist] = useState({
    stemClear: true,
    singleAnswer: true,
    plausibleDistractors: true,
    validExplanation: true,
  });

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectPreset, setRejectPreset] = useState('');
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

    const fullReason = [rejectPreset, rejectReason.trim()].filter(Boolean).join(': ');

    if (!fullReason) {
      setRejectError('A rejection reason is required before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await client.admin.rejectQuestion(question.id, fullReason);
      success(`Question rejected: "${fullReason}"`);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading question details & telemetry...</p>
      </div>
    );
  }

  if (!question) return null;

  const options = question.options || [
    'O(N^2)',
    'O(N)',
    'O(N log N)',
    'O(1)',
  ];
  const correctIndex = (question as unknown as { correct_index?: number }).correct_index ?? question.correct_option_index ?? 1;

  return (
    <div className="flex flex-col w-full relative pb-28">
      {/* ======================================================================= */}
      {/* 1. Sub-Header Workspace Utility Strip                                  */}
      {/* ======================================================================= */}
      <section className="w-full bg-white px-6 py-2.5 flex items-center justify-between border-b border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/review')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>
          <span className="w-px h-3.5 bg-zinc-200"></span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900">Queue Workbench</span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500 font-medium">Question 4 of 24 Pending</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => navigate('/review')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-600 hover:bg-zinc-200 transition text-[11px]"
              title="Previous Question (J)"
              type="button"
            >
              <span>‹</span>
              <kbd className="font-mono bg-white px-1 rounded text-zinc-600 text-[9px] shadow-2xs">J</kbd>
            </button>
            <span className="w-px h-3 bg-zinc-300"></span>
            <button
              onClick={() => navigate('/review')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-900 hover:bg-zinc-200 transition font-medium text-[11px]"
              title="Next Question (K)"
              type="button"
            >
              <kbd className="font-mono bg-white px-1 rounded text-zinc-600 text-[9px] shadow-2xs">K</kbd>
              <span>›</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
            <span className="font-mono text-[11px] text-zinc-500">STAGE: L3_EDITORIAL</span>
          </div>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('candidate')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'candidate'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Candidate View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'raw'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Raw JSON / AST
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. Main 60/40 Split Workbench                                          */}
      {/* ======================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* =================================================================== */}
          {/* LEFT COLUMN (60% / col-span-7): Question Learner View               */}
          {/* =================================================================== */}
          <section className="col-span-12 lg:col-span-7 flex flex-col gap-5 min-w-0">
            {viewMode === 'raw' ? (
              <div className="bg-zinc-900 text-zinc-100 rounded-xl p-5 font-mono text-xs overflow-x-auto shadow-sm">
                <pre>{JSON.stringify(question, null, 2)}</pre>
              </div>
            ) : (
              <>
                {/* Main Learner Preview Card */}
                <article className="bg-white rounded-xl p-6 border border-zinc-200 shadow-2xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-600" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Learner Preview
                      </span>
                      <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-mono text-[10px] border border-zinc-200">
                        Rendered: Markdown + KaTeX
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold text-[11px] px-2 py-0.5 rounded border border-indigo-200">
                        {question.topic_name || 'DSA'}
                      </span>
                      <span className="bg-zinc-100 text-zinc-600 font-mono text-[10px] px-2 py-0.5 rounded">
                        4 Multiple Choice
                      </span>
                    </div>
                  </div>

                  {/* Question Stem Text */}
                  <div className="pt-1">
                    <h1 className="text-lg font-semibold text-zinc-900 leading-relaxed">
                      {question.text}
                    </h1>
                  </div>

                  {/* Dark Code Block Preview */}
                  <div className="bg-zinc-900 rounded-lg p-4 text-zinc-200 font-mono text-xs shadow-inner flex flex-col gap-2">
                    <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800 text-[11px]">
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>solution_snippet.py</span>
                      </span>
                      <span>Target Complexity: O(N)</span>
                    </div>
                    <pre className="overflow-x-auto text-[12px] leading-5 text-zinc-200">
                      <code>
                        <span className="text-purple-400">def</span>{' '}
                        <span className="text-blue-400">solve_problem</span>(arr: List[int]) -&gt; int:
                        {'\n'}    left, right = 0, len(arr) - 1{'\n'}    <span className="text-zinc-500"># Two pointer traversal in linear time</span>
                        {'\n'}    <span className="text-purple-400">while</span> left &lt; right:
                        {'\n'}        <span className="text-purple-400">return</span> max(left, right)
                      </code>
                    </pre>
                  </div>

                  {/* Options List */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Candidate Options
                      </span>
                      <span className="text-[11px] text-zinc-500">Selectable Single-Choice</span>
                    </div>

                    {options.map((optionText, idx) => {
                      const isCorrect = idx === correctIndex;
                      const letter = String.fromCharCode(65 + idx);

                      return (
                        <div
                          key={idx}
                          className={`relative flex items-start gap-3 p-3.5 rounded-lg border transition ${
                            isCorrect
                              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                              : 'bg-zinc-50/80 border-zinc-200/80 hover:bg-zinc-100/60'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-zinc-300 text-zinc-700'
                            }`}
                          >
                            {isCorrect ? <Check className="w-3.5 h-3.5" /> : letter}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isCorrect ? 'text-emerald-800' : 'text-zinc-600'
                                }`}
                              >
                                Option {letter}
                              </span>
                              {isCorrect && (
                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1">
                                  <Verified className="w-3 h-3" />
                                  <span>Correct Option</span>
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm leading-relaxed ${
                                isCorrect ? 'text-emerald-950 font-medium' : 'text-zinc-800'
                              }`}
                            >
                              {optionText}
                            </p>
                          </div>

                          {!isCorrect && (
                            <span className="font-mono text-[10px] text-zinc-400 opacity-60">
                              Distractor
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>

                {/* Detailed Solution & Comprehensive Rationale Block */}
                <article className="bg-white rounded-xl p-6 border border-zinc-200 shadow-2xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-900">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-bold">
                        Detailed Solution &amp; Engineering Rationale
                      </h2>
                    </div>
                    <span className="bg-zinc-100 text-zinc-600 font-mono text-[10px] px-2 py-0.5 rounded">
                      Markdown v2
                    </span>
                  </div>

                  {/* Core Explanation */}
                  <div className="space-y-4 text-zinc-800 text-sm leading-relaxed">
                    <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                      <h3 className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                        Core Architectural Mechanics:
                      </h3>
                      <p className="text-xs text-indigo-950/80 leading-normal">
                        {question.explanation ||
                          'Using two pointers starting at opposite ends avoids redundant traversals, reducing algorithmic time complexity from quadratic to linear time O(N).'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 mb-1.5">
                        Computational Cost Trade-off:
                      </h4>
                      <ul className="space-y-1 text-xs text-zinc-600 pl-4 list-disc">
                        <li>
                          <strong className="text-zinc-900">Time Complexity:</strong> Scales strictly at{' '}
                          <code className="font-mono text-[11px] bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
                            linear O(N)
                          </code>{' '}
                          where each element is inspected at most once.
                        </li>
                        <li>
                          <strong className="text-zinc-900">Auxiliary Space:</strong> Auxiliary memory requires{' '}
                          <code className="font-mono text-[11px] bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
                            constant O(1)
                          </code>{' '}
                          in-place pointer allocations without extra heap arrays.
                        </li>
                      </ul>
                    </div>

                    {/* Distractor Invalidation Audit */}
                    <div className="bg-zinc-50 rounded-lg p-3.5 space-y-2 border border-zinc-200/70">
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Distractor Invalidation Audit
                      </h4>
                      <div className="space-y-1.5 text-xs text-zinc-700">
                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="font-bold text-rose-600">Option A (False):</span> O(N^2)
                          is the brute-force nested loop complexity, which is suboptimal.
                        </div>
                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="font-bold text-rose-600">Option C (False):</span> O(N log N)
                          applies to sorting-first approaches, which incurs unnecessary overhead.
                        </div>
                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="font-bold text-rose-600">Option D (False):</span> O(1)
                          cannot be achieved without precomputing or caching the entire array elements.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Taxonomy Tags */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Topic Taxonomy:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-600 hover:text-zinc-900 cursor-pointer">
                        #two-pointers
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-600 hover:text-zinc-900 cursor-pointer">
                        #arrays
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-600 hover:text-zinc-900 cursor-pointer">
                        #dsa-interview
                      </span>
                    </div>
                  </div>
                </article>
              </>
            )}
          </section>

          {/* =================================================================== */}
          {/* RIGHT COLUMN (40% / col-span-5): Workflow & Metadata Gate           */}
          {/* =================================================================== */}
          <aside className="col-span-12 lg:col-span-5 flex flex-col gap-5 min-w-0">
            {/* AI Synthesis Flag Banner */}
            {question.source_type === 'ai_generated' ? (
              <section className="bg-amber-50/90 rounded-xl p-4 border border-amber-200 shadow-2xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-900">
                  <Bot className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-xs">AI Synthesis Flag (GPT-4o Staging)</h3>
                </div>
                <p className="text-xs text-amber-900/90 leading-normal">
                  Verify code correctness, edge cases, and ensure explanations do not hallucinate
                  performance guarantees.
                </p>
                <div className="mt-1 pt-2 border-t border-amber-200 flex items-center justify-between text-amber-800 text-[11px] font-medium">
                  <span>Confidence: <strong>94.2%</strong></span>
                  <span>Plagiarism: <strong>&lt; 1.8%</strong></span>
                </div>
              </section>
            ) : question.source_type === 'community' ? (
              <section className="bg-emerald-50/90 rounded-xl p-4 border border-emerald-200 shadow-2xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-xs">Community Contributor Submission</h3>
                </div>
                <p className="text-xs text-emerald-950/80 leading-normal">
                  Submitted by verified peer educator. Check for plagiarism, formatting, and correct
                  spec alignment.
                </p>
              </section>
            ) : null}

            {/* Technical Metadata Card */}
            <section className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="font-bold text-xs text-zinc-900">Question Metadata</h3>
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-600">
                  v1.4.0
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                    Topic Domain
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 block truncate">
                    {question.topic_name || 'System Design'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                    Cognitive Difficulty
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                    {(question as unknown as { difficulty?: string }).difficulty || 'Medium'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs text-zinc-700">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-500">Target Quiz:</span>
                  <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                    {question.quiz_title || 'General Warmup'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-500">Origin Source:</span>
                  <span className="font-mono text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {question.source_type}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-500">Submitted By:</span>
                  <span className="font-medium text-zinc-800">
                    {(question as unknown as { submitted_by_name?: string }).submitted_by_name || question.submitter_email || 'Staff Reviewer'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-500">Est. Solve Cadence:</span>
                  <span className="font-mono text-zinc-900 font-semibold">90 seconds</span>
                </div>
              </div>
            </section>

            {/* Ergonomic Reviewer Checklist Box */}
            <section className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-xs text-zinc-900">Reviewer Quality Gate</h3>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">4/4 Complete</span>
              </div>

              <div className="space-y-2 text-xs text-zinc-800">
                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-zinc-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.stemClear}
                    onChange={(e) =>
                      setChecklist((prev) => ({ ...prev, stemClear: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>Question stem is unambiguous &amp; concise</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-zinc-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.singleAnswer}
                    onChange={(e) =>
                      setChecklist((prev) => ({ ...prev, singleAnswer: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>Exactly one option is indisputably correct</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-zinc-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.plausibleDistractors}
                    onChange={(e) =>
                      setChecklist((prev) => ({
                        ...prev,
                        plausibleDistractors: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>Distractors are technically plausible</span>
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-zinc-50 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.validExplanation}
                    onChange={(e) =>
                      setChecklist((prev) => ({
                        ...prev,
                        validExplanation: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>Explanation directly validates correct option</span>
                </label>
              </div>
            </section>

            {/* Version & Diff Audit Log */}
            <section className="bg-white rounded-xl p-4 border border-zinc-200 shadow-2xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Audit History
                </span>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                  Compare Diff
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-1 text-zinc-700">
                  <GitCommit className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-900 block">v1.1: Math notation sanitized</span>
                    <span className="text-zinc-400 text-[10px]">By System Synthesizer • 1 hr ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-1 text-zinc-700">
                  <PlusCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-900 block">v1.0: Synthetic generation commit</span>
                    <span className="text-zinc-400 text-[10px]">By ContentBot pipeline • 4 hrs ago</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. Sticky Bottom HUD Action Control Deck                                */}
      {/* ======================================================================= */}
      <footer className="fixed bottom-0 left-60 right-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3 shadow-lg flex items-center justify-between border-t border-zinc-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-900">#{question.id}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500">23 items remaining in primary review queue</span>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 text-zinc-400 text-xs">
            <span>Reviewer: <strong className="text-zinc-900 font-medium">{user?.name || 'Sarah Chen'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/review')}
            className="h-9 px-3.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
            type="button"
          >
            Skip for now
          </button>

          {/* Reject Button (Trigger Reject Modal) */}
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 shadow-2xs"
            type="button"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Reject</span>
            <kbd className="font-mono text-[10px] bg-white text-rose-800 px-1 py-0.2 rounded border border-rose-200 shadow-2xs">
              R
            </kbd>
          </button>

          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            type="button"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Approve &amp; Publish</span>
            <kbd className="font-mono text-[10px] bg-white/20 text-white px-1 py-0.2 rounded">
              A
            </kbd>
          </button>

          <span className="w-px h-5 bg-zinc-200 mx-1"></span>

          <button
            onClick={() => navigate('/review')}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
            title="Advance directly (K)"
            type="button"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* ======================================================================= */}
      {/* 4. Rejection Reason Modal                                              */}
      {/* ======================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Reject Question Confirmation
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectError(null);
                }}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-normal">
              Specify the factual violation or guideline failure. Feedback is routed into the GPT-4o
              RLHF pipeline and tagged on the author's record.
            </p>

            {rejectError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {rejectError}
              </div>
            )}

            {/* Presets Radio Options */}
            <div className="space-y-1.5 text-xs text-zinc-800">
              {[
                'Factually incorrect or outdated architectural claim',
                'Ambiguous wording / Multiple defensible answers',
                'Low cognitive difficulty / Trivial definition test',
                'Duplicate or close clone of existing item',
              ].map((reasonText) => (
                <label
                  key={reasonText}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reject_preset"
                    checked={rejectPreset === reasonText}
                    onChange={() => setRejectPreset(reasonText)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>{reasonText}</span>
                </label>
              ))}
            </div>

            {/* Quick Tags (Required for automated tests) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                '+ Incorrect Answer Key',
                '+ Poor Explanation',
                '+ Duplicate',
                '+ Formatting Issue',
                '+ Low Quality',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setRejectReason((prev) => (prev ? `${prev}, ${tag}` : tag));
                    setRejectError(null);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Freeform Notes Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-900">
                Detailed Reviewer Note (Required)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                rows={3}
                placeholder="Explain the specific error to optimize prompt embeddings..."
                className="w-full p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectError(null);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg"
              >
                Cancel (Esc)
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Confirm Rejection</span>
                <kbd className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded">↵</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
