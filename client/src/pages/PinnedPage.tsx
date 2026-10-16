import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Pin } from '../types';
import { RepoCard } from '../components/repositories/RepoCard';
import { NoteModal } from '../components/repositories/NoteModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Bookmark, Search, Tag, Filter } from 'lucide-react';

export const PinnedPage: React.FC = () => {
  const navigate = useNavigate();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedPinForNote, setSelectedPinForNote] = useState<Pin | null>(null);

  useEffect(() => {
    async function loadPins() {
      try {
        const res = await api.get('/pins');
        setPins(res.data);
      } catch (err) {
        console.error('Failed to load pins:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPins();
  }, []);

  // Collect unique tags
  const allTags = Array.from(
    new Set(pins.flatMap((p) => p.tags || []))
  ).sort();

  // Filter pins
  const filteredPins = pins.filter((pin) => {
    const matchSearch =
      pin.repository.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pin.repository.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pin.note || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchTag =
      selectedTag === 'all' || (pin.tags && pin.tags.includes(selectedTag));

    return matchSearch && matchTag;
  });

  const handleUnpin = async (pinId: string) => {
    try {
      await api.delete(`/pins/${pinId}`);
      setPins((prev) => prev.filter((p) => p.id !== pinId));
    } catch (err) {
      console.error('Failed to unpin:', err);
    }
  };

  const handleSavePinNote = async (note: string, tags: string[]) => {
    if (!selectedPinForNote) return;
    try {
      const res = await api.patch(`/pins/${selectedPinForNote.id}`, { note, tags });
      setPins((prev) =>
        prev.map((p) => (p.id === selectedPinForNote.id ? res.data : p))
      );
    } catch (err) {
      console.error('Failed to update pin note:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Bookmark className="w-7 h-7 text-teal-600" />
            <span>Pinned Repositories</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate your personal collection of open source code with custom notes and taxonomy tags.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or note..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 outline-none shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 flex items-center space-x-1 pl-1 font-medium">
            <Tag className="w-3.5 h-3.5 text-teal-600" />
            <span>Tags:</span>
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition shadow-xs ${
              selectedTag === 'all'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All ({pins.length})
          </button>
          {allTags.map((tag) => {
            const count = pins.filter((p) => p.tags?.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 shadow-xs ${
                  selectedTag === tag
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>#{tag}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="Retrieving bookmarked repositories..." />
        </div>
      )}

      {!loading && pins.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No pinned repositories yet"
          description="Search and explore any developer profile, then click the 'Pin' button on repositories to bookmark them with custom notes and tags."
          action={{
            label: 'Search Developers',
            onClick: () => navigate('/dashboard')
          }}
        />
      )}

      {!loading && pins.length > 0 && filteredPins.length === 0 && (
        <div className="glass-card p-8 rounded-3xl text-center text-slate-500 text-sm border border-slate-200/80">
          No pinned repositories match "{searchTerm}" {selectedTag !== 'all' ? `with tag #${selectedTag}` : ''}.
        </div>
      )}

      {!loading && filteredPins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPins.map((pin) => (
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

      {/* Note editing modal */}
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
