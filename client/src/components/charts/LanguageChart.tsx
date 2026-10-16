import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface LanguageChartProps {
  distribution: Record<string, number>;
  title?: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#eab308',
  TypeScript: '#0284c7',
  Python: '#2563eb',
  C: '#475569',
  'C++': '#db2777',
  'C#': '#16a34a',
  Java: '#b45309',
  Go: '#0891b2',
  Rust: '#c2410c',
  PHP: '#4338ca',
  Ruby: '#b91c1c',
  Swift: '#ea580c',
  Kotlin: '#7c3aed',
  HTML: '#e11d48',
  CSS: '#6d28d9',
  Shell: '#65a30d'
};

export const LanguageChart: React.FC<LanguageChartProps> = ({
  distribution,
  title = 'Top Languages Breakdown'
}) => {
  const chartData = Object.entries(distribution || {})
    .map(([name, percentage]) => ({
      name,
      percentage,
      color: LANGUAGE_COLORS[name] || '#0d9488'
    }))
    .sort((a, b) => b.percentage - a.percentage);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
        No language data recorded for this profile.
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">{title}</h4>
        <span className="text-xs text-slate-500 font-medium">By Repository Primary Language</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#94a3b8"
              fontSize={11}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 border border-slate-200/90 p-2.5 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="font-semibold text-slate-900">{data.name}</span>
                      </div>
                      <p className="text-slate-600">
                        Share: <span className="font-bold text-teal-600">{data.percentage}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="percentage"
              radius={[0, 6, 6, 0]}
              barSize={16}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pill legend */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
            <span className="text-slate-500 font-mono text-[11px]">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
