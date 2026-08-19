'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Activity, Truck, Settings, CheckCircle2, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function TransitDashboardPage() {
  const corridors = [
    {
      id: 'corridor-1',
      name: 'Grand Avenue Bus Transit Corridor',
      intersections: 14,
      avgSpeedGain: '+28%',
      tspExtensions: 412,
      status: 'ACTIVE_OPTIMIZATION',
    },
    {
      id: 'corridor-2',
      name: '4th Street Light Rail Priority Line',
      intersections: 8,
      avgSpeedGain: '+34%',
      tspExtensions: 289,
      status: 'ACTIVE_OPTIMIZATION',
    },
  ];

  return (
    <div className="py-8 bg-gray-900 text-white min-h-screen -mt-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <Badge variant="primary" size="sm" className="bg-[#006D77] text-white">
              TRANSIT SIGNAL PRIORITY (TSP) ENGINE
            </Badge>
            <h1 className="text-3xl font-black text-white mt-1">
              Municipal Bus & Light Rail Corridor Control
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Activity className="w-4 h-4" />}>
                Live Map
              </Button>
            </Link>
            <Link href="/dashboard/transit">
              <Button variant="primary" size="sm" leftIcon={<Cpu className="w-4 h-4" />}>
                Transit AI
              </Button>
            </Link>
            <Link href="/dashboard/fleet">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Truck className="w-4 h-4" />}>
                Fleet Priority
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Corridors Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corridors.map((c) => (
            <Card key={c.id} variant="dark" className="p-6 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">
                  {c.status}
                </Badge>
                <span className="text-xs font-mono text-gray-400">{c.intersections} SIGNAL NODES</span>
              </div>

              <h3 className="text-2xl font-bold text-white">{c.name}</h3>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                <div>
                  <span className="text-xs text-gray-400">Corridor Speed Gain:</span>
                  <div className="text-2xl font-extrabold text-emerald-400">{c.avgSpeedGain}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Green Extensions Granted:</span>
                  <div className="text-2xl font-extrabold text-[#83C5BE]">{c.tspExtensions} today</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" size="sm" className="text-xs border-gray-700 text-gray-300">
                  Tune Priority Weights
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
