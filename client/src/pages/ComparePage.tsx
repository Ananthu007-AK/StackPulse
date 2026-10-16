import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompare } from '../hooks/useCompare';
import { DeveloperSelector } from '../components/developers/DeveloperSelector';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import {
  Trophy,
  Star,
  Users,
  GitFork,
  Code2,
  BookmarkCheck,
  Flame,
  Check,
  X,
  ExternalLink,
  GitCompare
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for developer usernames
  const [usernames, setUsernames] = useState<string[]>(() => {
    const devsParam = searchParams.get('devs');
    const dev1 = searchParams.get('dev1');
    const dev2 = searchParams.get('dev2');

    if (devsParam) {
      return devsParam.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (dev1 && dev2) {
      return [dev1.trim(), dev2.trim()];
    }
    if (dev1) {
      return [dev1.trim()];
    }
    return [];
  });

  const { data, loading, error, compareDevelopers, saveComparison, setData } = useCompare();

  // Save comparison modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync searchParams with usernames if query changes
  useEffect(() => {
    const devsParam = searchParams.get('devs');
    const dev1 = searchParams.get('dev1');
    const dev2 = searchParams.get('dev2');

    if (devsParam) {
      const parsed = devsParam.split(',').map((s) => s.trim()).filter(Boolean);
      setUsernames(parsed);
    } else if (dev1 && dev2) {
      setUsernames([dev1.trim(), dev2.trim()]);
    } else if (dev1) {
      setUsernames([dev1.trim()]);
    }
  }, [searchParams]);

  // Trigger compare on mount or when usernames change
  useEffect(() => {
    if (usernames.length >= 2) {
      compareDevelopers(usernames);
    } else {
      setData(null);
    }
  }, [usernames, compareDevelopers, setData]);

  const handleAddUsername = (username: string) => {
    const lower = username.toLowerCase();
    if (!usernames.includes(lower) && usernames.length < 5) {
      const next = [...usernames, lower];
      setUsernames(next);
      navigate(`/compare?devs=${next.join(',')}`, { replace: true });
    }
  };

  const handleRemoveUsername = (username: string) => {
    const next = usernames.filter((u) => u !== username.toLowerCase());
    setUsernames(next);
    if (next.length > 0) {
      navigate(`/compare?devs=${next.join(',')}`, { replace: true });
    } else {
      navigate('/compare', { replace: true });
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparisonName.trim()) return;

    setSaving(true);
    setSaveErrorMsg(null);
    try {
      await saveComparison(comparisonName.trim(), usernames);
      setSaveSuccessMsg(`Comparison "${comparisonName}" saved to your dashboard!`);
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveSuccessMsg(null);
        setComparisonName('');
      }, 1500);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Developer Intelligence <span className="text-teal-600">Comparison</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Benchmark repositories, stargazers, follower reach, and commit cadence side-by-side.
        </p>
      </div>

      {/* Developer Selector */}
      <DeveloperSelector
        selectedUsernames={usernames}
        onAddUsername={handleAddUsername}
        onRemoveUsername={handleRemoveUsername}
        onSaveComparison={() => setIsSaveModalOpen(true)}
        loading={loading}
      />

      {loading && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner
            size="lg"
            text="Gathering multi-developer comparative telemetry..."
          />
        </div>
      )}

      {error && !loading && (
        <ErrorMessage
          message={error}
          onRetry={() => compareDevelopers(usernames)}
        />
      )}

      {!loading && usernames.length < 2 && (
        <EmptyState
          icon={GitCompare}
          title={
            usernames.length === 1
              ? `Benchmark @${usernames[0]} against another developer`
              : 'Select developers to compare'
          }
          description={
            usernames.length === 1
              ? `Type at least one more GitHub username above and click '+' to compare side-by-side with @${usernames[0]}.`
              : 'Add 2 to 5 GitHub usernames in the selector above to benchmark stargazers, follower reach, and code metrics.'
          }
        />
      )}

      {!loading && data && data.developers.length >= 2 && (
        <>
          {/* Winner Highlights Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-teal-200 bg-teal-50/50 space-y-1 shadow-xs">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Most Stars</span>
              </div>
              <p className="text-lg font-extrabold text-slate-900 truncate">
                @{data.winnerHighlights.mostStars.username}
              </p>
              <p className="text-xs text-slate-500">
                {data.winnerHighlights.mostStars.count.toLocaleString()} stars
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-1 shadow-xs">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Most Followers</span>
              </div>
              <p className="text-lg font-extrabold text-slate-900 truncate">
                @{data.winnerHighlights.mostFollowers.username}
              </p>
              <p className="text-xs text-slate-500">
                {data.winnerHighlights.mostFollowers.count.toLocaleString()} followers
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-1 shadow-xs">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Most Repositories</span>
              </div>
              <p className="text-lg font-extrabold text-slate-900 truncate">
                @{data.winnerHighlights.mostRepos.username}
              </p>
              <p className="text-xs text-slate-500">
                {data.winnerHighlights.mostRepos.count.toLocaleString()} repos
              </p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-1 shadow-xs">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Highest Avg Stars</span>
              </div>
              <p className="text-lg font-extrabold text-slate-900 truncate">
                @{data.winnerHighlights.highestAvgStars.username}
              </p>
              <p className="text-xs text-slate-500">
                ~{data.winnerHighlights.highestAvgStars.count.toLocaleString()} / repo
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Table (Sticky first column for mobile) */}
          <div className="glass-card rounded-3xl border border-slate-200/80 overflow-hidden space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Telemetry Benchmark Matrix
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider sticky left-0 bg-slate-50 z-10 w-44 border-r border-slate-200/80">
                      Metric
                    </th>
                    {data.developers.map((dev) => (
                      <th
                        key={dev.developer.githubUsername}
                        className="py-3 px-4 font-semibold text-slate-900 min-w-[180px]"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={dev.developer.avatarUrl || ''}
                            alt={dev.developer.githubUsername}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-teal-500/30 shadow-xs"
                          />
                          <div className="overflow-hidden">
                            <p className="font-bold text-slate-900 truncate">
                              {dev.developer.name || dev.developer.githubUsername}
                            </p>
                            <p className="text-[11px] text-teal-600 font-mono">
                              @{dev.developer.githubUsername}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {/* Total Stars */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Total Stars
                    </td>
                    {data.developers.map((d) => {
                      const isWinner =
                        d.developer.githubUsername ===
                        data.winnerHighlights.mostStars.username;
                      return (
                        <td key={d.developer.githubUsername} className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                            <span>{d.metrics.totalStars.toLocaleString()}</span>
                            {isWinner && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] flex items-center space-x-0.5">
                                <span>🏆</span>
                                <span>Leader</span>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Followers */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Followers
                    </td>
                    {data.developers.map((d) => {
                      const isWinner =
                        d.developer.githubUsername ===
                        data.winnerHighlights.mostFollowers.username;
                      return (
                        <td key={d.developer.githubUsername} className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                            <span>{d.developer.followers.toLocaleString()}</span>
                            {isWinner && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] flex items-center space-x-0.5">
                                <span>🏆</span>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Public Repos */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Public Repositories
                    </td>
                    {data.developers.map((d) => {
                      const isWinner =
                        d.developer.githubUsername ===
                        data.winnerHighlights.mostRepos.username;
                      return (
                        <td key={d.developer.githubUsername} className="py-3.5 px-4 text-slate-700">
                          <div className="flex items-center space-x-1.5">
                            <span>
                              {d.developer.publicRepos || d.repositories.length}
                            </span>
                            {isWinner && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Forks */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Total Forks
                    </td>
                    {data.developers.map((d) => (
                      <td key={d.developer.githubUsername} className="py-3.5 px-4 text-slate-700">
                        {d.metrics.totalForks.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Recent Commits */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Recent Commits (4w)
                    </td>
                    {data.developers.map((d) => (
                      <td key={d.developer.githubUsername} className="py-3.5 px-4 text-teal-700 font-bold">
                        {d.metrics.recentCommits} commits
                      </td>
                    ))}
                  </tr>

                  {/* Average Stars */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Avg Stars / Repo
                    </td>
                    {data.developers.map((d) => {
                      const isWinner =
                        d.developer.githubUsername ===
                        data.winnerHighlights.highestAvgStars.username;
                      return (
                        <td key={d.developer.githubUsername} className="py-3.5 px-4 text-slate-700">
                          <div className="flex items-center space-x-1">
                            <span>~{d.metrics.avgStarsPerRepo}</span>
                            {isWinner && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Repository */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Flagship Repo
                    </td>
                    {data.developers.map((d) => (
                      <td key={d.developer.githubUsername} className="py-3.5 px-4 text-slate-700">
                        {d.metrics.topRepo ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 truncate max-w-[160px]">
                              {d.metrics.topRepo.name}
                            </p>
                            <span className="text-[11px] text-amber-600 flex items-center space-x-1 font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{d.metrics.topRepo.stars.toLocaleString()}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Action Link */}
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                      Full Profile
                    </td>
                    {data.developers.map((d) => (
                      <td key={d.developer.githubUsername} className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/developer/${d.developer.githubUsername}`)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                        >
                          <span>Explore Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grouped Bar Visualizations */}
          <ComparisonChart developers={data.developers} />
        </>
      )}

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsSaveModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-2xl z-10 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Save Comparison Benchmark</h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm flex items-center space-x-2">
                <Check className="w-5 h-5 text-teal-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                {saveErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {saveErrorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Comparison Title
                  </label>
                  <input
                    type="text"
                    required
                    value={comparisonName}
                    onChange={(e) => setComparisonName(e.target.value)}
                    placeholder="e.g. Frontend Architecture Titans"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Comparing: </span>
                  {usernames.map((u) => `@${u}`).join(', ')}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !comparisonName.trim()}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shadow-teal-600/20"
                  >
                    {saving ? 'Saving...' : 'Confirm & Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
