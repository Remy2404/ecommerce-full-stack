'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { getProductReviews } from '@/services/review.service';
import { Review } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminReviewsPage() {
  const [productId, setProductId] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!productId) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await getProductReviews(productId, 0, 20);
      setReviews(result?.reviews || []);
      if (!result || result.reviews.length === 0) {
        setMessage('No reviews found for this product.');
      }
    } catch (err) {
      setMessage('Unable to load product reviews.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const text = `${review.title || ''} ${review.comment || ''} ${review.userName || ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Review Moderation</p>
        <h1 className="text-3xl font-semibold">Product Reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search reviews by product and take action on suspicious content.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Enter product ID"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          />
          <Button onClick={handleLookup} disabled={loading}>
            Lookup Reviews
          </Button>
          <Input
            placeholder="Search within reviews"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-design-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Reviewer</th>
                  <th className="px-4 py-3 text-left font-semibold">Verified</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{review.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{review.comment || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{review.userName || review.userId}</td>
                    <td className="px-4 py-3">
                      <Badge variant={review.isVerified ? 'success' : 'secondary'}>
                        {review.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!loading && filteredReviews.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                      No reviews available for the selected product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
