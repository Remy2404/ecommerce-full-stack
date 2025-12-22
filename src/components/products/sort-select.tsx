'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  defaultValue?: string;
}

export function SortSelect({ defaultValue = 'newest' }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      defaultValue={defaultValue}
      className="h-10 rounded-design border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      onChange={handleChange}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </select>
  );
}
