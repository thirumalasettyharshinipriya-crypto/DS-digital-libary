import React, { useState } from 'react';
import { Experiment, Module } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  FlaskConical,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ExternalLink,
  Github,
  Play,
  Copy,
  Check,
  Code2,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Video,
  ArrowUpDown,
  ListOrdered
} from 'lucide-react';

interface ExperimentsViewProps {
  experiments: Experiment[];
  modules: Module[];
  onRefreshExperiments: () => void;
  onOpenCodeEditorWithCode: (code: string, language: string) => void;
  selectedExpId?: number | null;
  onClearSelectedExpId?: () => void;
  initialAddModalOpen?: boolean;
  initialDefaultModuleId?: number;
  onCloseAddModal?: () => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  experiments,
  modules,
  onRefreshExperiments,
  onOpenCodeEditorWithCode,
  selectedExpId,
  onClearSelectedExpId,
  initialAddModalOpen = false,
  initialDefaultModuleId,
  onCloseAddModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'number' | 'newest'>('number');
  const [viewDetailModal, setViewDetailModal] = useState<Experiment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAddModalOpen);
  const [editingExp, setEditingExp] = useState<Experiment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // If selectedExpId was passed from dashboard
  React.useEffect(() => {
    if (selectedExpId) {
      const exp = experiments.find(e => e.id === selectedExpId);
      if (exp) {
        setViewDetailModal(exp);
      }
    }
  }, [selectedExpId, experiments]);

  // If initialAddModalOpen prop changes
  React.useEffect(() => {
    if (initialAddModalOpen) {
      handleOpenAdd(initialDefaultModuleId);
    }
  }, [initialAddModalOpen, initialDefaultModuleId]);

  // Form State
  const [formData, setFormData] = useState({
    experiment_number: '',
    module_id: modules[0]?.id || 1,
    title: '',
    short_description: '',
    long_description: '',
    aim: '',
    software_hardware_requirements: 'Software: Python 3.10+, Pandas, NumPy. Hardware: Standard Lab Workstation (8GB RAM)',
    procedure_steps: '1. Load dataset.\n2. Preprocess missing values.\n3. Implement model algorithm.\n4. Measure evaluation metrics.',
    source_code: '',
    programming_language: 'Python',
    expected_output: '',
    actual_output_notes: '',
    reference_links: '',
    github_url: '',
    video_url: ''
  });

  const handleOpenAdd = (defaultModId?: number) => {
    const nextNumber = experiments.length > 0 ? Math.max(...experiments.map(e => e.experiment_number)) + 1 : 1;
    setFormData({
      experiment_number: nextNumber.toString(),
      module_id: defaultModId || (modules[0]?.id || 1),
      title: '',
      short_description: '',
      long_description: '',
      aim: '',
      software_hardware_requirements: 'Software: Python 3.10+, Pandas, NumPy. Hardware: Standard Lab Workstation',
      procedure_steps: '1. Ingest input dataset into memory.\n2. Verify schema and clean anomalous observations.\n3. Execute algorithmic transformation pipeline.\n4. Log output parameters and calculate metrics.',
      source_code: `import numpy as np\n\n# DS Lab Experiment\nprint("Executing Experiment ${nextNumber}...")`,
      programming_language: 'Python',
      expected_output: 'Execution completed successfully.',
      actual_output_notes: 'Verified on workstation 12.',
      reference_links: 'https://docs.python.org/3/',
      github_url: '',
      video_url: ''
    });
    setEditingExp(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp: Experiment) => {
    setEditingExp(exp);
    setFormData({
      experiment_number: exp.experiment_number.toString(),
      module_id: exp.module_id,
      title: exp.title,
      short_description: exp.short_description,
      long_description: exp.long_description || '',
      aim: exp.aim,
      software_hardware_requirements: exp.software_hardware_requirements,
      procedure_steps: exp.procedure_steps,
      source_code: exp.source_code || '',
      programming_language: exp.programming_language || 'Python',
      expected_output: exp.expected_output || '',
      actual_output_notes: exp.actual_output_notes || '',
      reference_links: exp.reference_links || '',
      github_url: exp.github_url || '',
      video_url: exp.video_url || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expNum = parseInt(formData.experiment_number);
      if (isNaN(expNum) || expNum <= 0) {
        setFeedback({ type: 'error', message: 'Experiment number must be a valid positive integer.' });
        return;
      }

      // Check duplicates if creating
      if (!editingExp) {
        const existing = experiments.find(x => x.experiment_number === expNum);
        if (existing) {
          setFeedback({ type: 'error', message: `Experiment number ${expNum} already exists in the database.` });
          return;
        }
        await api.addExperiment({ ...formData, experiment_number: expNum, module_id: Number(formData.module_id) });
        setFeedback({ type: 'success', message: 'Experiment added successfully.' });
      } else {
        await api.updateExperiment(editingExp.id, {
          ...formData,
          experiment_number: expNum,
          module_id: Number(formData.module_id)
        });
        setFeedback({ type: 'success', message: 'Experiment updated successfully.' });
      }

      setIsAddModalOpen(false);
      if (onCloseAddModal) onCloseAddModal();
      onRefreshExperiments();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteExperiment(id);
      setDeleteConfirmId(null);
      if (viewDetailModal?.id === id) setViewDetailModal(null);
      onRefreshExperiments();
      setFeedback({ type: 'success', message: 'Experiment deleted successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter & Sort
  const filtered = experiments.filter(e => {
    const matchesModule = selectedModuleFilter === 'all' || e.module_id.toString() === selectedModuleFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.short_description.toLowerCase().includes(search.toLowerCase()) ||
      e.aim.toLowerCase().includes(search.toLowerCase()) ||
      e.experiment_number.toString() === search.trim();
    return matchesModule && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'number') return a.experiment_number - b.experiment_number;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Laboratory Experiments & Assignments</span>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {experiments.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Syllabus practicals, algorithms, test outputs, and reproducible source files
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Module Filter */}
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Modules</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.code} - {m.title}</option>
            ))}
          </select>

          {/* Sort Filter */}
          <button
            onClick={() => setSortBy(sortBy === 'number' ? 'newest' : 'number')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort: {sortBy === 'number' ? 'Exp #' : 'Newest'}</span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add Experiment</span>
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

      {/* Experiments List / Table Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sorted.map((exp) => (
            <div
              key={exp.id}
              className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-sky-400 flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">EXP</span>
                  <span className="text-sm font-bold font-mono tabular-nums leading-none">
                    {exp.experiment_number}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      onClick={() => setViewDetailModal(exp)}
                      className="text-sm font-bold text-slate-900 group-hover:text-blue-900 cursor-pointer transition-colors"
                    >
                      {exp.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {exp.module_title || 'Core Module'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {exp.programming_language}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                    {exp.short_description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span>Aim: <strong className="font-medium text-slate-700">{exp.aim.slice(0, 75)}...</strong></span>
                    {exp.github_url && (
                      <a
                        href={exp.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        <Github className="w-3 h-3" />
                        <span>Source Repo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onOpenCodeEditorWithCode(exp.source_code, exp.programming_language)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-950 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors flex items-center gap-1"
                  title="Run code in Code Editor"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-800" />
                  <span>Run</span>
                </button>
                <button
                  onClick={() => setViewDetailModal(exp)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  title="Edit Experiment"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(exp.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                  title="Delete Experiment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="py-12 text-center">
              <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">No experiments found.</p>
              <button
                onClick={() => handleOpenAdd()}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg"
              >
                Add Experiment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Experiment Detail Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900 text-sky-400 flex flex-col items-center justify-center font-mono font-bold">
                  <span className="text-[9px] text-slate-300 leading-none">EXP</span>
                  <span className="text-base leading-none">{viewDetailModal.experiment_number}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-900">{viewDetailModal.module_title}</span>
                    <span>·</span>
                    <span>Language: {viewDetailModal.programming_language}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{viewDetailModal.title}</h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewDetailModal(null);
                  if (onClearSelectedExpId) onClearSelectedExpId();
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Aim & Objective */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Aim of Experiment</h4>
                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed">
                  {viewDetailModal.aim}
                </div>
              </div>

              {/* Requirements & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Required Software & Hardware</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {viewDetailModal.software_hardware_requirements}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Detailed Overview</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {viewDetailModal.long_description || viewDetailModal.short_description}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Procedure & Steps</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                  {viewDetailModal.procedure_steps}
                </div>
              </div>

              {/* Source Code Section */}
              {viewDetailModal.source_code && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-blue-900" />
                      <span>Source Code ({viewDetailModal.programming_language})</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCodeToClipboard(viewDetailModal.source_code)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenCodeEditorWithCode(viewDetailModal.source_code, viewDetailModal.programming_language);
                          setViewDetailModal(null);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-950 bg-sky-100 border border-sky-300 rounded-md hover:bg-sky-200"
                      >
                        <Play className="w-3 h-3 text-blue-800" />
                        <span>Run in Editor</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-64">
                    <code>{viewDetailModal.source_code}</code>
                  </pre>
                </div>
              )}

              {/* Expected Output */}
              {viewDetailModal.expected_output && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Expected Terminal Output</h4>
                  <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{viewDetailModal.expected_output}</code>
                  </pre>
                </div>
              )}

              {/* Result Notes & References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewDetailModal.actual_output_notes && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Actual Result & Viva Notes</h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      {viewDetailModal.actual_output_notes}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">External Links & References</h4>
                  <div className="space-y-1.5">
                    {viewDetailModal.github_url && (
                      <a
                        href={viewDetailModal.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                      >
                        <Github className="w-4 h-4 text-slate-700" />
                        <span className="truncate flex-1">{viewDetailModal.github_url}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                    {viewDetailModal.reference_links && (
                      <a
                        href={viewDetailModal.reference_links}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                        <span className="truncate flex-1">{viewDetailModal.reference_links}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-600">Experiment ID: {viewDetailModal.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(viewDetailModal);
                    setViewDetailModal(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Edit Experiment
                </button>
                <button
                  onClick={() => {
                    setViewDetailModal(null);
                    if (onClearSelectedExpId) onClearSelectedExpId();
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Experiment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingExp ? `Edit Experiment #${editingExp.experiment_number}` : 'Add New Lab Experiment'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperiment} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment No *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.experiment_number}
                    onChange={(e) => setFormData({ ...formData, experiment_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Module *</label>
                  <select
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.code} - {m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                  <select
                    value={formData.programming_language}
                    onChange={(e) => setFormData({ ...formData, programming_language: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Python">Python</option>
                    <option value="SQL">SQL</option>
                    <option value="Java">Java</option>
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implementation of K-Nearest Neighbors Classifier"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Brief one-line summary of algorithmic objective..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aim *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="To design, formulate, and test..."
                  value={formData.aim}
                  onChange={(e) => setFormData({ ...formData, aim: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Procedure Steps *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.procedure_steps}
                  onChange={(e) => setFormData({ ...formData, procedure_steps: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Code</label>
                <textarea
                  rows={4}
                  placeholder="Paste Python / SQL code here..."
                  value={formData.source_code}
                  onChange={(e) => setFormData({ ...formData, source_code: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-900 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Output</label>
                <textarea
                  rows={2}
                  placeholder="Expected terminal output..."
                  value={formData.expected_output}
                  onChange={(e) => setFormData({ ...formData, expected_output: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Documentation Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.reference_links}
                    onChange={(e) => setFormData({ ...formData, reference_links: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                >
                  {editingExp ? 'Save Changes' : 'Create Experiment'}
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
              Are you sure you want to delete this experiment? This record and any attachments will be permanently removed.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
