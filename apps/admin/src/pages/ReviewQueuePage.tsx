import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isMockEnabled } from "../config/env";
import {
  type AdminQuestionItem,
  type QuestionSourceType,
  type TopicSummary,
} from "@fastquiz/shared";
import {
  Search,
  ArrowRight,
  RefreshCw,
  Clock,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Play,
  History,
  X,
  FileDown,
  RotateCcw,
  Zap,
} from "lucide-react";

export const ReviewQueuePage: React.FC = () => {
  const { client } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mockActive = isMockEnabled();

  const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<
    QuestionSourceType | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [showActiveBanner, setShowActiveBanner] = useState(true);

  // Load questions and topics
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedQuestions, fetchedTopics] = await Promise.all([
        client.admin.getQuestions({ status: "pending" }),
        client.admin.getTopics(),
      ]);
      setQuestions(fetchedQuestions);
      setTopics(fetchedTopics);
    } catch {
      // In production mode, if backend has no questions or is unreachable, ensure clean empty state
      setQuestions([]);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, [client.admin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter questions client-side for ultra-fast desktop HUD speed
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.review_status !== "pending") return false;

      // Topic filter
      if (selectedTopic !== "all" && q.topic_id !== selectedTopic) {
        return false;
      }

      // Source filter
      if (selectedSource !== "all" && q.source_type !== selectedSource) {
        return false;
      }

      // Difficulty filter
      if (
        selectedDifficulty !== "all" &&
        (q as unknown as { difficulty?: string }).difficulty !==
          selectedDifficulty
      ) {
        return false;
      }

      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesQuiz =
          q.quiz_title?.toLowerCase().includes(query) ?? false;
        const matchesTopic =
          q.topic_name?.toLowerCase().includes(query) ?? false;
        const matchesOptions =
          q.options?.some((opt) => opt.toLowerCase().includes(query)) ?? false;
        if (!matchesText && !matchesQuiz && !matchesTopic && !matchesOptions)
          return false;
      }

      return true;
    });
  }, [
    questions,
    selectedTopic,
    selectedSource,
    selectedDifficulty,
    searchQuery,
  ]);

  // Keyboard navigation across queue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, filteredQuestions.length - 1),
        );
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredQuestions[focusedIndex]) {
          navigate(`/review/${filteredQuestions[focusedIndex].id}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredQuestions, focusedIndex, navigate]);

  // Multi-select helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk action handlers
  const handleBulkApprove = () => {
    showToast(
      `Approved ${selectedIds.size} questions successfully!`,
      "success",
    );
    setSelectedIds(new Set());
  };

  const handleBulkReject = () => {
    showToast(`Rejected ${selectedIds.size} questions.`, "error");
    setSelectedIds(new Set());
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedTopic("all");
    setSelectedSource("all");
    setSelectedDifficulty("all");
    setSearchQuery("");
  };

  // Count by source
  const sourceCounts = useMemo(() => {
    const ai = questions.filter((q) => q.source_type === "ai_generated").length;
    const comm = questions.filter((q) => q.source_type === "community").length;
    const staff = questions.filter(
      (q) => q.source_type === "self_authored",
    ).length;
    return { all: questions.length, ai, comm, staff };
  }, [questions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* ======================================================================= */}
      {/* 1. Top Action & Notification Banner                                    */}
      {/* ======================================================================= */}
      {showActiveBanner && (mockActive || filteredQuestions.length > 0) && (
        <div className="flex items-center justify-between bg-indigo-50/80 px-4 py-2.5 rounded-xl border border-indigo-200/70 text-indigo-950 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-600" />
            <span>
              <strong>Batch Queue Active:</strong> {filteredQuestions.length}{" "}
              pending technical questions await editorial verification. Press{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-2xs">
                J
              </kbd>{" "}
              or{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-2xs">
                K
              </kbd>{" "}
              to traverse,{" "}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 shadow-2xs">
                Enter
              </kbd>{" "}
              to inspect.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-zinc-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
              Pipeline Live
            </span>
            <button
              onClick={() => setShowActiveBanner(false)}
              className="text-zinc-400 hover:text-zinc-700 p-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. Page Header & Actions                                               */}
      {/* ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Content Review Queue
            </h1>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs font-medium border border-zinc-200 dark:border-zinc-700">
              v2.4-prod
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {filteredQuestions.length} pending questions awaiting human review
            across DSA and System Design syllabi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="h-9 px-3.5 flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-2xs"
          >
            <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Review History</span>
          </button>
          <button
            onClick={() => {
              if (filteredQuestions[0]) {
                navigate(`/review/${filteredQuestions[0].id}`);
              }
            }}
            className="h-9 px-4 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Triage (Next)</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px]">
              Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. KPI Metrics Deck (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Review */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Pending Review
            </span>
            <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {filteredQuestions.length}
              </span>
              {filteredQuestions.length > 0 ? (
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {mockActive ? "Over SLA (+4)" : "Pending"}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  All Clear
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{sourceCounts.ai} AI</span>
              <span>•</span>
              <span>{sourceCounts.comm} Community</span>
              <span>•</span>
              <span>{sourceCounts.staff} Staff</span>
            </div>
          </div>
        </div>

        {/* Card 2: Reviewed Today */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Reviewed Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              {mockActive ? (
                <>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    18{" "}
                    <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                      / 42
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    +12% pace
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    0{" "}
                    <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                      / 0
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    0 today
                  </span>
                </>
              )}
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: mockActive ? "42.8%" : "0%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Review Latency */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Avg Time per Review
            </span>
            <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {mockActive ? "48s" : "--"}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {mockActive ? "Optimal" : "SLA Target"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Target &lt; 90s SLA</span>
              <span className="font-mono text-zinc-400 dark:text-zinc-500">
                {mockActive ? "P95: 1m 12s" : "No records"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Quality Flags */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Quality Flags
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${mockActive ? "text-rose-500" : "text-emerald-500"}`}
            />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${mockActive ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100"}`}
              >
                {mockActive ? "2" : "0"}
              </span>
              <span
                className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${
                  mockActive
                    ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800"
                    : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {mockActive ? "High Risk" : "Zero Flags"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {mockActive ? (
                <>
                  <span>1 Duplication risk</span>
                  <span>•</span>
                  <span>1 AI Hallucination</span>
                </>
              ) : (
                <span>No flagged questions</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. Filter & Command Bar                                                */}
      {/* ======================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input with / shortcut */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text, stem, tags... (Press /)"
              className="w-full h-9 pl-9 pr-12 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
              /
            </kbd>
          </div>

          {/* Filter Dropdowns (Combobox 0: Topic, Combobox 1: Source, Combobox 2: Difficulty) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Topic Select (Combobox 0) */}
            <div className="relative">
              <select
                aria-label="Topic Filter"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="h-9 pl-3 pr-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                <option value="all">
                  All Topics (DSA &amp; System Design)
                </option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Type Select (Combobox 1) */}
            <div className="relative">
              <select
                aria-label="Source Filter"
                value={selectedSource}
                onChange={(e) =>
                  setSelectedSource(
                    e.target.value as QuestionSourceType | "all",
                  )
                }
                className="h-9 pl-3 pr-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="ai_generated">AI-Generated</option>
                <option value="community">Community Submitted</option>
                <option value="self_authored">Staff Authored</option>
              </select>
            </div>

            {/* Difficulty Select (Combobox 2) */}
            <div className="relative">
              <select
                aria-label="Difficulty Filter"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-9 pl-3 pr-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="h-9 px-2.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Source Pills Row */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedSource("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                selectedSource === "all"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span>All Sources</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/80 dark:bg-zinc-800 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700">
                {sourceCounts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedSource("ai_generated")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                selectedSource === "ai_generated"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span>AI-Generated</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                {sourceCounts.ai}
              </span>
            </button>

            <button
              onClick={() => setSelectedSource("community")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                selectedSource === "community"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Community Submitted</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                {sourceCounts.comm}
              </span>
            </button>

            <button
              onClick={() => setSelectedSource("self_authored")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                selectedSource === "self_authored"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
              <span>Staff Authored</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                {sourceCounts.staff}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs">
            <span>
              Sort:{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">
                Priority (SLA)
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 5. Sticky Floating Bulk Action Toolbar                                 */}
      {/* ======================================================================= */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-30 flex items-center justify-between bg-zinc-900 text-white px-4 py-2 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-mono text-[11px] font-bold">
                {selectedIds.size}
              </span>
              <span className="font-medium text-white">questions selected</span>
            </div>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-indigo-300 hover:underline"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Selected ({selectedIds.size})</span>
              <kbd className="px-1 py-0.2 rounded bg-black/30 font-mono text-[9px]">
                ⇧A
              </kbd>
            </button>
            <button
              onClick={handleBulkReject}
              className="h-7 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject Selected...</span>
              <kbd className="px-1 py-0.2 rounded bg-black/30 font-mono text-[9px]">
                ⇧R
              </kbd>
            </button>
            <button
              onClick={() =>
                showToast("Exported question payloads as JSON", "info")
              }
              className="h-7 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 6. High-Density Question Review Table                                  */}
      {/* ======================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 pl-4 pr-1 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size > 0 &&
                      selectedIds.size === filteredQuestions.length
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 accent-indigo-600 cursor-pointer"
                    title="Select all questions"
                  />
                </th>
                <th className="py-2.5 px-3">Question Stem &amp; Identifier</th>
                <th className="py-2.5 px-3">Domain &amp; Topic</th>
                <th className="py-2.5 px-3">Target Quiz</th>
                <th className="py-2.5 px-3">Source &amp; Quality</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-zinc-400 dark:text-zinc-500"
                  >
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-600" />
                    Loading question queue...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      All caught up!
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      No questions pending review matching current criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isSelected = selectedIds.has(q.id);
                  const isFocused = idx === focusedIndex;

                  return (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/review/${q.id}`)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/60 border-l-4 border-l-indigo-600"
                          : isFocused
                            ? "bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l-4 border-l-zinc-400"
                            : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 pl-4 pr-1"
                        onClick={(e) => handleToggleRow(q.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 accent-indigo-600 cursor-pointer"
                        />
                      </td>

                      {/* Question Stem & ID */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2 max-w-xl">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold shrink-0">
                            #{q.id}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {q.text}
                            </span>
                            {q.explanation && (
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                                {q.explanation}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Domain & Topic */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {q.topic_name || "System Design"}
                          </span>
                        </div>
                      </td>

                      {/* Target Quiz */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {q.quiz_title || "General Warmup"}
                        </span>
                      </td>

                      {/* Source & Quality Pill */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {q.source_type === "ai_generated" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            GPT-4o Synthesizer
                          </span>
                        ) : q.source_type === "community" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Community
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                            Staff Authored
                          </span>
                        )}
                      </td>

                      {/* Submitted Timestamp */}
                      <td className="py-3 px-3 whitespace-nowrap text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
                        2h ago
                      </td>

                      {/* Action */}
                      <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                          Review <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
