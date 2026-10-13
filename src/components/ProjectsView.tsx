import React, { useState, useMemo } from 'react';
import { Project } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  FolderGit2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Github,
  ExternalLink,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Code2,
  Play,
  Activity,
  BarChart3,
  Database,
  UserCheck,
  Award,
  Layers,
  Copy,
  Check,
  Sliders,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Cpu,
  Brain,
  Download,
  Terminal,
  FileSpreadsheet,
  CheckCheck,
  Eye,
  FileCheck,
  Filter
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onRefreshProjects: () => void;
  selectedProjectId?: number | null;
  onClearSelectedProjectId?: () => void;
  initialAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  onOpenCodeEditorWithCode?: (code: string, language: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onRefreshProjects,
  selectedProjectId,
  onClearSelectedProjectId,
  initialAddModalOpen = false,
  onCloseAddModal,
  onOpenCodeEditorWithCode
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'accuracy' | 'title'>('newest');
  const [onlyWithReports, setOnlyWithReports] = useState(false);

  // Modals
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [viewDetailModal, setViewDetailModal] = useState<Project | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'overview' | 'predictor' | 'charts' | 'code' | 'dataset'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAddModalOpen);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Standalone Live Predictor Modal
  const [activePredictorProject, setActivePredictorProject] = useState<Project | null>(null);

  // Predictor Simulator States
  // Research Capstones
  const [ecgInputs, setEcgInputs] = useState({ heartRate: 72, prInterval: 160, qrsDuration: 88, stElevation: 0.02 });
  const [trafficInputs, setTrafficInputs] = useState({ volume: 1420, speed: 18.4, weather: 'Clear', rushHour: true });
  const [churnInputs, setChurnInputs] = useState({ tenure: 36, monthlyCharge: 65.5, supportTickets: 1, contract: 'Two-Year' });
  const [visionInputs, setVisionInputs] = useState({ age: 58, flairMean: 412.5, enhancementRatio: 2.84, edemaVolume: 34.2 });
  const [nlpInputs, setNlpInputs] = useState({ text: 'Paclitaxel therapy inhibits EGFR over-expression in advanced carcinoma patients.' });

  // Curriculum Lab Notebook Projects (2a, 2b / 3a-d / 4a-c)
  const [exp2Inputs, setExp2Inputs] = useState<{
    imputation: 'median' | 'mean' | 'mode' | 'drop';
    scaler: 'standard' | 'minmax' | 'robust';
    encoding: 'onehot' | 'label';
  }>({
    imputation: 'median',
    scaler: 'standard',
    encoding: 'onehot'
  });

  const [exp3Inputs, setExp3Inputs] = useState<{
    iqrMultiplier: number;
    zCutoff: number;
    targetCol: 'systolic_bp' | 'cholesterol_mgdl' | 'bmi' | 'blood_glucose';
  }>({
    iqrMultiplier: 1.5,
    zCutoff: 3.0,
    targetCol: 'cholesterol_mgdl'
  });

  const [exp4Inputs, setExp4Inputs] = useState<{
    modelChoice: 'knn' | 'tree' | 'logistic' | 'linear';
    trainSplit: number;
    studyHours: number;
    pastScore: number;
    attendance: number;
  }>({
    modelChoice: 'knn',
    trainSplit: 80,
    studyHours: 6.5,
    pastScore: 82.0,
    attendance: 92.0
  });

  const [inferenceRunning, setInferenceRunning] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<{
    label: string;
    confidence: number;
    latencyMs: number;
    badgeColor: string;
    description: string;
    features: Array<{ name: string; impact: number; positive: boolean }>;
    extraMetrics?: Record<string, string | number>;
  } | null>(null);

  // Open detail if passed from dashboard
  React.useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find((p) => p.id === selectedProjectId);
      if (proj) {
        setViewDetailModal(proj);
        setDetailActiveTab('overview');
      }
    }
  }, [selectedProjectId, projects]);

  // Sync initialAddModalOpen
  React.useEffect(() => {
    if (initialAddModalOpen) {
      handleOpenAdd();
    }
  }, [initialAddModalOpen]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    detailed_description: '',
    technologies_used: '',
    github_url: '',
    demo_url: '',
    cover_image_url: '',
    report_file_url: '',
    category: 'Machine Learning',
    stage: 'Published',
    accuracy: '96.5% Accuracy',
    mentor_name: 'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
    team_members: 'T. Harshini Priya (24102A030128)',
    source_code: '',
    dataset_sample: '',
    chart_type: 'distribution'
  });

  // Dynamic technology frequency and sorted tech stacks
  const techStats = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      if (!p.technologies_used) return;
      p.technologies_used.split(',').forEach((raw) => {
        const clean = raw.trim();
        if (clean) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);

  const allTechs = useMemo(() => techStats.map(([tech]) => tech), [techStats]);

  // Categories list
  const categories = [
    'All Categories',
    'Lab Curriculum Notebooks',
    'Data Science & Analytics',
    'Machine Learning',
    'Deep Learning & Graphs',
    'Computer Vision',
    'Natural Language Processing'
  ];

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      short_description: '',
      detailed_description: '',
      technologies_used: 'Python, Pandas, NumPy, Scikit-Learn',
      github_url: 'https://github.com/harshinipriya-ds/',
      demo_url: '',
      cover_image_url: '',
      report_file_url: '',
      category: 'Data Science & Analytics',
      stage: 'Published',
      accuracy: '98.5% Accuracy',
      mentor_name: 'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
      team_members: 'T. Harshini Priya (24102A030128)',
      source_code: `# Data Science Analytical Pipeline\nimport numpy as np\nimport pandas as pd\n\nprint("Data Science model compiled successfully.")`,
      dataset_sample: `sample_id,feature_1,feature_2,feature_3,target_class\nSMP_01,0.84,14.2,120,Normal\nSMP_02,1.25,28.6,180,Anomalous`,
      chart_type: 'distribution'
    });
    setEditingProject(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      short_description: p.short_description,
      detailed_description: p.detailed_description,
      technologies_used: p.technologies_used,
      github_url: p.github_url || '',
      demo_url: p.demo_url || '',
      cover_image_url: p.cover_image_url || '',
      report_file_url: p.report_file_url || '',
      category: p.category || 'Data Science & Analytics',
      stage: p.stage || 'Published',
      accuracy: p.accuracy || '95.0% Accuracy',
      mentor_name: p.mentor_name || 'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
      team_members: p.team_members || 'T. Harshini Priya (24102A030128)',
      source_code: p.source_code || '',
      dataset_sample: p.dataset_sample || '',
      chart_type: p.chart_type || 'distribution'
    });
    setIsAddModalOpen(true);
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingReport(true);
      const res = await api.uploadFile(file, 'project_report');
      setFormData((prev) => ({ ...prev, report_file_url: res.file_url }));
      setFeedback({ type: 'success', message: 'Report / Notebook attached successfully.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, formData);
        setFeedback({ type: 'success', message: 'Project details and code successfully updated.' });
      } else {
        await api.addProject(formData);
        setFeedback({ type: 'success', message: 'New Data Science project published to portal repository.' });
      }
      setIsAddModalOpen(false);
      if (onCloseAddModal) onCloseAddModal();
      onRefreshProjects();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProject(id);
      setDeleteConfirmId(null);
      if (viewDetailModal?.id === id) setViewDetailModal(null);
      if (activePredictorProject?.id === id) setActivePredictorProject(null);
      onRefreshProjects();
      setFeedback({ type: 'success', message: 'Project removed from repository.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper to determine notebook download URL
  const getNotebookDownloadUrl = (proj: Project): { url: string; filename: string } | null => {
    const title = proj.title.toLowerCase();
    if (proj.id === 6 || title.includes('exp-2') || title.includes('2a, 2b')) {
      return { url: '/uploads/ds(2a,b).ipynb', filename: 'ds(2a,b).ipynb' };
    }
    if (proj.id === 7 || title.includes('exp-3') || title.includes('3a, 3b')) {
      return { url: '/uploads/ds(3a,b,c,d).ipynb', filename: 'ds(3a,b,c,d).ipynb' };
    }
    if (proj.id === 8 || title.includes('exp-4') || title.includes('4a, 4b')) {
      return { url: '/uploads/ds(4a,b,c).ipynb', filename: 'ds(4a,b,c).ipynb' };
    }
    if (proj.report_file_url?.toLowerCase().endsWith('.ipynb')) {
      return { url: proj.report_file_url, filename: `${proj.title.replace(/\s+/g, '_')}.ipynb` };
    }
    if (proj.demo_url?.toLowerCase().endsWith('.ipynb')) {
      return { url: proj.demo_url, filename: `${proj.title.replace(/\s+/g, '_')}.ipynb` };
    }
    return null;
  };

  // Helper to get comprehensive Report Download & associated file info
  const getProjectReportInfo = (proj: Project): {
    hasReport: boolean;
    url: string;
    filename: string;
    type: 'ipynb' | 'pdf' | 'csv' | 'file';
    label: string;
  } => {
    const nb = getNotebookDownloadUrl(proj);
    if (nb) {
      return {
        hasReport: true,
        url: nb.url,
        filename: nb.filename,
        type: 'ipynb',
        label: 'Jupyter Notebook (.ipynb)'
      };
    }
    if (proj.report_file_url && proj.report_file_url.trim().length > 0) {
      const url = proj.report_file_url.trim();
      const lower = url.toLowerCase();
      let type: 'ipynb' | 'pdf' | 'csv' | 'file' = 'file';
      if (lower.endsWith('.pdf')) type = 'pdf';
      else if (lower.endsWith('.ipynb')) type = 'ipynb';
      else if (lower.endsWith('.csv')) type = 'csv';

      let filename = url.split('/').pop() || `${proj.title.replace(/[^a-zA-Z0-9]/g, '_')}_Report.${type}`;
      if (!filename.includes('.')) filename += `.${type}`;
      return {
        hasReport: true,
        url,
        filename,
        type,
        label: type === 'pdf' ? 'Technical Report (PDF)' : type === 'ipynb' ? 'Jupyter Notebook' : 'Attached Report'
      };
    }
    if (proj.dataset_sample && proj.dataset_sample.trim().length > 0) {
      return {
        hasReport: true,
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(proj.dataset_sample)}`,
        filename: `${proj.title.replace(/[^a-zA-Z0-9]/g, '_')}_Dataset.csv`,
        type: 'csv',
        label: 'Benchmark Dataset (CSV)'
      };
    }
    return {
      hasReport: false,
      url: '',
      filename: '',
      type: 'file',
      label: 'No Report File'
    };
  };

  // Inference Execution Simulation
  const runLiveInference = (proj: Project) => {
    setInferenceRunning(true);
    setTimeout(() => {
      const cat = (proj.category || '').toLowerCase();
      const title = proj.title.toLowerCase();

      // 1. DS Lab Experiment 2 (2a, 2b) - Data Ingestion & Preprocessing
      if (proj.id === 6 || title.includes('exp-2') || title.includes('2a, 2b') || title.includes('ingestion')) {
        const imp = exp2Inputs.imputation;
        const scaler = exp2Inputs.scaler;
        const enc = exp2Inputs.encoding;
        const scalerName = scaler === 'standard' ? 'StandardScaler (Z-Score)' : scaler === 'minmax' ? 'MinMaxScaler ([0, 1])' : 'RobustScaler';
        
        setInferenceResult({
          label: `Cleaned & Transformed Feature Matrix (${scalerName})`,
          confidence: 100.0,
          latencyMs: 12,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          description: `Pipeline executed: 0 missing values remain after ${imp} imputation. Normalization applied via ${scalerName}. Categorical features encoded into ${enc === 'onehot' ? '3 binary one-hot indicators' : 'integer rank ordinal labels'}.`,
          features: [
            { name: `Null Imputation (${imp})`, impact: 0.45, positive: true },
            { name: `Feature Scaling (${scaler})`, impact: 0.35, positive: true },
            { name: `Encoding (${enc})`, impact: 0.20, positive: true }
          ],
          extraMetrics: {
            'Null Values': '0 / 1000 records',
            'Mean Vector': '0.00 ± 0.01',
            'Std Deviation': '1.00',
            'Columns Out': enc === 'onehot' ? '8 columns' : '5 columns'
          }
        });
      }
      // 2. DS Lab Experiment 3 (3a, 3b, 3c, 3d) - Statistical EDA, Outlier Detection
      else if (proj.id === 7 || title.includes('exp-3') || title.includes('3a, 3b') || title.includes('outlier') || title.includes('eda')) {
        const mult = exp3Inputs.iqrMultiplier;
        const col = exp3Inputs.targetCol;
        const outliersFound = mult <= 1.5 ? 3 : mult <= 2.0 ? 1 : 0;
        
        setInferenceResult({
          label: `Statistical EDA & Anomaly Audit: ${outliersFound} Outliers Flagged`,
          confidence: 99.1,
          latencyMs: 15,
          badgeColor: outliersFound > 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          description: `Evaluated ${col} across 200 clinical patient samples with ${mult}× IQR fence filtering. Strong positive Pearson correlation verified (r = +0.772, p < 0.001) between systolic BP and serum cholesterol.`,
          features: [
            { name: 'Pearson Correlation (r = +0.772)', impact: 0.52, positive: true },
            { name: `Tukey Fence Cutoff (${mult}× IQR)`, impact: -0.31, positive: false },
            { name: 'Normality Kurtosis Check', impact: 0.17, positive: true }
          ],
          extraMetrics: {
            'Correlation (r)': '+0.772',
            'p-value': '< 1e-35',
            'Outliers Isolated': `${outliersFound} points`,
            'Clean Sample Size': `${200 - outliersFound} records`
          }
        });
      }
      // 3. DS Lab Experiment 4 (4a, 4b, 4c) - Supervised ML & Benchmarking
      else if (proj.id === 8 || title.includes('exp-4') || title.includes('4a, 4b') || title.includes('benchmarking') || title.includes('knn')) {
        const hours = exp4Inputs.studyHours;
        const past = exp4Inputs.pastScore;
        const att = exp4Inputs.attendance;
        const model = exp4Inputs.modelChoice;

        const compositeScore = (hours * 4.82 + past * 0.65 + att * 0.25).toFixed(1);
        const isDistinction = parseFloat(compositeScore) >= 75;
        const modelAccuracy = model === 'knn' ? '95.00%' : model === 'tree' ? '93.33%' : model === 'logistic' ? '91.67%' : 'R² = 0.9124';

        setInferenceResult({
          label: isDistinction ? `Predicted: Class 1 (Distinction / Pass) — Score: ${compositeScore}` : `Predicted: Class 0 (Average / At-Risk) — Score: ${compositeScore}`,
          confidence: model === 'knn' ? 95.0 : model === 'tree' ? 93.3 : 91.7,
          latencyMs: 9,
          badgeColor: isDistinction ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300',
          description: `Evaluated test instance [Hours: ${hours}, Grade: ${past}, Attendance: ${att}%] on ${model.toUpperCase()}. Model Test Split Accuracy: ${modelAccuracy}.`,
          features: [
            { name: 'Study Hours (Beta: 4.82)', impact: 0.54, positive: true },
            { name: 'Past Score History', impact: 0.32, positive: true },
            { name: 'Class Attendance Ratio', impact: 0.14, positive: true }
          ],
          extraMetrics: {
            'Selected Model': model.toUpperCase(),
            'Test Accuracy': modelAccuracy,
            'ROC-AUC Score': '0.9577',
            'Predicted Score': `${compositeScore}/100`
          }
        });
      }
      // 4. Autonomous ECG Cardiac Arrhythmia Classifier
      else if (title.includes('ecg')) {
        const hr = ecgInputs.heartRate;
        const qrs = ecgInputs.qrsDuration;
        const st = ecgInputs.stElevation;

        if (st > 0.15 || qrs > 135) {
          setInferenceResult({
            label: 'Ventricular Tachycardia (Pathological Arrhythmia)',
            confidence: 97.4,
            latencyMs: 14,
            badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
            description: 'Significant ST elevation and widened QRS complex (>135ms) indicates ventricular rhythm disorder.',
            features: [
              { name: 'ST-Segment Elevation', impact: 0.48, positive: true },
              { name: 'QRS Complex Duration', impact: 0.32, positive: true },
              { name: 'PR-Interval Variance', impact: -0.12, positive: false }
            ]
          });
        } else if (hr < 60) {
          setInferenceResult({
            label: 'Sinus Bradycardia (Low Heart Rate)',
            confidence: 96.1,
            latencyMs: 12,
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            description: 'Normal morphology with sub-60 BPM resting rhythm detected.',
            features: [
              { name: 'Resting Heart Rate', impact: 0.62, positive: true },
              { name: 'QRS Morphology', impact: -0.18, positive: false }
            ]
          });
        } else {
          setInferenceResult({
            label: 'Normal Sinus Rhythm (Healthy)',
            confidence: 98.8,
            latencyMs: 11,
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            description: 'Regular rhythm, standard PR interval, and intact P-waves confirm normal cardiac conduction.',
            features: [
              { name: 'Normal QRS Complex', impact: 0.45, positive: true },
              { name: 'Baseline ST Segment', impact: 0.38, positive: true },
              { name: 'Heart Rate Consistency', impact: 0.22, positive: true }
            ]
          });
        }
      }
      // 5. Intelligent Traffic Congestion Predictor
      else if (title.includes('traffic') || cat.includes('graph')) {
        const vol = trafficInputs.volume;
        const spd = trafficInputs.speed;
        if (vol > 1600 || spd < 15) {
          setInferenceResult({
            label: 'Severe Congestion / Bottleneck (Gridlock)',
            confidence: 96.8,
            latencyMs: 24,
            badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
            description: 'Volume-to-capacity ratio exceeded 0.92 with average transit speed below 15 km/h.',
            features: [
              { name: 'High Inbound Volume', impact: 0.54, positive: true },
              { name: 'Low Segment Speed', impact: 0.41, positive: true },
              { name: 'Upstream Node Pressure', impact: 0.22, positive: true }
            ]
          });
        } else {
          setInferenceResult({
            label: 'Free-Flow Transit (Optimal)',
            confidence: 94.5,
            latencyMs: 19,
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            description: 'Segment velocity within designated speed limits with minimal queue buildup.',
            features: [
              { name: 'Moderate Vehicle Volume', impact: 0.49, positive: true },
              { name: 'Steady Transit Speed', impact: 0.35, positive: true }
            ]
          });
        }
      }
      // 6. Retail Customer Churn
      else if (title.includes('churn')) {
        const tickets = churnInputs.supportTickets;
        const contract = churnInputs.contract;
        if (tickets >= 4 || contract === 'Month-to-Month') {
          setInferenceResult({
            label: 'High Churn Probability (Risk Score: 87.2%)',
            confidence: 89.6,
            latencyMs: 8,
            badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
            description: 'Month-to-month billing and elevated support ticket volume predict customer attrition.',
            features: [
              { name: 'Contract Type (Month-to-Month)', impact: 0.44, positive: true },
              { name: 'Support Tickets > 3', impact: 0.38, positive: true },
              { name: 'Low Account Tenure', impact: 0.26, positive: true }
            ]
          });
        } else {
          setInferenceResult({
            label: 'Customer Retained / Low Churn (Risk: 12.4%)',
            confidence: 95.3,
            latencyMs: 7,
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            description: 'Long-term tenure and stable billing contract signal strong brand loyalty.',
            features: [
              { name: 'Two-Year Contract Commitment', impact: 0.52, positive: true },
              { name: 'Low Ticket Frequency', impact: 0.34, positive: true }
            ]
          });
        }
      }
      // 7. Brain MRI Glioma Segmentation
      else if (title.includes('mri') || cat.includes('vision') || title.includes('glioma')) {
        const ratio = visionInputs.enhancementRatio;
        setInferenceResult({
          label: ratio > 2.0 ? 'High-Grade Glioblastoma Detected' : 'Low-Grade Astrocytoma Detected',
          confidence: ratio > 2.0 ? 93.4 : 91.8,
          latencyMs: 38,
          badgeColor: ratio > 2.0 ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-blue-100 text-blue-900 border-blue-300',
          description: `Volumetric 3D scan shows contrast enhancement ratio of ${ratio} with segmented edema mass.`,
          features: [
            { name: 'T1ce Enhancement Ratio', impact: 0.58, positive: true },
            { name: 'FLAIR Hyperintensity Volume', impact: 0.39, positive: true },
            { name: 'Subcortical Edema Margin', impact: 0.25, positive: true }
          ]
        });
      }
      // 8. Biomedical NER
      else {
        setInferenceResult({
          label: 'Biomedical Named Entities Extracted (3 spans)',
          confidence: 92.5,
          latencyMs: 16,
          badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
          description: 'Identified [Paclitaxel] as B-CHEMICAL, [EGFR] as B-GENE, and [carcinoma] as B-DISEASE.',
          features: [
            { name: 'Domain BioBERT Attention', impact: 0.61, positive: true },
            { name: 'CRF Transition Score', impact: 0.42, positive: true }
          ]
        });
      }
      setInferenceRunning(false);
    }, 400);
  };

  // Filtered and Sorted Projects
  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        let matchesCat = true;
        if (categoryFilter === 'Lab Curriculum Notebooks') {
          matchesCat =
            p.title.toLowerCase().includes('exp-') ||
            p.title.toLowerCase().includes('lab') ||
            p.title.toLowerCase().includes('ds(') ||
            Boolean(getNotebookDownloadUrl(p));
        } else if (categoryFilter !== 'all' && categoryFilter !== 'All Categories') {
          matchesCat = p.category.toLowerCase() === categoryFilter.toLowerCase();
        }

        const matchesTech =
          techFilter === 'all' ||
          p.technologies_used.toLowerCase().includes(techFilter.toLowerCase());

        const matchesReport = !onlyWithReports || getProjectReportInfo(p).hasReport;

        const matchesSearch =
          !search.trim() ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.short_description.toLowerCase().includes(search.toLowerCase()) ||
          p.technologies_used.toLowerCase().includes(search.toLowerCase()) ||
          (p.mentor_name && p.mentor_name.toLowerCase().includes(search.toLowerCase())) ||
          (p.team_members && p.team_members.toLowerCase().includes(search.toLowerCase()));

        return matchesCat && matchesTech && matchesReport && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'accuracy') {
          const accA = parseFloat(a.accuracy?.replace(/[^0-9.]/g, '') || '0');
          const accB = parseFloat(b.accuracy?.replace(/[^0-9.]/g, '') || '0');
          return accB - accA;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [projects, categoryFilter, techFilter, search, sortBy, onlyWithReports]);

  // Overall Metrics KPI
  const statsSummary = useMemo(() => {
    const total = projects.length;
    const notebooks = projects.filter((p) => getNotebookDownloadUrl(p)).length;
    const withDemos = projects.filter((p) => p.demo_url || p.source_code).length;
    const withReports = projects.filter((p) => getProjectReportInfo(p).hasReport).length;
    return { total, notebooks, withDemos, withReports };
  }, [projects]);

  return (
    <div className="space-y-6">
      
      {/* Header and KPI Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-sky-400 flex items-center justify-center font-bold shadow-2xs">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Student Projects & Research Showcase
              </h1>
              <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {projects.length} Total Repositories
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Curated repository of academic student projects, research capstones, and university laboratory notebook implementations (<code className="text-blue-900 font-semibold">ds(2a,b)</code>, <code className="text-blue-900 font-semibold">ds(3a,b,c,d)</code>, <code className="text-blue-900 font-semibold">ds(4a,b,c)</code>) with interactive model testing, downloadable Jupyter notebooks, and verified datasets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg shadow-xs hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Project</span>
            </button>
          </div>
        </div>

        {/* KPI Mini-Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
              <Layers className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-slate-900">{statsSummary.total}</div>
              <div className="text-[11px] text-slate-500 font-medium">Published Projects</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-200">
              <BookOpen className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-slate-900">{statsSummary.notebooks} Notebooks</div>
              <div className="text-[11px] text-slate-500 font-medium">Lab Notebook Projects</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-slate-900">{statsSummary.withDemos} Interactive</div>
              <div className="text-[11px] text-slate-500 font-medium">Runnable Test Demos</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center border border-indigo-100">
              <Database className="w-4 h-4 text-indigo-700" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-slate-900">{statsSummary.withReports} Attached</div>
              <div className="text-[11px] text-slate-500 font-medium">Datasets & Reports</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title, mentor, tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters and Sorters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Report indicator toggle filter */}
            <button
              onClick={() => setOnlyWithReports(!onlyWithReports)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                onlyWithReports
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
              }`}
              title={onlyWithReports ? 'Click to show all projects' : 'Filter projects with downloadable report files'}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>With Reports ({statsSummary.withReports})</span>
            </button>

            {/* Tech filter dropdown */}
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Tech Stacks ({projects.length})</option>
              {techStats.map(([tech, count]) => (
                <option key={tech} value={tech}>
                  {tech} ({count})
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="accuracy">Sort: Benchmark Score</option>
                <option value="title">Sort: Project Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Technology Chips Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0 uppercase tracking-wider pr-1">
            <Filter className="w-3 h-3 text-blue-900" />
            <span>Tech:</span>
          </div>

          <button
            onClick={() => setTechFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
              techFilter === 'all'
                ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>All Technologies</span>
            <span
              className={`text-[10px] font-mono px-1 rounded ${
                techFilter === 'all' ? 'bg-blue-800 text-sky-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {projects.length}
            </span>
          </button>

          {techStats.map(([tech, count]) => {
            const isSelected = techFilter.toLowerCase() === tech.toLowerCase();
            return (
              <button
                key={tech}
                onClick={() => setTechFilter(isSelected ? 'all' : tech)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white font-semibold shadow-2xs ring-2 ring-blue-300/40'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={`Filter projects using ${tech}`}
              >
                <span>{tech}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-blue-800 text-sky-200 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
          {categories.map((cat) => {
            const isSelected =
              categoryFilter === cat || (cat === 'All Categories' && categoryFilter === 'all');
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === 'All Categories' ? 'all' : cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'Lab Curriculum Notebooks' && <BookOpen className="w-3 h-3 text-amber-300" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Tag Bar */}
        {(techFilter !== 'all' || onlyWithReports || (categoryFilter !== 'all' && categoryFilter !== 'All Categories') || search) && (
          <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap text-slate-600">
              <span className="font-medium text-slate-500">Active Filters ({filtered.length} found):</span>
              {techFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded text-[11px] border border-blue-200">
                  Tech: {techFilter}
                  <button onClick={() => setTechFilter('all')} className="hover:text-blue-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onlyWithReports && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  Reports Only
                  <button onClick={() => setOnlyWithReports(false)} className="hover:text-emerald-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && categoryFilter !== 'All Categories' && (
                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 font-semibold px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')} className="hover:text-indigo-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                  "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-slate-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setTechFilter('all');
                setCategoryFilter('all');
                setOnlyWithReports(false);
                setSearch('');
              }}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline shrink-0 ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => {
          const notebookInfo = getNotebookDownloadUrl(proj);
          const reportInfo = getProjectReportInfo(proj);
          const isLabNotebook = Boolean(notebookInfo);

          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-slate-300"
            >
              {/* Card Banner / Stage Badge */}
              <div
                className={`p-4 text-white relative ${
                  isLabNotebook
                    ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950'
                    : 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {proj.category || 'Data Science'}
                    </span>
                    {isLabNotebook && (
                      <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-950" />
                        <span>Curriculum Notebook</span>
                      </span>
                    )}
                    {/* Report Download Ready Indicator in Header */}
                    {reportInfo.hasReport && (
                      <span
                        className="text-[10px] font-mono font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/35 px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs"
                        title={`Associated ${reportInfo.label} available: ${reportInfo.filename}`}
                      >
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span>Report Ready</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1 rounded text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-sky-400/20 text-sky-300 flex items-center justify-center font-bold">
                      <FolderGit2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono text-slate-300">ID #{proj.id}</span>
                  </div>

                  {proj.accuracy && (
                    <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>{proj.accuracy}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setQuickViewProject(proj)}
                    className="text-sm font-bold text-slate-900 group-hover:text-blue-900 cursor-pointer transition-colors leading-snug mb-1.5"
                    title="Click for Quick View details"
                  >
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {proj.short_description}
                  </p>

                  {/* Faculty Mentor & Author Tag */}
                  <div className="mb-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                    <span className="truncate">Guide: {proj.mentor_name || 'Dr. K. V. Ramanathan'}</span>
                  </div>

                  {/* Tech Chips with Dynamic Filter trigger */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.technologies_used.split(',').slice(0, 4).map((tech, idx) => {
                      const clean = tech.trim();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTechFilter(clean);
                          }}
                          className="text-[10px] font-mono text-slate-700 bg-slate-100 hover:bg-blue-100 hover:text-blue-900 px-1.5 py-0.5 rounded border border-slate-200/60 transition-colors"
                          title={`Filter projects by ${clean}`}
                        >
                          {clean}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons & Links */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* GitHub Link */}
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="GitHub Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}

                      {/* Report Download Indicator / Action */}
                      {reportInfo.hasReport ? (
                        <a
                          href={reportInfo.url}
                          download={reportInfo.filename}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-300 transition-colors shadow-2xs group/rep"
                          title={`Download associated ${reportInfo.label}: ${reportInfo.filename}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Report</span>
                          <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-emerald-200/80 text-emerald-900 rounded font-semibold">
                            {reportInfo.type}
                          </span>
                          <Download className="w-3 h-3 text-emerald-600 group-hover/rep:translate-y-0.5 transition-transform" />
                        </a>
                      ) : (
                        <span
                          className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-400 bg-slate-50 rounded-md border border-slate-200/60 cursor-not-allowed"
                          title="No associated report file currently attached"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>No Report</span>
                        </span>
                      )}

                      {/* Open in Editor button */}
                      {onOpenCodeEditorWithCode && proj.source_code && (
                        <button
                          onClick={() => onOpenCodeEditorWithCode(proj.source_code || '', 'python')}
                          className="p-1.5 text-blue-800 hover:text-blue-950 hover:bg-blue-50 rounded-md transition-colors"
                          title="Open Code in Interactive Playground"
                        >
                          <Code2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Test Model Playground */}
                      <button
                        onClick={() => {
                          setActivePredictorProject(proj);
                          setInferenceResult(null);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                        title="Run Interactive Test"
                      >
                        <Play className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                        <span>Test Demo</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick View Modal Trigger */}
                      <button
                        onClick={() => setQuickViewProject(proj)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/80 shadow-2xs flex items-center gap-1"
                        title="Quick View Project Summary"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span className="hidden sm:inline">Quick View</span>
                      </button>

                      {/* Full Details Modal Trigger */}
                      <button
                        onClick={() => {
                          setViewDetailModal(proj);
                          setDetailActiveTab('overview');
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Open Full Detailed Analysis"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-200 p-8 space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No matching projects found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your technology search or category filters, or upload a new data science project.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg shadow-xs hover:bg-blue-800"
            >
              Upload Project
            </button>
          </div>
        )}
      </div>

      {/* Dedicated 'Quick View' Modal for Rapid Project Inspection */}
      {quickViewProject && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setQuickViewProject(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick View Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 text-white flex items-start justify-between">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    {quickViewProject.category || 'Data Science'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded">
                    {quickViewProject.stage || 'Published'}
                  </span>
                  {quickViewProject.accuracy && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>{quickViewProject.accuracy}</span>
                    </span>
                  )}
                  {getProjectReportInfo(quickViewProject).hasReport && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-300" />
                      <span>Report Ready</span>
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {quickViewProject.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Guide: {quickViewProject.mentor_name || 'Dr. K. V. Ramanathan'}</span>
                  </span>
                  {quickViewProject.team_members && (
                    <span className="text-slate-400 truncate max-w-xs">
                      Author: {quickViewProject.team_members}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setQuickViewProject(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Close Quick View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick View Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Report Download Indicator Banner */}
              {(() => {
                const report = getProjectReportInfo(quickViewProject);
                if (report.hasReport) {
                  return (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                          <FileText className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-950">
                              Associated Project Report Available
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                              {report.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-mono truncate">
                            {report.filename} • Verified Academic Documentation
                          </p>
                        </div>
                      </div>

                      <a
                        href={report.url}
                        download={report.filename}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Report</span>
                      </a>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>No external technical report or notebook file currently attached.</span>
                      </div>
                      <button
                        onClick={() => {
                          const p = quickViewProject;
                          setQuickViewProject(null);
                          handleOpenEdit(p);
                        }}
                        className="text-xs text-blue-900 font-semibold hover:underline shrink-0"
                      >
                        Attach File via Edit
                      </button>
                    </div>
                  );
                }
              })()}

              {/* Abstract & Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                  <span>Abstract & Objectives</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border-l-2 border-blue-900">
                  {quickViewProject.short_description}
                </p>
                {quickViewProject.detailed_description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {quickViewProject.detailed_description}
                  </p>
                )}
              </div>

              {/* Technologies Used with Dynamic Filter Trigger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-800" />
                    <span>Technologies Used</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Click any tech to filter projects view</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickViewProject.technologies_used.split(',').map((tech, idx) => {
                    const clean = tech.trim();
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setTechFilter(clean);
                          setQuickViewProject(null);
                        }}
                        className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 border border-slate-200 transition-colors flex items-center gap-1 group"
                        title={`Filter all projects by ${clean}`}
                      >
                        <span>{clean}</span>
                        <Filter className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-800" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Key Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Evaluation Metric</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                    {quickViewProject.accuracy || 'Verified'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Lifecycle Stage</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {quickViewProject.stage || 'Published'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Report File</div>
                  <div className="text-xs font-bold text-emerald-900 mt-0.5 flex items-center gap-1">
                    {getProjectReportInfo(quickViewProject).hasReport ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Ready</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">None</span>
                    )}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Interactive Demo</div>
                  <div className="text-xs font-bold text-blue-900 mt-0.5 flex items-center gap-1">
                    <Play className="w-3 h-3 text-blue-700 fill-blue-700" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Dataset sample snippet if present */}
              {quickViewProject.dataset_sample && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Dataset Head Preview</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Sample Records</span>
                  </div>
                  <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-lg overflow-x-auto max-h-24">
                    <pre>{quickViewProject.dataset_sample.split('\n').slice(0, 4).join('\n')}</pre>
                  </div>
                </div>
              )}

            </div>

            {/* Quick View Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {quickViewProject.github_url && (
                  <a
                    href={quickViewProject.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {onOpenCodeEditorWithCode && quickViewProject.source_code && (
                  <button
                    onClick={() => {
                      onOpenCodeEditorWithCode(quickViewProject.source_code || '', 'python');
                      setQuickViewProject(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Playground</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const p = quickViewProject;
                    setQuickViewProject(null);
                    setActivePredictorProject(p);
                    setInferenceResult(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800" />
                  <span>Test Demo</span>
                </button>

                <button
                  onClick={() => {
                    const p = quickViewProject;
                    setQuickViewProject(null);
                    setViewDetailModal(p);
                    setDetailActiveTab('overview');
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  <span>Full Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Tabbed Project Detail Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-sky-400 flex items-center justify-center font-bold">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {viewDetailModal.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono text-blue-900 font-semibold">{viewDetailModal.category}</span>
                    <span>·</span>
                    <span>Status: <strong className="text-emerald-700 font-semibold">{viewDetailModal.stage || 'Published'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Report / Notebook if available */}
                {(() => {
                  const rep = getProjectReportInfo(viewDetailModal);
                  if (rep.hasReport) {
                    return (
                      <a
                        href={rep.url}
                        download={rep.filename}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
                        title={`Download ${rep.label} (${rep.filename})`}
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Download {rep.filename}</span>
                      </a>
                    );
                  }
                  return null;
                })()}

                {/* Open in Editor */}
                {onOpenCodeEditorWithCode && viewDetailModal.source_code && (
                  <button
                    onClick={() => {
                      onOpenCodeEditorWithCode(viewDetailModal.source_code || '', 'python');
                      setViewDetailModal(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>Open in Playground</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setViewDetailModal(null);
                    if (onClearSelectedProjectId) onClearSelectedProjectId();
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDetailActiveTab('overview')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'overview'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Overview & Architecture</span>
              </button>

              <button
                onClick={() => {
                  setDetailActiveTab('predictor');
                  setInferenceResult(null);
                }}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'predictor'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-4 h-4 text-emerald-600" />
                <span>Live Test & Playground</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('charts')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'charts'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Metrics & Benchmarks</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('code')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'code'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-4 h-4 text-amber-600" />
                <span>Source Code ({viewDetailModal.source_code ? 'Python' : 'None'})</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('dataset')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  detailActiveTab === 'dataset'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4 text-sky-600" />
                <span>Dataset & CSV Sample</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {detailActiveTab === 'overview' && (
                <div className="space-y-6">
                  {/* Academic Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Faculty Mentor</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{viewDetailModal.mentor_name || 'Dr. K. V. Ramanathan'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Student Author</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{viewDetailModal.team_members || 'T. Harshini Priya (24102A030128)'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Development Stage</span>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">{viewDetailModal.stage || 'Published'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Evaluation Benchmark</span>
                      <p className="text-xs font-bold text-blue-900 font-mono mt-0.5">{viewDetailModal.accuracy || '98.4%'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Executive Abstract</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                      {viewDetailModal.short_description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Detailed Architecture & Methodology</h4>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                      {viewDetailModal.detailed_description}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Technologies & Tooling</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewDetailModal.technologies_used.split(',').map((tech, idx) => (
                        <span key={idx} className="text-xs font-mono font-medium text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {viewDetailModal.github_url && (
                      <a
                        href={viewDetailModal.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-900 transition-colors"
                      >
                        <Github className="w-4 h-4 text-slate-700" />
                        <span className="truncate flex-1">View GitHub Code</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}

                    {(() => {
                      const rep = getProjectReportInfo(viewDetailModal);
                      if (rep.hasReport) {
                        return (
                          <a
                            href={rep.url}
                            download={rep.filename}
                            className="flex items-center gap-2 p-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-950 transition-colors shadow-2xs"
                            title={`Download ${rep.label}: ${rep.filename}`}
                          >
                            <Download className="w-4 h-4 text-emerald-700" />
                            <span className="truncate flex-1">Download Report ({rep.filename})</span>
                          </a>
                        );
                      }
                      return (
                        viewDetailModal.demo_url && (
                          <a
                            href={viewDetailModal.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-blue-900 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            <span className="truncate flex-1">Open Live Deployment</span>
                          </a>
                        )
                      );
                    })()}

                    {viewDetailModal.demo_url && getProjectReportInfo(viewDetailModal).hasReport && (
                      <a
                        href={viewDetailModal.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-blue-900 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                        <span className="truncate flex-1">Live Demo / Deployment</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE MODEL PREDICTOR */}
              {detailActiveTab === 'predictor' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900">
                    <strong>Interactive In-App Inference Engine:</strong> Adjust the parameters below and run live execution. Results simulate model inference directly against trained model algorithms and statistical distributions.
                  </div>

                  {/* Parameter Controls based on project type */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-900" />
                      <span>Input Evaluation Parameters</span>
                    </h4>

                    {/* Experiment 2 (2a, 2b): Ingestion & Preprocessing */}
                    {(viewDetailModal.id === 6 || viewDetailModal.title.toLowerCase().includes('exp-2')) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Missing Value Strategy (2a)</label>
                          <select
                            value={exp2Inputs.imputation}
                            onChange={(e) => setExp2Inputs({ ...exp2Inputs, imputation: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="median">Median Imputation (Skewed Features)</option>
                            <option value="mean">Mean Imputation (Normal Distribution)</option>
                            <option value="mode">Mode Imputation (Categorical Values)</option>
                            <option value="drop">Drop Rows with Null Values</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Normalization (2b)</label>
                          <select
                            value={exp2Inputs.scaler}
                            onChange={(e) => setExp2Inputs({ ...exp2Inputs, scaler: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="standard">StandardScaler (Mean=0, Std=1)</option>
                            <option value="minmax">MinMaxScaler (Range [0, 1])</option>
                            <option value="robust">RobustScaler (IQR Quantiles)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Categorical Encoding (2b)</label>
                          <select
                            value={exp2Inputs.encoding}
                            onChange={(e) => setExp2Inputs({ ...exp2Inputs, encoding: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="onehot">One-Hot Encoding (pd.get_dummies)</option>
                            <option value="label">LabelEncoder (Ordinal integer rank)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Experiment 3 (3a-d): Statistical EDA & Outlier Detection */}
                    {(viewDetailModal.id === 7 || viewDetailModal.title.toLowerCase().includes('exp-3')) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">IQR Multiplier Fence: {exp3Inputs.iqrMultiplier}×</label>
                          <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.5"
                            value={exp3Inputs.iqrMultiplier}
                            onChange={(e) => setExp3Inputs({ ...exp3Inputs, iqrMultiplier: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                          <span className="text-[10px] text-slate-500">1.5× = Tukey Standard, 3.0× = Extreme only</span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Feature</label>
                          <select
                            value={exp3Inputs.targetCol}
                            onChange={(e) => setExp3Inputs({ ...exp3Inputs, targetCol: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="cholesterol_mgdl">Serum Cholesterol (mg/dL)</option>
                            <option value="systolic_bp">Systolic Blood Pressure (mmHg)</option>
                            <option value="bmi">Body Mass Index (BMI)</option>
                            <option value="blood_glucose">Fasting Blood Glucose (mg/dL)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Z-Score Cutoff (|Z|): {exp3Inputs.zCutoff}</label>
                          <input
                            type="range"
                            min="2.0"
                            max="3.5"
                            step="0.5"
                            value={exp3Inputs.zCutoff}
                            onChange={(e) => setExp3Inputs({ ...exp3Inputs, zCutoff: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Experiment 4 (4a-c): Supervised ML Benchmarking */}
                    {(viewDetailModal.id === 8 || viewDetailModal.title.toLowerCase().includes('exp-4')) && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Predictive Model</label>
                            <select
                              value={exp4Inputs.modelChoice}
                              onChange={(e) => setExp4Inputs({ ...exp4Inputs, modelChoice: e.target.value as any })}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                            >
                              <option value="knn">K-Nearest Neighbors (k=5) — 95.0% Acc</option>
                              <option value="tree">Decision Tree Classifier (d=3) — 93.3% Acc</option>
                              <option value="logistic">Logistic Regression (Binary) — 91.7% Acc</option>
                              <option value="linear">Multiple Linear Regression (OLS) — R²=0.912</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Study Hours (Daily): {exp4Inputs.studyHours} hrs</label>
                            <input
                              type="range"
                              min="1"
                              max="12"
                              step="0.5"
                              value={exp4Inputs.studyHours}
                              onChange={(e) => setExp4Inputs({ ...exp4Inputs, studyHours: Number(e.target.value) })}
                              className="w-full accent-blue-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Past Academic Grade: {exp4Inputs.pastScore}/100</label>
                            <input
                              type="range"
                              min="40"
                              max="100"
                              value={exp4Inputs.pastScore}
                              onChange={(e) => setExp4Inputs({ ...exp4Inputs, pastScore: Number(e.target.value) })}
                              className="w-full accent-blue-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Attendance: {exp4Inputs.attendance}%</label>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={exp4Inputs.attendance}
                              onChange={(e) => setExp4Inputs({ ...exp4Inputs, attendance: Number(e.target.value) })}
                              className="w-full accent-blue-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ECG Inputs */}
                    {viewDetailModal.title.toLowerCase().includes('ecg') && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (BPM): {ecgInputs.heartRate}</label>
                          <input
                            type="range"
                            min="40"
                            max="180"
                            value={ecgInputs.heartRate}
                            onChange={(e) => setEcgInputs({ ...ecgInputs, heartRate: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">ST-Elevation (mV): {ecgInputs.stElevation}</label>
                          <input
                            type="range"
                            min="-0.1"
                            max="0.4"
                            step="0.01"
                            value={ecgInputs.stElevation}
                            onChange={(e) => setEcgInputs({ ...ecgInputs, stElevation: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">QRS Duration (ms): {ecgInputs.qrsDuration}</label>
                          <input
                            type="range"
                            min="60"
                            max="160"
                            value={ecgInputs.qrsDuration}
                            onChange={(e) => setEcgInputs({ ...ecgInputs, qrsDuration: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Traffic GNN Inputs */}
                    {viewDetailModal.title.toLowerCase().includes('traffic') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Inbound Vehicle Volume (VPH): {trafficInputs.volume}</label>
                          <input
                            type="range"
                            min="400"
                            max="2200"
                            step="20"
                            value={trafficInputs.volume}
                            onChange={(e) => setTrafficInputs({ ...trafficInputs, volume: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Segment Velocity (km/h): {trafficInputs.speed}</label>
                          <input
                            type="range"
                            min="8"
                            max="60"
                            step="0.5"
                            value={trafficInputs.speed}
                            onChange={(e) => setTrafficInputs({ ...trafficInputs, speed: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Retail Churn Inputs */}
                    {viewDetailModal.title.toLowerCase().includes('churn') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Tenure (Months): {churnInputs.tenure}</label>
                          <input
                            type="range"
                            min="1"
                            max="60"
                            value={churnInputs.tenure}
                            onChange={(e) => setChurnInputs({ ...churnInputs, tenure: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Support Tickets: {churnInputs.supportTickets}</label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={churnInputs.supportTickets}
                            onChange={(e) => setChurnInputs({ ...churnInputs, supportTickets: Number(e.target.value) })}
                            className="w-full accent-blue-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fallback for other projects */}
                    {!viewDetailModal.title.toLowerCase().includes('ecg') &&
                      !viewDetailModal.title.toLowerCase().includes('traffic') &&
                      !viewDetailModal.title.toLowerCase().includes('churn') &&
                      !viewDetailModal.title.toLowerCase().includes('exp-') &&
                      ![6, 7, 8].includes(viewDetailModal.id) && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Input Text / Clinical Query</label>
                          <input
                            type="text"
                            value={nlpInputs.text}
                            onChange={(e) => setNlpInputs({ text: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      )}

                    {/* Preset buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEcgInputs({ heartRate: 72, prInterval: 160, qrsDuration: 88, stElevation: 0.02 });
                            setTrafficInputs({ volume: 750, speed: 45.0, weather: 'Clear', rushHour: false });
                            setChurnInputs({ tenure: 48, monthlyCharge: 55.0, supportTickets: 0, contract: 'Two-Year' });
                            setExp2Inputs({ imputation: 'median', scaler: 'standard', encoding: 'onehot' });
                            setExp3Inputs({ iqrMultiplier: 1.5, zCutoff: 3.0, targetCol: 'cholesterol_mgdl' });
                            setExp4Inputs({ modelChoice: 'knn', trainSplit: 80, studyHours: 8.5, pastScore: 92, attendance: 96 });
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          Preset: Normal Sample
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEcgInputs({ heartRate: 140, prInterval: 120, qrsDuration: 145, stElevation: 0.22 });
                            setTrafficInputs({ volume: 1950, speed: 11.5, weather: 'Rain', rushHour: true });
                            setChurnInputs({ tenure: 2, monthlyCharge: 95.0, supportTickets: 5, contract: 'Month-to-Month' });
                            setExp2Inputs({ imputation: 'drop', scaler: 'minmax', encoding: 'label' });
                            setExp3Inputs({ iqrMultiplier: 1.0, zCutoff: 2.0, targetCol: 'systolic_bp' });
                            setExp4Inputs({ modelChoice: 'logistic', trainSplit: 70, studyHours: 2.0, pastScore: 48, attendance: 65 });
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                        >
                          Preset: Anomaly / Pathological Sample
                        </button>
                      </div>

                      <button
                        onClick={() => runLiveInference(viewDetailModal)}
                        disabled={inferenceRunning}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{inferenceRunning ? 'Evaluating...' : 'Run Live Inference'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inference Output Card */}
                  {inferenceResult && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inference Output</span>
                        <span className="text-[11px] font-mono text-slate-500">Execution Latency: {inferenceResult.latencyMs}ms</span>
                      </div>

                      <div className={`p-4 rounded-xl border ${inferenceResult.badgeColor}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{inferenceResult.label}</span>
                          <span className="text-xs font-mono font-bold">{inferenceResult.confidence}% Benchmark</span>
                        </div>
                        <p className="text-xs leading-relaxed">{inferenceResult.description}</p>
                      </div>

                      {/* Extra metrics */}
                      {inferenceResult.extraMetrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {Object.entries(inferenceResult.extraMetrics).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-[10px] text-slate-500 block uppercase font-medium">{k}</span>
                              <span className="text-xs font-mono font-bold text-slate-900">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Feature contributions */}
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block mb-2">Feature Importance & Factor Weights:</span>
                        <div className="space-y-2">
                          {inferenceResult.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <span className="w-48 text-slate-600 truncate">{f.name}</span>
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${f.positive ? 'bg-blue-900' : 'bg-slate-400'}`}
                                  style={{ width: `${Math.abs(f.impact) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-slate-700 w-12 text-right">
                                {f.impact > 0 ? `+${f.impact}` : f.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CHARTS & CURVES */}
              {detailActiveTab === 'charts' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Curve 1 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {viewDetailModal.id === 8 ? 'Algorithm Accuracy Comparison' : viewDetailModal.id === 7 ? 'Covariance Scatter Variance' : 'Training vs Validation Loss'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {viewDetailModal.id === 8 ? 'KNN vs Decision Tree vs Logistic Regression' : 'Residual convergence across training cycles'}
                      </p>
                      
                      {viewDetailModal.id === 8 ? (
                        <div className="space-y-3 pt-2">
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span>K-Nearest Neighbors (k=5)</span>
                              <span className="font-mono font-bold text-emerald-800">95.00%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '95%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span>Decision Tree Classifier (d=3)</span>
                              <span className="font-mono font-bold text-blue-900">93.33%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-blue-900 h-full rounded-full" style={{ width: '93.3%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span>Logistic Regression (L-BFGS)</span>
                              <span className="font-mono font-bold text-indigo-800">91.67%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '91.7%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span>Multiple Linear Regression (R²)</span>
                              <span className="font-mono font-bold text-amber-800">91.24%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-amber-600 h-full rounded-full" style={{ width: '91.2%' }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-full flex items-end gap-1.5 pt-4">
                          {[0.85, 0.62, 0.44, 0.31, 0.22, 0.17, 0.12, 0.09, 0.07, 0.05].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-blue-900 rounded-t transition-all hover:bg-blue-800"
                                style={{ height: `${val * 140}px` }}
                                title={`Step ${idx + 1}: Loss ${val}`}
                              />
                              <span className="text-[9px] font-mono text-slate-500">{idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Curve 2 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {viewDetailModal.id === 7 ? 'Pearson Correlation Matrix' : 'Validation Accuracy Curve'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {viewDetailModal.id === 7 ? 'Feature Interdependence Matrix (r)' : `Progression towards ${viewDetailModal.accuracy || '98.4%'}`}
                      </p>
                      
                      {viewDetailModal.id === 7 ? (
                        <div className="space-y-2 pt-1 font-mono text-xs">
                          <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-slate-700 bg-slate-200/70 p-1.5 rounded">
                            <span>Feature</span>
                            <span>BP</span>
                            <span>Chol</span>
                            <span>Glucose</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded border border-slate-200 text-[11px]">
                            <span className="font-bold">BP</span>
                            <span className="bg-blue-100 text-blue-900 text-center font-bold">1.000</span>
                            <span className="bg-emerald-100 text-emerald-900 text-center font-bold">+0.772</span>
                            <span className="text-center text-slate-600">+0.098</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded border border-slate-200 text-[11px]">
                            <span className="font-bold">Chol</span>
                            <span className="bg-emerald-100 text-emerald-900 text-center font-bold">+0.772</span>
                            <span className="bg-blue-100 text-blue-900 text-center font-bold">1.000</span>
                            <span className="text-center text-slate-600">+0.114</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded border border-slate-200 text-[11px]">
                            <span className="font-bold">BMI</span>
                            <span className="text-center text-slate-600">+0.084</span>
                            <span className="text-center text-slate-600">+0.092</span>
                            <span className="bg-emerald-50 text-emerald-900 text-center font-bold">+0.478</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-full flex items-end gap-1.5 pt-4">
                          {[0.71, 0.79, 0.85, 0.89, 0.92, 0.94, 0.96, 0.97, 0.98, 0.984].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-emerald-600 rounded-t transition-all hover:bg-emerald-500"
                                style={{ height: `${(val - 0.6) * 320}px` }}
                                title={`Step ${idx + 1}: ${(val * 100).toFixed(1)}%`}
                              />
                              <span className="text-[9px] font-mono text-slate-500">{idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Metrics Matrix */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Performance Evaluation Metrics Ledger
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Benchmark</span>
                        <span className="text-base font-bold font-mono text-emerald-700">
                          {viewDetailModal.metrics?.accuracy || viewDetailModal.accuracy || '98.4%'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
                        <span className="text-base font-bold font-mono text-blue-900">
                          {viewDetailModal.metrics?.precision || '97.8%'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Recall Sensitivity</span>
                        <span className="text-base font-bold font-mono text-indigo-700">
                          {viewDetailModal.metrics?.recall || '98.9%'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">F1-Score</span>
                        <span className="text-base font-bold font-mono text-purple-700">
                          {viewDetailModal.metrics?.f1_score || '98.3%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SOURCE CODE */}
              {detailActiveTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-800">Executable Python Implementation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenCodeEditorWithCode && (
                        <button
                          onClick={() => {
                            onOpenCodeEditorWithCode(viewDetailModal.source_code || '', 'python');
                            setViewDetailModal(null);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run in Code Playground</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyCode(viewDetailModal.source_code || '')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-sky-300 overflow-x-auto max-h-[500px]">
                    <pre className="leading-relaxed whitespace-pre font-mono">
                      {viewDetailModal.source_code || '# No source code attached.'}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 5: DATASET SAMPLE */}
              {detailActiveTab === 'dataset' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Sample Input Dataset (CSV Format)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        First records of training and benchmarking dataset
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getNotebookDownloadUrl(viewDetailModal) && (
                        <a
                          href={getNotebookDownloadUrl(viewDetailModal)!.url}
                          download={getNotebookDownloadUrl(viewDetailModal)!.filename}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-700" />
                          <span>Download Notebook</span>
                        </a>
                      )}

                      {viewDetailModal.dataset_sample && (
                        <a
                          href={`data:text/csv;charset=utf-8,${encodeURIComponent(viewDetailModal.dataset_sample)}`}
                          download={`${viewDetailModal.title.replace(/\s+/g, '_')}_sample.csv`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Download CSV</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {viewDetailModal.dataset_sample ? (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                          <tr>
                            {viewDetailModal.dataset_sample.split('\n')[0].split(',').map((header, i) => (
                              <th key={i} className="px-3 py-2 border-r border-slate-200/60 last:border-0 whitespace-nowrap">
                                {header.trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                          {viewDetailModal.dataset_sample.split('\n').slice(1).filter((r) => r.trim()).map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-blue-50/40">
                              {row.split(',').map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-2 border-r border-slate-100 last:border-0 whitespace-nowrap">
                                  {cell.trim()}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      No tabular dataset preview recorded for this project.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">Project Archive ID #{viewDetailModal.id}</span>
              <button
                onClick={() => {
                  setViewDetailModal(null);
                  if (onClearSelectedProjectId) onClearSelectedProjectId();
                }}
                className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Interactive Predictor Modal */}
      {activePredictorProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {activePredictorProject.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Interactive Model Test Simulator</span>
                </div>
              </div>
              <button
                onClick={() => setActivePredictorProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Simulated Input Vectors
                </span>

                {/* Exp 2 */}
                {(activePredictorProject.id === 6 || activePredictorProject.title.toLowerCase().includes('exp-2')) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Missing Value Imputation</label>
                      <select
                        value={exp2Inputs.imputation}
                        onChange={(e) => setExp2Inputs({ ...exp2Inputs, imputation: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="median">Median Imputation</option>
                        <option value="mean">Mean Imputation</option>
                        <option value="mode">Mode Imputation</option>
                        <option value="drop">Drop Null Rows</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Scaler Method</label>
                      <select
                        value={exp2Inputs.scaler}
                        onChange={(e) => setExp2Inputs({ ...exp2Inputs, scaler: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="standard">StandardScaler (Mean=0, Std=1)</option>
                        <option value="minmax">MinMaxScaler (0 to 1)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Exp 3 */}
                {(activePredictorProject.id === 7 || activePredictorProject.title.toLowerCase().includes('exp-3')) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IQR Multiplier: {exp3Inputs.iqrMultiplier}×</label>
                      <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.5"
                        value={exp3Inputs.iqrMultiplier}
                        onChange={(e) => setExp3Inputs({ ...exp3Inputs, iqrMultiplier: Number(e.target.value) })}
                        className="w-full accent-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Feature</label>
                      <select
                        value={exp3Inputs.targetCol}
                        onChange={(e) => setExp3Inputs({ ...exp3Inputs, targetCol: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="cholesterol_mgdl">Serum Cholesterol</option>
                        <option value="systolic_bp">Systolic BP</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Exp 4 */}
                {(activePredictorProject.id === 8 || activePredictorProject.title.toLowerCase().includes('exp-4')) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Classifier Model</label>
                      <select
                        value={exp4Inputs.modelChoice}
                        onChange={(e) => setExp4Inputs({ ...exp4Inputs, modelChoice: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="knn">KNN (k=5) — 95.0% Acc</option>
                        <option value="tree">Decision Tree (d=3) — 93.3% Acc</option>
                        <option value="logistic">Logistic Regression — 91.7% Acc</option>
                        <option value="linear">Multiple Linear Regression</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Study Hours: {exp4Inputs.studyHours} hrs</label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="0.5"
                        value={exp4Inputs.studyHours}
                        onChange={(e) => setExp4Inputs({ ...exp4Inputs, studyHours: Number(e.target.value) })}
                        className="w-full accent-blue-900"
                      />
                    </div>
                  </div>
                )}

                {/* ECG */}
                {activePredictorProject.title.toLowerCase().includes('ecg') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate: {ecgInputs.heartRate} BPM</label>
                      <input
                        type="range"
                        min="40"
                        max="180"
                        value={ecgInputs.heartRate}
                        onChange={(e) => setEcgInputs({ ...ecgInputs, heartRate: Number(e.target.value) })}
                        className="w-full accent-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">QRS Duration: {ecgInputs.qrsDuration} ms</label>
                      <input
                        type="range"
                        min="60"
                        max="160"
                        value={ecgInputs.qrsDuration}
                        onChange={(e) => setEcgInputs({ ...ecgInputs, qrsDuration: Number(e.target.value) })}
                        className="w-full accent-blue-900"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => runLiveInference(activePredictorProject)}
                    disabled={inferenceRunning}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{inferenceRunning ? 'Processing Inference...' : 'Predict Result'}</span>
                  </button>
                </div>
              </div>

              {inferenceResult && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                  <div className={`p-3.5 rounded-lg border ${inferenceResult.badgeColor}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{inferenceResult.label}</span>
                      <span className="text-xs font-mono font-bold">{inferenceResult.confidence}% Score</span>
                    </div>
                    <p className="text-xs leading-relaxed">{inferenceResult.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 block">Feature Impact:</span>
                    {inferenceResult.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-40 text-slate-600 truncate">{f.name}</span>
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${f.positive ? 'bg-blue-900' : 'bg-slate-400'}`}
                            style={{ width: `${Math.abs(f.impact) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-700 w-10 text-right">
                          {f.impact > 0 ? `+${f.impact}` : f.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActivePredictorProject(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProject ? 'Edit Project Repository' : 'Upload Data Science Project'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DS Lab Exp-2: Data Ingestion & Preprocessing (2a, 2b)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Deep Learning & Graphs">Deep Learning & Graphs</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Natural Language Processing">Natural Language Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Published">Published</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Accuracy / Metric</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.4% Accuracy"
                    value={formData.accuracy}
                    onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Mentor / Advisor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. K. V. Ramanathan, M.Tech, Ph.D."
                    value={formData.mentor_name}
                    onChange={(e) => setFormData({ ...formData, mentor_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Author / Team</label>
                  <input
                    type="text"
                    placeholder="e.g. T. Harshini Priya (24102A030128)"
                    value={formData.team_members}
                    onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies Used (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="Python, Pandas, NumPy, Scikit-Learn, Jupyter"
                  value={formData.technologies_used}
                  onChange={(e) => setFormData({ ...formData, technologies_used: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Summary (Abstract) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief synopsis of model architecture, objectives, and findings..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Architecture & Methodology</label>
                <textarea
                  rows={4}
                  placeholder="Exhaustive methodology detailing mathematical formulation, feature scaling, and optimization..."
                  value={formData.detailed_description}
                  onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deployment / Notebook URL</label>
                  <input
                    type="text"
                    placeholder="https://... or /uploads/ds(2a,b).ipynb"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Upload Report or Notebook */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Notebook (.ipynb) or Report Document</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.ipynb,.docx,.csv"
                    onChange={handleReportUpload}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {isUploadingReport && <span className="text-xs text-blue-900 animate-pulse">Uploading file...</span>}
                  {formData.report_file_url && (
                    <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 truncate max-w-xs">
                      Attached: {formData.report_file_url.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>

              {/* Source code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Executable Python Source Code</label>
                <textarea
                  rows={5}
                  placeholder="# Python script implementation..."
                  value={formData.source_code}
                  onChange={(e) => setFormData({ ...formData, source_code: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-900 text-sky-300"
                />
              </div>

              {/* Dataset sample */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sample Tabular Dataset (CSV Format)</label>
                <textarea
                  rows={3}
                  placeholder="id,feature_1,feature_2,label\n1,0.5,12.4,1"
                  value={formData.dataset_sample}
                  onChange={(e) => setFormData({ ...formData, dataset_sample: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingProject ? 'Save Changes' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Delete Project Repository?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to remove project #{deleteConfirmId}? This action will permanently remove it and write to the audit trail.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
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
