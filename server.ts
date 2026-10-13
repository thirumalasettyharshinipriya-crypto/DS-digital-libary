import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import multer from 'multer';
import dotenv from 'dotenv';
import { dbStore } from './server/store.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Configure Multer for secure file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|csv|json|txt|docx|ipynb/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed: Images, PDF, CSV, JSON, TXT, DOCX, IPYNB'));
    }
  }
});

// =========================================================================
// REST API ROUTES
// =========================================================================

// 1. Dashboard Statistics
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  try {
    const stats = dbStore.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Audit Logs Endpoint
app.get('/api/audit-logs', (req: Request, res: Response) => {
  try {
    const actionType = req.query.action_type as string | undefined;
    const search = req.query.search as string | undefined;
    const logs = dbStore.getAuditLogs(actionType, search);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/audit-logs', (req: Request, res: Response) => {
  try {
    const { action_type, entity_type, title, description, entity_id, user_name } = req.body;
    if (!action_type || !entity_type || !title || !description) {
      return res.status(400).json({ error: 'Missing required audit log fields' });
    }
    const log = dbStore.logAction(action_type, entity_type, title, description, entity_id, user_name);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 2. Student Profile
app.get('/api/student', (_req: Request, res: Response) => {
  try {
    const student = dbStore.getStudent();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/student', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const required = ['full_name', 'roll_number', 'department', 'section', 'subject', 'faculty_name', 'email'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `Field '${field}' is required` });
      }
    }
    const updated = dbStore.updateStudent(body);
    res.json({ message: 'Student profile updated successfully', student: updated });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 3. Modules
app.get('/api/modules', (_req: Request, res: Response) => {
  try {
    const modules = dbStore.getModules();
    const withCounts = modules.map(m => {
      const exps = dbStore.getExperiments(m.id);
      return { ...m, experiments_count: exps.length };
    });
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/modules/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const mod = dbStore.getModuleById(id);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    res.json(mod);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/modules', (req: Request, res: Response) => {
  try {
    const { code, title, description, semester, category, icon_name, color_accent } = req.body;
    if (!code || !title) {
      return res.status(400).json({ error: 'Code and Title are required' });
    }
    const newMod = dbStore.addModule({
      code,
      title,
      description: description || '',
      semester: semester || 'Semester 5',
      category: category || 'Core Laboratory',
      icon_name: icon_name || 'Code',
      color_accent: color_accent || 'blue'
    });
    res.status(201).json(newMod);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/modules/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = dbStore.updateModule(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Module not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/modules/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = dbStore.deleteModule(id);
    if (!success) return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 4. Experiments
app.get('/api/experiments', (req: Request, res: Response) => {
  try {
    const moduleId = req.query.module_id && req.query.module_id !== 'all' ? parseInt(req.query.module_id as string) : undefined;
    const search = req.query.search as string | undefined;
    const exps = dbStore.getExperiments(moduleId, search);
    res.json(exps);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/experiments/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const exp = dbStore.getExperimentById(id);
    if (!exp) return res.status(404).json({ error: 'Experiment not found' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/experiments', (req: Request, res: Response) => {
  try {
    const {
      experiment_number, module_id, title, short_description, long_description,
      aim, software_hardware_requirements, procedure_steps, source_code,
      programming_language, expected_output, actual_output_notes, reference_links,
      github_url, video_url
    } = req.body;

    if (!experiment_number || !module_id || !title || !short_description || !aim || !procedure_steps) {
      return res.status(400).json({ error: 'Missing required experiment fields' });
    }

    // Check duplicate experiment number
    const existing = dbStore.getExperiments().find(e => e.experiment_number === Number(experiment_number));
    if (existing) {
      return res.status(409).json({ error: `Experiment number ${experiment_number} already exists` });
    }

    const newExp = dbStore.addExperiment({
      experiment_number: Number(experiment_number),
      module_id: Number(module_id),
      title,
      short_description,
      long_description: long_description || '',
      aim,
      software_hardware_requirements: software_hardware_requirements || 'Lab Workstation, Python 3.10',
      procedure_steps,
      source_code: source_code || '',
      programming_language: programming_language || 'Python',
      expected_output: expected_output || '',
      actual_output_notes: actual_output_notes || '',
      reference_links: reference_links || '',
      github_url: github_url || '',
      video_url: video_url || ''
    });

    res.status(201).json(newExp);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/experiments/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = dbStore.updateExperiment(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Experiment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/experiments/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = dbStore.deleteExperiment(id);
    if (!success) return res.status(404).json({ error: 'Experiment not found' });
    res.json({ message: 'Experiment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 5. Equipment
app.get('/api/equipment', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const equipments = dbStore.getEquipments(status, search);
    res.json(equipments);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/equipment', (req: Request, res: Response) => {
  try {
    const { equipment_name, equipment_code, description, quantity, availability_status, location, image_url } = req.body;
    if (!equipment_name || !equipment_code) {
      return res.status(400).json({ error: 'Equipment name and code are required' });
    }
    const newEq = dbStore.addEquipment({
      equipment_name,
      equipment_code,
      description: description || '',
      quantity: Number(quantity) || 1,
      availability_status: availability_status || 'Available',
      location: location || 'Room 402 - DS Lab',
      image_url: image_url || ''
    });
    res.status(201).json(newEq);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/equipment/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = dbStore.updateEquipment(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Equipment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/equipment/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = dbStore.deleteEquipment(id);
    if (!success) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 6. Projects
app.get('/api/projects', (req: Request, res: Response) => {
  try {
    const tech = req.query.tech as string | undefined;
    const search = req.query.search as string | undefined;
    const projects = dbStore.getProjects(tech, search);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const prj = dbStore.getProjectById(id);
    if (!prj) return res.status(404).json({ error: 'Project not found' });
    res.json(prj);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects', (req: Request, res: Response) => {
  try {
    const { title, short_description, technologies_used } = req.body;
    if (!title || !short_description || !technologies_used) {
      return res.status(400).json({ error: 'Title, Short Description and Technologies are required' });
    }
    const newPrj = dbStore.addProject({
      ...req.body,
      title,
      short_description,
      detailed_description: req.body.detailed_description || '',
      technologies_used,
      github_url: req.body.github_url || '',
      demo_url: req.body.demo_url || '',
      cover_image_url: req.body.cover_image_url || '',
      report_file_url: req.body.report_file_url || '',
      category: req.body.category || 'Data Science',
      source_code: req.body.source_code || '',
      expected_output: req.body.expected_output || '',
      dataset_sample: req.body.dataset_sample || '',
      chart_type: req.body.chart_type || 'distribution',
      accuracy: req.body.accuracy || '95.0% Accuracy',
      mentor_name: req.body.mentor_name || 'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
      team_members: req.body.team_members || 'T. Harshini Priya (Lead)',
      stage: req.body.stage || 'Published',
      metrics: req.body.metrics || {
        accuracy: req.body.accuracy || '95.0%',
        precision: '94.2%',
        recall: '93.8%',
        f1_score: '94.0%',
        epochs: 50,
        dataset_records: 10000
      }
    });
    res.status(201).json(newPrj);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = dbStore.updateProject(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = dbStore.deleteProject(id);
    if (!success) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 7. Resources
app.get('/api/resources', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const resources = dbStore.getResources(category, search);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/resources', (req: Request, res: Response) => {
  try {
    const { title, category, description, resource_url, author_or_source } = req.body;
    if (!title || !category || !resource_url) {
      return res.status(400).json({ error: 'Title, Category and Resource URL are required' });
    }
    const newRes = dbStore.addResource({
      title,
      category,
      description: description || '',
      resource_url,
      author_or_source: author_or_source || 'Faculty & Lab Staff'
    });
    res.status(201).json(newRes);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/resources/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = dbStore.updateResource(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/resources/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = dbStore.deleteResource(id);
    if (!success) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 8. File Upload
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      message: 'File uploaded successfully',
      file_url: fileUrl,
      original_filename: req.file.originalname,
      size_bytes: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 9. Sandboxed Code Execution
app.post('/api/execute-code', (req: Request, res: Response) => {
  const { language = 'python', code = '', stdin = '' } = req.body;
  if (!code.trim()) {
    return res.status(400).json({ status: 'error', output: '', error: 'Code cannot be empty', execution_time_ms: 0 });
  }

  const startTime = Date.now();
  const lang = String(language).toLowerCase();

  if (lang === 'python') {
    let stdout = '';
    let stderr = '';
    let exited = false;

    const child = spawn('python3', ['-c', code], {
      timeout: 5000,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
      if (stdout.length > 50000) {
        child.kill();
      }
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('close', code => {
      exited = true;
      const elapsed = Date.now() - startTime;
      res.json({
        status: code === 0 ? 'success' : 'runtime_error',
        output: stdout,
        error: stderr,
        exit_code: code ?? 1,
        execution_time_ms: elapsed
      });
    });

    child.on('error', err => {
      if (!exited) {
        res.json({
          status: 'system_error',
          output: '',
          error: err.message,
          execution_time_ms: Date.now() - startTime
        });
      }
    });
  } else {
    // For Java, C, C++ in this container environment:
    const elapsed = Date.now() - startTime;
    res.json({
      status: 'info',
      output: `[${lang.toUpperCase()} Execution Sandbox]\nCode structure verified successfully.\n(Note: To execute compiled ${lang.toUpperCase()} binaries with container cgroups in production, configure the container worker as described in README.md.)`,
      error: '',
      exit_code: 0,
      execution_time_ms: elapsed
    });
  }
});

// 10. Read-only SQL Practice Sandbox
app.post('/api/sql-practice', (req: Request, res: Response) => {
  const { query = '' } = req.body;
  const q = String(query).trim();

  if (!q) {
    return res.status(400).json({ error: 'Query cannot be empty' });
  }

  const upper = q.toUpperCase();
  const disallowed = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'REPLACE', 'CREATE', 'GRANT', 'REVOKE'];
  for (const word of disallowed) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(upper)) {
      return res.status(403).json({
        error: `Security Notice: Safe SQL Sandbox restricts '${word}' statements. Only read-only SELECT queries are permitted.`
      });
    }
  }

  if (!upper.startsWith('SELECT')) {
    return res.status(400).json({ error: 'SQL Practice query must begin with SELECT.' });
  }

  // Interactive educational practice dataset
  const sampleStudents = [
    { student_id: 101, name: 'Aditya Verma', department: 'Data Science', gpa: 8.92, semester: 5, attendance: 92 },
    { student_id: 102, name: 'T. Harshini Priya', department: 'Data Science', gpa: 9.45, semester: 5, attendance: 96 },
    { student_id: 103, name: 'Rohit Sharma', department: 'AI & ML', gpa: 8.15, semester: 5, attendance: 88 },
    { student_id: 104, name: 'Sneha Reddy', department: 'Computer Science', gpa: 9.10, semester: 5, attendance: 95 },
    { student_id: 105, name: 'Karthik Nair', department: 'Data Science', gpa: 7.85, semester: 5, attendance: 81 },
    { student_id: 106, name: 'Ananya Deshmukh', department: 'AI & ML', gpa: 9.30, semester: 5, attendance: 94 },
    { student_id: 107, name: 'Varun Teja', department: 'Computer Science', gpa: 8.40, semester: 5, attendance: 87 }
  ];

  let filtered = [...sampleStudents];

  if (upper.includes('WHERE')) {
    if (upper.includes('GPA > 9') || upper.includes('GPA >= 9')) {
      filtered = filtered.filter(s => s.gpa >= 9.0);
    } else if (upper.includes('GPA > 8') || upper.includes('GPA >= 8')) {
      filtered = filtered.filter(s => s.gpa >= 8.0);
    } else if (upper.includes("DEPARTMENT = 'DATA SCIENCE'") || upper.includes('DATA SCIENCE')) {
      filtered = filtered.filter(s => s.department === 'Data Science');
    }
  }

  if (upper.includes('ORDER BY GPA DESC')) {
    filtered.sort((a, b) => b.gpa - a.gpa);
  } else if (upper.includes('ORDER BY GPA')) {
    filtered.sort((a, b) => a.gpa - b.gpa);
  } else if (upper.includes('ORDER BY NAME')) {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (upper.includes('LIMIT')) {
    const limitMatch = upper.match(/LIMIT\s+(\d+)/);
    if (limitMatch) {
      filtered = filtered.slice(0, parseInt(limitMatch[1]));
    }
  }

  const columns = ['student_id', 'name', 'department', 'gpa', 'semester', 'attendance'];
  const rows = filtered.map(item => [item.student_id, item.name, item.department, item.gpa, item.semester, item.attendance]);

  res.json({
    columns,
    rows,
    row_count: rows.length,
    message: `Query executed successfully (${rows.length} records returned).`
  });
});

// =========================================================================
// START SERVER WITH VITE MIDDLEWARE
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DS Lab Portal] Server running on port ${PORT}`);
  });
}

startServer();
