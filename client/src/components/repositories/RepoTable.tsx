import React, { useState } from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  Search,
  ArrowUpDown,
  Filter,
  FileText
} from 'lucide-react';
import { Repository, Pin } from '../../types';
import { PinButton } from './PinButton';

interface RepoTableProps {
  repositories: Repository[];
  pinnedMap: Record<string, Pin>; // keyed by repo id or repo name
  onTogglePin: (repo: Repository) => void;
  onEditNote?: (repo: Repository) => void;
}

export const RepoTable: React.FC<RepoTableProps> = ({
  repositories,
  pinnedMap,
  onTogglePin,
  onEditNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'name' | 'updated'>('stars');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Collect unique languages
  const languages = Array.from(
    new Set(repositories.map((r) => r.primaryLanguage).filter(Boolean) as string[])
  ).sort();

  // Filter and sort
  const filtered = repositories
    .filter((repo) => {
      const matchSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchLang =
        selectedLanguage === 'all' || repo.primaryLanguage === selectedLanguage;
      return matchSearch && matchLang;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'stars') comparison = (b.stars || 0) - (a.stars || 0);
      else if (sortBy === 'forks') comparison = (b.forks || 0) - (a.forks || 0);
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'updated') {
        const dateA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
        const dateB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
        comparison = dateB - dateA;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'stars' | 'forks' | 'name' | 'updated') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-200/80 overflow-hidden space-y-4 p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Public Repositories</h3>
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {repositories.length} total repositories
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter repositories..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 outline-none shadow-xs"
            />
          </div>

          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:border-teal-500 outline-none cursor-pointer appearance-none shadow-xs"
            >
              <option value="all">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Repository</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Language</th>
              <th
                onClick={() => toggleSort('stars')}
                className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Stars</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('forks')}
                className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-900 transition hidden sm:table-cell"
              >
                <div className="flex items-center space-x-1">
                  <span>Forks</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('updated')}
                className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-900 transition hidden md:table-cell"
              >
                <div className="flex items-center space-x-1">
                  <span>Last Pushed</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/70">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No repositories match your current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((repo) => {
                const pin = pinnedMap[repo.id] || pinnedMap[repo.name];
                const isPinned = !!pin;
                const formattedDate = repo.pushedAt
                  ? new Date(repo.pushedAt).toLocaleDateString()
                  : '—';

                return (
                  <tr
                    key={repo.name}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <a
                            href={repo.htmlUrl || `https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-slate-900 hover:text-teal-600 transition flex items-center space-x-1.5"
                          >
                            <span>{repo.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          {repo.isFork && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                              fork
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                            {repo.description}
                          </p>
                        )}

                        {/* If pinned has a note or tags */}
                        {isPinned && pin && (pin.note || (pin.tags && pin.tags.length > 0)) && (
                          <div
                            onClick={() => onEditNote && onEditNote(repo)}
                            className="cursor-pointer pt-1 flex items-center space-x-2 text-[10px] text-teal-700"
                          >
                            {pin.note && (
                              <span className="flex items-center space-x-1 italic max-w-xs truncate">
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span>"{pin.note}"</span>
                              </span>
                            )}
                            {pin.tags && pin.tags.length > 0 && (
                              <div className="flex gap-1">
                                {pin.tags.map((t) => (
                                  <span key={t} className="px-1 rounded bg-teal-50 border border-teal-200 text-teal-700">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {repo.primaryLanguage ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          <span>{repo.primaryLanguage}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center space-x-1 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{repo.stars.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell">
                      <div className="flex items-center space-x-1">
                        <GitFork className="w-3.5 h-3.5 text-slate-400" />
                        <span>{repo.forks.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] hidden md:table-cell">
                      {formattedDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {isPinned && onEditNote && (
                          <button
                            onClick={() => onEditNote(repo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                            title="Edit Pin Note & Tags"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <PinButton
                          isPinned={isPinned}
                          onToggle={() => onTogglePin(repo)}
                          size="sm"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
