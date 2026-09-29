import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { webMockStore } from '../services/webMockStore';

export const TopicsCatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const topics = webMockStore.getTopics();

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      t.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-8 text-left">
      <div className="space-y-3">
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-white">
          Technical Interview Topics Catalog
        </h1>
        <p className="font-body text-slate-600 dark:text-[#94A3B8] max-w-2xl">
          Calibrated question banks across Data Structures, High-Throughput System Design, and Core Concurrency.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, algorithms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-900 dark:text-white focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {['all', 'System Design', 'Algorithms', 'Systems'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-headline text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1e2433] text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="group relative rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] p-6 shadow-md hover:border-primary/50 transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-headline text-xs font-bold uppercase tracking-wider">
                  {topic.category}
                </span>
                {topic.freeGrantAvailable && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-headline text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    1 Free Quiz
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                  {topic.title}
                </h2>
                <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] pt-2 border-t border-slate-100 dark:border-[#2d3748]/60">
                <span>{topic.totalQuizzes} Quizzes Total</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {topic.faangRelevancePercent}% FAANG Relevance
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to={`/topics/${topic.slug}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#1e2433] hover:bg-primary dark:hover:bg-primary text-slate-800 dark:text-white hover:text-white font-headline text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Quizzes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
