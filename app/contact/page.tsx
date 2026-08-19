import React from 'react';
import { Mail, Phone, MapPin, Building2, Clock, ShieldCheck } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { Card } from '@/components/ui/Card';

export default function ContactPage() {
  return (
    <div className="py-12 space-y-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-[#006D77]/10 text-[#006D77] rounded-full border border-[#006D77]/20">
          MUNICIPAL SOLUTIONS DESK
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Connect with NEXUS Traffic Engineers
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Whether you need a live signal simulation for your city council or hardware cabinet verification, our engineering team is here to assist.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Information & Map Embed */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Headquarters & Regional Offices
              </h2>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#006D77]/10 text-[#006D77] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">NEXUS AI Innovation Hub</h4>
                    <p className="text-gray-600">
                      500 Mobility Way, Suite 1200<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#006D77]/10 text-[#006D77] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Direct Engineering Inquiries</h4>
                    <p className="text-gray-600">solutions@nexus-urban.ai</p>
                    <p className="text-xs text-gray-500">24/7 SLA Response for Municipal Partners</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#006D77]/10 text-[#006D77] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Municipal Hotline</h4>
                    <p className="text-gray-600">+1 (800) 555-NEXUS (6398)</p>
                    <p className="text-xs text-gray-500">Mon - Fri • 8:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Google Maps Vector Embed */}
            <Card variant="default" className="p-2 overflow-hidden border border-gray-200 shadow-md">
              <div className="relative h-64 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
                  <rect width="100%" height="100%" fill="#111827" />
                  {/* Map roads grid */}
                  <path d="M 0 100 H 400 M 0 180 H 400 M 120 0 V 250 M 280 0 V 250" stroke="#1F2937" strokeWidth="12" />
                  <path d="M 0 100 H 400 M 120 0 V 250" stroke="#006D77" strokeWidth="2" strokeDasharray="4 4" />
                  {/* Pin */}
                  <g transform="translate(200, 100)">
                    <circle cx="0" cy="0" r="16" fill="#006D77" opacity="0.4" className="animate-ping" />
                    <circle cx="0" cy="0" r="8" fill="#E29578" stroke="#FFFFFF" strokeWidth="2" />
                  </g>
                </svg>

                <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-gray-950/90 backdrop-blur-md rounded-lg border border-gray-800 text-xs text-gray-300 flex items-center justify-between">
                  <span className="font-bold text-white">NEXUS HQ - Urban Telemetry Lab</span>
                  <span className="text-emerald-400 font-mono">37.7749° N, 122.4194° W</span>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-xl bg-[#006D77]/10 border border-[#006D77]/20 text-xs text-[#004D55] space-y-1">
              <div className="font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-[#006D77]" />
                Security & Data Sovereignty Assurance
              </div>
              <p className="text-gray-600">
                All communications and network simulation uploads are protected under municipal NDA and SOC 2 Type II strict encryption protocols.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
