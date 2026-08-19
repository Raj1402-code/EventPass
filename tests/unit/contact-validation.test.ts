import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid work email address.'),
  organization: z.string().min(2),
  roleTitle: z.string().min(2),
  cityRegion: z.string().min(2),
  message: z.string().min(10),
});

describe('Contact Form Zod Schema Validation', () => {
  it('validates a correct municipal contact form submission', () => {
    const validData = {
      name: 'Dr. Sarah Jenkins',
      email: 'sjenkins@metrotransit.gov',
      organization: 'Metro Department of Transportation',
      roleTitle: 'Chief Mobility Officer',
      cityRegion: 'Metro City, CA',
      message: 'We want to test NEXUS on 15 intersections along Grand Avenue.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email formats', () => {
    const invalidEmailData = {
      name: 'Sarah',
      email: 'not-an-email',
      organization: 'DOT',
      roleTitle: 'Engineer',
      cityRegion: 'Metro',
      message: 'Testing message input content.',
    };

    const result = contactSchema.safeParse(invalidEmailData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('valid work email');
    }
  });

  it('rejects message shorter than 10 characters', () => {
    const shortMessageData = {
      name: 'Sarah',
      email: 's@dot.gov',
      organization: 'DOT',
      roleTitle: 'Engineer',
      cityRegion: 'Metro',
      message: 'Too short',
    };

    const result = contactSchema.safeParse(shortMessageData);
    expect(result.success).toBe(false);
  });
});
