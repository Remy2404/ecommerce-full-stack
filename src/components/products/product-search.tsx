'use client';

import { useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductSearchProps {
  defaultValue?: string;
  className?: string;
}

export function ProductSearch({ defaultValue = '', className }: ProductSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);

  const pushWithQuery = (nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const normalized = nextQuery.trim();

    if (normalized) {
      params.set('search', normalized);
    } else {
      params.delete('search');
    }

    params.delete('page');

    const queryString = params.toString();
    const basePath = pathname === '/products' ? pathname : '/products';
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushWithQuery(query);
  };

  const clearSearch = () => {
    setQuery('');
    pushWithQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          icon={<Search className="h-5 w-5" />}
          className="h-12 rounded-design border-border bg-background/80 pr-24 text-base"
          aria-label="Search products"
        />
        {query.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-10 w-10"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
