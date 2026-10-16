import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface PinButtonProps {
  isPinned: boolean;
  onToggle: () => void;
  loading?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const PinButton: React.FC<PinButtonProps> = ({
  isPinned,
  onToggle,
  loading = false,
  size = 'md',
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={loading}
      aria-label={isPinned ? 'Unpin repository' : 'Pin repository'}
      title={isPinned ? 'Pinned — click to unpin or edit note' : 'Pin this repository to your dashboard'}
      className={`inline-flex items-center space-x-1.5 rounded-xl font-medium transition-all ${
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
      } ${
        isPinned
          ? 'bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100 shadow-xs'
          : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
      } ${className}`}
    >
      {isPinned ? (
        <BookmarkCheck className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-teal-600 fill-teal-100`} />
      ) : (
        <Bookmark className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-400`} />
      )}
      <span>{isPinned ? 'Pinned' : 'Pin'}</span>
    </button>
  );
};
