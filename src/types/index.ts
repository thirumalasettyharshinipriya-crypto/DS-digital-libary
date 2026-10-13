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
  experiments_count?: number;
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
  module_title?: string;
  module_code?: string;
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
  stage?: 'Completed' | 'In Progress' | 'Published' | 'Under Review' | string;
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

export interface DashboardStats {
  total_experiments: number;
  total_projects: number;
  total_equipment: number;
  available_equipment: number;
  total_resources: number;
  total_modules: number;
  recent_experiments: Array<{
    id: number;
    experiment_number: number;
    title: string;
    short_description: string;
    module_title: string;
    created_at: string;
  }>;
  recent_projects: Array<{
    id: number;
    title: string;
    short_description: string;
    technologies_used: string;
    category: string;
    created_at: string;
  }>;
  recent_audit_logs?: AuditLog[];
}

export interface CodeExecutionResult {
  status: string;
  output: string;
  error?: string;
  exit_code?: number;
  execution_time_ms: number;
}

export interface SqlQueryResult {
  columns: string[];
  rows: (string | number)[][];
  row_count: number;
  message?: string;
  error?: string;
}
