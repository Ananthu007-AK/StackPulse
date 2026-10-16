import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'teal' | 'indigo' | 'amber' | 'rose' | 'emerald';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  badge
}) => {
  const colorStyles = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200/80',
      text: 'text-teal-600',
      glow: 'group-hover:border-teal-400'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/80',
      text: 'text-indigo-600',
      glow: 'group-hover:border-indigo-400'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      text: 'text-amber-600',
      glow: 'group-hover:border-amber-400'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
      text: 'text-rose-600',
      glow: 'group-hover:border-rose-400'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      text: 'text-emerald-600',
      glow: 'group-hover:border-emerald-400'
    }
  };

  const style = colorStyles[color];

  return (
    <div className={`group glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 ${style.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center ${style.text} transition-transform group-hover:scale-110 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 shadow-xs">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
