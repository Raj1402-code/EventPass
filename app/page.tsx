import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { HeroBanner } from '@/components/HeroBanner';
import { StatCounter } from '@/components/StatCounter';
import { FeatureGrid } from '@/components/FeatureGrid';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { InteractiveTrafficSimulator } from '@/components/InteractiveTrafficSimulator';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Live Impact Statistics Bar */}
      <StatCounter />

      {/* Interactive Simulation Sandbox Teaser */}
      <section className="py-16 bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-[#006D77] text-white rounded-full">
              LIVE INTERACTIVE ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Test NEXUS Signal Priority in Action
            </h2>
            <p className="text-gray-400 text-base">
              Adjust vehicle inflow volume, toggle between legacy static timing and NEXUS Reinforcement Learning, or trigger an emergency ambulance green wave.
            </p>
          </div>

          <InteractiveTrafficSimulator />
        </div>
      </section>

      {/* Comprehensive Feature Grid */}
      <FeatureGrid />

      {/* Testimonials & Case Studies */}
      <TestimonialCarousel />

      {/* Conversion CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#006D77] via-[#004D55] to-[#111827] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Eliminate Corridor Gridlock in Your City?
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Join leading municipal transportation authorities. Deploy NEXUS on up to 5 intersections free for 30 days with full SCATS & NEMA hardware integration support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button
                variant="accent"
                size="lg"
                className="shadow-2xl px-8"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Schedule Municipal Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#006D77]"
              >
                Explore Pricing Plans
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-300 font-medium">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-[#83C5BE]" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-[#83C5BE]" />
              <span>Zero Cabinet Hardware Replacement Needed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
