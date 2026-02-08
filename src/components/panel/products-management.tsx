'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { getCategories } from '@/services/category.service';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type UpsertProductPayload,
} from '@/services/product.service';
import { type Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

const sanitizeSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const defaultForm = (): UpsertProductPayload => ({
  name: '',
  slug: '',
  description: '',
  price: 0,
  categoryId: '',
  stock: 0,
  images: [],
});

export function ProductsManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<UpsertProductPayload>(defaultForm);
  const [imagesInput, setImagesInput] = useState('');

  const queryKey = ['admin-products', page, searchQuery, categoryId];

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey,
    queryFn: () =>
      getProducts({
        page,
        size: PAGE_SIZE,
        ...(searchQuery ? { searchQuery } : {}),
        ...(categoryId ? { categoryId } : {}),
      }),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Product created');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: UpsertProductPayload }) =>
      updateProduct(slug, payload),
    onSuccess: () => {
      toast.success('Product updated');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteProduct(slug),
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: ['admin-products'] });
      const previous = queryClient.getQueriesData({ queryKey: ['admin-products'] });

      queryClient.setQueriesData(
        { queryKey: ['admin-products'] },
        (oldValue: unknown) => {
          if (!oldValue || typeof oldValue !== 'object') return oldValue;
          const typed = oldValue as { products?: Product[] };
          return {
            ...typed,
            products: (typed.products || []).filter((product) => product.slug !== slug),
          };
        }
      );

      return { previous };
    },
    onError: (_error, _slug, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to delete product');
    },
    onSuccess: () => toast.success('Product deleted'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const products = productsQuery.data?.products || [];
  const pagination = productsQuery.data?.pagination;
  const imagePreview = useMemo(() => imagesInput.split(',').map((img) => img.trim()).filter(Boolean), [imagesInput]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm(defaultForm());
    setImagesInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId || '',
      stock: product.stock,
      images: product.images,
    });
    setImagesInput(product.images.join(', '));
    setIsDialogOpen(true);
  };

  const submitForm = () => {
    const payload: UpsertProductPayload = {
      ...form,
      slug: sanitizeSlug(form.slug || form.name),
      images: imagePreview,
    };

    if (!payload.name || !payload.slug || !payload.categoryId) {
      toast.error('Name, slug, and category are required.');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ slug: editingProduct.slug, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Catalog</p>
          <h1 className="text-3xl font-semibold">Products</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Search products"
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(event) => {
              setPage(0);
              setSearchQuery(event.target.value);
            }}
          />
          <select
            value={categoryId}
            onChange={(event) => {
              setPage(0);
              setCategoryId(event.target.value);
            }}
            className="h-11 min-w-[180px] rounded-design border border-input bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categoriesQuery.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey })}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products ({pagination?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[920px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.slug}</td>
                    <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(product.slug)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!productsQuery.isLoading && products.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No products found for this filter set.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {(pagination?.page || 0) + 1} of {Math.max(pagination?.totalPages || 1, 1)}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(pagination?.totalPages || 0) <= page + 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                      slug: editingProduct ? prev.slug : sanitizeSlug(event.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Slug (URL-safe)</label>
                <Input
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: sanitizeSlug(event.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Stock</label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="h-11 w-full rounded-design border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Description</label>
              <Textarea
                value={form.description || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Image URLs (comma-separated)
              </label>
              <Textarea value={imagesInput} onChange={(event) => setImagesInput(event.target.value)} rows={3} />
            </div>

            {imagePreview.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Image Preview</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {imagePreview.slice(0, 4).map((image, index) => (
                    // eslint-disable-next-line @next/next/no-img-element -- admin previews arbitrary external URLs.
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Product preview ${index + 1}`}
                      className="h-24 w-full rounded-design border border-border object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitForm}
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
