/**
 * DS LAB PORTAL — DATA SCIENCE DIGITAL LIBRARY
 * Complete full-stack academic web application
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import {
  Student,
  DashboardStats,
  Module,
  Experiment,
  Equipment,
  Project,
  Resource
} from './types/index.ts';

import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ModulesView } from './components/ModulesView.tsx';
import { ExperimentsView } from './components/ExperimentsView.tsx';
import { LabEquipmentsView } from './components/LabEquipmentsView.tsx';
import { ToolsView } from './components/ToolsView.tsx';
import { ResourcesView } from './components/ResourcesView.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { CodeEditorView } from './components/CodeEditorView.tsx';
import { StudentProfileModal } from './components/StudentProfileModal.tsx';

import {
  GraduationCap,
  Database,
  Terminal,
  Heart,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Navigation and detail state transitions
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [initialExpAddOpen, setInitialExpAddOpen] = useState(false);
  const [initialDefaultModuleId, setInitialDefaultModuleId] = useState<number | undefined>(undefined);
  const [initialProjectAddOpen, setInitialProjectAddOpen] = useState(false);

  // Code editor transfer
  const [editorInitialCode, setEditorInitialCode] = useState<string | undefined>(undefined);
  const [editorInitialLanguage, setEditorInitialLanguage] = useState<string>('Python');

  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initial Data Fetching from Database
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [
        studentData,
        statsData,
        modulesData,
        experimentsData,
        equipmentData,
        projectsData,
        resourcesData
      ] = await Promise.all([
        api.getStudent(),
        api.getDashboardStats(),
        api.getModules(),
        api.getExperiments(),
        api.getEquipment(),
        api.getProjects(),
        api.getResources()
      ]);

      setStudent(studentData);
      setStats(statsData);
      setModules(modulesData);
      setExperiments(experimentsData);
      setEquipment(equipmentData);
      setProjects(projectsData);
      setResources(resourcesData);
      setGlobalError(null);
    } catch (err: any) {
      console.error('Error initializing portal data:', err);
      setGlobalError(err.message || 'Failed to connect to database API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for cross-component workflows
  const handleOpenCodeEditorWithCode = (code: string, language: string) => {
    setEditorInitialCode(code);
    setEditorInitialLanguage(language);
    setCurrentTab('editor');
  };

  const handleOpenAddExperiment = (defaultModuleId?: number) => {
    setInitialDefaultModuleId(defaultModuleId);
    setInitialExpAddOpen(true);
    setCurrentTab('modules');
  };

  const handleOpenAddProject = () => {
    setInitialProjectAddOpen(true);
    setCurrentTab('projects');
  };

  const handleSelectExperiment = (expId: number) => {
    setSelectedExpId(expId);
    setCurrentTab('modules');
  };

  const handleSelectProject = (projId: number) => {
    setSelectedProjectId(projId);
    setCurrentTab('projects');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-900 selection:text-white">
      
      {/* Top Universal Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedExpId(null);
          setSelectedProjectId(null);
        }}
        student={student}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Global Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin text-blue-900" />
            <span className="text-sm font-medium">Connecting to DS Lab Database...</span>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Connection Notice:</strong> {globalError}</span>
            </div>
            <button
              onClick={loadAllData}
              className="px-3 py-1 font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                student={student}
                onNavigate={setCurrentTab}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenAddExperiment={handleOpenAddExperiment}
                onOpenAddProject={handleOpenAddProject}
                onSelectExperiment={handleSelectExperiment}
                onSelectProject={handleSelectProject}
              />
            )}

            {currentTab === 'modules' && (
              <div className="space-y-10">
                <ModulesView
                  modules={modules}
                  onRefreshModules={loadAllData}
                  onOpenAddExperiment={handleOpenAddExperiment}
                  onSelectExperiment={handleSelectExperiment}
                />
                
                {/* Embedded Experiments list connected directly to modules */}
                <div className="pt-6 border-t border-slate-200">
                  <ExperimentsView
                    experiments={experiments}
                    modules={modules}
                    onRefreshExperiments={loadAllData}
                    onOpenCodeEditorWithCode={handleOpenCodeEditorWithCode}
                    selectedExpId={selectedExpId}
                    onClearSelectedExpId={() => setSelectedExpId(null)}
                    initialAddModalOpen={initialExpAddOpen}
                    initialDefaultModuleId={initialDefaultModuleId}
                    onCloseAddModal={() => setInitialExpAddOpen(false)}
                  />
                </div>
              </div>
            )}

            {currentTab === 'equipment' && (
              <LabEquipmentsView
                equipments={equipment}
                onRefreshEquipment={loadAllData}
              />
            )}

            {currentTab === 'tools' && (
              <ToolsView />
            )}

            {currentTab === 'resources' && (
              <ResourcesView
                resources={resources}
                onRefreshResources={loadAllData}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsView
                projects={projects}
                onRefreshProjects={loadAllData}
                selectedProjectId={selectedProjectId}
                onClearSelectedProjectId={() => setSelectedProjectId(null)}
                initialAddModalOpen={initialProjectAddOpen}
                onCloseAddModal={() => setInitialProjectAddOpen(false)}
                onOpenCodeEditorWithCode={handleOpenCodeEditorWithCode}
              />
            )}

            {currentTab === 'editor' && (
              <CodeEditorView
                initialCode={editorInitialCode}
                initialLanguage={editorInitialLanguage}
              />
            )}
          </>
        )}

      </main>

      {/* Student Profile Modal */}
      {student && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          student={student}
          onStudentUpdated={(updated) => {
            setStudent(updated);
            loadAllData();
          }}
        />
      )}

      {/* Academic Portal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-700">DS LAB PORTAL</span>
            <span>·</span>
            <span>Data Science Digital Library & Lab Management System</span>
          </div>
          
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
            <span>MySQL 8.0 / REST API</span>
            <span>·</span>
            <span>Dept. of CS & Data Science</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
