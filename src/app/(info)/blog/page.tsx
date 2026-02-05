import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Blog | Store',
  description: 'Tips, trends, and stories from the Store team.',
};

const blogPosts = [
  {
    id: 1,
    title: '10 Must-Have Accessories for 2025',
    excerpt: 'Discover the hottest trends in accessories that will elevate your style this year.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    category: 'Style Guide',
    author: 'Emily Johnson',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    slug: '10-must-have-accessories-2025',
  },
  {
    id: 2,
    title: 'Sustainable Shopping: A Beginner&apos;s Guide',
    excerpt: 'Learn how to make environmentally conscious purchasing decisions without compromising on quality.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80',
    category: 'Sustainability',
    author: 'Sarah Chen',
    date: 'Dec 10, 2024',
    readTime: '8 min read',
    slug: 'sustainable-shopping-guide',
  },
  {
    id: 3,
    title: 'How We Curate Our Products',
    excerpt: 'A behind-the-scenes look at our rigorous product selection process.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    category: 'Behind the Scenes',
    author: 'Michael Lee',
    date: 'Dec 5, 2024',
    readTime: '6 min read',
    slug: 'how-we-curate-products',
  },
  {
    id: 4,
    title: 'The Art of Gift Giving',
    excerpt: 'Tips for choosing the perfect gift for any occasion and any person.',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80',
    category: 'Lifestyle',
    author: 'David Kim',
    date: 'Nov 28, 2024',
    readTime: '4 min read',
    slug: 'art-of-gift-giving',
  },
  {
    id: 5,
    title: 'Workspace Essentials for Remote Workers',
    excerpt: 'Create the perfect home office with these productivity-boosting products.',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    category: 'Work From Home',
    author: 'Emily Johnson',
    date: 'Nov 20, 2024',
    readTime: '7 min read',
    slug: 'workspace-essentials-remote',
  },
  {
    id: 6,
    title: 'Minimalism: Less is More',
    excerpt: 'How embracing minimalism can simplify your life and your shopping habits.',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&q=80',
    category: 'Lifestyle',
    author: 'Sarah Chen',
    date: 'Nov 15, 2024',
    readTime: '5 min read',
    slug: 'minimalism-less-is-more',
  },
];

const categories = ['All', 'Style Guide', 'Sustainability', 'Lifestyle', 'Behind the Scenes', 'Work From Home'];

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Our Blog
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tips, trends, and stories from the Store team.
            </p>
          </div>
          
          {/* Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/blog/${featuredPost.slug}`} className="group block">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-design-lg bg-muted">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                className="object-cover transition-transform duration-slow group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-bold group-hover:text-primary transition-colors lg:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">By {featuredPost.author}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {featuredPost.date}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Other Posts */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">Latest Posts</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-design-lg border border-border bg-card overflow-hidden transition-all hover:shadow-soft"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-slow group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  {post.category}
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Subscribe to Our Newsletter</h2>
          <p className="mt-2 text-muted-foreground">
            Get the latest posts delivered straight to your inbox.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 w-full rounded-design border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
            />
            <Button size="lg">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
