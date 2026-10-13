import {
  Student,
  Module,
  Experiment,
  Equipment,
  Project,
  Resource,
  DashboardStats,
  CodeExecutionResult,
  SqlQueryResult
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
    return res.json();
  },

  // Student
  async getStudent(): Promise<Student> {
    const res = await fetch(`${API_BASE}/student`);
    if (!res.ok) throw new Error('Failed to load student profile');
    return res.json();
  },

  async updateStudent(data: Partial<Student>): Promise<{ message: string; student: Student }> {
    const res = await fetch(`${API_BASE}/student`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update student profile');
    }
    return res.json();
  },

  // Modules
  async getModules(): Promise<Module[]> {
    const res = await fetch(`${API_BASE}/modules`);
    if (!res.ok) throw new Error('Failed to load modules');
    return res.json();
  },

  async getModule(id: number): Promise<Module & { experiments: Experiment[] }> {
    const res = await fetch(`${API_BASE}/modules/${id}`);
    if (!res.ok) throw new Error('Failed to load module details');
    return res.json();
  },

  async addModule(mod: Partial<Module>): Promise<Module> {
    const res = await fetch(`${API_BASE}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mod)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create module');
    }
    return res.json();
  },

  async updateModule(id: number, mod: Partial<Module>): Promise<Module> {
    const res = await fetch(`${API_BASE}/modules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mod)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update module');
    }
    return res.json();
  },

  async deleteModule(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/modules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete module');
  },

  // Experiments
  async getExperiments(moduleId?: number, search?: string): Promise<Experiment[]> {
    const params = new URLSearchParams();
    if (moduleId) params.append('module_id', moduleId.toString());
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/experiments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load experiments');
    return res.json();
  },

  async getExperiment(id: number): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`);
    if (!res.ok) throw new Error('Failed to load experiment');
    return res.json();
  },

  async addExperiment(exp: Partial<Experiment>): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create experiment');
    }
    return res.json();
  },

  async updateExperiment(id: number, exp: Partial<Experiment>): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update experiment');
    }
    return res.json();
  },

  async deleteExperiment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/experiments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete experiment');
  },

  // Equipment
  async getEquipment(status?: string, search?: string): Promise<Equipment[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/equipment?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load equipment');
    return res.json();
  },

  async addEquipment(eq: Partial<Equipment>): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eq)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add equipment');
    }
    return res.json();
  },

  async updateEquipment(id: number, eq: Partial<Equipment>): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eq)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update equipment');
    }
    return res.json();
  },

  async deleteEquipment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete equipment');
  },

  // Projects
  async getProjects(tech?: string, search?: string): Promise<Project[]> {
    const params = new URLSearchParams();
    if (tech) params.append('tech', tech);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/projects?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async getProject(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to load project details');
    return res.json();
  },

  async addProject(prj: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prj)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add project');
    }
    return res.json();
  },

  async updateProject(id: number, prj: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prj)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update project');
    }
    return res.json();
  },

  async deleteProject(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  // Resources
  async getResources(category?: string, search?: string): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load resources');
    return res.json();
  },

  async addResource(r: Partial<Resource>): Promise<Resource> {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add resource');
    }
    return res.json();
  },

  async updateResource(id: number, r: Partial<Resource>): Promise<Resource> {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update resource');
    }
    return res.json();
  },

  async deleteResource(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/resources/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete resource');
  },

  // Upload
  async uploadFile(file: File, category: string = 'general'): Promise<{ file_url: string; original_filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload file');
    }
    return res.json();
  },

  // Code Execution
  async executeCode(language: string, code: string, stdin: string = ''): Promise<CodeExecutionResult> {
    const res = await fetch(`${API_BASE}/execute-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, stdin })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Code execution failed');
    }
    return res.json();
  },

  // SQL Practice
  async runSqlQuery(query: string): Promise<SqlQueryResult> {
    const res = await fetch(`${API_BASE}/sql-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (!res.ok) {
      return { columns: [], rows: [], row_count: 0, error: data.error || 'Query execution error' };
    }
    return data;
  },

  // Audit Logs
  async getAuditLogs(actionType?: string, search?: string): Promise<import('../types/index.ts').AuditLog[]> {
    const params = new URLSearchParams();
    if (actionType) params.append('action_type', actionType);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/audit-logs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load activity audit logs');
    return res.json();
  }
};
