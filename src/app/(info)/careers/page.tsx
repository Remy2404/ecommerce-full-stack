import { MapPin, Clock, Heart, Zap, Users, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Careers | Store',
  description: 'Join our team and help us build the future of e-commerce.',
};

const benefits = [
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
  { icon: Zap, title: 'Flexible Hours', description: 'Work when you&apos;re most productive' },
  { icon: Users, title: 'Remote-First', description: 'Work from anywhere in the world' },
  { icon: Coffee, title: 'Team Events', description: 'Regular team gatherings and offsites' },
];

const openPositions = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Phnom Penh',
    type: 'Full-time',
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Customer Success Lead',
    department: 'Support',
    location: 'Phnom Penh',
    type: 'Full-time',
  },
  {
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              Build the future of
              <span className="text-primary"> e-commerce</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Join a team of passionate individuals working to make online shopping 
              delightful for everyone. We&apos;re remote-first and always looking for talented people.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <a href="#positions">View Open Positions</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Why Work With Us</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-design-lg border border-border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-design-sm bg-primary/10 text-primary">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Culture */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Our Culture</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              We believe in transparency, continuous learning, and having fun while 
              doing meaningful work. Our team is diverse, inclusive, and supportive. 
              We celebrate wins together and learn from failures as a team.
            </p>
          </div>
          
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="relative aspect-video overflow-hidden rounded-design-lg bg-muted">
              <Image 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" 
                alt="Team collaboration"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-design-lg bg-muted">
              <Image 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" 
                alt="Office space"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-design-lg bg-muted">
              <Image 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" 
                alt="Team event"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="mb-8 text-3xl font-bold">Open Positions</h2>
        
        <div className="space-y-4">
          {openPositions.map((position, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-design-lg border border-border bg-card p-6 transition-all hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{position.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {position.department}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {position.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {position.type}
                </span>
                <Button size="sm">Apply Now</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Don't See Your Role */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Don&apos;t see your role?</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re always looking for talented people. Send us your resume and we&apos;ll 
            reach out when a matching position opens up.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
