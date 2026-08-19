'use client';

import React from 'react';
import {
  Cpu,
  Truck,
  ShieldCheck,
  BarChart3,
  Radio,
  Share2,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      id: 'adaptive-signal',
      badge: 'Core Engine',
      title: 'Adaptive RL Traffic Signal Timing',
      desc: 'Replaces rigid fixed-time cycles with multi-agent reinforcement learning that dynamically adjusts green light durations based on live camera & loop sensor queues.',
      icon: Cpu,
      bullets: [
        'Sub-100ms decision latency at cabinet edge',
        'Compatible with NEMA TS2, 2070, and 170 controllers',
        'Automatic spillback & gridlock prevention',
      ],
    },
    {
      id: 'transit-priority',
      badge: 'Transit AI',
      title: 'Bus Corridor Signal Priority (TSP)',
      desc: 'Grants conditional green extensions to delayed municipal buses and light-rail vehicles without triggering side-street congestion bottlenecks.',
      icon: Radio,
      bullets: [
        'Automatic vehicle location (AVL) integration',
        'Schedule adherence priority algorithms',
        'Reduces bus dwell & corridor travel times by 24%',
      ],
    },
    {
      id: 'fleet-rerouting',
      badge: 'Fleet AI',
      title: 'Emergency Green Wave Priority',
      desc: 'Clears full traffic corridors dynamically for ambulances, fire engines, and police forces, cutting emergency response arrival times dramatically.',
      icon: Truck,
      bullets: [
        'Preemption request verification via encrypted V2X',
        'Dynamic green wave pathway pre-clearing',
        'Zero manual dispatcher intervention required',
      ],
    },
    {
      id: 'heatmaps',
      badge: 'Analytics',
      title: 'Predictive Congestion Heatmaps',
      desc: 'Ingests historical and spatial GIS data to forecast traffic bottlenecks up to 45 minutes in advance, allowing proactive signal re-balancing.',
      icon: BarChart3,
      bullets: [
        'Origin-Destination (OD) traffic flow modeling',
        'Weather & event congestion impact forecasting',
        'High-density spatial resolution GIS overlay',
      ],
    },
    {
      id: 'data-sovereignty',
      badge: 'Enterprise Security',
      title: 'On-Premise & Hybrid Cloud Bridge',
      desc: 'Complies strictly with municipal data governance laws. Run inference models directly on local city edge servers or secure private cloud infrastructure.',
      icon: ShieldCheck,
      bullets: [
        'SOC 2 Type II certified data pipeline',
        'End-to-end TLS 1.3 encryption',
        'Role-based access control (RBAC) for engineers',
      ],
    },
    {
      id: 'open-apis',
      badge: 'Integrations',
      title: 'Open API & SCATS Integration',
      desc: 'Seamlessly connects with existing CAD/AVL software, Google Maps Traffic APIs, and city GTFS real-time transit feeds via open REST and gRPC endpoints.',
      icon: Share2,
      bullets: [
        'GTFS-RT & NTCIP standard protocol support',
        'Custom Webhook notifications for signal faults',
        'Automated daily CSV & GeoJSON export pipelines',
      ],
    },
  ];

  return (
    <section className="py-20 bg-[#F8F9FA]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="primary" className="uppercase tracking-widest text-xs">
            INTELLIGENT CORRIDOR ARCHITECTURE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for Municipal Scale, Speed & Security
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            NEXUS modular features integrate directly with existing traffic controller hardware to modernize city infrastructure without costly hardware replacements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} variant="hover" className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#006D77]/10 text-[#006D77] flex items-center justify-center font-bold">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                    <ul className="space-y-2 border-t border-gray-100 pt-3">
                      {item.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start text-xs text-gray-700">
                          <Check className="w-4 h-4 text-[#006D77] mr-2 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
