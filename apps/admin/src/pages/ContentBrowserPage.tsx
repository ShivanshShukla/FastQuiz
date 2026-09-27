import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type TopicSummary,
  type AdminQuizItem,
  type Question,
} from '@fastquiz/shared';
import {
  BookOpen,
  Folder,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Check,
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
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        }
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
        setQuizzes(data);
        if (data.length > 0) {
          setSelectedQuizId(data[0].id);
        } else {
          setSelectedQuizId(null);
          setQuestions([]);
        }
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
        setQuestions(data);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [selectedQuizId, client]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Topics & Quizzes Browser
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Read-only taxonomy hierarchy. Inspect published quizzes and question counts across domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Column 1: Topics List (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-indigo-600" />
            Topics ({topics.length})
          </div>

          {loadingTopics ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading topics...</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`w-full text-left px-4 py-3 text-xs transition flex items-center justify-between cursor-pointer ${
                    selectedTopicId === t.id
                      ? 'bg-indigo-50/80 font-bold text-indigo-900 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="pr-2">
                    <p className="line-clamp-1">{t.name}</p>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {t.total_quizzes} Quizzes
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Quizzes in Selected Topic (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Quizzes in Topic ({quizzes.length})
          </div>

          {loadingQuizzes ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No quizzes under this topic.</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className={`w-full text-left p-4 text-xs transition cursor-pointer ${
                    selectedQuizId === quiz.id
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-900 line-clamp-1">{quiz.title}</h4>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
                      ${quiz.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                    {quiz.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2.5 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {quiz.total_questions} Questions
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {quiz.approved_questions_count} Approved
                    </span>
                    {quiz.pending_questions_count > 0 && (
                      <span className="flex items-center gap-1 text-amber-700">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {quiz.pending_questions_count} Pending
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Questions in Selected Quiz (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Quiz Questions ({questions.length})
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Read-only view</span>
          </div>

          {loadingQuestions ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No questions found in this quiz.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto p-3 space-y-3">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 leading-snug">
                      <span className="text-slate-400 mr-1.5 font-mono">#{qIndex + 1}</span>
                      {q.text}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                        q.review_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.review_status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.review_status}
                    </span>
                  </div>

                  <div className="space-y-1 pl-4">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`text-[11px] flex items-center gap-1.5 ${
                          oIdx === q.correct_option_index
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <span className="font-mono text-[10px]">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt}</span>
                        {oIdx === q.correct_option_index && (
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
