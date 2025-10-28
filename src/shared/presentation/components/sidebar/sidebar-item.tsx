'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { NavItem } from '@/src/core/config/navigation';

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  depth?: number;
}

export function SidebarItem({ item, isActive, depth = 0 }: SidebarItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer',
        'hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-accent text-accent-foreground font-medium',
        item.disabled && 'opacity-50 cursor-not-allowed',
        depth > 0 && 'ml-6'
      )}
      onClick={handleClick}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">{item.title}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {item.badge}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>

      {hasChildren && (
        isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )
      )}
    </div>
  );

  return (
    <div>
      {!hasChildren ? (
        <Link href={item.href}>{content}</Link>
      ) : (
        content
      )}

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.href}
              item={child}
              isActive={isActive}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
