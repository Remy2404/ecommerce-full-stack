import { Download, ExternalLink, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Press | Store',
  description: 'Press releases, media resources, and news about Store.',
};

const pressReleases = [
  {
    date: 'December 2024',
    title: 'Store Raises $10M Series A to Expand Product Selection',
    description: 'Funding will be used to onboard new merchants and enhance the shopping experience.',
  },
  {
    date: 'October 2024',
    title: 'Store Launches Sustainability Initiative',
    description: 'New program commits to carbon-neutral shipping and eco-friendly packaging.',
  },
  {
    date: 'August 2024',
    title: 'Store Reaches 50,000 Customer Milestone',
    description: 'Company celebrates rapid growth with special promotions for customers.',
  },
  {
    date: 'June 2024',
    title: 'Store Expands to International Markets',
    description: 'E-commerce platform now ships to 15 countries across Asia and Europe.',
  },
];

const mediaFeatures = [
  {
    outlet: 'Tech Today',
    title: '"Store is Redefining E-commerce in Southeast Asia"',
    link: '#',
  },
  {
    outlet: 'Business Daily',
    title: '"How Store Built a Loyal Customer Base Through Quality Curation"',
    link: '#',
  },
  {
    outlet: 'Startup Weekly',
    title: '"10 E-commerce Startups to Watch in 2024"',
    link: '#',
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Press & Media
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              News, press releases, and media resources about Store.
            </p>
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-design-lg border border-border bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Media Kit</h2>
          <p className="mt-2 text-muted-foreground">
            Download our brand assets, logos, and company information.
          </p>
          <Button className="mt-6" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download Media Kit
          </Button>
        </div>
      </section>

      {/* Press Releases */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">Press Releases</h2>
        <div className="space-y-6">
          {pressReleases.map((release, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-design-lg border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {release.date}
                </div>
                <h3 className="mt-2 font-semibold">{release.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {release.description}
                </p>
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                Read More
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* In the Media */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold">In the Media</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {mediaFeatures.map((feature, index) => (
              <a
                key={index}
                href={feature.link}
                className="group rounded-design-lg border border-border bg-card p-6 transition-all hover:shadow-soft"
              >
                <p className="text-sm font-medium text-primary">{feature.outlet}</p>
                <p className="mt-2 font-medium group-hover:text-primary transition-colors">
                  {feature.title}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Read Article
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">Company Facts</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-design-lg border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-primary">2020</p>
            <p className="mt-1 text-sm text-muted-foreground">Founded</p>
          </div>
          <div className="rounded-design-lg border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-primary">50K+</p>
            <p className="mt-1 text-sm text-muted-foreground">Customers</p>
          </div>
          <div className="rounded-design-lg border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-primary">15+</p>
            <p className="mt-1 text-sm text-muted-foreground">Countries</p>
          </div>
          <div className="rounded-design-lg border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-primary">50+</p>
            <p className="mt-1 text-sm text-muted-foreground">Team Members</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Media Inquiries</h2>
          <p className="mt-2 text-muted-foreground">
            For press inquiries, interviews, or media resources, please contact:
          </p>
          <a
            href="mailto:press@store.com"
            className="mt-4 inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline"
          >
            <Mail className="h-5 w-5" />
            press@store.com
          </a>
        </div>
      </section>
    </div>
  );
}
