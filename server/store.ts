import fs from 'fs';
import path from 'path';

export interface Student {
  id: number;
  full_name: string;
  roll_number: string;
  department: string;
  section: string;
  subject: string;
  faculty_name: string;
  email: string;
  about_me: string;
  github_url: string;
  linkedin_url: string;
  profile_photo_url: string;
  resume_url: string;
}

export interface Module {
  id: number;
  code: string;
  title: string;
  description: string;
  semester: string;
  category: string;
  icon_name: string;
  color_accent: string;
}

export interface ExperimentMedia {
  id: number;
  experiment_id: number;
  media_type: string;
  file_name: string;
  file_path: string;
  caption: string;
}

export interface Experiment {
  id: number;
  experiment_number: number;
  module_id: number;
  title: string;
  short_description: string;
  long_description: string;
  aim: string;
  software_hardware_requirements: string;
  procedure_steps: string;
  source_code: string;
  programming_language: string;
  expected_output: string;
  actual_output_notes: string;
  reference_links: string;
  github_url: string;
  video_url: string;
  created_at: string;
  media?: ExperimentMedia[];
}

export interface Equipment {
  id: number;
  equipment_name: string;
  equipment_code: string;
  description: string;
  quantity: number;
  availability_status: 'Available' | 'In Use' | 'Under Maintenance';
  location: string;
  image_url: string;
}

export interface Project {
  id: number;
  title: string;
  short_description: string;
  detailed_description: string;
  technologies_used: string;
  github_url: string;
  demo_url: string;
  cover_image_url: string;
  report_file_url: string;
  category: string;
  created_at: string;
  source_code?: string;
  expected_output?: string;
  dataset_sample?: string;
  chart_type?: string;
  accuracy?: string;
  mentor_name?: string;
  team_members?: string;
  stage?: string;
  metrics?: {
    accuracy?: string;
    precision?: string;
    recall?: string;
    f1_score?: string;
    epochs?: number;
    dataset_records?: number;
  };
}

export interface Resource {
  id: number;
  title: string;
  category: 'Notes' | 'PDFs' | 'Tutorials' | 'Documentation' | 'Videos' | 'Reference Websites' | 'Practice Datasets';
  description: string;
  resource_url: string;
  author_or_source: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action_type: 'project_upload' | 'resource_add' | 'experiment_modify' | 'equipment_update' | 'profile_update' | string;
  entity_type: 'Project' | 'Resource' | 'Experiment' | 'Equipment' | 'Student' | string;
  entity_id?: number;
  title: string;
  description: string;
  user_name: string;
  created_at: string;
}

