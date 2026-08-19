import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_nexus_key', {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'NEXUS Urban AI SaaS',
    version: '1.0.0',
  },
});

export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Starter Municipal',
    priceMonthly: 0,
    priceAnnual: 0,
    priceId: '',
    intersectionsLimit: 5,
    features: [
      'Up to 5 AI-managed Intersections',
      'Standard Traffic Signal Simulator',
      'Basic Delay & Congestion Analytics',
      'Community & Email Support',
      'Standard Map Layer Views'
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Municipal Pro',
    priceMonthly: 499,
    priceAnnual: 399, // billed annually ($4,788/yr)
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly_mock',
    intersectionsLimit: 50,
    features: [
      'Up to 50 Adaptive AI Intersections',
      'Real-time Autonomous Fleet Priority Override',
      'High-Frequency Congestion Heatmaps (10s updates)',
      'Sub-Second Signal Optimization Engine',
      'CSV / GeoJSON Data Exporting',
      '24/7 Priority SLA & Dedicated Signal Engineer Support'
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Metropolitan Enterprise',
    priceMonthly: 1999,
    priceAnnual: 1599, // billed annually
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_ent_monthly_mock',
    intersectionsLimit: 9999,
    features: [
      'Unlimited City-Wide Intersections & Regional Grid',
      'Emergency Transit Green Wave Automatic Routing',
      'Custom Deep RL Model Fine-Tuning on Historical Traffic',
      'Dedicated On-Premise / Private Cloud Hybrid Bridge',
      'Custom API & SCATS / NEMA Signal Controller Integration',
      'Quarterly Infrastructure Audits & Guaranteed 99.99% Uptime'
    ],
  },
};
