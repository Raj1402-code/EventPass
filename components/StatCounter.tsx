'use client';

import React from 'react';
import { TrendingDown, Leaf, Network, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const StatCounter: React.FC = () => {
  const stats = [
    {
      id: 'delay',
      value: '38.4%',
      label: 'Average Delay Reduction',
      subtext: 'Measured across 1.2M daily transit journeys',
      icon: TrendingDown,
      color: 'text-[#006D77]',
      bg: 'bg-[#006D77]/10',
    },
    {
      id: 'co2',
      value: '4.2M',
      label: 'Tons CO2 Emissions Saved',
      subtext: 'Reduced idling time at urban intersections',
      icon: Leaf,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'nodes',
      value: '1,420+',
      label: 'Active Signal Junctions',
      subtext: 'Deployed in 14 major metropolitan areas',
      icon: Network,
      color: 'text-[#004D55]',
      bg: 'bg-[#004D55]/10',
    },
    {
      id: 'latency',
      value: '< 85ms',
      label: 'Edge Signal Re-phasing',
      subtext: 'Sub-second real-time AI decision loops',
      icon: Zap,
      color: 'text-[#E29578]',
      bg: 'bg-[#E29578]/15',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#006D77]">
            PROVEN MUNICIPAL IMPACT
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Quantifiable Results for City Transit & Fleet Operations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.id} variant="hover" className="p-6 text-left relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center font-bold transition-transform group-hover:scale-110`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    VERIFIED
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-gray-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
                  {stat.subtext}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
