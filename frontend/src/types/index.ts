// Shared TypeScript types for the Digital Banking ETL Platform

export interface Dataset {
  id: string;
  original_filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  status: string;
  parquet_path?: string;
}

export interface ColumnStat {
  name: string;
  type: string;
  unique: number;
  missing: number;
}

export interface PreviewData {
  data: Record<string, unknown>[];
  total_rows: number;
  total_pages: number;
  column_stats: ColumnStat[];
  duplicate_count: number;
}

export interface CleanResult {
  message: string;
  original_rows: number;
  new_rows: number;
  rows_removed: number;
}

export interface ValidationReport {
  rows_imported: number;
  rows_removed: number;
  duplicates_removed: number;
  missing_values_fixed: number;
  errors: number;
  warnings: number;
  final_record_count: number;
  data_quality_score: number;
}

export interface SchemaRelationship {
  from: string;
  to: string;
  type: string;
}

export interface SchemaResult {
  status: string;
  fact_table: string;
  dimensions: string[];
  relationships: SchemaRelationship[];
}

export interface DashboardStats {
  total_files: number;
  total_records: number;
  clean_records: number;
  duplicate_records: number;
  missing_values: number;
  data_quality_score: number;
  etl_progress: number;
  latest_upload: string;
}
