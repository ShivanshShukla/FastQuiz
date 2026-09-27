import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  type AdminQuestionItem,
  type QuestionSourceType,
  type TopicSummary,
} from '@fastquiz/shared';
import {
  Filter,
  Search,
  Sparkles,
  Users,
  PenTool,
  Clock,
  ArrowRight,
  RefreshCw,
  Inbox,
} from 'lucide-react';

export const ReviewQueuePage: React.FC = () => {
  const { client } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<QuestionSourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load questions and topics
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedQuestions, fetchedTopics] = await Promise.all([
        client.admin.getQuestions({ status: 'pending' }),
        client.admin.getTopics(),
      ]);
      setQuestions(fetchedQuestions);
      setTopics(fetchedTopics);
    } catch {
      // Fallback handled inside api-client
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter questions client-side for ultra-fast desktop responsiveness
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Review status filter
      if (q.review_status !== 'pending') return false;

      // Topic filter
      if (selectedTopic !== 'all' && q.topic_id !== selectedTopic) {
        return false;
      }

      // Source filter
      if (selectedSource !== 'all' && q.source_type !== selectedSource) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesQuiz = q.quiz_title?.toLowerCase().includes(query) ?? false;
        const matchesTopic = q.topic_name?.toLowerCase().includes(query) ?? false;
        const matchesOptions = q.options?.some((opt) => opt.toLowerCase().includes(query)) ?? false;
        if (!matchesText && !matchesQuiz && !matchesTopic && !matchesOptions) return false;
      }

      return true;
    });
  }, [questions, selectedTopic, selectedSource, searchQuery]);

  const renderSourceBadge = (source: QuestionSourceType) => {
    switch (source) {
      case 'ai_generated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" />
            AI Generated
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Users className="w-3 h-3 text-amber-600" />
            Community
          </span>
        );
      case 'self_authored':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <PenTool className="w-3 h-3 text-sky-600" />
            Self Authored
          </span>
        );
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Content Review Queue
            <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              {filteredQuestions.length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and gate incoming questions before they go live on the user exam prep platform.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Source Type Filter */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value as QuestionSourceType | 'all')}
          className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Source Types</option>
          <option value="ai_generated">AI Generated</option>
          <option value="community">Community Submitted</option>
          <option value="self_authored">Self Authored</option>
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search question text or quiz title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs"
          />
        </div>

        {(selectedTopic !== 'all' || selectedSource !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedTopic('all');
              setSelectedSource('all');
              setSearchQuery('');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Dense Questions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading review queue...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No questions pending review</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All submitted questions for the selected filters have been reviewed, approved, or rejected.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-2.5 px-4 w-[42%]">Question Text</th>
                <th className="py-2.5 px-3 w-[18%]">Topic</th>
                <th className="py-2.5 px-3 w-[18%]">Parent Quiz</th>
                <th className="py-2.5 px-3 w-[12%]">Source</th>
                <th className="py-2.5 px-3 w-[10%]">Submitted</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => navigate(`/review/${q.id}`)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition group"
                >
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <p className="line-clamp-2 leading-relaxed" title={q.text}>
                      {q.text}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.options.length} options • Answer #{q.correct_option_index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 truncate max-w-[160px]">
                      {q.topic_name || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-xs">
                    <span className="truncate block max-w-[160px]" title={q.quiz_title}>
                      {q.quiz_title || 'Unassigned Quiz'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderSourceBadge(q.source_type)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(q.submitted_at)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:text-indigo-800 transition">
                      Review
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Showing {filteredQuestions.length} pending questions</span>
        <span className="flex items-center gap-1.5">
          <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[10px] text-slate-700 font-mono">Click Row</kbd> to inspect and approve/reject with keyboard shortcuts.
        </span>
      </div>
    </div>
  );
};
