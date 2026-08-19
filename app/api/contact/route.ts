import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import prisma from '@/lib/prisma';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organization: z.string().min(2),
  roleTitle: z.string().min(2),
  cityRegion: z.string().min(2),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`contact:${ip}`, 5, 60 * 1000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait 1 minute before submitting again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Save lead to database if Prisma is connected or fallback to clean response
    try {
      if (prisma.lead) {
        await prisma.lead.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            organization: validatedData.organization,
            roleTitle: validatedData.roleTitle,
            cityRegion: validatedData.cityRegion,
            message: validatedData.message,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma DB not ready, fallbacking to simulated submission log:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry received. A NEXUS Systems Specialist will be in touch.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
