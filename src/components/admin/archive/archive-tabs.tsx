'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Archive, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArchiveTabConfig, ArchiveStatus } from '@/types/archive';
import type { ReactNode } from 'react';

interface ArchiveTabsProps extends ArchiveTabConfig {
  value: ArchiveStatus;
  onValueChange: (value: ArchiveStatus) => void;
  activeContent: ReactNode;
  archivedContent: ReactNode;
  className?: string;
}

/**
 * Reusable tabs component for Active/Archived views
 */
export function ArchiveTabs({
  value,
  onValueChange,
  activeContent,
  archivedContent,
  activeLabel = 'Active',
  archivedLabel = 'Archived',
  activeCount,
  archivedCount,
  className,
}: ArchiveTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as ArchiveStatus)}
      className={cn('w-full', className)}
    >
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="active" className="gap-2">
          <FileText className="h-4 w-4" />
          {activeLabel}
          {activeCount !== undefined && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {activeCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="archived" className="gap-2">
          <Archive className="h-4 w-4" />
          {archivedLabel}
          {archivedCount !== undefined && (
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              {archivedCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-4">
        {activeContent}
      </TabsContent>
      <TabsContent value="archived" className="mt-4">
        {archivedContent}
      </TabsContent>
    </Tabs>
  );
}
