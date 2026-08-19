'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cpu, Truck, BarChart3, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { InteractiveTrafficSimulator } from '@/components/InteractiveTrafficSimulator';
import { Button } from '@/components/ui/Button';

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const solutionTabs = [
    { id: 'all', label: 'All Solutions' },
    { id: 'transit-ai', label: 'Transit AI (TSP)', badge: 'Bus / Rail' },
    { id: 'fleet', label: 'Fleet Optimization', badge: 'Emergency / V2X' },
    { id: 'analytics', label: 'Predictive Analytics' },
  ];

  const solutions = [
    {
      id: 'transit-ai-corridors',
      category: 'transit-ai',
      title: 'Municipal Transit Signal Priority (TSP)',
      desc: 'Dynamic signal extensions for public buses and light rail vehicles based on real-time GTFS schedule variance. Minimizes bus dwell time while safeguarding side-street mobility.',
      metrics: '24% Faster Bus Travel Times',
      icon: Cpu,
    },
    {
      id: 'emergency-green-wave',
      category: 'fleet',
      title: 'Emergency Vehicle Green Wave Preemption',
      desc: 'Encrypts vehicle-to-infrastructure (V2I) signals to grant immediate green corridors for ambulances and fire trucks, clearing intersection queues before arrival.',
      metrics: '4.5 Min Arrival Time Reduction',
      icon: Truck,
    },
    {
      id: 'predictive-heatmaps',
      category: 'analytics',
      title: 'Real-Time GIS Congestion Heatmaps',
      desc: 'Combines spatial camera telemetry with historical flow patterns to predict bottlenecks up to 45 minutes ahead, automatically adjusting upstream metering signals.',
      metrics: '45-Min Advance Prediction',
      icon: BarChart3,
    },
    {
      id: 'hybrid-edge-controller',
      category: 'transit-ai',
      title: 'NEMA & SCATS Hardware Adapter',
      desc: 'Plug-and-play cabinet module that interfaces directly with 2070 and TS2 signal controllers. Eliminates expensive traffic cabinet overhauls.',
      metrics: 'Sub-100ms Edge Latency',
      icon: ShieldCheck,
    },
  ];

  const filteredSolutions =
    activeTab === 'all'
      ? solutions
      : solutions.filter((s) => s.category === activeTab);

  const specFaqs = [
    {
      id: 'spec-1',
      title: 'How does NEXUS interface with existing SCATS or NEMA cabinet controllers?',
      content:
        'NEXUS deploys a lightweight edge software runtime (or physical DIN-rail gateway) inside existing 332/NEMA cabinets. It communicates using NTCIP 1202 standards over local Ethernet, sending phase hold and force-off commands without modifying core safety interlocks.',
    },
    {
      id: 'spec-2',
      title: 'What happens if internet connection to the cloud is lost?',
      content:
        'Safety is paramount. The NEXUS edge runtime operates fully autonomously. If cloud connection drops, local edge models continue optimizing signals based on immediate loop sensors. If edge hardware experiences a fault, the cabinet instantly reverts to native hardwired static timing.',
    },
    {
      id: 'spec-3',
      title: 'What data standards and V2X protocols are supported?',
      content:
        'NEXUS supports GTFS-RT (Real-Time), SAE J2735 V2X BSM/MAP/SPaT messages, NTCIP 1202, MQTT, gRPC, and standard RESTful JSON APIs for CAD/AVL integrations.',
    },
  ];

  return (
    <div className="py-12 space-y-16">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-[#006D77]/10 text-[#006D77] rounded-full border border-[#006D77]/20">
          ENTERPRISE URBAN AI SOLUTIONS
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
          Next-Generation Mobility & Signal Intelligence
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          From transit corridor signal priority to autonomous emergency preemption, NEXUS equips municipal planners with end-to-end urban traffic control tools.
        </p>
      </div>

      {/* Filterable Solutions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl mx-auto">
          <Tabs tabs={solutionTabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSolutions.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} variant="hover" className="p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center font-bold">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      {item.metrics}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#006D77]">
                  <span>SCATS / NTCIP 1202 Ready</span>
                  <Link href="/contact" className="inline-flex items-center hover:underline">
                    <span>Request Spec Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive Sandbox Simulator Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveTrafficSimulator />
      </div>

      {/* Technical Specifications Accordion */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Technical Architecture & Protocols
          </h2>
          <p className="text-gray-600 text-sm">
            Answers to common questions from municipal IT and traffic engineering teams.
          </p>
        </div>

        <Accordion items={specFaqs} />
      </div>
    </div>
  );
}
