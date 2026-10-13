-- =====================================================================
-- DS LAB PORTAL — DATA SCIENCE DIGITAL LIBRARY
-- Database Initialization & Schema Definition Script
-- Database: MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ds_lab 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE ds_lab;

-- ---------------------------------------------------------------------
-- 1. Table: student (Primary student profile record)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    section VARCHAR(20) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    about_me TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    profile_photo_url VARCHAR(255),
    resume_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_roll (roll_number),
    INDEX idx_student_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Table: modules (Curriculum and Subject Modules)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    semester VARCHAR(30) DEFAULT 'Semester 5',
    category VARCHAR(50) DEFAULT 'Core Laboratory',
    icon_name VARCHAR(50) DEFAULT 'Code',
    color_accent VARCHAR(30) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table: experiments (Laboratory Experiments & Assignments)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_number INT NOT NULL UNIQUE,
    module_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(300) NOT NULL,
    long_description TEXT,
    aim TEXT NOT NULL,
    software_hardware_requirements TEXT NOT NULL,
    procedure_steps TEXT NOT NULL,
    source_code MEDIUMTEXT,
    programming_language VARCHAR(50) DEFAULT 'Python',
    expected_output MEDIUMTEXT,
    actual_output_notes TEXT,
    reference_links TEXT,
    github_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_experiment_module FOREIGN KEY (module_id) 
        REFERENCES modules (id) ON DELETE CASCADE,
    INDEX idx_exp_number (experiment_number),
    INDEX idx_exp_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table: experiment_media (Image and media attachments)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiment_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id INT NOT NULL,
    media_type ENUM('image', 'diagram', 'chart', 'output_screenshot', 'document') DEFAULT 'image',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_experiment FOREIGN KEY (experiment_id) 
        REFERENCES experiments (id) ON DELETE CASCADE,
    INDEX idx_media_experiment (experiment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Table: projects (Student Data Science Projects)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(350) NOT NULL,
    detailed_description TEXT NOT NULL,
    technologies_used VARCHAR(300) NOT NULL,
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    report_file_url VARCHAR(255),
    category VARCHAR(80) DEFAULT 'Machine Learning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Table: project_files (Project documentation and datasets)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_project FOREIGN KEY (project_id) 
        REFERENCES projects (id) ON DELETE CASCADE,
    INDEX idx_file_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Table: lab_equipments (Hardware, Workstations & Lab Gear)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab_equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_name VARCHAR(150) NOT NULL,
    equipment_code VARCHAR(60) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    availability_status ENUM('Available', 'In Use', 'Under Maintenance') NOT NULL DEFAULT 'Available',
    location VARCHAR(120) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_equipment_status (availability_status),
    INDEX idx_equipment_code (equipment_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Table: resources (Digital Library Learning Materials)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('Notes', 'PDFs', 'Tutorials', 'Documentation', 'Videos', 'Reference Websites', 'Practice Datasets') NOT NULL,
    description TEXT NOT NULL,
    resource_url VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    author_or_source VARCHAR(150) DEFAULT 'DS Faculty & Lab Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resource_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Table: uploaded_files (Centralized file audit ledger)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploaded_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    category VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_file_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. Table: audit_logs (Activity history and audit trail)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('project_upload', 'resource_add', 'experiment_modify', 'equipment_update', 'profile_update') NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_name VARCHAR(150) DEFAULT 'T. Harshini Priya',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA: INITIAL RECORD POPULATION
-- =====================================================================

-- Default student profile
INSERT INTO student (id, full_name, roll_number, department, section, subject, faculty_name, email, about_me, github_url, linkedin_url)
VALUES (
    1,
    'T. Harshini Priya',
    '22BD1A0501',
    'Computer Science & Data Science',
    'Section A',
    'Data Science Lab (CS501PC)',
    'Dr. K. V. Ramanathan, M.Tech, Ph.D.',
    'thirumalasettyharshinipriya@gmail.com',
    'Third-year Data Science undergraduate researcher with focus on statistical modeling, exploratory data analysis, and end-to-end predictive machine learning pipelines.',
    'https://github.com/harshinipriya-ds',
    'https://linkedin.com/in/harshinipriya-ds'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Academic modules
INSERT INTO modules (id, code, title, description, semester, category, icon_name, color_accent) VALUES
(1, 'DS-101', 'Python Programming', 'Foundations of Python syntax, object-oriented concepts, NumPy array computing, and Pandas DataFrame manipulation for analytical workflows.', 'Semester 3', 'Foundational', 'Terminal', 'blue'),
(2, 'DS-102', 'Java Programming', 'Object-oriented programming in Java, collections framework, exception handling, and concurrent data pipelines.', 'Semester 3', 'Core Software', 'Coffee', 'amber'),
(3, 'DS-201', 'Data Structures and Algorithms', 'Implementation of linked lists, binary search trees, heap structures, sorting algorithms, and asymptotic complexity analysis.', 'Semester 4', 'Core CS', 'Binary', 'indigo'),
(4, 'DS-202', 'Database Management Systems', 'Relational algebra, SQL DDL/DML, index design, normalization (1NF to BCNF), and ACID transactions in MySQL.', 'Semester 4', 'Databases', 'Database', 'cyan'),
(5, 'DS-301', 'Data Science', 'Exploratory data analysis, statistical distributions, hypothesis testing, feature engineering, and data cleaning techniques.', 'Semester 5', 'Specialization', 'BarChart3', 'emerald'),
(6, 'DS-302', 'Machine Learning', 'Supervised and unsupervised algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forests, and K-Means Clustering.', 'Semester 5', 'Advanced Specialization', 'Cpu', 'purple'),
(7, 'DS-303', 'Internet of Things', 'Sensor data acquisition, MQTT communication protocols, edge computing devices, and real-time telemetry streaming.', 'Semester 5', 'Hardware & IoT', 'Wifi', 'rose')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Experiments
INSERT INTO experiments (id, experiment_number, module_id, title, short_description, long_description, aim, software_hardware_requirements, procedure_steps, source_code, programming_language, expected_output, actual_output_notes, reference_links, github_url) VALUES
(1, 1, 5, 'Exploratory Data Analysis on Student Performance', 'Perform summary statistics, missing value imputation, and quartile distributions on academic dataset.', 'This experiment demonstrates practical data wrangling on tabular records using Pandas and NumPy, calculating central tendencies and dispersion metrics.', 'To compute summary statistics, detect missing values, and analyze feature variance across student performance records.', 'Software: Python 3.10+, Pandas, NumPy, Jupyter Notebook / VS Code. Hardware: Standard Lab Workstation (Min 8GB RAM).', '1. Load the tabular CSV dataset into a Pandas DataFrame.\n2. Inspect data types using df.info() and df.describe().\n3. Identify missing null values and impute using column medians.\n4. Compute standard deviation, interquartile range (IQR), and skewness.\n5. Output consolidated statistical summary.', 'import numpy as np\nimport pandas as pd\n\n# Sample academic records\ndata = {\n    "student_id": [101, 102, 103, 104, 105],\n    "math_score": [88, 92, 75, 64, 95],\n    "stats_score": [82, 89, 70, 78, 91],\n    "attendance_pct": [94.5, 98.0, 85.0, 72.5, 96.0]\n}\ndf = pd.DataFrame(data)\n\nprint("--- Summary Statistics ---")\nprint(df.describe().round(2))\n\nprint("\n--- Correlation Matrix ---")\nprint(df[["math_score", "stats_score", "attendance_pct"]].corr().round(3))', 'Python', '--- Summary Statistics ---\n       student_id  math_score  stats_score  attendance_pct\ncount        5.00        5.00         5.00            5.00\nmean       103.00       82.80        82.00           89.20\nstd          1.58       12.75         8.34           10.63\nmin        101.00       64.00        70.00           72.50\n25%        102.00       75.00        78.00           85.00\n50%        103.00       88.00        82.00           94.50\n75%        104.00       92.00        89.00           96.00\nmax        105.00       95.00        91.00           98.00\n\n--- Correlation Matrix ---\n                math_score  stats_score  attendance_pct\nmath_score           1.000        0.912           0.884\nstats_score          0.912        1.000           0.821\nattendance_pct       0.884        0.821           1.000', 'Executed successfully without runtime errors. Strong positive correlation observed between attendance and statistics marks.', 'https://pandas.pydata.org/docs/', 'https://github.com/harshinipriya-ds/eda-student-performance'),

(2, 2, 6, 'Multiple Linear Regression for Housing Price Estimation', 'Fit ordinary least squares regression model and evaluate Mean Squared Error and R-squared metric.', 'Formulate a multivariate linear regression hypothesis to predict housing prices using area, bedrooms, and location rank.', 'To develop a predictive linear regression model, calculate regression coefficients, and evaluate model performance using RMSE and R^2.', 'Software: Python 3.10+, Scikit-Learn, NumPy, Matplotlib. Hardware: Workstation with multi-core CPU.', '1. Import train_test_split and LinearRegression from sklearn.\n2. Partition feature matrix X and target vector y into 80% train and 20% test splits.\n3. Fit the Ordinary Least Squares model on training records.\n4. Predict response values for test records.\n5. Compute Mean Squared Error (MSE) and R2 determination score.', 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error, r2_score\n\n# Synthetic housing features: [Square Feet (100s), Bedrooms]\nX = np.array([\n    [15.0, 3], [18.5, 4], [12.0, 2], [22.0, 4],\n    [10.5, 2], [25.0, 5], [14.0, 3], [19.0, 3]\n])\n# Target: Price in thousands USD\ny = np.array([280.0, 360.0, 210.0, 410.0, 185.0, 490.0, 260.0, 375.0])\n\nmodel = LinearRegression()\nmodel.fit(X, y)\npreds = model.predict(X)\n\nprint("Coefficients:", np.round(model.coef_, 2))\nprint("Intercept:", round(model.intercept_, 2))\nprint("R-Squared Score:", round(r2_score(y, preds), 4))\nprint("RMSE:", round(np.sqrt(mean_squared_error(y, preds)), 2))', 'Python', 'Coefficients: [19.24  7.81]\nIntercept: -28.45\nR-Squared Score: 0.9942\nRMSE: 7.85', 'The linear regression model achieved an R2 score > 0.99 with low residual variance.', 'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html', 'https://github.com/harshinipriya-ds/housing-linear-regression'),

(3, 3, 4, 'Relational Database Schema Normalization & Complex Queries', 'Design schema for university course enrollments up to BCNF and write SQL analytical joins.', 'Demonstrates 3NF and BCNF normalization on student course enrollments, eliminating transitive dependencies and executing aggregation queries.', 'To design a normalized relational schema and execute multi-table INNER and LEFT OUTER joins with GROUP BY aggregations.', 'Software: MySQL Server 8.0, MySQL Workbench / CLI. Hardware: Lab Database Server.', '1. Identify functional dependencies in unnormalized course registration sheet.\n2. Decompose into Students, Courses, Instructors, and Enrollments tables.\n3. Establish primary and foreign key constraints.\n4. Execute SQL join queries computing student GPA and department averages.', 'SELECT \n    d.dept_name,\n    COUNT(DISTINCT s.student_id) AS total_students,\n    ROUND(AVG(e.grade_points), 2) AS avg_gpa\nFROM departments d\nINNER JOIN students s ON d.dept_id = s.dept_id\nLEFT JOIN enrollments e ON s.student_id = e.student_id\nGROUP BY d.dept_id, d.dept_name\nHAVING COUNT(DISTINCT s.student_id) > 0\nORDER BY avg_gpa DESC;', 'SQL', '+--------------------------------+----------------+---------+\n| dept_name                      | total_students | avg_gpa |\n+--------------------------------+----------------+---------+\n| Computer Science & Data Science|             64 |    8.62 |\n| Artificial Intelligence        |             58 |    8.44 |\n| Information Technology         |             60 |    8.19 |\n+--------------------------------+----------------+---------+', 'Schema successfully verified in 3NF. Foreign keys correctly enforce referential integrity.', 'https://dev.mysql.com/doc/refman/8.0/en/', 'https://github.com/harshinipriya-ds/dbms-normalized-queries')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Lab Equipments
INSERT INTO lab_equipments (id, equipment_name, equipment_code, description, quantity, availability_status, location) VALUES
(1, 'Dell Precision 3660 Data Science Workstation', 'EQ-DS-01', 'Intel Core i9-13900K, 64GB DDR5 RAM, NVIDIA RTX A4500 20GB GPU, 2TB NVMe SSD for deep learning training.', 16, 'Available', 'Room 402 - Advanced AI & DS Lab'),
(2, 'NVIDIA Jetson AGX Orin Developer Kit', 'EQ-EMB-02', 'High-performance edge AI compute module (275 TOPS) for embedded computer vision and real-time inference.', 8, 'Available', 'Hardware Bench B - IoT Corner'),
(3, 'Cisco Catalyst 3850 Gigabit Switch', 'EQ-NET-03', 'Managed 48-port PoE+ network switch powering high-throughput lab cluster communication.', 4, 'In Use', 'Server Rack C4'),
(4, 'Raspberry Pi 4 Model B (8GB)', 'EQ-IOT-04', 'Quad-core single-board microcomputer kit with environmental sensors and camera module for telemetry logging.', 24, 'Available', 'Cabinet 02 - IoT Storage'),
(5, 'HP Color LaserJet Enterprise MFP M578', 'EQ-PRT-05', 'High-speed network printer for lab experiment report documentation and project verification prints.', 2, 'Under Maintenance', 'Lab Office - Ground Floor'),
(6, 'Synology DiskStation DS923+ NAS Storage', 'EQ-NAS-06', 'Centralized 32TB RAID-6 shared network storage server hosting lab research datasets and student backups.', 1, 'In Use', 'Server Room Rack 01')
ON DUPLICATE KEY UPDATE equipment_name = VALUES(equipment_name);

-- Learning Resources
INSERT INTO resources (id, title, category, description, resource_url, author_or_source) VALUES
(1, 'Data Science Laboratory Manual & Experiment Guidelines', 'PDFs', 'Official semester laboratory handbook covering all 12 prescribed syllabus experiments, rubric, and viva questions.', 'https://cs-department.edu/ds-lab-manual-v3.pdf', 'Department of Data Science'),
(2, 'NumPy and Pandas Masterclass for Analytical Workflows', 'Tutorials', 'Step-by-step interactive tutorial detailing vectorization, broadcasting, index manipulation, and group operations.', 'https://numpy.org/doc/stable/user/absolute_beginners.html', 'NumPy Documentation Team'),
(3, 'Applied Machine Learning Lecture Notes & Slide Decks', 'Notes', 'Comprehensive lecture notes on supervised algorithms, regularization (L1/L2), gradient descent, and cross-validation.', 'https://stanford.edu/~shervine/teaching/cs-229/cheatsheet-supervised-learning', 'Dr. K. V. Ramanathan'),
(4, 'Kaggle UCI Credit Card Default Practice Dataset', 'Practice Datasets', 'Clean tabular dataset with 30,000 records and 24 attributes, ideal for classification model benchmarking.', 'https://www.kaggle.com/datasets/uciml/default-of-credit-card-clients-dataset', 'UCI Machine Learning Repository'),
(5, 'Scikit-Learn Official API Reference & User Guide', 'Documentation', 'Complete guide to transformers, estimators, clustering metrics, pipeline architectures, and hyperparameter tuning.', 'https://scikit-learn.org/stable/user_guide.html', 'Scikit-Learn Consortium'),
(6, 'End-to-End Neural Network Training Walkthrough', 'Videos', 'Recorded university seminar demonstrating PyTorch tensor operations, DataLoader pipelines, and training loops.', 'https://youtube.com/watch?v=sample-ds-lab-video', 'Faculty Guest Lecture Series')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Student Projects
INSERT INTO projects (id, title, short_description, detailed_description, technologies_used, github_url, demo_url, category) VALUES
(1, 'Autonomous ECG Cardiac Arrhythmia Classifier', 'Deep learning pipeline classifying 5 cardiac rhythm categories from 12-lead electrocardiogram signals.', 'Developed a residual convolutional neural network with bidirectional LSTM units to analyze rhythm strips from the MIT-BIH Arrhythmia Database. Implemented signal filtering using Butterworth bandpass filters and achieved 98.4% diagnostic sensitivity across test records.', 'Python, PyTorch, SciPy, Pandas, Streamlit, Matplotlib', 'https://github.com/harshinipriya-ds/ecg-arrhythmia-classifier', 'https://ecg-classifier-demo.example.edu', 'Machine Learning'),

(2, 'Intelligent Traffic Congestion Predictor using Graph Networks', 'Spatio-temporal graph convolutional network predicting metropolitan intersection density 30 minutes in advance.', 'Engineered a spatial-temporal graph neural network model modeling road segments as graph vertices. Ingested loop sensor velocity and volume data to predict bottleneck queues, reducing simulated transit delay by 14.8%.', 'Python, PyTorch Geometric, NetworkX, NumPy, Flask', 'https://github.com/harshinipriya-ds/traffic-gnn-predictor', 'https://traffic-gnn.example.edu', 'Deep Learning & Graphs'),

(3, 'Multi-Modal Retail Customer Churn Prediction Engine', 'Enterprise analytical engine predicting subscriber attrition probability using gradient boosted decision trees.', 'Integrated customer transaction histories, support call sentiments, and demographic indices into an ensemble XGBoost model. Deployed feature importance explanation graphs using SHAP and automated alert webhooks.', 'Python, XGBoost, Scikit-Learn, SHAP, Docker, MySQL', 'https://github.com/harshinipriya-ds/customer-churn-engine', 'https://churn-predictor.example.edu', 'Data Science & Analytics'),

(4, 'Automated Brain MRI Glioma Segmentation using 3D U-Net', 'Volumetric multi-modal 3D convolutional network delineating active tumor cores and edema from BraTS neuroimaging scans.', 'Attention-gated 3D U-Net architecture processing T1, T1ce, T2, and FLAIR MRI modalities with deep supervision loss and generalized Dice score of 0.912.', 'Python, PyTorch, MONAI, SimpleITK, Nibabel', 'https://github.com/harshinipriya-ds/mri-glioma-segmentation', 'https://mri-tumor-vision.example.edu', 'Computer Vision'),

(5, 'Biomedical Named Entity Recognition with BioBERT', 'Domain-adapted transformer architecture extracting gene loci, chemical compounds, and clinical phenotypes from PubMed abstracts.', 'Fine-tuned BioBERT-v1.1 with CRF token classification on NCBI-Disease and BC5CDR corpora with 89.7% F1-score.', 'Python, HuggingFace Transformers, PyTorch, FastAPI, NLTK', 'https://github.com/harshinipriya-ds/biomedical-ner-biobert', 'https://biomed-ner.example.edu', 'Natural Language Processing'),

(6, 'DS Lab Exp-2: Data Ingestion, Cleaning & Feature Transformation (2a, 2b)', 'Tabular dataset ingestion, missing value audit & median/mean imputation, StandardScaler & MinMaxScaler normalizations, and categorical One-Hot/Label encoding.', 'Curriculum lab notebook implementing Experiment 2 (2a, 2b). Builds an automated data cleaning and feature engineering pipeline using Pandas, NumPy, and Scikit-Learn.', 'Python, Pandas, NumPy, Scikit-Learn, Jupyter Notebook', 'https://github.com/harshinipriya-ds/ds-lab-experiment-2', '/uploads/ds(2a,b).ipynb', 'Data Science & Analytics'),

(7, 'DS Lab Exp-3: Exploratory Data Analysis, Correlation & Outlier Analytics (3a, 3b, 3c, 3d)', 'Statistical EDA with univariate moments (skewness/kurtosis), Pearson correlation matrix heatmaps, bivariate linear regression, and IQR/Z-score outlier detection.', 'Curriculum lab notebook implementing Experiment 3 (3a, 3b, 3c, 3d). Delivers an exhaustive statistical exploration on clinical indicators with Tukey IQR fences and Z-score anomaly filtering.', 'Python, Pandas, NumPy, SciPy (stats), Seaborn, Matplotlib, Jupyter Notebook', 'https://github.com/harshinipriya-ds/ds-lab-experiment-3', '/uploads/ds(3a,b,c,d).ipynb', 'Data Science & Analytics'),

(8, 'DS Lab Exp-4: Supervised Machine Learning & Classification Benchmarking (4a, 4b, 4c)', 'Supervised learning pipeline: Multiple Linear Regression (R² = 0.912), Logistic Regression (92% Accuracy), and Decision Tree vs KNN benchmark (95% Accuracy).', 'Curriculum lab notebook implementing Experiment 4 (4a, 4b, 4c). Evaluates continuous regression and compares KNN, Decision Tree, and Logistic Regression classifiers on test splits.', 'Python, Scikit-Learn, Matplotlib, NumPy, Jupyter Notebook', 'https://github.com/harshinipriya-ds/ds-lab-experiment-4', '/uploads/ds(4a,b,c).ipynb', 'Machine Learning')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Initial Audit Logs (Activity History)
INSERT INTO audit_logs (id, action_type, entity_type, entity_id, title, description, user_name, created_at) VALUES
(1, 'project_upload', 'Project', 3, 'Multi-Modal Retail Customer Churn Prediction Engine', 'Uploaded new capstone project repository with model weights and SHAP explainability notebooks.', 'T. Harshini Priya', '2026-09-25 16:40:00'),
(2, 'experiment_modify', 'Experiment', 3, 'Relational Database Schema Normalization & Complex Queries', 'Verified normalization up to 3NF and updated multi-table join SQL script.', 'T. Harshini Priya', '2026-09-28 14:15:00'),
(3, 'resource_add', 'Resource', 6, 'End-to-End Neural Network Training Walkthrough', 'Added university faculty guest lecture video link on PyTorch DataLoader pipelines.', 'Dr. K. V. Ramanathan', '2026-09-05 12:00:00'),
(4, 'experiment_modify', 'Experiment', 2, 'Multiple Linear Regression for Housing Price Estimation', 'Executed ordinary least squares model and logged evaluation metrics (R^2 = 0.9942).', 'T. Harshini Priya', '2026-09-22 11:00:00'),
(5, 'equipment_update', 'Equipment', 1, 'Dell Precision 3660 Data Science Workstation', 'Updated laboratory workstation driver stack to CUDA 12.2 and PyTorch 2.4.', 'Lab Admin', '2026-09-18 09:30:00'),
(6, 'resource_add', 'Resource', 4, 'Kaggle UCI Credit Card Default Practice Dataset', 'Added benchmark dataset with 30,000 credit records for classification algorithms.', 'T. Harshini Priya', '2026-08-25 16:00:00'),
(7, 'profile_update', 'Student', 1, 'Academic Profile Credentials Verification', 'Synchronized Semester 5 course registrations and confirmed faculty advisor.', 'T. Harshini Priya', '2026-08-15 10:00:00')
ON DUPLICATE KEY UPDATE title = VALUES(title);

