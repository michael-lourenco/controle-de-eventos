'use client';

import React from 'react';
import { BarChartData, ChartConfig } from '@/types/charts';

interface BarChartProps {
  data: BarChartData[];
  config?: ChartConfig;
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export function BarChart({ 
  data, 
  config = {}, 
  orientation = 'horizontal' 
}: BarChartProps) {
  const {
    showValues = true,
    showPercentages = true,
    colors = DEFAULT_COLORS
  } = config;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  {showValues && (
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  )}
                  {showPercentages && (
                    <span className="text-sm text-gray-600">({percentage.toFixed(1)}%)</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color
                  }}
                >
                  {showPercentages && barWidth > 20 && (
                    <span className="text-xs font-medium text-white">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars (for future implementation)
  return (
    <div className="flex items-end justify-center space-x-2 h-64">
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const color = item.color || colors[index % colors.length];

        return (
          <div key={item.label} className="flex flex-col items-center space-y-2">
            <div
              className="w-8 rounded-t transition-all duration-300"
              style={{
                height: `${barHeight}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-600 text-center max-w-16 break-words">
              {item.label}
            </span>
            {showValues && (
              <span className="text-xs font-bold text-gray-900">{item.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
