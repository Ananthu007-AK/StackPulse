import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { DeveloperProfileResponse } from '../../types';

interface ComparisonChartProps {
  developers: DeveloperProfileResponse[];
}

const DEV_COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#e11d48', '#8b5cf6'];

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ developers }) => {
  const [metricTab, setMetricTab] = useState<'overview' | 'languages'>('overview');

  // Overview metrics data: Stars, Followers, Repositories, Recent Commits
  const overviewData = [
    {
      metric: 'Total Stars',
      ...Object.fromEntries(
        developers.map((d) => [d.developer.githubUsername, d.metrics.totalStars])
      )
    },
    {
      metric: 'Followers',
      ...Object.fromEntries(
        developers.map((d) => [d.developer.githubUsername, d.developer.followers])
      )
    },
    {
      metric: 'Public Repos',
      ...Object.fromEntries(
        developers.map((d) => [d.developer.githubUsername, d.developer.publicRepos])
      )
    },
    {
      metric: 'Recent Commits',
      ...Object.fromEntries(
        developers.map((d) => [d.developer.githubUsername, d.metrics.recentCommits])
      )
    }
  ];

  // Language comparison data
  const languageSet = new Set<string>();
  developers.forEach((d) => {
    Object.keys(d.metrics.languageDistribution || {}).forEach((l) => languageSet.add(l));
  });

  const languageData = Array.from(languageSet)
    .slice(0, 7)
    .map((lang) => {
      const row: any = { language: lang };
      developers.forEach((d) => {
        row[d.developer.githubUsername] = d.metrics.languageDistribution?.[lang] || 0;
      });
      return row;
    });

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Comparative Metrics</h4>
          <p className="text-xs text-slate-500">Side-by-side benchmark across selected engineers</p>
        </div>

        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          <button
            onClick={() => setMetricTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              metricTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Core Metrics
          </button>
          <button
            onClick={() => setMetricTab('languages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              metricTab === 'languages'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Language Share (%)
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metricTab === 'overview' ? (
            <BarChart data={overviewData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#475569' }}
                iconType="circle"
              />
              {developers.map((d, index) => (
                <Bar
                  key={d.developer.githubUsername}
                  dataKey={d.developer.githubUsername}
                  name={`@${d.developer.githubUsername}`}
                  fill={DEV_COLORS[index % DEV_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <BarChart data={languageData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="language" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(value: any) => [`${value}%`]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#475569' }}
                iconType="circle"
              />
              {developers.map((d, index) => (
                <Bar
                  key={d.developer.githubUsername}
                  dataKey={d.developer.githubUsername}
                  name={`@${d.developer.githubUsername}`}
                  fill={DEV_COLORS[index % DEV_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
