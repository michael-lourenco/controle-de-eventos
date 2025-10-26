'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabbedChartProps } from '@/types/charts';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  className = '',
  actions 
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export function TabbedChart({ 
  title, 
  subtitle, 
  tabs, 
  defaultTab 
}: TabbedChartProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <ChartContainer title={title} subtitle={subtitle}>
      {/* Abas */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="min-h-[300px]">
        {activeTabContent}
      </div>
    </ChartContainer>
  );
}
