import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-[#0D1117] border-t border-slate-200 dark:border-[#262F40]/80 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showBadge={false} />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] pl-3 border-l border-slate-300 dark:border-[#262F40]">
            © 2026 FastQuiz Inc. Built for engineering interview mastery.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-[#94A3B8] font-medium">
          <Link to="/topics" className="hover:text-primary transition-colors">
            Topics Catalog
          </Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">
            Pro Bundles
          </Link>
          <Link to="/attempts/att-seed-1/results" className="hover:text-primary transition-colors">
            Diagnostic Matrix
          </Link>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit Secure Exam Proctor</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
