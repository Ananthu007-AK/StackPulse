import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeveloper } from '../hooks/useDeveloper';
import api from '../services/api';
import { Pin, Repository } from '../types';
import { ProfileHeader } from '../components/developers/ProfileHeader';
import { MetricsCards } from '../components/developers/MetricsCards';
import { LanguageChart } from '../components/charts/LanguageChart';
import { CommitActivityChart } from '../components/charts/CommitActivityChart';
import { RepoTable } from '../components/repositories/RepoTable';
import { SearchInput } from '../components/common/SearchInput';
import { NoteModal } from '../components/repositories/NoteModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, UserX } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useDeveloper(username);

  // User's current pins map (keyed by repoId or repoName)
  const [pinnedMap, setPinnedMap] = useState<Record<string, Pin>>({});
  const [selectedRepoForNote, setSelectedRepoForNote] = useState<Repository | null>(null);

  useEffect(() => {
    async function loadPins() {
      try {
        const res = await api.get('/pins');
        const map: Record<string, Pin> = {};
        res.data.forEach((pin: Pin) => {
          map[pin.repoId] = pin;
          if (pin.repository?.name) {
            map[pin.repository.name] = pin;
          }
        });
        setPinnedMap(map);
      } catch (err) {
        console.error('Failed to load user pins:', err);
      }
    }
    loadPins();
  }, []);

  const handleSearch = (newUsername: string) => {
    navigate(`/developer/${newUsername}`);
  };

  const handleTogglePin = async (repo: Repository) => {
    const existing = pinnedMap[repo.id] || pinnedMap[repo.name];

    if (existing) {
      // Unpin
      try {
        await api.delete(`/pins/${existing.id}`);
        setPinnedMap((prev) => {
          const next = { ...prev };
          delete next[repo.id];
          delete next[repo.name];
          delete next[existing.id];
          return next;
        });
      } catch (err) {
        console.error('Failed to remove pin:', err);
      }
    } else {
      // Prompt note modal to pin with optional note & tags
      setSelectedRepoForNote(repo);
    }
  };

  const handleSavePin = async (note: string, tags: string[]) => {
    if (!selectedRepoForNote) return;

    try {
      const existing = pinnedMap[selectedRepoForNote.id] || pinnedMap[selectedRepoForNote.name];

      if (existing) {
        // Update existing pin
        const res = await api.patch(`/pins/${existing.id}`, { note, tags });
        setPinnedMap((prev) => ({
          ...prev,
          [selectedRepoForNote.id]: res.data,
          [selectedRepoForNote.name]: res.data
        }));
      } else {
        // Create new pin
        const res = await api.post('/pins', {
          repoId: selectedRepoForNote.id,
          note,
          tags
        });
        setPinnedMap((prev) => ({
          ...prev,
          [selectedRepoForNote.id]: res.data,
          [selectedRepoForNote.name]: res.data
        }));
      }
    } catch (err) {
      console.error('Failed to save pin:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top search & back bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="w-full sm:w-96">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search username..."
          />
        </div>
      </div>

      {loading && (
        <div className="py-24 flex justify-center">
          <LoadingSpinner
            size="lg"
            text={`Analyzing GitHub intelligence for @${username}...`}
          />
        </div>
      )}

      {error && (
        <div className="glass-card p-8 rounded-3xl border border-red-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Developer Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm shadow-teal-600/20"
            >
              Retry Search
            </button>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Profile Header */}
          <ProfileHeader developer={data.developer} />

          {/* Metric Aggregate Cards */}
          <MetricsCards metrics={data.metrics} />

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LanguageChart
              distribution={data.metrics.languageDistribution}
              title="Top Languages Breakdown"
            />
            <CommitActivityChart
              activity={data.metrics.weeklyActivity || []}
              totalRecentCommits={data.metrics.recentCommits}
            />
          </div>

          {/* Repositories Table */}
          <RepoTable
            repositories={data.repositories}
            pinnedMap={pinnedMap}
            onTogglePin={handleTogglePin}
            onEditNote={(repo) => setSelectedRepoForNote(repo)}
          />
        </>
      )}

      {/* Note & Tag Modal */}
      {selectedRepoForNote && (
        <NoteModal
          isOpen={true}
          onClose={() => setSelectedRepoForNote(null)}
          onSave={handleSavePin}
          initialNote={
            pinnedMap[selectedRepoForNote.id]?.note ||
            pinnedMap[selectedRepoForNote.name]?.note ||
            ''
          }
          initialTags={
            pinnedMap[selectedRepoForNote.id]?.tags ||
            pinnedMap[selectedRepoForNote.name]?.tags ||
            []
          }
          repoName={selectedRepoForNote.name}
        />
      )}
    </div>
  );
};
