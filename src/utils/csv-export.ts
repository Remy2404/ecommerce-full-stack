/**
 * CSV Export Utilities
 * Client-side CSV generation and download
 */

import type { CsvColumn, ExportResult } from '@/types/export';

/**
 * Maximum rows to export to prevent browser freeze
 */
export const MAX_EXPORT_ROWS = 5000;

/**
 * Sanitize a value for CSV output
 * Handles quotes, newlines, and null values
 */
export function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV string from typed data and column definitions
 */
export function generateCsv<T>(
  columns: CsvColumn<T>[],
  data: T[]
): string {
  const headerRow = columns
    .map((col) => sanitizeCsvValue(col.header))
    .join(',');

  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(item)
            : item[col.accessor];
        return sanitizeCsvValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Generate timestamped filename
 */
export function generateFilename(baseName: string, includeTimestamp = true): string {
  if (!includeTimestamp) {
    return `${baseName}.csv`;
  }

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  return `${baseName}_${timestamp}.csv`;
}

/**
 * Trigger browser download of CSV data
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV with safety limits
 */
export function exportToCsv<T>(
  columns: CsvColumn<T>[],
  data: T[],
  baseName: string,
  options: { maxRows?: number; includeTimestamp?: boolean } = {}
): ExportResult {
  const { maxRows = MAX_EXPORT_ROWS, includeTimestamp = true } = options;

  try {
    const truncated = data.length > maxRows;
    const exportData = truncated ? data.slice(0, maxRows) : data;

    const csvContent = generateCsv(columns, exportData);
    const filename = generateFilename(baseName, includeTimestamp);

    downloadCsv(filename, csvContent);

    return {
      success: true,
      rowCount: exportData.length,
      truncated,
    };
  } catch (error) {
    return {
      success: false,
      rowCount: 0,
      truncated: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}
