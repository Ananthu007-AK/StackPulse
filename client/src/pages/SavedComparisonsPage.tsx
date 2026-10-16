import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SavedComparison } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Layers,
  ArrowRight,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';

export const SavedComparisonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    async function loadComparisons() {
      try {
        const res = await api.get('/comparisons');
        setComparisons(res.data);
      } catch (err) {
        console.error('Failed to load comparisons:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComparisons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comparison?')) return;
    try {
      await api.delete(`/comparisons/${id}`);
      setComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comparison:', err);
    }
  };

  const startRename = (comp: SavedComparison) => {
    setEditingId(comp.id);
    setEditName(comp.name);
  };

  const handleSaveRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await api.patch(`/comparisons/${id}`, { name: editName.trim() });
      setComparisons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: res.data.name } : c))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to rename comparison:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Layers className="w-7 h-7 text-teal-600" />
            <span>Saved Benchmarks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archived multi-engineer comparisons and custom talent benchmarks.
          </p>
        </div>

        <button
          onClick={() => navigate('/compare')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-600/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Comparison</span>
        </button>
      </div>

      {loading && (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="Loading saved benchmarks..." />
        </div>
      )}

      {!loading && comparisons.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No saved benchmarks yet"
          description="Create your first side-by-side comparison between 2 to 5 developers, then save it to revisit performance trends anytime."
          action={{
            label: 'Benchmark Developers Now',
            onClick: () => navigate('/compare')
          }}
        />
      )}

      {!loading && comparisons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comparisons.map((comp) => {
            const usernames = comp.developers
              .map((d) => d.developer?.githubUsername)
              .filter(Boolean);
            const isEditing = editingId === comp.id;

            return (
              <div
                key={comp.id}
                className="glass-card p-6 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-5 hover:border-teal-400 transition group"
              >
                <div className="space-y-3">
                  {/* Header / Rename */}
                  <div className="flex items-start justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-1 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-white border border-teal-500 text-sm text-slate-900 outline-none shadow-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(comp.id)}
                          className="p-1 rounded bg-teal-600 text-white hover:bg-teal-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition truncate">
                          {comp.name}
                        </h3>
                        <button
                          onClick={() => startRename(comp)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition p-1"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                      title="Delete benchmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Developers Chips */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      <span>{comp.developers.length} Developers Benchmarked</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {comp.developers.map((dev) => (
                        <div
                          key={dev.id}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs"
                        >
                          {dev.developer?.avatarUrl && (
                            <img
                              src={dev.developer.avatarUrl}
                              alt=""
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                          )}
                          <span className="font-mono text-teal-700 font-bold text-[11px]">
                            @{dev.developer?.githubUsername}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center space-x-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </span>

                  <button
                    onClick={() => navigate(`/compare?id=${comp.id}&devs=${usernames.join(',')}`)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold transition shadow-xs"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
