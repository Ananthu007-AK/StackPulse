import React from 'react';
import { Star, GitFork, Activity, Award, Flame } from 'lucide-react';
import { DeveloperMetrics } from '../../types';
import { StatCard } from '../common/StatCard';

interface MetricsCardsProps {
  metrics: DeveloperMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Stars"
        value={metrics.totalStars}
        subtitle="Cumulative repository stargazers"
        icon={Star}
        color="teal"
      />

      <StatCard
        title="Total Forks"
        value={metrics.totalForks}
        subtitle="Open source code derivative branches"
        icon={GitFork}
        color="indigo"
      />

      <StatCard
        title="Avg Stars / Repo"
        value={metrics.avgStarsPerRepo}
        subtitle="Repository impact density"
        icon={Award}
        color="amber"
      />

      <StatCard
        title="Recent Commits"
        value={metrics.recentCommits}
        subtitle="Past 4 weeks across top repos"
        icon={Flame}
        color="emerald"
        badge={metrics.recentCommits > 20 ? 'Active' : undefined}
      />
    </div>
  );
};
