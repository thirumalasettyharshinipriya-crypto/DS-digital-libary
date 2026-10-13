import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { CodeExecutionResult } from '../types/index.ts';
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  Download,
  Trash2,
  Check,
  Clock,
  Terminal,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';

interface CodeEditorViewProps {
  initialCode?: string;
  initialLanguage?: string;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  initialCode,
  initialLanguage = 'Python'
}) => {
  const [language, setLanguage] = useState<'Python' | 'Java' | 'C' | 'C++'>(
    (initialLanguage as any) || 'Python'
  );

  const starterTemplates: Record<string, string> = {
    Python: `# DS Lab Portal — Python 3 Analytical Sandbox
import numpy as np

# Sample Linear Algebra & Statistical Estimation
data_x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
data_y = np.array([2.2, 2.8, 3.6, 4.5, 5.1])

# Calculate sample slope and intercept
mean_x = np.mean(data_x)
mean_y = np.mean(data_y)

slope = np.sum((data_x - mean_x) * (data_y - mean_y)) / np.sum((data_x - mean_x) ** 2)
intercept = mean_y - slope * mean_x

print("=== Simple Linear Regression Analysis ===")
print(f"Sample Count: {len(data_x)}")
print(f"Mean(X): {mean_x:.2f}, Mean(Y): {mean_y:.2f}")
print(f"Calculated Slope (m): {slope:.4f}")
print(f"Intercept (c): {intercept:.4f}")

# Predictions
predicted_y = slope * data_x + intercept
residuals = data_y - predicted_y
print(f"Mean Squared Residual: {np.mean(residuals**2):.5f}")`,

    Java: `// DS Lab Portal — Java Programming Sandbox
public class LabAssignment {
    public static void main(String[] args) {
        System.out.println("=== Java Data Structures & Algorithms ===");
        int[] dataset = { 14, 28, 35, 42, 59, 63, 77, 88, 95 };
        int target = 42;
        
        int resultIndex = binarySearch(dataset, target, 0, dataset.length - 1);
        if (resultIndex != -1) {
            System.out.println("Target " + target + " found at index: " + resultIndex);
        } else {
            System.out.println("Target " + target + " not found in array.");
        }
    }
    
    public static int binarySearch(int[] arr, int target, int low, int high) {
        if (low > high) return -1;
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] > target) return binarySearch(arr, target, low, mid - 1);
        return binarySearch(arr, target, mid + 1, high);
    }
}`,

    C: `/* DS Lab Portal — C Programming Sandbox */
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("=== Dynamic Memory Allocation & Pointer Vector ===\\n");
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));
    
    if (arr == NULL) {
        printf("Memory allocation failed.\\n");
        return 1;
    }
    
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("Element [%d] = %d at address %p\\n", i, arr[i], (void*)&arr[i]);
    }
    
    free(arr);
    printf("Memory successfully deallocated.\\n");
    return 0;
}`,

    'C++': `// DS Lab Portal — C++ STL & Data Science Sandbox
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "=== C++ Standard Template Library (STL) ===" << std::endl;
    std::vector<double> scores = { 88.5, 92.0, 75.4, 84.2, 95.0, 89.6 };
    
    double sum = std::accumulate(scores.begin(), scores.end(), 0.0);
    double mean = sum / scores.size();
    
    std::sort(scores.begin(), scores.end());
    
    std::cout << "Scores count: " << scores.size() << std::endl;
    std::cout << "Mean Score: " << mean << std::endl;
    std::cout << "Min: " << scores.front() << ", Max: " << scores.back() << std::endl;
    
    return 0;
}`
  };

  const [code, setCode] = useState(initialCode || starterTemplates[language]);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<string>('');
  const [execStatus, setExecStatus] = useState<CodeExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // If initialCode changes from outside
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLanguage) setLanguage(initialLanguage as any);
    }
  }, [initialCode, initialLanguage]);

  const handleLanguageChange = (newLang: 'Python' | 'Java' | 'C' | 'C++') => {
    setLanguage(newLang);
    setCode(starterTemplates[newLang]);
    setOutput('');
    setExecStatus(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setExecStatus(null);

    try {
      const res = await api.executeCode(language.toLowerCase(), code, stdin);
      setExecStatus(res);
      if (res.output) {
        setOutput(res.output);
      }
      if (res.error) {
        setOutput(prev => (prev ? `${prev}\n\n[Errors/Stderr]:\n${res.error}` : res.error || ''));
      }
    } catch (err: any) {
      setOutput(`Execution Failed: ${err.message}`);
      setExecStatus({
        status: 'system_error',
        output: '',
        error: err.message,
        execution_time_ms: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      Python: 'py',
      Java: 'java',
      C: 'c',
      'C++': 'cpp'
    };
    const ext = extMap[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ds_lab_solution.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setCode(starterTemplates[language]);
    setOutput('');
    setExecStatus(null);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="space-y-4">
      
      {/* Top IDE Toolbar */}
      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold tracking-tight uppercase">DS IDE Sandbox</span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            {(['Python', 'Java', 'C', 'C++'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === lang
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Download Code File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Primary Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor & I/O Panes Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Code Editor Pane (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 shadow-xs overflow-hidden flex flex-col h-[560px]">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">main.{language === 'Python' ? 'py' : language === 'Java' ? 'java' : language === 'C' ? 'c' : 'cpp'}</span>
            <span className="font-mono tabular-nums">{lineCount} lines</span>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers Bar */}
            <div className="w-12 py-3 bg-slate-950/80 text-right pr-3 select-none text-[11px] font-mono text-slate-600 border-r border-slate-900">
              {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                <div key={i + 1} className="leading-6 tabular-nums">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-none overflow-y-auto selection:bg-blue-900"
            />
          </div>
        </div>

        {/* Input & Output Terminal (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-[560px]">
          
          {/* Stdin Input Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col h-40">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Standard Input (stdin)</span>
              <span className="text-[11px] text-slate-400 font-normal">Optional</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Input values passed to standard input..."
              className="flex-1 p-2 text-xs font-mono rounded border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Terminal Output Console */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 shadow-xs flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold text-slate-200 uppercase text-[11px]">Terminal Console</span>
              </div>

              <div className="flex items-center gap-3">
                {execStatus && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300 tabular-nums">{execStatus.execution_time_ms}ms</span>
                    <span className="text-slate-500">·</span>
                    <span className={execStatus.status === 'success' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      Code: {execStatus.exit_code ?? 0}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setOutput('');
                    setExecStatus(null);
                  }}
                  className="text-slate-400 hover:text-slate-200"
                  title="Clear Output"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed select-text">
              {isRunning ? (
                <div className="text-sky-400 flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>Executing code in isolated worker container...</span>
                </div>
              ) : output ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="text-slate-600 italic">
                  Press 'Run Code' to execute your program against the sandboxed runtime.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
