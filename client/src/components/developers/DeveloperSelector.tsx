import React, { useState } from 'react';
import { Plus, X, UserPlus, BookmarkPlus } from 'lucide-react';

interface DeveloperSelectorProps {
  selectedUsernames: string[];
  onAddUsername: (username: string) => void;
  onRemoveUsername: (username: string) => void;
  onSaveComparison?: () => void;
  loading?: boolean;
}

export const DeveloperSelector: React.FC<DeveloperSelectorProps> = ({
  selectedUsernames,
  onAddUsername,
  onRemoveUsername,
  onSaveComparison,
  loading = false
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed && !selectedUsernames.includes(trimmed.toLowerCase())) {
      onAddUsername(trimmed);
      setInputVal('');
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <span>Select Developers to Benchmark (2 to 5)</span>
          </h3>
          <p className="text-xs text-slate-500">Add GitHub handles to generate comparative engineering metrics</p>
        </div>

        {onSaveComparison && selectedUsernames.length >= 2 && (
          <button
            id="open-save-comparison-btn"
            onClick={onSaveComparison}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition shadow-xs"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save Comparison</span>
          </button>
        )}
      </div>

      {/* Selected tags & input form */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedUsernames.map((username) => (
          <div
            key={username}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-slate-800 text-sm font-medium shadow-xs group"
          >
            <span className="text-teal-600 font-bold">@</span>
            <span>{username}</span>
            <button
              onClick={() => onRemoveUsername(username)}
              className="p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition"
              title={`Remove ${username}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {selectedUsernames.length < 5 && (
          <form onSubmit={handleAdd} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Add username (e.g. torvalds)..."
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none w-56 shadow-xs"
            />
            <button
              id="add-dev-selector-btn"
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white transition shadow-xs"
              title="Add Developer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
