'use client';

import React from 'react';
import { Sidebar } from '../components/sidebar/sidebar';
import { TopBar } from '../components/top-bar';
import { projectNavigation } from '@/src/core/config/navigation';

interface ProjectLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar with project-specific navigation */}
      <Sidebar sections={projectNavigation(projectId)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
