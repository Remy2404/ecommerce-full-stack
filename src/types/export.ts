/**
 * Export-related type definitions
 */

/**
 * Column definition for CSV export
 */
export interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | null | undefined);
}

/**
 * Export configuration options
 */
export interface ExportConfig {
  filename: string;
  maxRows?: number;
  includeTimestamp?: boolean;
}

/**
 * Export result with status
 */
export interface ExportResult {
  success: boolean;
  rowCount: number;
  truncated: boolean;
  error?: string;
}
