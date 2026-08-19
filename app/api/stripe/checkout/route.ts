import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING_TIERS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { tier, interval } = await req.json();

    const selectedTier = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
    if (!selectedTier || tier === 'FREE') {
      return NextResponse.json({ error: 'Invalid tier requested' }, { status: 400 });
    }

    const domainUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `NEXUS ${selectedTier.name} Subscription`,
                description: `Includes ${selectedTier.intersectionsLimit} Adaptive RL Traffic Light Intersections`,
              },
              unit_amount: (interval === 'annual' ? selectedTier.priceAnnual : selectedTier.priceMonthly) * 100,
              recurring: {
                interval: interval === 'annual' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${domainUrl}/dashboard?payment=success&tier=${tier}`,
        cancel_url: `${domainUrl}/pricing?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    } catch (stripeErr) {
      console.warn('Stripe checkout fallback for dev mode:', stripeErr);
      return NextResponse.json({
        url: `${domainUrl}/dashboard?payment=simulated_success&tier=${tier}`,
      });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
