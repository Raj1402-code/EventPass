'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111827] text-white border-t border-gray-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006D77] to-[#83C5BE] flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                NEXUS<span className="text-[#83C5BE] font-bold">.AI</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              NEXUS is the Next-Generation Urban Traffic & Transit Intelligence Platform. Empowering municipal engineers and fleet operators with dynamic AI signal prioritization, zero-latency sensor networks, and emergency green corridor routing.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#83C5BE]">
              <ShieldCheck className="w-4 h-4" />
              <span>WCAG 2.1 AA Compliant & SOC2 Type II Certified</span>
            </div>
          </div>

          {/* Solution Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/solutions#transit-ai" className="hover:text-[#83C5BE] transition-colors">
                  Transit Signal Priority
                </Link>
              </li>
              <li>
                <Link href="/solutions#fleet" className="hover:text-[#83C5BE] transition-colors">
                  Autonomous Fleet Rerouting
                </Link>
              </li>
              <li>
                <Link href="/solutions#heatmaps" className="hover:text-[#83C5BE] transition-colors">
                  Congestion Heatmaps
                </Link>
              </li>
              <li>
                <Link href="/solutions#emergency" className="hover:text-[#83C5BE] transition-colors">
                  Emergency Green Wave
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/pricing" className="hover:text-[#83C5BE] transition-colors">
                  Enterprise Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#83C5BE] transition-colors">
                  Request Municipal Demo
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#83C5BE] transition-colors">
                  Command Center Sign-In
                </Link>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#83C5BE] transition-colors">
                  Privacy & Data Sovereignty
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Urban AI Briefing
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Monthly insights on municipal AI models, traffic telemetry, and zero-emission corridors.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Subscribed! Check your inbox for the latest report.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="city.engineer@metro.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#83C5BE]"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" className="w-full text-xs">
                  <span>Subscribe</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} NEXUS Urban Intelligence Inc. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#terms" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="#privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#security" className="hover:text-gray-300 transition-colors">
              Security Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
