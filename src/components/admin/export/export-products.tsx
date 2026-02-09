'use client';

import { useCallback } from 'react';
import { exportToCsv } from '@/utils/csv-export';
import { ExportButton } from './export-button';
import type { Product } from '@/types/product';
import type { CsvColumn } from '@/types/export';

/**
 * Column definitions for product CSV export
 */
const PRODUCT_COLUMNS: CsvColumn<Product>[] = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Slug', accessor: 'slug' },
  { header: 'Description', accessor: (p) => p.description ?? '' },
  { header: 'Price', accessor: 'price' },
  { header: 'Compare Price', accessor: (p) => p.comparePrice ?? '' },
  { header: 'Stock', accessor: 'stock' },
  { header: 'Category', accessor: (p) => p.categoryName ?? '' },
  { header: 'Rating', accessor: 'rating' },
  { header: 'Review Count', accessor: 'reviewCount' },
  { header: 'Active', accessor: (p) => p.isActive ? 'Yes' : 'No' },
  { header: 'Featured', accessor: (p) => p.isFeatured ? 'Yes' : 'No' },
  { header: 'Created At', accessor: 'createdAt' },
  { header: 'Updated At', accessor: 'updatedAt' },
];

interface ExportProductsButtonProps {
  products: Product[];
  disabled?: boolean;
  className?: string;
}

/**
 * Export products to CSV
 */
export function ExportProductsButton({
  products,
  disabled = false,
  className,
}: ExportProductsButtonProps) {
  const handleExport = useCallback(() => {
    return exportToCsv(PRODUCT_COLUMNS, products, 'products_export');
  }, [products]);

  return (
    <ExportButton
      onExport={handleExport}
      label="Export Products"
      disabled={disabled || products.length === 0}
      className={className}
    />
  );
}
