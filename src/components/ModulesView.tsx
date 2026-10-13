import React, { useState } from 'react';
import { Module, Experiment } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Layers,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  X,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Coffee,
  Binary,
  Database,
  BarChart3,
  Cpu,
  Wifi,
  FileCode
} from 'lucide-react';

interface ModulesViewProps {
  modules: Module[];
  onRefreshModules: () => void;
  onOpenAddExperiment: (defaultModuleId?: number) => void;
  onSelectExperiment: (id: number) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onRefreshModules,
  onOpenAddExperiment,
  onSelectExperiment
}) => {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<(Module & { experiments: Experiment[] }) | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    semester: 'Semester 5',
    category: 'Core Laboratory',
    icon_name: 'Code',
    color_accent: 'blue'
  });

  const getModuleIcon = (name: string) => {
    switch (name) {
      case 'Terminal': return Terminal;
      case 'Coffee': return Coffee;
      case 'Binary': return Binary;
      case 'Database': return Database;
      case 'BarChart3': return BarChart3;
      case 'Cpu': return Cpu;
      case 'Wifi': return Wifi;
      default: return FileCode;
    }
  };

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDetail = async (modId: number) => {
    try {
      setIsDetailLoading(true);
      const detail = await api.getModule(modId);
      setSelectedModule(detail);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: `DS-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      description: '',
      semester: 'Semester 5',
      category: 'Core Laboratory',
      icon_name: 'BarChart3',
      color_accent: 'blue'
    });
    setEditingModule(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mod: Module) => {
    setEditingModule(mod);
    setFormData({
      code: mod.code,
      title: mod.title,
      description: mod.description,
      semester: mod.semester,
      category: mod.category,
      icon_name: mod.icon_name,
      color_accent: mod.color_accent
    });
    setIsAddModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await api.updateModule(editingModule.id, formData);
        setFeedback({ type: 'success', message: 'Module updated successfully.' });
      } else {
        await api.addModule(formData);
        setFeedback({ type: 'success', message: 'New module added successfully.' });
      }
      setIsAddModalOpen(false);
      onRefreshModules();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const handleDeleteModule = async (id: number) => {
    try {
      await api.deleteModule(id);
      setDeleteConfirmId(null);
      if (selectedModule?.id === id) setSelectedModule(null);
      onRefreshModules();
      setFeedback({ type: 'success', message: 'Module deleted successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Curriculum Modules</span>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {modules.length} Subjects
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Core syllabi, assigned lab experiments, and learning outcomes
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const Icon = getModuleIcon(mod.icon_name);
          return (
            <div
              key={mod.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center font-bold shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 block">
                        {mod.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(mod)}
                      className="p-1 rounded text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit Module"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(mod.id)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-800" />
                  <span>{mod.experiments_count || 0} Experiments</span>
                </span>

                <button
                  onClick={() => handleOpenDetail(mod.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">No curriculum modules matched your search.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg"
            >
              Add New Module
            </button>
          </div>
        )}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-600">{selectedModule.code}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-slate-600">{selectedModule.semester}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedModule.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Module Overview</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedModule.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-900" />
                    <span>Assigned Lab Experiments ({selectedModule.experiments.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      onOpenAddExperiment(selectedModule.id);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experiment</span>
                  </button>
                </div>

                {selectedModule.experiments.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {selectedModule.experiments.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => {
                          setSelectedModule(null);
                          onSelectExperiment(exp.id);
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-900">Exp #{exp.experiment_number}</span>
                            <span className="text-xs font-semibold text-slate-900">{exp.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{exp.short_description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No experiments assigned to this module yet.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Module Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingModule ? 'Edit Curriculum Module' : 'Add New Curriculum Module'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DS-304"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing & Big Data"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief syllabus outline and learning objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                >
                  {editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this module? All associated experiments will also be removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteModule(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Delete Module
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
