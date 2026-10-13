import React from 'react';
import { Student } from '../types/index.ts';
import {
  LayoutDashboard,
  Layers,
  Cpu,
  Wrench,
  BookOpen,
  FolderGit2,
  Code2,
  GraduationCap,
  User,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  student: Student | null;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  student,
  onOpenProfile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'equipment', label: 'Lab Equipments', icon: Cpu },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'editor', label: 'Code Editor', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-slate-800">
              <GraduationCap className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-950 uppercase flex items-center gap-2">
                <span>DS LAB PORTAL</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  DIGITAL LIBRARY
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden md:block">
                Dept. of Computer Science & Data Science
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Student Profile Quick Card on Right */}
          <div className="flex items-center gap-3 shrink-0">
            {student ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-all text-left shadow-2xs group"
                title="View and Edit Student Profile"
              >
                <div className="w-8 h-8 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-blue-700/50 overflow-hidden">
                  {student.profile_photo_url ? (
                    <img
                      src={student.profile_photo_url}
                      alt={student.full_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {student.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-950 flex items-center gap-1.5">
                    <span className="truncate max-w-[120px]">{student.full_name}</span>
                    <span className="text-[10px] font-mono text-slate-600">[{student.roll_number}]</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-none truncate max-w-[140px]">
                    {student.department} · {student.section}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-800 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
