import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompare,
  Bookmark,
  Layers,
  Github
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Compare Devs', to: '/compare', icon: GitCompare },
    { label: 'Pinned Repos', to: '/pins', icon: Bookmark },
    { label: 'Saved Comparisons', to: '/comparisons', icon: Layers },
  ];

  return (
    <aside className={`w-64 h-full overflow-y-auto glass-panel border-r border-slate-200/70 flex flex-col justify-between py-6 px-4 bg-white/70 flex-shrink-0 backdrop-blur-md ${className}`}>
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Navigation</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/compare'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm border transition-all outline-none focus:outline-none select-none ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 border-teal-200/90 font-semibold shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-3 pt-6 border-t border-slate-200/70 text-xs text-slate-500 space-y-2">
        <div className="flex items-center space-x-2 text-slate-700">
          <Github className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-slate-800">StackPulse v1.0</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Real-time GitHub developer benchmarking and repository curation.
        </p>
      </div>
    </aside>
  );
};
