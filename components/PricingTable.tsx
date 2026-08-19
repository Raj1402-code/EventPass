'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, HelpCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PRICING_TIERS } from '@/lib/stripe';

export const PricingTable: React.FC = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectTier = async (tierKey: string) => {
    setLoadingTier(tierKey);

    if (tierKey === 'FREE') {
      router.push('/dashboard');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierKey,
          interval: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback to demo contact/dashboard if Stripe keys are not live yet
        router.push(`/dashboard?plan=${tierKey.toLowerCase()}`);
      }
    } catch (err) {
      console.error(err);
      router.push(`/dashboard?plan=${tierKey.toLowerCase()}`);
    } finally {
      setLoadingTier(null);
    }
  };

  const matrixFeatures = [
    {
      name: 'AI Adaptive Signal Intersections',
      free: 'Up to 5',
      pro: 'Up to 50',
      enterprise: 'Unlimited',
    },
    {
      name: 'Sub-Second Signal Re-phasing',
      free: 'Standard',
      pro: 'Priority (<100ms)',
      enterprise: 'Ultra-Low Latency (<50ms)',
    },
    {
      name: 'Emergency Transit Green Wave',
      free: '—',
      pro: 'Enabled',
      enterprise: 'Encrypted V2X + Automated',
    },
    {
      name: 'Historical Congestion Heatmaps',
      free: '24-hour retention',
      pro: '90-day retention',
      enterprise: '5-year retention & RL training',
    },
    {
      name: 'SCATS / NTCIP Hardware Integration',
      free: '—',
      pro: 'Standard Adapter',
      enterprise: 'Dedicated Hybrid Bridge',
    },
    {
      name: 'Dedicated Signal Engineer Support',
      free: 'Community',
      pro: '24/7 Email & Phone',
      enterprise: 'Dedicated On-Call Specialist',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Billing Interval Switcher */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              !isAnnual
                ? 'bg-white dark:bg-gray-900 text-[#006D77] shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-1.5 ${
              isAnnual
                ? 'bg-[#006D77] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-emerald-400 text-gray-900 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          * Flexible municipal billing options available via purchase order (PO) or annual wire transfer.
        </p>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Starter Free Tier */}
        <Card variant="hover" className="flex flex-col justify-between border-2 border-gray-200">
          <div>
            <CardHeader className="space-y-2">
              <Badge variant="outline" className="w-fit">
                {PRICING_TIERS.FREE.name}
              </Badge>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 text-sm font-semibold">/ month</span>
              </div>
              <p className="text-xs text-gray-500">
                Ideal for initial corridor trials & university research projects.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 border-t border-gray-100">
              <ul className="space-y-2.5 text-sm text-gray-700">
                {PRICING_TIERS.FREE.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-[#006D77] mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <CardFooter className="pt-6">
            <Button
              variant="outline"
              className="w-full"
              isLoading={loadingTier === 'FREE'}
              onClick={() => handleSelectTier('FREE')}
            >
              Start Free Trial
            </Button>
          </CardFooter>
        </Card>

        {/* Municipal Pro Tier (Highlighted) */}
        <Card variant="default" className="flex flex-col justify-between border-2 border-[#006D77] shadow-2xl relative scale-105 z-10 bg-white">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge variant="primary" className="bg-[#006D77] text-white px-4 py-1 font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
              MOST POPULAR MUNICIPAL TIER
            </Badge>
          </div>
          <div>
            <CardHeader className="space-y-2 pt-8">
              <Badge variant="primary" className="w-fit">
                {PRICING_TIERS.PRO.name}
              </Badge>
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-extrabold text-gray-900">
                  ${isAnnual ? PRICING_TIERS.PRO.priceAnnual : PRICING_TIERS.PRO.priceMonthly}
                </span>
                <span className="text-gray-500 text-sm font-semibold">/ month per node</span>
              </div>
              <p className="text-xs text-[#006D77] font-semibold">
                {isAnnual ? 'Billed annually ($4,788/yr per node)' : 'Billed monthly'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 border-t border-gray-100">
              <ul className="space-y-2.5 text-sm text-gray-700">
                {PRICING_TIERS.PRO.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-[#006D77] mr-2 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <CardFooter className="pt-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-xl"
              isLoading={loadingTier === 'PRO'}
              onClick={() => handleSelectTier('PRO')}
            >
              Deploy Pro Corridor
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Tier */}
        <Card variant="dark" className="flex flex-col justify-between border-2 border-gray-800 shadow-xl">
          <div>
            <CardHeader className="space-y-2">
              <Badge variant="accent" className="w-fit">
                {PRICING_TIERS.ENTERPRISE.name}
              </Badge>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-white">
                  ${isAnnual ? PRICING_TIERS.ENTERPRISE.priceAnnual : PRICING_TIERS.ENTERPRISE.priceMonthly}
                </span>
                <span className="text-gray-400 text-sm font-semibold">/ month</span>
              </div>
              <p className="text-xs text-gray-400">
                For major metropolitan city grids requiring custom RL model training & SLA.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 border-t border-gray-800">
              <ul className="space-y-2.5 text-sm text-gray-300">
                {PRICING_TIERS.ENTERPRISE.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-[#83C5BE] mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <CardFooter className="pt-6">
            <Button
              variant="accent"
              className="w-full shadow-lg"
              isLoading={loadingTier === 'ENTERPRISE'}
              onClick={() => handleSelectTier('ENTERPRISE')}
            >
              Contact City Sales
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="space-y-6 pt-12">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900">
            Full Tier Capability Matrix
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare technical capabilities across municipal deployment tiers.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-gray-900">Platform Capability</th>
                <th className="py-4 px-6 font-bold text-[#006D77]">Starter</th>
                <th className="py-4 px-6 font-bold text-[#006D77]">Municipal Pro</th>
                <th className="py-4 px-6 font-bold text-[#E29578]">Enterprise Grid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matrixFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3.5 px-6 text-gray-600">{row.free}</td>
                  <td className="py-3.5 px-6 font-semibold text-[#006D77]">{row.pro}</td>
                  <td className="py-3.5 px-6 font-semibold text-gray-900">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
