import React, { useState, useMemo } from 'react';
import { api } from '../services/api.ts';
import {
  Wrench,
  Table,
  Calculator,
  Braces,
  Database,
  Upload,
  Download,
  Search,
  ArrowUpDown,
  Copy,
  Check,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'csv' | 'stats' | 'json' | 'sql'>('csv');

  // =========================================================================
  // 1. CSV VIEWER STATE & LOGIC
  // =========================================================================
  const sampleCsvData = `student_id,full_name,department,gpa,attendance_pct,lab_score
101,Harshini Priya,Data Science,9.45,96.0,98
102,Aditya Verma,Data Science,8.92,92.5,91
103,Rohit Sharma,AI & ML,8.15,88.0,85
104,Sneha Reddy,Computer Science,9.10,95.0,94
105,Karthik Nair,Data Science,7.85,81.0,80
106,Ananya Deshmukh,AI & ML,9.30,94.0,95
107,Varun Teja,Computer Science,8.40,87.0,88
108,Divya S,Data Science,9.05,93.5,92`;

  const [csvRaw, setCsvRaw] = useState(sampleCsvData);
  const [csvSearch, setCsvSearch] = useState('');
  const [csvSortCol, setCsvSortCol] = useState<number | null>(null);
  const [csvSortAsc, setCsvSortAsc] = useState(true);

  const parsedCsv = useMemo(() => {
    const lines = csvRaw.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
    return { headers, rows };
  }, [csvRaw]);

  const filteredCsvRows = useMemo(() => {
    let rows = parsedCsv.rows;
    if (csvSearch.trim()) {
      const q = csvSearch.toLowerCase();
      rows = rows.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
    }
    if (csvSortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const valA = a[csvSortCol] || '';
        const valB = b[csvSortCol] || '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return csvSortAsc ? numA - numB : numB - numA;
        }
        return csvSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return rows;
  }, [parsedCsv, csvSearch, csvSortCol, csvSortAsc]);

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvRaw(text);
        setCsvSearch('');
        setCsvSortCol(null);
      }
    };
    reader.readAsText(file);
  };

  const downloadCsv = () => {
    const csvContent = [
      parsedCsv.headers.join(','),
      ...filteredCsvRows.map(r => r.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 2. STATISTICS CALCULATOR STATE & LOGIC
  // =========================================================================
  const [statsInput, setStatsInput] = useState('78, 85, 92, 88, 95, 85, 64, 91, 89, 75, 99');
  const [statsError, setStatsError] = useState<string | null>(null);

  const calculatedStats = useMemo(() => {
    setStatsError(null);
    if (!statsInput.trim()) return null;

    const parts = statsInput.split(/[,\s\n]+/).filter(p => p.trim().length > 0);
    const nums: number[] = [];

    for (const p of parts) {
      const num = parseFloat(p);
      if (isNaN(num)) {
        setStatsError(`Invalid numeric value detected: "${p}"`);
        return null;
      }
      nums.push(num);
    }

    if (nums.length === 0) return null;

    nums.sort((a, b) => a - b);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];

    // Mode
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    nums.forEach(x => {
      freq[x] = (freq[x] || 0) + 1;
      if (freq[x] > maxFreq) maxFreq = freq[x];
    });
    const modes = Object.keys(freq).filter(k => freq[parseFloat(k)] === maxFreq && maxFreq > 1);

    // Min, Max, Range
    const min = nums[0];
    const max = nums[n - 1];
    const range = max - min;

    // Variance & Std Dev
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);
    const popVariance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const popStdDev = Math.sqrt(popVariance);

    // Quartiles
    const q1 = nums[Math.floor(n * 0.25)];
    const q3 = nums[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    return {
      count: n,
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      mode: modes.length > 0 ? modes.join(', ') : 'No single mode (all unique)',
      min,
      max,
      range: Number(range.toFixed(3)),
      variance: Number(variance.toFixed(3)),
      stdDev: Number(stdDev.toFixed(3)),
      popStdDev: Number(popStdDev.toFixed(3)),
      q1,
      q3,
      iqr
    };
  }, [statsInput]);

  // =========================================================================
  // 3. JSON FORMATTER STATE & LOGIC
  // =========================================================================
  const sampleJson = `{
  "experiment": "Hyperparameter Tuning for Random Forest",
  "dataset": "UCI Credit Default",
  "parameters": {
    "n_estimators": 150,
    "max_depth": 12,
    "min_samples_split": 4,
    "criterion": "gini"
  },
  "metrics": {
    "accuracy": 0.892,
    "f1_score": 0.884,
    "roc_auc": 0.931
  },
  "trained_at": "2026-10-12"
}`;

  const [jsonInput, setJsonInput] = useState(sampleJson);
  const [jsonFormatted, setJsonFormatted] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const formatJson = (spaces: number = 2) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonFormatted(JSON.stringify(parsed, null, spaces));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
      setJsonFormatted('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonFormatted(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
      setJsonFormatted('');
    }
  };

  // =========================================================================
  // 4. SQL PRACTICE SANDBOX STATE & LOGIC
  // =========================================================================
  const [sqlQuery, setSqlQuery] = useState("SELECT student_id, name, department, gpa, semester FROM students WHERE gpa >= 8.5 ORDER BY gpa DESC;");
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: (string | number)[][]; message?: string } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  const handleRunSql = async () => {
    setIsExecutingSql(true);
    setSqlError(null);
    try {
      const res = await api.runSqlQuery(sqlQuery);
      if (res.error) {
        setSqlError(res.error);
        setSqlResult(null);
      } else {
        setSqlResult(res);
      }
    } catch (err) {
      setSqlError(String(err));
      setSqlResult(null);
    } finally {
      setIsExecutingSql(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tools Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student & Faculty Data Science Tools</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Interactive analytical utilities for data inspection, exploratory computing, and SQL practice
          </p>
        </div>

        {/* Segmented Tool Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTool('csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTool === 'csv' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-blue-700" />
            <span>CSV Viewer</span>
          </button>
          <button
            onClick={() => setActiveTool('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTool === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-700" />
            <span>Stats Calculator</span>
          </button>
          <button
            onClick={() => setActiveTool('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTool === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Braces className="w-3.5 h-3.5 text-amber-700" />
            <span>JSON Formatter</span>
          </button>
          <button
            onClick={() => setActiveTool('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTool === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-700" />
            <span>SQL Practice</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CSV VIEWER TOOL                                                        */}
      {/* ========================================================================= */}
      {activeTool === 'csv' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Upload CSV File</span>
                <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setCsvRaw(sampleCsvData)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Sample Data
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-600">
                <strong className="font-mono text-slate-900 tabular-nums">{filteredCsvRows.length}</strong> rows · <strong className="font-mono text-slate-900 tabular-nums">{parsedCsv.headers.length}</strong> columns
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={csvSearch}
                  onChange={(e) => setCsvSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold z-10">
                  <tr>
                    {parsedCsv.headers.map((header, idx) => (
                      <th
                        key={idx}
                        onClick={() => {
                          if (csvSortCol === idx) {
                            setCsvSortAsc(!csvSortAsc);
                          } else {
                            setCsvSortCol(idx);
                            setCsvSortAsc(true);
                          }
                        }}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{header}</span>
                          <ArrowUpDown className={`w-3 h-3 ${csvSortCol === idx ? 'text-blue-900' : 'text-slate-400'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredCsvRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-4 tabular-nums">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredCsvRows.length === 0 && (
                    <tr>
                      <td colSpan={parsedCsv.headers.length || 1} className="py-8 text-center text-slate-600 font-sans">
                        No rows found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STATISTICS CALCULATOR TOOL                                             */}
      {/* ========================================================================= */}
      {activeTool === 'stats' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Numerical Dataset Input (comma or space separated)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600">Presets:</span>
                  <button
                    onClick={() => setStatsInput('88, 92, 75, 64, 95, 82, 89, 70, 78, 91')}
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    Exam Scores
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => setStatsInput('24.5, 26.1, 23.8, 28.4, 25.0, 29.2, 22.9, 27.5')}
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    Sensor Telemetry
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={statsInput}
                onChange={(e) => setStatsInput(e.target.value)}
                placeholder="e.g. 12, 15, 22, 29, 34, 45, 52, 60"
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            {statsError && (
              <div className="p-3 rounded-lg text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{statsError}</span>
              </div>
            )}
          </div>

          {calculatedStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Sample Size (N)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.count}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Mean (Average)</span>
                <span className="text-xl font-bold font-mono text-blue-900 tabular-nums">{calculatedStats.mean}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Median</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.median}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Mode</span>
                <span className="text-sm font-bold font-mono text-slate-900 truncate block mt-1">{calculatedStats.mode}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Minimum (Min)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.min}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Maximum (Max)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.max}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Range</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.range}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Sample Std Deviation (s)</span>
                <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">{calculatedStats.stdDev}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Population Std Dev (σ)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.popStdDev}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Sample Variance (s²)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.variance}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Quartiles (Q1 / Q3)</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.q1} / {calculatedStats.q3}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-600 block">Interquartile Range (IQR)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{calculatedStats.iqr}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. JSON FORMATTER TOOL                                                    */}
      {/* ========================================================================= */}
      {activeTool === 'json' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Raw JSON Input
                </label>
                <button
                  onClick={() => setJsonInput(sampleJson)}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Load Example Template
                </button>
              </div>
              <textarea
                rows={14}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste unformatted or raw JSON here..."
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                onClick={() => formatJson(2)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              >
                Format (2-space)
              </button>
              <button
                onClick={() => formatJson(4)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Format (4-space)
              </button>
              <button
                onClick={minifyJson}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Minify
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Formatted / Validated Output
                </label>
                {jsonFormatted && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jsonFormatted);
                      setCopiedJson(true);
                      setTimeout(() => setCopiedJson(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:underline font-medium"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {jsonError ? (
                <div className="p-4 rounded-lg text-xs bg-rose-50 text-rose-800 border border-rose-200 font-mono space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertCircle className="w-4 h-4" />
                    <span>JSON Syntax Validation Error:</span>
                  </div>
                  <div>{jsonError}</div>
                </div>
              ) : (
                <textarea
                  readOnly
                  rows={14}
                  value={jsonFormatted || '// Click Format to validate and indent JSON'}
                  className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 bg-slate-950 text-slate-100 select-all"
                />
              )}
            </div>

            <div className="text-[11px] text-slate-600 pt-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conforms to ECMA-404 JSON Standard Specification</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SQL PRACTICE TOOL                                                      */}
      {/* ========================================================================= */}
      {activeTool === 'sql' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-900" />
                  <span>Practice Dataset: `students` table (Read-Only Sandbox)</span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Columns: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">student_id</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">name</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">department</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">gpa</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">semester</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">attendance</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlQuery("SELECT student_id, name, gpa FROM students WHERE gpa >= 9.0 ORDER BY gpa DESC;")}
                  className="text-[11px] text-blue-700 hover:underline font-medium"
                >
                  Top Performers
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setSqlQuery("SELECT * FROM students WHERE department = 'Data Science' ORDER BY name ASC;")}
                  className="text-[11px] text-blue-700 hover:underline font-medium"
                >
                  DS Department
                </button>
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="SELECT ... FROM students ..."
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                Security Sandbox: Only SELECT queries permitted. Mutation commands (DROP/DELETE/INSERT) are blocked.
              </span>
              <button
                onClick={handleRunSql}
                disabled={isExecutingSql}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>{isExecutingSql ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {sqlError && (
            <div className="p-4 rounded-xl text-xs bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{sqlError}</span>
            </div>
          )}

          {sqlResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span className="font-medium">{sqlResult.message || `Query returned ${sqlResult.rows.length} records`}</span>
                <span className="font-mono text-slate-600 tabular-nums">{sqlResult.rows.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold">
                    <tr>
                      {sqlResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-2 px-4 tabular-nums">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
