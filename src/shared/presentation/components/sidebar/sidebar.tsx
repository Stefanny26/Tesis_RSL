'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from './sidebar-item';
import { NavSection } from '@/src/core/config/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarSectionProps {
  section: NavSection;
}

function SidebarSection({ section }: SidebarSectionProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {section.title}
      </h4>
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  sections: NavSection[];
  className?: string;
}

export function Sidebar({ sections, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-64 border-r bg-background flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="h-16 border-b flex items-center px-6">
        <h2 className="text-lg font-semibold">RSL System</h2>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {sections.map((section, index) => (
            <SidebarSection key={index} section={section} />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="h-16 border-t flex items-center px-6">
        <p className="text-xs text-muted-foreground">
          v1.0.0 - Clean Architecture
        </p>
      </div>
    </aside>
  );
}
