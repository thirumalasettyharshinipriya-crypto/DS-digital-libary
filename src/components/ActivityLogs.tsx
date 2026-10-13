import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  History,
  FolderGit2,
  FlaskConical,
  BookOpen,
  Cpu,
  UserCheck,
  Search,
  RefreshCw,
  Clock,
  Filter,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ActivityLogsProps {
  initialLogs?: AuditLog[];
  onSelectExperiment?: (id: number) => void;
  onSelectProject?: (id: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({
  initialLogs = [],
  onSelectExperiment,
  onSelectProject,
  onNavigateTab
}) => {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    } else {
      fetchLogs();
    }
  }, [initialLogs]);

  // Format timestamp into clean academic prose
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const getEntityIcon = (entityType: string, actionType: string) => {
    const e = entityType.toLowerCase();
    const a = actionType.toLowerCase();

    if (e.includes('project') || a.includes('project')) {
      return {
        icon: FolderGit2,
        bgColor: 'bg-indigo-900',
        textColor: 'text-indigo-400',
        tagText: 'Project Upload',
        tagColor: 'text-indigo-950 font-semibold'
      };
    }
    if (e.includes('experiment') || a.includes('experiment')) {
      return {
        icon: FlaskConical,
        bgColor: 'bg-blue-900',
        textColor: 'text-sky-400',
        tagText: 'Experiment Mod',
        tagColor: 'text-blue-950 font-semibold'
      };
    }
    if (e.includes('resource') || a.includes('resource')) {
      return {
        icon: BookOpen,
        bgColor: 'bg-amber-900',
        textColor: 'text-amber-400',
        tagText: 'Resource Addition',
        tagColor: 'text-amber-950 font-semibold'
      };
    }
    if (e.includes('equipment') || a.includes('equipment')) {
      return {
        icon: Cpu,
        bgColor: 'bg-emerald-900',
        textColor: 'text-emerald-400',
        tagText: 'Equipment Status',
        tagColor: 'text-emerald-950 font-semibold'
      };
    }
    return {
      icon: UserCheck,
      bgColor: 'bg-slate-900',
      textColor: 'text-slate-300',
      tagText: 'Profile Update',
      tagColor: 'text-slate-950 font-semibold'
    };
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filterType === 'all' ||
      log.action_type.toLowerCase() === filterType.toLowerCase() ||
      log.entity_type.toLowerCase() === filterType.toLowerCase();

    const matchesSearch =
      !search.trim() ||
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.user_name.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center shadow-2xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Activity Logs & Audit Trail</h2>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 tabular-nums">
                {logs.length} logged
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Chronological ledger of project uploads, resource additions, and experiment modifications
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('project_upload')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'project_upload'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setFilterType('experiment_modify')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'experiment_modify'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Experiments
            </button>
            <button
              onClick={() => setFilterType('resource_add')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'resource_add'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setFilterType('equipment_update')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'equipment_update'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Equipment
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 w-36 sm:w-44"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh Activity Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chronological Activity Feed */}
      <div className="mt-4">
        {filteredLogs.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredLogs.map((log) => {
              const meta = getEntityIcon(log.entity_type, log.action_type);
              const Icon = meta.icon;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Dot / Icon */}
                  <div
                    className={`absolute -left-6 top-0.5 w-6 h-6 rounded-md ${meta.bgColor} ${meta.textColor} flex items-center justify-center shadow-2xs border border-white ring-2 ring-slate-100`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors`}>
                          {log.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600">
                          [{meta.tagText}]
                        </span>
                      </div>

                      {/* Unboxed Metadata with Typographic Separator */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {log.description}
                    </p>

                    {/* Footer Attribution & Action Links */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>Initiated by: <strong className="font-semibold text-slate-800">{log.user_name}</strong></span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="font-mono text-slate-600">Log ID #{log.id}</span>
                      </div>

                      {log.entity_type === 'Experiment' && log.entity_id && onSelectExperiment && (
                        <button
                          onClick={() => onSelectExperiment(log.entity_id!)}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <span>View Experiment</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {log.entity_type === 'Project' && log.entity_id && onSelectProject && (
                        <button
                          onClick={() => onSelectProject(log.entity_id!)}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <span>View Project</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {log.entity_type === 'Resource' && onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('resources')}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <span>Go to Resources</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {log.entity_type === 'Equipment' && onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('equipment')}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <span>Check Equipment</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-700">No activity logs matched your filter.</p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearch('');
              }}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
