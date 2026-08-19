'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cpu,
  Truck,
  CheckCircle,
  Zap,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const LiveTelemetryMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('node-1');
  const [overrideMode, setOverrideMode] = useState<boolean>(false);

  const nodes = [
    {
      id: 'node-1',
      name: 'Grand Ave & 4th Street',
      lat: '37.7749',
      lng: '-122.4194',
      status: 'OPTIMAL',
      congestion: 28,
      mode: 'AI_ADAPTIVE',
      signal: 'GREEN',
      vehiclesPerMin: 142,
    },
    {
      id: 'node-2',
      name: 'Central Transit Hub Junction',
      lat: '37.7752',
      lng: '-122.4180',
      status: 'BUS_PRIORITY_ACTIVE',
      congestion: 45,
      mode: 'AI_ADAPTIVE',
      signal: 'GREEN',
      vehiclesPerMin: 188,
    },
    {
      id: 'node-3',
      name: 'Bay Bridge Expressway Exit',
      lat: '37.7730',
      lng: '-122.4210',
      status: 'HEAVY_QUEUE',
      congestion: 82,
      mode: overrideMode ? 'MANUAL_OVERRIDE' : 'AI_ADAPTIVE',
      signal: 'YELLOW',
      vehiclesPerMin: 230,
    },
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Interactive Vector Map Surface */}
      <div className="lg:col-span-8 space-y-4">
        <Card variant="dark" className="p-4 relative overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-bold">LIVE TELEMETRY STREAM</span>
            </div>
            <span className="text-gray-400">FEED FREQUENCY: 100ms • ENCRYPTED MQTT</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative h-96 bg-gray-950 rounded-xl overflow-hidden my-3 border border-gray-900 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
              {/* Grid map background */}
              <defs>
                <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1F2937" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />

              {/* Major Roads */}
              <path d="M 100 225 Q 400 150 700 225" fill="none" stroke="#374151" strokeWidth="24" />
              <path d="M 400 50 L 400 400" fill="none" stroke="#374151" strokeWidth="24" />

              {/* Road center lines */}
              <path d="M 100 225 Q 400 150 700 225" fill="none" stroke="#006D77" strokeDasharray="10 10" strokeWidth="2" />
              <path d="M 400 50 L 400 400" fill="none" stroke="#006D77" strokeDasharray="10 10" strokeWidth="2" />

              {/* Intersection Nodes Pins */}
              {/* Node 1 */}
              <g
                transform="translate(250, 190)"
                onClick={() => setSelectedNode('node-1')}
                className="cursor-pointer group"
              >
                <circle cx="0" cy="0" r="16" fill="#006D77" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill={selectedNode === 'node-1' ? '#83C5BE' : '#006D77'} stroke="#FFFFFF" strokeWidth="2" />
                <text x="15" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  Node #1 (28%)
                </text>
              </g>

              {/* Node 2 */}
              <g
                transform="translate(400, 200)"
                onClick={() => setSelectedNode('node-2')}
                className="cursor-pointer group"
              >
                <circle cx="0" cy="0" r="16" fill="#16A34A" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill={selectedNode === 'node-2' ? '#83C5BE' : '#16A34A'} stroke="#FFFFFF" strokeWidth="2" />
                <text x="15" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  Node #2 (TSP)
                </text>
              </g>

              {/* Node 3 */}
              <g
                transform="translate(580, 240)"
                onClick={() => setSelectedNode('node-3')}
                className="cursor-pointer group"
              >
                <circle cx="0" cy="0" r="18" fill="#DC2626" opacity="0.4" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill={selectedNode === 'node-3' ? '#83C5BE' : '#DC2626'} stroke="#FFFFFF" strokeWidth="2" />
                <text x="15" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  Node #3 (82%)
                </text>
              </g>

              {/* Emergency Ambulance Vehicle Pulse */}
              <g transform="translate(360, 200)">
                <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#E29578" className="animate-bounce" />
                <text x="-6" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                  EMS
                </text>
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
            <span>Click any intersection marker to inspect or manually override green phases.</span>
            <span className="font-mono text-[#83C5BE]">3 ACTIVE NODES MONITORED</span>
          </div>
        </Card>
      </div>

      {/* Right: Selected Node Signal Control Panel */}
      <div className="lg:col-span-4 space-y-4">
        <Card variant="dark" className="p-5 space-y-4 border border-gray-800">
          <div className="border-b border-gray-800 pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">
                SELECTED JUNCTION
              </Badge>
              <span className="text-xs font-mono text-gray-400">{activeNode.id}</span>
            </div>
            <h4 className="text-xl font-bold text-white mt-1">
              {activeNode.name}
            </h4>
          </div>

          {/* Node Metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Congestion Density:</span>
              <span className={`font-mono font-bold ${
                activeNode.congestion > 70 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {activeNode.congestion}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Vehicle Inflow:</span>
              <span className="font-mono font-bold text-white">
                {activeNode.vehiclesPerMin} vehicles/min
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Current RL Phase:</span>
              <Badge variant={activeNode.signal === 'GREEN' ? 'success' : 'warning'}>
                {activeNode.signal} WAVE
              </Badge>
            </div>
          </div>

          {/* Override Action Controls */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Manual Override & Priority Controls
            </label>

            <Button
              variant={overrideMode ? 'accent' : 'outline'}
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => setOverrideMode(!overrideMode)}
              leftIcon={<Sliders className="w-4 h-4" />}
            >
              {overrideMode ? 'Manual Control Active (Click to Reset)' : 'Force Signal Preemption'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Force Emergency All-Red Clearance
            </Button>
          </div>
        </Card>

        {/* Live Incident Alerts Feed */}
        <Card variant="dark" className="p-5 border border-gray-800 space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
            Live System Incident Feed
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
              <div className="font-bold">Heavy Traffic Queue Detected</div>
              <div className="text-[11px] text-amber-400/80">Bay Bridge Exit • Auto RL re-phasing triggered</div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
              <div className="font-bold">Transit Priority Wave Executed</div>
              <div className="text-[11px] text-emerald-400/80">Bus Line #42 cleared Grand Ave in 3.2 mins</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
