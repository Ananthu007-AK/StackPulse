import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface SearchInputProps {
  onSearch: (username: string) => void;
  placeholder?: string;
  initialValue?: string;
  loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search GitHub username...',
  initialValue = '',
  loading = false
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    } else {
      document.getElementById('github-search-input')?.focus();
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        
        <input
          id="github-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 sm:pl-12 pr-28 sm:pr-32 py-2.5 sm:py-3.5 rounded-2xl bg-white/80 border border-slate-200/90 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none transition-all shadow-xs backdrop-blur-md"
        />

        <button
          id="github-search-submit"
          type="submit"
          disabled={loading}
          className="absolute inset-y-1.5 right-1.5 px-4 sm:px-5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md shadow-teal-600/25 disabled:opacity-60 cursor-pointer"
        >
          <span>{loading ? 'Searching...' : 'Explore'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
