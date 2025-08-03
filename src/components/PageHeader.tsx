
import React, { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode; // For breadcrumbs or other elements
  count?: number; // For displaying total count
}

export default function PageHeader({ title, description, actions, children, count }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {children} 
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">{title}</h1>
            {count !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {count.toLocaleString()} Total Records
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
