'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Cpu, Truck, Zap, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const InteractiveTrafficSimulator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'AI_ADAPTIVE' | 'FIXED_TIMED'>('AI_ADAPTIVE');
  const [congestionLevel, setCongestionLevel] = useState<number>(65); // 20 - 100%
  const [transitPriority, setTransitPriority] = useState<boolean>(true);
  const [hasEmergencyActive, setHasEmergencyActive] = useState<boolean>(false);
  const [signalState, setSignalState] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [timerCount, setTimerCount] = useState<number>(14);

  // Computed metrics based on mode & congestion level
  const queueLength = mode === 'AI_ADAPTIVE' 
    ? Math.round((congestionLevel * 0.35) * (hasEmergencyActive ? 0.4 : 1))
    : Math.round(congestionLevel * 0.85);

  const avgLatencySec = mode === 'AI_ADAPTIVE'
    ? Math.round(12 + congestionLevel * 0.15)
    : Math.round(35 + congestionLevel * 0.45);

  const co2Index = mode === 'AI_ADAPTIVE'
    ? (1.2 + (congestionLevel / 100) * 0.6).toFixed(1)
    : (2.8 + (congestionLevel / 100) * 1.5).toFixed(1);

  // Simulation timer tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (signalState === 'GREEN') {
            setSignalState('YELLOW');
            return 3;
          } else if (signalState === 'YELLOW') {
            setSignalState('RED');
            return mode === 'AI_ADAPTIVE' ? 6 : 15;
          } else {
            setSignalState('GREEN');
            return mode === 'AI_ADAPTIVE' ? 14 : 20;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, signalState, mode]);

  const triggerEmergencyWave = () => {
    setHasEmergencyActive(true);
    setMode('AI_ADAPTIVE');
    setSignalState('GREEN');
    setTimerCount(25);
    setTimeout(() => {
      setHasEmergencyActive(false);
    }, 8000);
  };

  return (
    <Card variant="dark" className="p-6 shadow-2xl border border-gray-800" id="sandbox">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="accent" size="sm">
              INTERACTIVE DEMO SANDBOX
            </Badge>
            <span className="text-xs text-gray-400 font-mono">NODE #409 (4-WAY CORRIDOR)</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            Real-Time Traffic Light & Signal Simulator
          </h3>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-gray-700 text-gray-200 hover:bg-gray-800"
            leftIcon={isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          >
            {isPlaying ? 'Pause Simulation' : 'Run Simulation'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCongestionLevel(50);
              setMode('AI_ADAPTIVE');
              setHasEmergencyActive(false);
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Control Panel Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-800">
        {/* Signal Mode Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Signal Optimization Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800">
            <button
              type="button"
              onClick={() => setMode('AI_ADAPTIVE')}
              className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                mode === 'AI_ADAPTIVE'
                  ? 'bg-[#006D77] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 inline mr-1" />
              NEXUS AI
            </button>
            <button
              type="button"
              onClick={() => setMode('FIXED_TIMED')}
              className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                mode === 'FIXED_TIMED'
                  ? 'bg-gray-700 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Legacy Timer
            </button>
          </div>
        </div>

        {/* Traffic Density Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-300">
              Vehicle Inflow Volume
            </span>
            <span className="font-mono text-[#83C5BE] font-bold">{congestionLevel}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={congestionLevel}
            onChange={(e) => setCongestionLevel(Number(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#006D77]"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Light Flow</span>
            <span>Rush Hour Gridlock</span>
          </div>
        </div>

        {/* Special Priority Injector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Emergency & Fleet Preemption
          </label>
          <Button
            variant="accent"
            size="sm"
            onClick={triggerEmergencyWave}
            disabled={hasEmergencyActive}
            className="w-full text-xs font-bold shadow-lg"
            leftIcon={<Truck className="w-4 h-4 animate-bounce" />}
          >
            {hasEmergencyActive ? 'Emergency Wave In Progress...' : 'Inject Ambulance Preemption'}
          </Button>
        </div>
      </div>

      {/* Live Canvas Visualizer & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Interactive Intersection SVG Diagram */}
        <div className="lg:col-span-7 relative bg-gray-950 rounded-2xl p-4 border border-gray-800 min-h-[300px] flex items-center justify-center">
          <svg className="w-full h-72" viewBox="0 0 500 300">
            {/* Roads */}
            <rect x="0" y="110" width="500" height="80" fill="#111827" />
            <rect x="210" y="0" width="80" height="300" fill="#111827" />

            {/* Lane dividers */}
            <line x1="0" y1="150" x2="500" y2="150" stroke="#374151" strokeDasharray="8 8" strokeWidth="2" />
            <line x1="250" y1="0" x2="250" y2="300" stroke="#374151" strokeDasharray="8 8" strokeWidth="2" />

            {/* Stop Lines */}
            <line x1="200" y1="110" x2="200" y2="190" stroke="#F59E0B" strokeWidth="4" />

            {/* Traffic Signal Light Display */}
            <g transform="translate(180, 70)">
              <rect x="0" y="0" width="30" height="35" rx="6" fill="#1F2937" stroke="#374151" />
              <circle
                cx="15"
                cy="17.5"
                r="10"
                fill={
                  signalState === 'GREEN'
                    ? '#16A34A'
                    : signalState === 'YELLOW'
                    ? '#F59E0B'
                    : '#DC2626'
                }
                className="transition-colors duration-300"
              />
            </g>

            {/* Countdown Badge inside SVG */}
            <text x="220" y="92" fill="#FFFFFF" fontSize="16" fontFamily="monospace" fontWeight="bold">
              {timerCount}s
            </text>

            {/* Queue Cars (Animated dots) */}
            {[...Array(Math.min(queueLength, 12))].map((_, i) => (
              <circle
                key={i}
                cx={180 - i * 16}
                cy={130}
                r="6"
                fill={hasEmergencyActive && i === 0 ? '#EF4444' : '#83C5BE'}
                className="transition-all duration-500"
              />
            ))}

            {/* Emergency Vehicle Glow Banner if active */}
            {hasEmergencyActive && (
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="220" height="30" rx="8" fill="#DC2626" opacity="0.9" />
                <text x="12" y="20" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                  AMBULANCE V2X PRIORITY WAVE
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Right Live Telemetry Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Current Phase Timer</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {signalState} ({timerCount}s)
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              signalState === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Vehicle Queue Length</span>
              <div className="text-2xl font-extrabold text-white mt-1">{queueLength} cars</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {mode === 'AI_ADAPTIVE' ? '↓ 62% vs legacy static timer' : '↑ Bottleneck forming'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Avg Intersection Latency</span>
              <div className="text-2xl font-extrabold text-[#83C5BE] mt-1">{avgLatencySec} sec</div>
              <div className="text-[10px] text-emerald-400 mt-1">
                {mode === 'AI_ADAPTIVE' ? 'Optimal Flow Rate' : 'Delayed'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Idling Emission Index:</span>
              <span className="font-mono font-bold text-emerald-400">{co2Index} kg CO2/min</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === 'AI_ADAPTIVE' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((Number(co2Index) / 4.5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
