import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type TopicSummary,
  type AdminQuizItem,
  type Question,
} from '@fastquiz/shared';
import {
  Folder,
  BookOpen,
  Check,
  RefreshCw,
} from 'lucide-react';

export const ContentBrowserPage: React.FC = () => {
  const { client } = useAuth();

  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<AdminQuizItem[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Load topics
  useEffect(() => {
    const loadTopics = async () => {
      setLoadingTopics(true);
      try {
        const data = await client.admin.getTopics();
        const list = Array.isArray(data) ? data : [];
        setTopics(list);
        if (list.length > 0) {
          setSelectedTopicId(list[0].id);
        } else {
          setSelectedTopicId(null);
          setQuizzes([]);
          setQuestions([]);
        }
      } catch {
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
    loadTopics();
  }, [client]);

  // Load quizzes when topic changes
  useEffect(() => {
    if (!selectedTopicId) return;

    const loadQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const data = await client.admin.getQuizzesForTopic(selectedTopicId);
        const list = Array.isArray(data) ? data : [];
        setQuizzes(list);
        if (list.length > 0) {
          setSelectedQuizId(list[0].id);
        } else {
          setSelectedQuizId(null);
          setQuestions([]);
        }
      } catch {
        setQuizzes([]);
        setSelectedQuizId(null);
        setQuestions([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    loadQuizzes();
  }, [selectedTopicId, client]);

  // Load questions when quiz changes
  useEffect(() => {
    if (!selectedQuizId) return;

    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const data = await client.admin.getQuestionsForQuiz(selectedQuizId);
        const list = Array.isArray(data) ? data : [];
        setQuestions(list);
      } catch {
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [selectedQuizId, client]);

  const activeTopic = topics.find((t) => t.id === selectedTopicId);
  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Curated Content Hierarchy
          </h1>
          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs font-medium border border-zinc-200 dark:border-zinc-700">
            Read-Only
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore production syllabus content: Topics &rarr; Quizzes &rarr; Questions.
        </p>
      </div>

      {/* 3-Column Drill-down Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Column 1: Topics (4 cols) */}
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              1. Topics ({topics.length})
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[560px] overflow-y-auto">
            {loadingTopics ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-1.5 text-indigo-600 dark:text-indigo-400" />
                Loading topics...
              </div>
            ) : topics.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">No topics found.</div>
            ) : (
              topics.map((topic) => {
                const isSelected = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3.5 flex items-start justify-between transition ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-3 border-indigo-600'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <Folder
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">{topic.name}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 font-normal">
                          {topic.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {topic.total_quizzes} quizzes
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Quizzes (4 cols) */}
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
              2. Quizzes {activeTopic ? `in ${activeTopic.name}` : ''} ({quizzes.length})
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[560px] overflow-y-auto">
            {loadingQuizzes ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-1.5 text-indigo-600 dark:text-indigo-400" />
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">No quizzes found.</div>
            ) : (
              quizzes.map((quiz) => {
                const isSelected = quiz.id === selectedQuizId;
                return (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className={`w-full text-left p-3.5 flex items-start justify-between transition ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-3 border-indigo-600'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <BookOpen
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">{quiz.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                          >
                            {(quiz as unknown as { status?: string }).status || 'published'}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            ${((quiz.price || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {quiz.total_questions ?? 0} Qs
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Questions in Quiz (4 cols) */}
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
              3. Questions {activeQuiz ? `in ${activeQuiz.title}` : ''} ({questions.length})
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[560px] overflow-y-auto p-2 space-y-2">
            {loadingQuestions ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-1.5 text-indigo-600 dark:text-indigo-400" />
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                Select a quiz to inspect questions.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shrink-0">
                      Q{idx + 1}
                    </span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{q.text}</p>
                  </div>

                  <div className="space-y-1 pl-6">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === ((q as unknown as { correct_index?: number }).correct_index ?? q.correct_option_index);
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-1.5 text-[11px] ${
                            isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isCorrect ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1 mr-0.5 shrink-0"></span>
                          )}
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
