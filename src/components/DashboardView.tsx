import React from 'react';
import { DashboardStats, Student } from '../types/index.ts';
import { ActivityLogs } from './ActivityLogs.tsx';
import {
  FlaskConical,
  FolderGit2,
  Cpu,
  BookOpen,
  PlusCircle,
  Code2,
  User,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  student: Student | null;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAddExperiment: () => void;
  onOpenAddProject: () => void;
  onSelectExperiment: (id: number) => void;
  onSelectProject: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  student,
  onNavigate,
  onOpenProfile,
  onOpenAddExperiment,
  onOpenAddProject,
  onSelectExperiment,
  onSelectProject
}) => {
  return (
    <div className="space-y-6">
      
      {/* Welcome & Student Profile Academic Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 overflow-hidden border border-blue-800">
              {student?.profile_photo_url ? (
                <img
                  src={student.profile_photo_url}
                  alt={student.full_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {student?.full_name
                    ? student.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    : 'DS'}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {student?.full_name || 'Student'}
                </h1>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {student?.roll_number}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                <span>{student?.department}</span>
                <span className="mx-1.5 text-slate-400">·</span>
                <span>{student?.section}</span>
                <span className="mx-1.5 text-slate-400">·</span>
                <span className="font-medium text-slate-700">{student?.subject}</span>
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                <span>Faculty: <strong className="font-semibold text-slate-800">{student?.faculty_name}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Academic Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onOpenAddExperiment}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Add Experiment</span>
            </button>
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Upload Project</span>
            </button>
            <button
              onClick={() => onNavigate('editor')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-950 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors border border-sky-300/60"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-800" />
              <span>Open Code Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards from MySQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Experiments */}
        <div
          onClick={() => onNavigate('modules')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Total Experiments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
              <FlaskConical className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {stats ? stats.total_experiments : '...'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Across {stats ? stats.total_modules : 7} core modules</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Total Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Student Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center border border-indigo-100">
              <FolderGit2 className="w-4 h-4 text-indigo-700" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {stats ? stats.total_projects : '...'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Portfolio and demos</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Available Equipment */}
        <div
          onClick={() => onNavigate('equipment')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Available Lab Equipment</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center border border-emerald-100">
              <Cpu className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {stats ? stats.available_equipment : '...'}
            </span>
            <span className="text-xs text-slate-600">
              / {stats ? stats.total_equipment : 0} units total
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Ready for scheduling</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Learning Resources */}
        <div
          onClick={() => onNavigate('resources')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Learning Resources</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-100">
              <BookOpen className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {stats ? stats.total_resources : '...'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Notes, PDFs & datasets</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Recently Added Experiments & Recently Uploaded Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recently Added Experiments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-900" />
                <h2 className="text-sm font-bold text-slate-900">Recently Added Experiments</h2>
              </div>
              <button
                onClick={() => onNavigate('modules')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {stats && stats.recent_experiments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recent_experiments.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExperiment(exp.id)}
                    className="py-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-900">
                            Exp {exp.experiment_number}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 transition-colors line-clamp-1">
                            {exp.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {exp.short_description}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-600 shrink-0 whitespace-nowrap">
                        {exp.module_title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-600">No experiments recorded in the database yet.</p>
                <button
                  onClick={onOpenAddExperiment}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Add First Experiment
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Verified against semester curriculum</span>
            <button
              onClick={onOpenAddExperiment}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Experiment</span>
            </button>
          </div>
        </div>

        {/* Recently Uploaded Projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-900" />
                <h2 className="text-sm font-bold text-slate-900">Recently Uploaded Projects</h2>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {stats && stats.recent_projects.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recent_projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className="py-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
                          {proj.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {proj.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {proj.short_description}
                      </p>
                      <div className="text-[11px] text-slate-600 pt-0.5">
                        Tech: {proj.technologies_used}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-600">No student projects uploaded yet.</p>
                <button
                  onClick={onOpenAddProject}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Upload First Project
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Research & lab prototypes</span>
            <button
              onClick={onOpenAddProject}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload New Project</span>
            </button>
          </div>
        </div>

      </div>

      {/* Chronological Activity Logs Audit Trail Section */}
      <ActivityLogs
        initialLogs={stats?.recent_audit_logs || []}
        onSelectExperiment={onSelectExperiment}
        onSelectProject={onSelectProject}
        onNavigateTab={onNavigate}
      />

    </div>
  );
};
