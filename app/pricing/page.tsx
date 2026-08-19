import React from 'react';
import { PricingTable } from '@/components/PricingTable';
import { Accordion } from '@/components/ui/Accordion';

export default function PricingPage() {
  const faqItems = [
    {
      id: 'faq-1',
      title: 'Can municipal authorities purchase via Purchase Order (PO) or procurement bid?',
      content:
        'Yes. NEXUS supports formal municipal procurement, master service agreements (MSA), purchase order billing, and net-60 invoicing. Contact our city sales team to receive a tailored procurement packet.',
    },
    {
      id: 'faq-2',
      title: 'Is there a minimum intersection requirement for the Pro tier?',
      content:
        'No. Municipal Pro can be deployed on a single signal junction or expanded corridor-by-corridor. Volume pricing discounts automatically kick in for deployments exceeding 25 nodes.',
    },
    {
      id: 'faq-3',
      title: 'What hardware is required inside our traffic signal cabinets?',
      content:
        'Zero cabinet replacement is required. NEXUS runs on standard ARM/x86 DIN-rail edge hardware (such as Siemens, Yunex, or Econolite edge computers) or via direct software integration with central ATMS software.',
    },
    {
      id: 'faq-4',
      title: 'How long does a typical 10-intersection corridor deployment take?',
      content:
        'Most 10-intersection corridors are fully online within 2 to 4 weeks, including hardware cabinet connectivity verification, model shadow testing, and signal timing sign-off.',
    },
  ];

  return (
    <div className="py-12 space-y-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-[#006D77]/10 text-[#006D77] rounded-full border border-[#006D77]/20">
          TRANSPARENT MUNICIPAL PRICING
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
          Flexible Pricing Built for City Budgets
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          No hidden implementation fees. Pay per active intersection node with full SCATS & NEMA adapter support included.
        </p>
      </div>

      {/* Main Pricing Cards & Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTable />
      </div>

      {/* Pricing FAQ Accordion */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Pricing Questions
          </h2>
          <p className="text-sm text-gray-600">
            Need help choosing the right tier for your city mobility project?
          </p>
        </div>

        <Accordion items={faqItems} />
      </div>
    </div>
  );
}
