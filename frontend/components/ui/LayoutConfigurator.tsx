// components/admin/LayoutConfigurator.tsx
'use client';

import { FC } from 'react';
import GridLayout from 'react-grid-layout';

interface LayoutConfiguratorProps {
  layout: any[];
  onLayoutChange: (layout: any[]) => void;
  children: React.ReactNode[];
}

export const LayoutConfigurator: FC<LayoutConfiguratorProps> = ({ layout, onLayoutChange, children }) => (
  <GridLayout
    className="layout"
    layout={layout}
    cols={12}
    rowHeight={30}
    width={1200}
    onLayoutChange={onLayoutChange}
  >
    {children.map((child, i) => (
      <div key={i} data-grid={layout[i]}>
        {child}
      </div>
    ))}
  </GridLayout>
);
