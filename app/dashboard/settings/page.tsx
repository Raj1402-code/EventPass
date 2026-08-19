'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Settings, Shield, User, Sparkles, Activity, Cpu, Truck, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SettingsDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="py-8 bg-gray-900 text-white min-h-screen -mt-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <Badge variant="secondary" size="sm">
              ORGANIZATION & API SETTINGS
            </Badge>
            <h1 className="text-3xl font-black text-white mt-1">
              Account Profile & Subscription Management
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
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" leftIcon={<Truck className="w-4 h-4" />}>
                Fleet Priority
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="primary" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Account Profile Card */}
          <div className="lg:col-span-6 space-y-6">
            <Card variant="dark" className="p-6 border border-gray-800 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <User className="w-5 h-5 text-[#006D77] mr-2" />
                Engineer Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <div className="font-bold text-white mt-0.5">{session?.user?.name || 'Municipal Engineer'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Work Email:</span>
                  <div className="font-bold text-white mt-0.5">{session?.user?.email || 'engineer@city.gov'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Organization:</span>
                  <div className="font-bold text-[#83C5BE] mt-0.5">City of Metro Transit Authority</div>
                </div>
              </div>
            </Card>

            <Card variant="dark" className="p-6 border border-gray-800 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Key className="w-5 h-5 text-[#E29578] mr-2" />
                API & NTCIP Tokens
              </h3>
              <div className="space-y-2 text-xs">
                <p className="text-gray-400">
                  Use this token to authenticate MQTT and gRPC telemetry streams from your traffic cabinet edge runtime.
                </p>
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 font-mono text-emerald-400 flex items-center justify-between">
                  <span>nx_live_token_77849182991029</span>
                  <button className="text-xs text-gray-400 hover:text-white underline">Copy</button>
                </div>
              </div>
            </Card>
          </div>

          {/* Subscription Tier Card */}
          <div className="lg:col-span-6">
            <Card variant="dark" className="p-6 border border-gray-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Sparkles className="w-5 h-5 text-amber-400 mr-2" />
                  Subscription Plan
                </h3>
                <Badge variant="primary">MUNICIPAL PRO</Badge>
              </div>

              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Node Usage:</span>
                  <span className="font-bold text-white">42 / 50 Nodes</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006D77] h-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>50 Adaptive RL Traffic Light Intersections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Sub-100ms Signal Priority Edge Engine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>24/7 Dedicated On-Call Signal Specialist</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                <Link href="/pricing">
                  <Button variant="accent" size="sm">
                    Upgrade to Metropolitan Grid Tier
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
