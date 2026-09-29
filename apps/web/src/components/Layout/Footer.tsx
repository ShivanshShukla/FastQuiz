import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showBadge={false} />
          <span className="text-xs text-zinc-500 pl-3 border-l border-zinc-200 dark:border-zinc-800">
            Technical assessment platform for engineering teams and candidates.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-medium">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Curriculum
          </Link>
          <Link to="/topics" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Topic Catalog
          </Link>
          <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Pricing
          </Link>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Proctoring</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
