import { NextRequest, NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';
import { analyzeEventStats } from '@/lib/fallbackAiEngine';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const roleCheck = requireRole(user, 'organizer');
    if (roleCheck.error) return roleCheck.error;

    const body = await req.json();
    const { eventId, query: userQuery } = body;

    if (!eventId || !userQuery) {
      return NextResponse.json({ error: 'eventId and query string are required.' }, { status: 400 });
    }

    const eventRes = await dbQuery('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }
    const event = eventRes.rows[0];

    const attendeesRes = await dbQuery(
      'SELECT id, attendee_name, attendee_email, status, checked_in_at, created_at FROM attendees WHERE event_id = $1',
      [eventId]
    );
    const attendees = attendeesRes.rows;
    const totalRegistered = attendees.length;
    const checkedInCount = event.checked_in_count;

    const hourlyDistribution: Record<string, number> = {};
    attendees.forEach((a: any) => {
      if (a.status === 'checked_in' && a.checked_in_at) {
        const dateObj = new Date(a.checked_in_at);
        const hourLabel = `${dateObj.getHours().toString().padStart(2, '0')}:00 - ${(dateObj.getHours() + 1).toString().padStart(2, '0')}:00`;
        hourlyDistribution[hourLabel] = (hourlyDistribution[hourLabel] || 0) + 1;
      }
    });

    const statsContext = {
      event,
      totalRegistered,
      checkedInCount,
      hourlyDistribution,
      attendees
    };

    let aiAnswer = null;
    let usedFallback = false;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an AI Event Operations Analyst. Answer the user question concisely using the following live PostgreSQL check-in metrics context.
        
Context:
- Event Title: ${event.title}
- Event Capacity: ${event.capacity}
- Total Registrations: ${totalRegistered}
- Current Checked-In Count: ${checkedInCount}
- Check-in Fill Percentage: ${((checkedInCount / event.capacity) * 100).toFixed(1)}%
- Hourly Check-in Distribution: ${JSON.stringify(hourlyDistribution)}
- Recent Attendees: ${JSON.stringify(attendees.slice(0, 10).map((a: any) => ({ name: a.attendee_name, status: a.status, checked_in_at: a.checked_in_at })))}

User Question: "${userQuery}"

Provide a direct, helpful, and concise answer formatted with markdown bullet points where appropriate.`;

        const llmPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM_TIMEOUT')), 4000)
        );

        const response: any = await Promise.race([llmPromise, timeoutPromise]);
        aiAnswer = response.text;
      } catch (llmErr: any) {
        console.warn('LLM API call timed out or failed, switching to Graceful Fallback Engine:', llmErr.message);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    if (!aiAnswer) {
      aiAnswer = analyzeEventStats(userQuery, statsContext);
    }

    return NextResponse.json({
      query: userQuery,
      answer: aiAnswer,
      usedFallback,
      contextSummary: {
        eventId,
        checkedInCount,
        capacity: event.capacity,
        totalRegistered
      }
    });
  } catch (err) {
    console.error('AI Insights Controller error:', err);
    return NextResponse.json({ error: 'Internal server error processing AI insight query.' }, { status: 500 });
  }
}
