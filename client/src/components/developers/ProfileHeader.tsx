import React from 'react';
import {
  MapPin,
  Building,
  Link as LinkIcon,
  Users,
  GitFork,
  ExternalLink,
  GitCompare,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Developer } from '../../types';

interface ProfileHeaderProps {
  developer: Developer;
  onAddToCompare?: (username: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  developer,
  onAddToCompare
}) => {
  const navigate = useNavigate();

  const handleCompareClick = () => {
    if (onAddToCompare) {
      onAddToCompare(developer.githubUsername);
    } else {
      navigate(`/compare?dev1=${developer.githubUsername}`);
    }
  };

  const formattedDate = new Date(developer.fetchedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-slate-200/80">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            {developer.avatarUrl ? (
              <img
                src={developer.avatarUrl}
                alt={developer.name || developer.githubUsername}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-teal-50 text-teal-700 font-bold text-3xl flex items-center justify-center ring-2 ring-teal-200">
                {developer.githubUsername[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
              PRO
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {developer.name || developer.githubUsername}
              </h1>
              <span className="text-sm font-semibold text-teal-600">
                @{developer.githubUsername}
              </span>
            </div>

            {developer.bio && (
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                {developer.bio}
              </p>
            )}

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
              {developer.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{developer.location}</span>
                </span>
              )}
              {developer.company && (
                <span className="flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{developer.company}</span>
                </span>
              )}
              {developer.blog && (
                <a
                  href={developer.blog.startsWith('http') ? developer.blog : `https://${developer.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-teal-600 hover:underline font-medium"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[140px] truncate">{developer.blog}</span>
                </a>
              )}
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Synced {formattedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            id="add-to-compare-btn"
            onClick={handleCompareClick}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-600/20 active:scale-95"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Dev</span>
          </button>

          <a
            id="view-github-profile-link"
            href={`https://github.com/${developer.githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition shadow-xs"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Followers</p>
          <p className="text-lg font-extrabold text-slate-900 mt-0.5">
            {developer.followers.toLocaleString()}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Following</p>
          <p className="text-lg font-extrabold text-slate-900 mt-0.5">
            {developer.following.toLocaleString()}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public Repos</p>
          <p className="text-lg font-extrabold text-slate-900 mt-0.5">
            {developer.publicRepos.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
