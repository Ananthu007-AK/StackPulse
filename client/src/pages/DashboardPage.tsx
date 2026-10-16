import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Pin, SavedComparison, Repository } from '../types';
import { SearchInput } from '../components/common/SearchInput';
import { StatCard } from '../components/common/StatCard';
import { RepoCard } from '../components/repositories/RepoCard';
import { NoteModal } from '../components/repositories/NoteModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Bookmark,
  GitCompare,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2,
  ExternalLink,
  Code2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pins, setPins] = useState<Pin[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  // Note modal state
  const [selectedPinForNote, setSelectedPinForNote] = useState<Pin | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pinsRes, compRes] = await Promise.all([
          api.get('/pins'),
          api.get('/comparisons')
        ]);
        setPins(pinsRes.data);
        setComparisons(compRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleSearch = (username: string) => {
    navigate(`/developer/${username}`);
  };

  const handleUnpin = async (pinId: string) => {
    try {
      await api.delete(`/pins/${pinId}`);
      setPins((prev) => prev.filter((p) => p.id !== pinId));
    } catch (err) {
      console.error('Failed to unpin repository:', err);
    }
  };

  const handleSavePinNote = async (note: string, tags: string[]) => {
    if (!selectedPinForNote) return;
    try {
      const res = await api.put(`/pins/${selectedPinForNote.id}`, { note, tags });
      setPins((prev) =>
        prev.map((p) => (p.id === selectedPinForNote.id ? res.data : p))
      );
      setSelectedPinForNote(null);
    } catch (err) {
      console.error('Failed to update pin note:', err);
    }
  };

  const handleDeleteComparison = async (compId: string) => {
    if (!confirm('Are you sure you want to delete this saved comparison?')) return;
    try {
      await api.delete(`/comparisons/${compId}`);
      setComparisons((prev) => prev.filter((c) => c.id !== compId));
    } catch (err) {
      console.error('Failed to delete comparison:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard intelligence..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-slate-200/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Intelligence Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-teal-600">{user?.name || user?.email.split('@')[0]}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Search top open-source engineers, benchmark impact metrics across teams, and organize your curated repositories.
          </p>

          <div className="pt-2">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pinned Repos"
          value={pins.length}
          subtitle="Starred repositories in your collection"
          icon={Bookmark}
          color="teal"
        />
        <StatCard
          title="Saved Benchmarks"
          value={comparisons.length}
          subtitle="Multi-developer comparative snapshots"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Engineers Tracked"
          value={
            new Set([
              ...pins.map((p) => p.repository.developer?.githubUsername).filter(Boolean),
              ...comparisons.flatMap((c) => c.developers.map((d) => d.developer?.githubUsername)).filter(Boolean)
            ]).size
          }
          subtitle="Unique profiles in your dashboard"
          icon={Code2}
          color="emerald"
        />
      </div>

      {/* Pinned Repositories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-teal-600" />
              <span>Pinned Repositories</span>
            </h2>
            <p className="text-xs text-slate-500">Repositories you've bookmarked with notes & tags</p>
          </div>

          {pins.length > 0 && (
            <Link
              to="/pins"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>View All ({pins.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {pins.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No pinned repositories yet"
            description="Explore any GitHub developer profile using the search bar above and click 'Pin' on repositories to save notes and tags."
            action={{
              label: 'Search Developers',
              onClick: () => {
                const el = document.getElementById('github-search-input');
                el?.focus();
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pins.slice(0, 6).map((pin) => (
              <RepoCard
                key={pin.id}
                repo={pin.repository}
                isPinned={true}
                pinData={pin}
                onTogglePin={() => handleUnpin(pin.id)}
                onEditNote={() => setSelectedPinForNote(pin)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Saved Comparisons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-teal-600" />
              <span>Saved Comparisons</span>
            </h2>
            <p className="text-xs text-slate-500">Saved benchmarks between engineering talent</p>
          </div>

          {comparisons.length > 0 && (
            <Link
              to="/comparisons"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Manage Comparisons ({comparisons.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {comparisons.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="No saved comparisons yet"
            description="Benchmark 2 to 5 developers simultaneously and save your customized comparisons for instant access."
            action={{
              label: 'Create a Comparison',
              onClick: () => navigate('/compare')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.slice(0, 6).map((comp) => {
              const usernames = comp.developers.map((d) => d.developer?.githubUsername).filter(Boolean);
              return (
                <div
                  key={comp.id}
                  className="glass-card p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition">
                        {comp.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteComparison(comp.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                        title="Delete comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {comp.developers.map((dev) => (
                        <span
                          key={dev.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono"
                        >
                          @{dev.developer?.githubUsername}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/compare?id=${comp.id}&devs=${usernames.join(',')}`)}
                      className="inline-flex items-center space-x-1 text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      <span>Load Benchmark</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note modal for editing pins */}
      {selectedPinForNote && (
        <NoteModal
          isOpen={true}
          onClose={() => setSelectedPinForNote(null)}
          onSave={handleSavePinNote}
          initialNote={selectedPinForNote.note || ''}
          initialTags={selectedPinForNote.tags || []}
          repoName={selectedPinForNote.repository.name}
        />
      )}
    </div>
  );
};
