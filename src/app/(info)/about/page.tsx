import Image from 'next/image';
import { Heart, Globe, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Store',
  description: 'Learn about our mission, values, and the team behind Store.',
};

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every decision we make starts with our customers. Your satisfaction is our success.',
  },
  {
    icon: Award,
    title: 'Quality Promise',
    description: 'We curate only the best products that meet our high standards of quality and value.',
  },
  {
    icon: Globe,
    title: 'Sustainability',
    description: 'We&apos;re committed to reducing our environmental footprint and supporting ethical practices.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'We continuously improve our platform and offerings to deliver the best shopping experience.',
  },
];

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '2K+', label: 'Products' },
  { value: '15+', label: 'Countries' },
  { value: '4.9', label: 'Average Rating' },
];

const team = [
  { name: 'Sarah Chen', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
  { name: 'Michael Lee', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
  { name: 'Emily Johnson', role: 'Design Lead', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80' },
  { name: 'David Kim', role: 'Tech Lead', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              We&apos;re on a mission to make
              <span className="text-primary"> shopping delightful</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Founded in 2020, Store has grown from a small startup to a trusted destination 
              for premium products. We believe everyone deserves access to quality goods 
              at fair prices.
            </p>
          </div>
        </div>
        <div className="absolute -left-10 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-10 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">Our Story</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              It all started with a simple idea: what if online shopping could feel as 
              personal and curated as visiting your favorite local boutique?
            </p>
            <p>
              In 2020, our founders set out to create an e-commerce platform that 
              prioritizes quality over quantity. Instead of offering millions of products, 
              we carefully curate thousands - each meeting our strict standards for 
              craftsmanship, value, and sustainability.
            </p>
            <p>
              Today, we serve customers across 15 countries, but our mission remains 
              the same: to help you discover products you&apos;ll love, from brands that 
              share our values.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-design bg-primary/10 text-primary">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Meet the Team</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full bg-muted">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Join Our Journey</h2>
          <p className="mt-4 text-primary-foreground/80">
            We&apos;re always looking for talented people who share our vision.
          </p>
          <Button variant="secondary" size="lg" className="mt-6" asChild>
            <Link href="/careers">View Open Positions</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
