const db = require('../config/db');
const { analyzeEventStats } = require('../utils/fallbackAiEngine');

async function getAiInsights(req, res) {
  try {
    const { eventId, query: userQuery } = req.body;

    if (!eventId || !userQuery) {
      return res.status(400).json({ error: 'eventId and query string are required.' });
    }

    // 1. Fetch Event metadata
    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventRes.rows[0];

    // 2. Fetch Attendees and Check-in audit logs
    const attendeesRes = await db.query(
      'SELECT id, attendee_name, attendee_email, status, checked_in_at, created_at FROM attendees WHERE event_id = $1',
      [eventId]
    );
    const attendees = attendeesRes.rows;
    const totalRegistered = attendees.length;
    const checkedInCount = event.checked_in_count;

    // 3. Aggregate Hourly Check-in Distribution
    const hourlyDistribution = {};
    attendees.forEach(a => {
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

    // 4. Try LLM Call with timeout safety wrapper (4000ms limit)
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
- Recent Attendees: ${JSON.stringify(attendees.slice(0, 10).map(a => ({ name: a.attendee_name, status: a.status, checked_in_at: a.checked_in_at })))}

User Question: "${userQuery}"

Provide a direct, helpful, and concise answer formatted with markdown bullet points where appropriate.`;

        // 4 second timeout wrapper
        const llmPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('LLM_TIMEOUT')), 4000)
        );

        const response = await Promise.race([llmPromise, timeoutPromise]);
        aiAnswer = response.text;
      } catch (llmErr) {
        console.warn('LLM API call timed out or failed, switching to Graceful Fallback Engine:', llmErr.message);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 5. Use Fallback Engine if LLM did not run or failed
    if (!aiAnswer) {
      aiAnswer = analyzeEventStats(userQuery, statsContext);
    }

    return res.json({
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
    return res.status(500).json({ error: 'Internal server error processing AI insight query.' });
  }
}

module.exports = {
  getAiInsights
};