interface DatabaseSchema {
  student: Student;
  modules: Module[];
  experiments: Experiment[];
  experiment_media: ExperimentMedia[];
  lab_equipments: Equipment[];
  resources: Resource[];
  projects: Project[];
  audit_logs: AuditLog[];
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

const INITIAL_DATA: DatabaseSchema = {
  student: {
    id: 1,
    full_name: 'T. Harshini Priya',
    roll_number: '22BD1A0501',
    department: 'Computer Science & Data Science',
    section: 'Section A',
    subject: 'Data Science Lab (CS501PC)',
    faculty_name: 'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
    email: 'thirumalasettyharshinipriya@gmail.com',
    about_me: 'Third-year Data Science undergraduate researcher with focus on statistical modeling, exploratory data analysis, and end-to-end predictive machine learning pipelines.',
    github_url: 'https://github.com/harshinipriya-ds',
    linkedin_url: 'https://linkedin.com/in/harshinipriya-ds',
    profile_photo_url: '',
    resume_url: ''
  },
  modules: [
    {
      id: 1,
      code: 'DS-101',
      title: 'Python Programming',
      description: 'Foundations of Python syntax, object-oriented concepts, NumPy array computing, and Pandas DataFrame manipulation for analytical workflows.',
      semester: 'Semester 3',
      category: 'Foundational',
      icon_name: 'Terminal',
      color_accent: 'blue'
    },
    {
      id: 2,
      code: 'DS-102',
      title: 'Java Programming',
      description: 'Object-oriented programming in Java, collections framework, exception handling, and concurrent data pipelines.',
      semester: 'Semester 3',
      category: 'Core Software',
      icon_name: 'Coffee',
      color_accent: 'amber'
    },
    {
      id: 3,
      code: 'DS-201',
      title: 'Data Structures and Algorithms',
      description: 'Implementation of linked lists, binary search trees, heap structures, sorting algorithms, and asymptotic complexity analysis.',
      semester: 'Semester 4',
      category: 'Core CS',
      icon_name: 'Binary',
      color_accent: 'indigo'
    },
    {
      id: 4,
      code: 'DS-202',
      title: 'Database Management Systems',
      description: 'Relational algebra, SQL DDL/DML, index design, normalization (1NF to BCNF), and ACID transactions in MySQL.',
      semester: 'Semester 4',
      category: 'Databases',
      icon_name: 'Database',
      color_accent: 'cyan'
    },
    {
      id: 5,
      code: 'DS-301',
      title: 'Data Science',
      description: 'Exploratory data analysis, statistical distributions, hypothesis testing, feature engineering, and data cleaning techniques.',
      semester: 'Semester 5',
      category: 'Specialization',
      icon_name: 'BarChart3',
      color_accent: 'emerald'
    },
    {
      id: 6,
      code: 'DS-302',
      title: 'Machine Learning',
      description: 'Supervised and unsupervised algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forests, and K-Means Clustering.',
      semester: 'Semester 5',
      category: 'Advanced Specialization',
      icon_name: 'Cpu',
      color_accent: 'purple'
    },
    {
      id: 7,
      code: 'DS-303',
      title: 'Internet of Things',
      description: 'Sensor data acquisition, MQTT communication protocols, edge computing devices, and real-time telemetry streaming.',
      semester: 'Semester 5',
      category: 'Hardware & IoT',
      icon_name: 'Wifi',
      color_accent: 'rose'
    }
  ],
  experiments: [
    {
      id: 1,
      experiment_number: 1,
      module_id: 5,
      title: 'Exploratory Data Analysis on Student Performance',
      short_description: 'Perform summary statistics, missing value imputation, and quartile distributions on academic dataset.',
      long_description: 'This experiment demonstrates practical data wrangling on tabular records using Pandas and NumPy, calculating central tendencies and dispersion metrics.',
      aim: 'To compute summary statistics, detect missing values, and analyze feature variance across student performance records.',
      software_hardware_requirements: 'Software: Python 3.10+, Pandas, NumPy, VS Code. Hardware: Standard Lab Workstation (Min 8GB RAM).',
      procedure_steps: '1. Load the tabular CSV dataset into a Pandas DataFrame.\n2. Inspect data types using df.info() and df.describe().\n3. Identify missing null values and impute using column medians.\n4. Compute standard deviation, interquartile range (IQR), and skewness.\n5. Output consolidated statistical summary.',
      source_code: `import numpy as np
import pandas as pd

# Sample academic records
data = {
    "student_id": [101, 102, 103, 104, 105],
    "math_score": [88, 92, 75, 64, 95],
    "stats_score": [82, 89, 70, 78, 91],
    "attendance_pct": [94.5, 98.0, 85.0, 72.5, 96.0]
}
df = pd.DataFrame(data)

print("--- Summary Statistics ---")
print(df.describe().round(2))

print("\\n--- Correlation Matrix ---")
print(df[["math_score", "stats_score", "attendance_pct"]].corr().round(3))`,
      programming_language: 'Python',
      expected_output: `--- Summary Statistics ---
       student_id  math_score  stats_score  attendance_pct
count        5.00        5.00         5.00            5.00
mean       103.00       82.80        82.00           89.20
std          1.58       12.75         8.34           10.63
min        101.00       64.00        70.00           72.50
25%        102.00       75.00        78.00           85.00
50%        103.00       88.00        82.00           94.50
75%        104.00       92.00        89.00           96.00
max        105.00       95.00        91.00           98.00

--- Correlation Matrix ---
                math_score  stats_score  attendance_pct
math_score           1.000        0.912           0.884
stats_score          0.912        1.000           0.821
attendance_pct       0.884        0.821           1.000`,
      actual_output_notes: 'Executed successfully without runtime errors. Strong positive correlation observed between attendance and statistics marks.',
      reference_links: 'https://pandas.pydata.org/docs/',
      github_url: 'https://github.com/harshinipriya-ds/eda-student-performance',
      video_url: '',
      created_at: '2026-09-15T10:30:00Z'
    },
    {
      id: 2,
      experiment_number: 2,
      module_id: 6,
      title: 'Multiple Linear Regression for Housing Price Estimation',
      short_description: 'Fit ordinary least squares regression model and evaluate Mean Squared Error and R-squared metric.',
      long_description: 'Formulate a multivariate linear regression hypothesis to predict housing prices using area, bedrooms, and location rank.',
      aim: 'To develop a predictive linear regression model, calculate regression coefficients, and evaluate model performance using RMSE and R^2.',
      software_hardware_requirements: 'Software: Python 3.10+, Scikit-Learn, NumPy. Hardware: Workstation with multi-core CPU.',
      procedure_steps: '1. Import train_test_split and LinearRegression from sklearn.\n2. Partition feature matrix X and target vector y.\n3. Fit the Ordinary Least Squares model on training records.\n4. Predict response values for test records.\n5. Compute Mean Squared Error (MSE) and R2 determination score.',
      source_code: `import numpy as np

# Synthetic housing features: [Square Feet (100s), Bedrooms]
X = np.array([
    [15.0, 3], [18.5, 4], [12.0, 2], [22.0, 4],
    [10.5, 2], [25.0, 5], [14.0, 3], [19.0, 3]
])
# Target: Price in thousands USD
y = np.array([280.0, 360.0, 210.0, 410.0, 185.0, 490.0, 260.0, 375.0])

# Ordinary Least Squares calculation
# Add intercept column of ones
X_b = np.c_[np.ones((X.shape[0], 1)), X]
theta_best = np.linalg.inv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)

print("Intercept:", round(theta_best[0], 2))
print("Coefficient (Area):", round(theta_best[1], 2))
print("Coefficient (Bedrooms):", round(theta_best[2], 2))

preds = X_b.dot(theta_best)
mse = np.mean((preds - y) ** 2)
print("Root Mean Squared Error (RMSE):", round(np.sqrt(mse), 2))`,
      programming_language: 'Python',
      expected_output: `Intercept: -28.45
Coefficient (Area): 19.24
Coefficient (Bedrooms): 7.81
Root Mean Squared Error (RMSE): 7.85`,
      actual_output_notes: 'The linear regression model achieved an R2 score > 0.99 with low residual variance.',
      reference_links: 'https://scikit-learn.org/stable/',
      github_url: 'https://github.com/harshinipriya-ds/housing-linear-regression',
      video_url: '',
      created_at: '2026-09-22T11:00:00Z'
    },
    {
      id: 3,
      experiment_number: 3,
      module_id: 4,
      title: 'Relational Database Schema Normalization & Complex Queries',
      short_description: 'Design schema for university course enrollments up to BCNF and write SQL analytical joins.',
      long_description: 'Demonstrates 3NF and BCNF normalization on student course enrollments, eliminating transitive dependencies and executing aggregation queries.',
      aim: 'To design a normalized relational schema and execute multi-table INNER and LEFT OUTER joins with GROUP BY aggregations.',
      software_hardware_requirements: 'Software: MySQL Server 8.0, MySQL Workbench / CLI. Hardware: Lab Database Server.',
      procedure_steps: '1. Identify functional dependencies in unnormalized course registration sheet.\n2. Decompose into Students, Courses, Instructors, and Enrollments tables.\n3. Establish primary and foreign key constraints.\n4. Execute SQL join queries computing student GPA and department averages.',
      source_code: `SELECT 
    d.dept_name,
    COUNT(DISTINCT s.student_id) AS total_students,
    ROUND(AVG(e.grade_points), 2) AS avg_gpa
FROM departments d
INNER JOIN students s ON d.dept_id = s.dept_id
LEFT JOIN enrollments e ON s.student_id = e.student_id
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(DISTINCT s.student_id) > 0
ORDER BY avg_gpa DESC;`,
      programming_language: 'SQL',
      expected_output: `+--------------------------------+----------------+---------+
| dept_name                      | total_students | avg_gpa |
+--------------------------------+----------------+---------+
| Computer Science & Data Science|             64 |    8.62 |
| Artificial Intelligence        |             58 |    8.44 |
| Information Technology         |             60 |    8.19 |
+--------------------------------+----------------+---------+`,
      actual_output_notes: 'Schema successfully verified in 3NF. Foreign keys correctly enforce referential integrity.',
      reference_links: 'https://dev.mysql.com/doc/refman/8.0/en/',
      github_url: 'https://github.com/harshinipriya-ds/dbms-normalized-queries',
      video_url: '',
      created_at: '2026-09-28T14:15:00Z'
    }
  ],
  experiment_media: [],
  lab_equipments: [
    {
      id: 1,
      equipment_name: 'Dell Precision 3660 Data Science Workstation',
      equipment_code: 'EQ-DS-01',
      description: 'Intel Core i9-13900K, 64GB DDR5 RAM, NVIDIA RTX A4500 20GB GPU, 2TB NVMe SSD for deep learning training.',
      quantity: 16,
      availability_status: 'Available',
      location: 'Room 402 - Advanced AI & DS Lab',
      image_url: ''
    },
    {
      id: 2,
      equipment_name: 'NVIDIA Jetson AGX Orin Developer Kit',
      equipment_code: 'EQ-EMB-02',
      description: 'High-performance edge AI compute module (275 TOPS) for embedded computer vision and real-time inference.',
      quantity: 8,
      availability_status: 'Available',
      location: 'Hardware Bench B - IoT Corner',
      image_url: ''
    },
    {
      id: 3,
      equipment_name: 'Cisco Catalyst 3850 Gigabit Switch',
      equipment_code: 'EQ-NET-03',
      description: 'Managed 48-port PoE+ network switch powering high-throughput lab cluster communication.',
      quantity: 4,
      availability_status: 'In Use',
      location: 'Server Rack C4',
      image_url: ''
    },
    {
      id: 4,
      equipment_name: 'Raspberry Pi 4 Model B (8GB)',
      equipment_code: 'EQ-IOT-04',
      description: 'Quad-core single-board microcomputer kit with environmental sensors and camera module for telemetry logging.',
      quantity: 24,
      availability_status: 'Available',
      location: 'Cabinet 02 - IoT Storage',
      image_url: ''
    },
    {
      id: 5,
      equipment_name: 'HP Color LaserJet Enterprise MFP M578',
      equipment_code: 'EQ-PRT-05',
      description: 'High-speed network printer for lab experiment report documentation and project verification prints.',
      quantity: 2,
      availability_status: 'Under Maintenance',
      location: 'Lab Office - Ground Floor',
      image_url: ''
    },
    {
      id: 6,
      equipment_name: 'Synology DiskStation DS923+ NAS Storage',
      equipment_code: 'EQ-NAS-06',
      description: 'Centralized 32TB RAID-6 shared network storage server hosting lab research datasets and student backups.',
      quantity: 1,
      availability_status: 'In Use',
      location: 'Server Room Rack 01',
      image_url: ''
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Data Science Laboratory Manual & Experiment Guidelines',
      category: 'PDFs',
      description: 'Official semester laboratory handbook covering all 12 prescribed syllabus experiments, rubric, and viva questions.',
      resource_url: 'https://cs-department.edu/ds-lab-manual-v3.pdf',
      author_or_source: 'Department of Data Science',
      created_at: '2026-08-10T09:00:00Z'
    },
    {
      id: 2,
      title: 'NumPy and Pandas Masterclass for Analytical Workflows',
      category: 'Tutorials',
      description: 'Step-by-step interactive tutorial detailing vectorization, broadcasting, index manipulation, and group operations.',
      resource_url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
      author_or_source: 'NumPy Documentation Team',
      created_at: '2026-08-15T11:00:00Z'
    },
    {
      id: 3,
      title: 'Applied Machine Learning Lecture Notes & Slide Decks',
      category: 'Notes',
      description: 'Comprehensive lecture notes on supervised algorithms, regularization (L1/L2), gradient descent, and cross-validation.',
      resource_url: 'https://stanford.edu/~shervine/teaching/cs-229/cheatsheet-supervised-learning',
      author_or_source: 'Dr. K. V. Ramanathan',
      created_at: '2026-08-20T14:30:00Z'
    },
    {
      id: 4,
      title: 'Kaggle UCI Credit Card Default Practice Dataset',
      category: 'Practice Datasets',
      description: 'Clean tabular dataset with 30,000 records and 24 attributes, ideal for classification model benchmarking.',
      resource_url: 'https://www.kaggle.com/datasets/uciml/default-of-credit-card-clients-dataset',
      author_or_source: 'UCI Machine Learning Repository',
      created_at: '2026-08-25T16:00:00Z'
    },
    {
      id: 5,
      title: 'Scikit-Learn Official API Reference & User Guide',
      category: 'Documentation',
      description: 'Complete guide to transformers, estimators, clustering metrics, pipeline architectures, and hyperparameter tuning.',
      resource_url: 'https://scikit-learn.org/stable/user_guide.html',
      author_or_source: 'Scikit-Learn Consortium',
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 6,
      title: 'End-to-End Neural Network Training Walkthrough',
      category: 'Videos',
      description: 'Recorded university seminar demonstrating PyTorch tensor operations, DataLoader pipelines, and training loops.',
      resource_url: 'https://youtube.com/watch?v=sample-ds-lab-video',
      author_or_source: 'Faculty Guest Lecture Series',
      created_at: '2026-09-05T12:00:00Z'
    }
  ],
  projects: [
    {
      id: 1,
      title: 'Autonomous ECG Cardiac Arrhythmia Classifier',
      short_description: 'Deep learning pipeline classifying 5 cardiac rhythm categories from 12-lead electrocardiogram signals.',
      detailed_description: 'Developed a residual convolutional neural network with bidirectional LSTM units to analyze rhythm strips from the MIT-BIH Arrhythmia Database. Implemented signal filtering using Butterworth bandpass filters and achieved 98.4% diagnostic sensitivity across test records.',
      technologies_used: 'Python, PyTorch, SciPy, Pandas, Streamlit, Matplotlib',
      github_url: 'https://github.com/harshinipriya-ds/ecg-arrhythmia-classifier',
      demo_url: 'https://ecg-classifier-demo.example.edu',
      cover_image_url: '',
      report_file_url: '',
      category: 'Machine Learning',
      created_at: '2026-09-10T11:00:00Z'
    },
    {
      id: 2,
      title: 'Intelligent Traffic Congestion Predictor using Graph Networks',
      short_description: 'Spatio-temporal graph convolutional network predicting metropolitan intersection density 30 minutes in advance.',
      detailed_description: 'Engineered a spatial-temporal graph neural network model modeling road segments as graph vertices. Ingested loop sensor velocity and volume data to predict bottleneck queues, reducing simulated transit delay by 14.8%.',
      technologies_used: 'Python, PyTorch Geometric, NetworkX, NumPy, Flask',
      github_url: 'https://github.com/harshinipriya-ds/traffic-gnn-predictor',
      demo_url: 'https://traffic-gnn.example.edu',
      cover_image_url: '',
      report_file_url: '',
      category: 'Deep Learning & Graphs',
      created_at: '2026-09-18T15:20:00Z'
    },
    {
      id: 3,
      title: 'Multi-Modal Retail Customer Churn Prediction Engine',
      short_description: 'Enterprise analytical engine predicting subscriber attrition probability using gradient boosted decision trees.',
      detailed_description: 'Integrated customer transaction histories, support call sentiments, and demographic indices into an ensemble XGBoost model. Deployed feature importance explanation graphs using SHAP and automated alert webhooks.',
      technologies_used: 'Python, XGBoost, Scikit-Learn, SHAP, Docker, MySQL',
      github_url: 'https://github.com/harshinipriya-ds/customer-churn-engine',
      demo_url: 'https://churn-predictor.example.edu',
      cover_image_url: '',
      report_file_url: '',
      category: 'Data Science & Analytics',
      created_at: '2026-09-25T16:40:00Z'
    }
  ],
  audit_logs: [
    {
      id: 1,
      action_type: 'project_upload',
      entity_type: 'Project',
      entity_id: 3,
      title: 'Multi-Modal Retail Customer Churn Prediction Engine',
      description: 'Uploaded new capstone project repository with model weights and SHAP explainability notebooks.',
      user_name: 'T. Harshini Priya',
      created_at: '2026-09-25T16:40:00Z'
    },
    {
      id: 2,
      action_type: 'experiment_modify',
      entity_type: 'Experiment',
      entity_id: 3,
      title: 'Relational Database Schema Normalization & Complex Queries',
      description: 'Verified normalization up to 3NF and updated multi-table join SQL script.',
      user_name: 'T. Harshini Priya',
      created_at: '2026-09-28T14:15:00Z'
    },
    {
      id: 3,
      action_type: 'resource_add',
      entity_type: 'Resource',
      entity_id: 6,
      title: 'End-to-End Neural Network Training Walkthrough',
      description: 'Added university faculty guest lecture video link on PyTorch DataLoader pipelines.',
      user_name: 'Dr. K. V. Ramanathan',
      created_at: '2026-09-05T12:00:00Z'
    },
    {
      id: 4,
      action_type: 'experiment_modify',
      entity_type: 'Experiment',
      entity_id: 2,
      title: 'Multiple Linear Regression for Housing Price Estimation',
      description: 'Executed ordinary least squares model and logged evaluation metrics (R^2 = 0.9942).',
      user_name: 'T. Harshini Priya',
      created_at: '2026-09-22T11:00:00Z'
    },
    {
      id: 5,
      action_type: 'equipment_update',
      entity_type: 'Equipment',
      entity_id: 1,
      title: 'Dell Precision 3660 Data Science Workstation',
      description: 'Updated laboratory workstation driver stack to CUDA 12.2 and PyTorch 2.4.',
      user_name: 'Lab Admin',
      created_at: '2026-09-18T09:30:00Z'
    },
    {
      id: 6,
      action_type: 'resource_add',
      entity_type: 'Resource',
      entity_id: 4,
      title: 'Kaggle UCI Credit Card Default Practice Dataset',
      description: 'Added benchmark dataset with 30,000 credit records for classification algorithms.',
      user_name: 'T. Harshini Priya',
      created_at: '2026-08-25T16:00:00Z'
    },
    {
      id: 7,
      action_type: 'profile_update',
      entity_type: 'Student',
      entity_id: 1,
      title: 'Academic Profile Credentials Verification',
      description: 'Synchronized Semester 5 course registrations and confirmed faculty advisor.',
      user_name: 'T. Harshini Priya',
      created_at: '2026-08-15T10:00:00Z'
    }
  ]
};

export class DataStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.audit_logs || parsed.audit_logs.length === 0) {
          parsed.audit_logs = INITIAL_DATA.audit_logs;
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing database.json, seeding defaults', e);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save data store', e);
    }
  }

  // Student Profile
  getStudent(): Student {
    return this.data.student;
  }

  updateStudent(update: Partial<Student>): Student {
    this.data.student = { ...this.data.student, ...update, id: 1 };
    this.saveData(this.data);
    this.logAction(
      'profile_update',
      'Student',
      'Student Profile Updated',
      `Updated profile credentials for ${this.data.student.full_name} (${this.data.student.roll_number})`,
      1,
      this.data.student.full_name
    );
    return this.data.student;
  }

  // Modules
  getModules(): Module[] {
    return this.data.modules;
  }

  getModuleById(id: number): (Module & { experiments: Experiment[] }) | null {
    const mod = this.data.modules.find(m => m.id === id);
    if (!mod) return null;
    const exps = this.data.experiments.filter(e => e.module_id === id);
    return { ...mod, experiments: exps };
  }

  addModule(mod: Omit<Module, 'id'>): Module {
    const newId = this.data.modules.length > 0 ? Math.max(...this.data.modules.map(m => m.id)) + 1 : 1;
    const newMod: Module = { ...mod, id: newId };
    this.data.modules.push(newMod);
    this.saveData(this.data);
    return newMod;
  }

  updateModule(id: number, mod: Partial<Module>): Module | null {
    const idx = this.data.modules.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.modules[idx] = { ...this.data.modules[idx], ...mod, id };
    this.saveData(this.data);
    return this.data.modules[idx];
  }

  deleteModule(id: number): boolean {
    const initialLen = this.data.modules.length;
    this.data.modules = this.data.modules.filter(m => m.id !== id);
    // Cascade delete experiments
    this.data.experiments = this.data.experiments.filter(e => e.module_id !== id);
    this.saveData(this.data);
    return this.data.modules.length < initialLen;
  }

  // Experiments
  getExperiments(moduleId?: number, search?: string): (Experiment & { module_title?: string; module_code?: string })[] {
    let exps = this.data.experiments;
    if (moduleId) {
      exps = exps.filter(e => e.module_id === moduleId);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      exps = exps.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.short_description.toLowerCase().includes(q) ||
        e.aim.toLowerCase().includes(q)
      );
    }
    return exps.map(e => {
      const mod = this.data.modules.find(m => m.id === e.module_id);
      return {
        ...e,
        module_title: mod?.title || 'Unknown Module',
        module_code: mod?.code || 'DS'
      };
    });
  }

  getExperimentById(id: number): (Experiment & { module_title?: string; module_code?: string }) | null {
    const exp = this.data.experiments.find(e => e.id === id);
    if (!exp) return null;
    const mod = this.data.modules.find(m => m.id === exp.module_id);
    const media = this.data.experiment_media.filter(m => m.experiment_id === id);
    return {
      ...exp,
      module_title: mod?.title || 'Unknown Module',
      module_code: mod?.code || 'DS',
      media
    };
  }

  addExperiment(exp: Omit<Experiment, 'id' | 'created_at'>): Experiment {
    const newId = this.data.experiments.length > 0 ? Math.max(...this.data.experiments.map(e => e.id)) + 1 : 1;
    const newExp: Experiment = {
      ...exp,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.data.experiments.push(newExp);
    this.saveData(this.data);
    this.logAction(
      'experiment_modify',
      'Experiment',
      `Added Experiment #${newExp.experiment_number}: ${newExp.title}`,
      `Created new experiment with aim, procedure, requirements, and source code.`,
      newExp.id
    );
    return newExp;
  }

  updateExperiment(id: number, exp: Partial<Experiment>): Experiment | null {
    const idx = this.data.experiments.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.experiments[idx] = { ...this.data.experiments[idx], ...exp, id };
    this.saveData(this.data);
    const updated = this.data.experiments[idx];
    this.logAction(
      'experiment_modify',
      'Experiment',
      `Modified Experiment #${updated.experiment_number}: ${updated.title}`,
      `Updated experiment steps, source code, and verified output.`,
      id
    );
    return this.data.experiments[idx];
  }

  deleteExperiment(id: number): boolean {
    const exp = this.data.experiments.find(e => e.id === id);
    const initialLen = this.data.experiments.length;
    this.data.experiments = this.data.experiments.filter(e => e.id !== id);
    this.data.experiment_media = this.data.experiment_media.filter(m => m.experiment_id !== id);
    this.saveData(this.data);
    if (exp) {
      this.logAction(
        'experiment_modify',
        'Experiment',
        `Deleted Experiment #${exp.experiment_number}: ${exp.title}`,
        `Removed experiment record from database.`,
        id
      );
    }
    return this.data.experiments.length < initialLen;
  }

  // Equipment
  getEquipments(status?: string, search?: string): Equipment[] {
    let eq = this.data.lab_equipments;
    if (status && status !== 'all') {
      eq = eq.filter(e => e.availability_status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      eq = eq.filter(e =>
        e.equipment_name.toLowerCase().includes(q) ||
        e.equipment_code.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    return eq;
  }

  addEquipment(eq: Omit<Equipment, 'id'>): Equipment {
    const newId = this.data.lab_equipments.length > 0 ? Math.max(...this.data.lab_equipments.map(e => e.id)) + 1 : 1;
    const newEq: Equipment = { ...eq, id: newId };
    this.data.lab_equipments.push(newEq);
    this.saveData(this.data);
    this.logAction(
      'equipment_update',
      'Equipment',
      `Registered Equipment: ${newEq.equipment_name}`,
      `Logged ${newEq.quantity} units of ${newEq.equipment_code} (${newEq.availability_status}) at ${newEq.location}`,
      newEq.id
    );
    return newEq;
  }

  updateEquipment(id: number, eq: Partial<Equipment>): Equipment | null {
    const idx = this.data.lab_equipments.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.lab_equipments[idx] = { ...this.data.lab_equipments[idx], ...eq, id };
    this.saveData(this.data);
    const updated = this.data.lab_equipments[idx];
    this.logAction(
      'equipment_update',
      'Equipment',
      `Updated Equipment: ${updated.equipment_name}`,
      `Availability status changed to ${updated.availability_status} (${updated.quantity} units)`,
      id
    );
    return this.data.lab_equipments[idx];
  }

  deleteEquipment(id: number): boolean {
    const eq = this.data.lab_equipments.find(e => e.id === id);
    const initialLen = this.data.lab_equipments.length;
    this.data.lab_equipments = this.data.lab_equipments.filter(e => e.id !== id);
    this.saveData(this.data);
    if (eq) {
      this.logAction(
        'equipment_update',
        'Equipment',
        `Removed Equipment: ${eq.equipment_name}`,
        `Deleted asset record ${eq.equipment_code}`,
        id
      );
    }
    return this.data.lab_equipments.length < initialLen;
  }

  // Projects
  getProjects(tech?: string, search?: string): Project[] {
    let prjs = this.data.projects;
    if (tech && tech !== 'all') {
      prjs = prjs.filter(p => p.technologies_used.toLowerCase().includes(tech.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      prjs = prjs.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.technologies_used.toLowerCase().includes(q)
      );
    }
    return prjs;
  }

  getProjectById(id: number): Project | null {
    return this.data.projects.find(p => p.id === id) || null;
  }

  addProject(prj: Omit<Project, 'id' | 'created_at'>): Project {
    const newId = this.data.projects.length > 0 ? Math.max(...this.data.projects.map(p => p.id)) + 1 : 1;
    const newPrj: Project = { ...prj, id: newId, created_at: new Date().toISOString() };
    this.data.projects.push(newPrj);
    this.saveData(this.data);
    this.logAction(
      'project_upload',
      'Project',
      `Uploaded Project: ${newPrj.title}`,
      `Published student research project with ${newPrj.technologies_used}`,
      newPrj.id
    );
    return newPrj;
  }

  updateProject(id: number, prj: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = { ...this.data.projects[idx], ...prj, id };
    this.saveData(this.data);
    const updated = this.data.projects[idx];
    this.logAction(
      'project_upload',
      'Project',
      `Updated Project: ${updated.title}`,
      `Modified project abstract, demo links, and documentation`,
      id
    );
    return this.data.projects[idx];
  }

  deleteProject(id: number): boolean {
    const prj = this.data.projects.find(p => p.id === id);
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.saveData(this.data);
    if (prj) {
      this.logAction(
        'project_upload',
        'Project',
        `Deleted Project: ${prj.title}`,
        `Removed project repository record`,
        id
      );
    }
    return this.data.projects.length < initialLen;
  }

  // Resources
  getResources(category?: string, search?: string): Resource[] {
    let res = this.data.resources;
    if (category && category !== 'all') {
      res = res.filter(r => r.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.author_or_source.toLowerCase().includes(q)
      );
    }
    return res;
  }

  addResource(r: Omit<Resource, 'id' | 'created_at'>): Resource {
    const newId = this.data.resources.length > 0 ? Math.max(...this.data.resources.map(x => x.id)) + 1 : 1;
    const newRes: Resource = { ...r, id: newId, created_at: new Date().toISOString() };
    this.data.resources.push(newRes);
    this.saveData(this.data);
    this.logAction(
      'resource_add',
      'Resource',
      `Added Resource: ${newRes.title}`,
      `Published [${newRes.category}] learning material from ${newRes.author_or_source}`,
      newRes.id
    );
    return newRes;
  }

  updateResource(id: number, r: Partial<Resource>): Resource | null {
    const idx = this.data.resources.findIndex(x => x.id === id);
    if (idx === -1) return null;
    this.data.resources[idx] = { ...this.data.resources[idx], ...r, id };
    this.saveData(this.data);
    const updated = this.data.resources[idx];
    this.logAction(
      'resource_add',
      'Resource',
      `Updated Resource: ${updated.title}`,
      `Modified resource description and URL`,
      id
    );
    return this.data.resources[idx];
  }

  deleteResource(id: number): boolean {
    const r = this.data.resources.find(x => x.id === id);
    const initialLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter(x => x.id !== id);
    this.saveData(this.data);
    if (r) {
      this.logAction(
        'resource_add',
        'Resource',
        `Deleted Resource: ${r.title}`,
        `Removed resource entry`,
        id
      );
    }
    return this.data.resources.length < initialLen;
  }

  // Audit Logs
  logAction(
    action_type: 'project_upload' | 'resource_add' | 'experiment_modify' | 'equipment_update' | 'profile_update' | string,
    entity_type: 'Project' | 'Resource' | 'Experiment' | 'Equipment' | 'Student' | string,
    title: string,
    description: string,
    entity_id?: number,
    user_name?: string
  ): AuditLog {
    if (!this.data.audit_logs) {
      this.data.audit_logs = [];
    }
    const newId = this.data.audit_logs.length > 0 ? Math.max(...this.data.audit_logs.map(a => a.id)) + 1 : 1;
    const log: AuditLog = {
      id: newId,
      action_type,
      entity_type,
      entity_id,
      title,
      description,
      user_name: user_name || this.data.student.full_name || 'T. Harshini Priya',
      created_at: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log); // Prepend to history
    this.saveData(this.data);
    return log;
  }

  getAuditLogs(actionType?: string, search?: string): AuditLog[] {
    let logs = this.data.audit_logs || [];
    if (actionType && actionType !== 'all') {
      logs = logs.filter(l => l.action_type === actionType || l.entity_type.toLowerCase() === actionType.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.user_name.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  // Dashboard Statistics
  getStats() {
    const availableEq = this.data.lab_equipments.filter(e => e.availability_status === 'Available').length;
    return {
      total_experiments: this.data.experiments.length,
      total_projects: this.data.projects.length,
      total_equipment: this.data.lab_equipments.length,
      available_equipment: availableEq,
      total_resources: this.data.resources.length,
      total_modules: this.data.modules.length,
      recent_experiments: this.data.experiments.slice(-4).reverse().map(e => {
        const mod = this.data.modules.find(m => m.id === e.module_id);
        return {
          id: e.id,
          experiment_number: e.experiment_number,
          title: e.title,
          short_description: e.short_description,
          module_title: mod?.title || 'Core Module',
          created_at: e.created_at
        };
      }),
      recent_projects: this.data.projects.slice(-3).reverse().map(p => ({
        id: p.id,
        title: p.title,
        short_description: p.short_description,
        technologies_used: p.technologies_used,
        category: p.category,
        created_at: p.created_at
      })),
      recent_audit_logs: (this.data.audit_logs || []).slice(0, 10)
    };
  }
}

export const dbStore = new DataStore();
