'use client';

import { Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface SystemSettingsLayoutProps {
  title?: string;
  description?: string;
  sections: SettingsSection[];
  className?: string;
}

/**
 * System settings page layout with sections
 */
export function SystemSettingsLayout({
  title = 'System Settings',
  description = 'Manage system-wide settings and feature flags',
  sections,
  className,
}: SystemSettingsLayoutProps) {
  return (
    <div className={cn('space-y-8', className)}>
      <div className="border-b pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="h-6 w-6" />
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <nav className="space-y-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </nav>

        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-6 rounded-lg border bg-card p-6"
            >
              <div className="mb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  {section.icon}
                  {section.title}
                </h2>
                {section.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </div>
              {section.content}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
