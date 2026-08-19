'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Activity,
  Shield,
  Truck,
  Cpu,
  AlertTriangle,
  Users,
  Settings,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { LiveTelemetryMap } from '@/components/dashboard/LiveTelemetryMap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { data: session } = useSession();

  const metrics = [
    {
      label: 'Active Signal Nodes',
      value: '42 / 50',
      subtext: '8 Nodes in Shadow Simulation Mode',
      icon: Cpu,
      color: 'text-[#006D77]',
      bg: 'bg-[#006D77]/10',
    },
    {
      label: 'Monitored Transit Fleets',
      value: '128 Vehicles',
      subtext: 'Buses & Light Rail En Route',
      icon: Truck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Avg Delay Reduction',
      value: '36.8%',
      subtext: 'Across Grand & 4th Corridors',
      icon: TrendingDown,
      color: 'text-[#83C5BE]',
      bg: 'bg-[#83C5BE]/20',
    },
    {
      label: 'Subscription Tier',
      value: 'Municipal Pro',
      subtext: 'Renews Oct 2026 • 50 Node Limit',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="py-8 bg-gray-900 text-white min-h-screen -mt-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="sm" className="bg-[#006D77] text-white">
                ENTERPRISE COMMAND CENTER
              </Badge>
              <span className="text-xs text-gray-400 font-mono">
                {session?.user?.name || 'Engineer Mode'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
              Metropolitan Traffic Telemetry & Signal Override
            </h1>
          </div>

          {/* Sub-Navigation Subviews */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            <Link href="/dashboard">
              <Button variant="primary" size="sm" leftIcon={<Activity className="w-4 h-4" />}>
                Live Map
              </Button>
            </Link>
            <Link href="/dashboard/transit">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Cpu className="w-4 h-4" />}>
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

        {/* Top Stat Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => {
            const IconComp = m.icon;
            return (
              <Card key={idx} variant="dark" className="p-5 space-y-2 border border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold">{m.label}</span>
                  <div className={`w-9 h-9 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">{m.value}</div>
                <div className="text-[11px] text-gray-400">{m.subtext}</div>
              </Card>
            );
          })}
        </div>

        {/* Main Live Telemetry Map Widget */}
        <LiveTelemetryMap />
      </div>
    </div>
  );
}
