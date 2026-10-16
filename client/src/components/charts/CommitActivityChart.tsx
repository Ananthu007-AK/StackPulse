import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface CommitActivityChartProps {
  activity: { week: string; commits: number }[];
  totalRecentCommits: number;
}

export const CommitActivityChart: React.FC<CommitActivityChartProps> = ({
  activity,
  totalRecentCommits
}) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
        Commit activity statistics are unavailable or generating for this profile.
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Commit Velocity</h4>
          <p className="text-xs text-slate-500">Weekly commits across top repositories</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-extrabold text-teal-600">{totalRecentCommits}</span>
          <span className="text-xs text-slate-500 ml-1.5 font-medium">past 4 wks</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 border border-slate-200/90 p-2.5 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
                      <p className="text-slate-500 font-medium">Week of {label}</p>
                      <p className="text-teal-600 font-bold text-sm">
                        {payload[0].value} <span className="text-slate-600 font-normal text-xs">commits</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#commitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
