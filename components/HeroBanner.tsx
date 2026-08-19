'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Shield, Cpu, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export const HeroBanner: React.FC = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#006D77]/5 via-transparent to-transparent pb-16 pt-8">
      {/* Background Animated SVG Grid Graphic */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#006D77" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge variant="secondary" className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
              <SparklesIcon className="w-3.5 h-3.5 mr-1.5 inline text-[#004D55]" />
              NEXUS v4.2 Release • Real-Time RL Signal Priority Engine
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Eliminate Gridlock with <span className="gradient-heading">Adaptive AI Signal Control</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed max-w-2xl">
              Transform municipal traffic corridors into synchronized intelligent grids. NEXUS coordinates signals, prioritizes public transit, and clears emergency corridors in real time—reducing average transit delays by up to 38%.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link href="/solutions#sandbox">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-xl"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Test Interactive Sandbox
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setVideoModalOpen(true)}
                className="w-full sm:w-auto border-2 border-gray-300 text-gray-800 hover:border-[#006D77]"
                leftIcon={<Play className="w-4 h-4 fill-current text-[#006D77]" />}
              >
                Watch 2-Min Architecture Overview
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-gray-200/80 flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-500">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-[#006D77]" />
                <span>Department of Transportation Compliant</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-[#006D77]" />
                <span>NEMA & SCATS Protocol Compatible</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#006D77]" />
                <span>Sub-100ms Signal Latency</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Visual Traffic Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Decorative Glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#006D77] via-[#83C5BE] to-[#E29578] opacity-30 blur-xl animate-pulse-glow" />

              <div className="relative rounded-2xl dark-glass-panel text-white p-6 shadow-2xl space-y-5 border border-gray-700/80">
                {/* Header Widget Bar */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      LIVE CORRIDOR TELEMETRY
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">NODE #784 - GRAND AVE</span>
                </div>

                {/* Simulated Signal Junction Visual */}
                <div className="relative h-48 bg-gray-900/90 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                    {/* Horizontal & Vertical Road Lines */}
                    <rect x="0" y="85" width="400" height="30" fill="#1F2937" />
                    <rect x="185" y="0" width="30" height="200" fill="#1F2937" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#374151" strokeDasharray="6 6" strokeWidth="2" />
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#374151" strokeDasharray="6 6" strokeWidth="2" />

                    {/* Dynamic Moving Vehicles */}
                    <circle cx="90" cy="100" r="4" fill="#83C5BE" className="animate-pulse" />
                    <circle cx="140" cy="100" r="4" fill="#83C5BE" />
                    <circle cx="200" cy="60" r="5" fill="#E29578" />
                    <circle cx="200" cy="130" r="4" fill="#83C5BE" />

                    {/* Signal Lights */}
                    <circle cx="175" cy="75" r="5" fill="#16A34A" className="shadow-lg shadow-emerald-500" />
                    <circle cx="225" cy="125" r="5" fill="#16A34A" />
                  </svg>

                  {/* Realtime Float Card Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-gray-950/80 backdrop-blur-md border border-gray-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300">Signal Priority Status:</span>
                    <span className="text-emerald-400 font-bold">TRANSIT WAVE ACTIVE</span>
                  </div>
                </div>

                {/* Performance Gauge Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                    <div className="text-xs text-gray-400">Queue Clearance</div>
                    <div className="text-xl font-bold text-white mt-1">94.2%</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">↑ +14% vs Static Cycles</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                    <div className="text-xs text-gray-400">Avg Corridor Latency</div>
                    <div className="text-xl font-bold text-[#83C5BE] mt-1">18.4 sec</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">↓ 32.1 sec Baseline</div>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-[#006D77]" />
                  <span>Synchronized across 1,420 city intersections</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overview */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="NEXUS Urban AI Architecture Walkthrough"
        maxWidth="lg"
      >
        <div className="space-y-4 text-gray-700 dark:text-gray-200">
          <div className="relative aspect-video rounded-xl bg-gray-900 flex items-center justify-center border border-gray-800 overflow-hidden">
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#006D77] text-white mx-auto flex items-center justify-center shadow-xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-sm font-semibold text-white">
                Interactive Architecture & Reinforcement Learning Model Simulation
              </p>
              <p className="text-xs text-gray-400">
                (Demonstrating SCATS & NEMA controller integration, real-time edge streaming, and emergency vehicle green wave priority)
              </p>
            </div>
          </div>
          <p className="text-sm">
            NEXUS connects to existing traffic cabinet hardware using secure MQTT/gRPC protocols. Deep reinforcement learning agents process camera and loop sensor telemetry to dynamically re-phase signals every 2.5 seconds.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setVideoModalOpen(false)}>
              Close Demo Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
    </svg>
  );
}
