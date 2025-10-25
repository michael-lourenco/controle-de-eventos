'use client';

import React from 'react';
import { PieChartData, ChartConfig } from '@/types/charts';

interface PieChartProps {
  data: PieChartData[];
  config?: ChartConfig;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export function PieChart({ data, config = {} }: PieChartProps) {
  const {
    showLegend = true,
    showValues = true,
    showPercentages = true,
    height = 200,
    width = 200,
    colors = DEFAULT_COLORS
  } = config;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const radius = 80;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div className="space-y-4">
      {/* Gráfico SVG */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width={width} height={height} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const color = item.color || colors[index % colors.length];
              
              currentAngle = endAngle;
              
              return (
                <path
                  key={item.label}
                  d={pathData}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      {showLegend && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            const percentage = ((item.value / total) * 100).toFixed(1);
            
            return (
              <div key={item.label} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                <div className="text-sm font-medium text-gray-900">
                  {showValues && `${item.value}`}
                  {showValues && showPercentages && ' • '}
                  {showPercentages && `${percentage}%`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
