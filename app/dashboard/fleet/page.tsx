'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Shield, AlertTriangle, CheckCircle, Activity, Settings, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function FleetDashboardPage() {
  const vehicles = [
    {
      id: 'v-101',
      code: 'BUS-402',
      type: 'MUNICIPAL_BUS',
      route: 'Line #14 Grand Ave',
      status: 'ON_SCHEDULE',
      speed: '42 km/h',
      battery: 92,
    },
    {
      id: 'v-102',
      code: 'AMB-09',
      type: 'EMERGENCY_AMBULANCE',
      route: 'General Hospital Response',
      status: 'GREEN_WAVE_ACTIVE',
      speed: '68 km/h',
      battery: 100,
    },
    {
      id: 'v-103',
      code: 'BUS-512',
      type: 'MUNICIPAL_BUS',
      route: 'Express Line 8',
      status: 'DELAYED',
      speed: '18 km/h',
      battery: 64,
    },
  ];

  return (
    <div className="py-8 bg-gray-900 text-white min-h-screen -mt-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <Badge variant="accent" size="sm">
              FLEET TELEMETRY & PRIORITY PREEMPTION
            </Badge>
            <h1 className="text-3xl font-black text-white mt-1">
              Autonomous Fleet Rerouting & V2X Operations
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Activity className="w-4 h-4" />}>
                Live Map
              </Button>
            </Link>
            <Link href="/dashboard/transit">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Cpu className="w-4 h-4" />}>
                Transit AI
              </Button>
            </Link>
            <Link href="/dashboard/fleet">
              <Button variant="primary" size="sm" leftIcon={<Truck className="w-4 h-4" />}>
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

        {/* Fleet Table */}
        <Card variant="dark" className="p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Active Telemetry Fleet Vehicles</h3>
            <span className="text-xs font-mono text-gray-400">3 VEHICLES REPORTING</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-mono text-xs">
                  <th className="py-3 px-4">Vehicle Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Assigned Route</th>
                  <th className="py-3 px-4">Priority Status</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-800/40">
                    <td className="py-4 px-4 font-bold text-white">{v.code}</td>
                    <td className="py-4 px-4 text-gray-300">{v.type}</td>
                    <td className="py-4 px-4 text-gray-300">{v.route}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          v.status === 'GREEN_WAVE_ACTIVE'
                            ? 'accent'
                            : v.status === 'ON_SCHEDULE'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-mono">{v.speed}</td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="outline" size="sm" className="text-xs border-gray-700 text-gray-300">
                        Force Priority Phase
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
