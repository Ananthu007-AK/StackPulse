import React from 'react';
import { Star, GitFork, ExternalLink, Calendar, Tag, FileText } from 'lucide-react';
import { Repository, Pin } from '../../types';
import { PinButton } from './PinButton';

interface RepoCardProps {
  repo: Repository;
  isPinned: boolean;
  pinData?: Pin;
  onTogglePin: () => void;
  onEditNote?: () => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  isPinned,
  pinData,
  onTogglePin,
  onEditNote
}) => {
  const formattedDate = repo.pushedAt
    ? new Date(repo.pushedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="overflow-hidden">
            <a
              href={repo.htmlUrl || `https://github.com/${repo.fullName}`}
              target="_blank"
              rel="noreferrer"
              className="text-base font-bold text-slate-900 hover:text-teal-600 flex items-center space-x-1.5 transition truncate"
            >
              <span className="truncate">{repo.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </a>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{repo.fullName}</p>
          </div>

          <PinButton isPinned={isPinned} onToggle={onTogglePin} size="sm" />
        </div>

        {repo.description && (
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {repo.description}
          </p>
        )}
      </div>

      {/* If pinned with note or tags */}
      {isPinned && pinData && (pinData.note || (pinData.tags && pinData.tags.length > 0)) && (
        <div
          onClick={onEditNote}
          className="p-2.5 rounded-xl bg-slate-50 border border-teal-200 text-xs space-y-1.5 cursor-pointer hover:border-teal-400 transition shadow-xs"
        >
          {pinData.note && (
            <div className="flex items-start space-x-1.5 text-slate-700">
              <FileText className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic text-[11px]">{pinData.note}</p>
            </div>
          )}

          {pinData.tags && pinData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {pinData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          {repo.primaryLanguage && (
            <span className="flex items-center space-x-1 text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>{repo.primaryLanguage}</span>
            </span>
          )}

          <span className="flex items-center space-x-1 text-slate-700 font-medium">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{repo.stars.toLocaleString()}</span>
          </span>

          <span className="flex items-center space-x-1 text-slate-500 font-medium">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            <span>{repo.forks.toLocaleString()}</span>
          </span>
        </div>

        {formattedDate && (
          <span className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        )}
      </div>
    </div>
  );
};
