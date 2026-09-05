"use client";

import React, { useState } from 'react';
import { Sparkles, Send, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
const API_URL = "/api";

interface AIInsightsWidgetProps {
  eventId: string;
}

export function AIInsightsWidget({ eventId }: AIInsightsWidgetProps) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    answer: string;
    usedFallback: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = [
    'What time did check-ins peak?',
    'How many spots are remaining?',
    'Who was the first person to check in?',
    'Give me an event status overview.'
  ];

  const handleAskAI = async (selectedQuery?: string) => {
    const q = selectedQuery || query;
    if (!q.trim() || !eventId) return;

    setLoading(true);
    setError(null);
    setQuery(q);

    try {
      const res = await fetch(`${API_URL}/events/ai-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, query: q })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI insights.');
      }

      setResponse({
        answer: data.answer,
        usedFallback: data.usedFallback
      });
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-purple-500/20 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Event Insights
            </h3>
            <p className="text-xs text-gray-400">Ask natural language questions about live check-in statistics</p>
          </div>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAskAI(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-800/80 hover:bg-purple-600/20 hover:text-purple-300 text-gray-300 border border-gray-700 hover:border-purple-500/40 transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskAI();
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What time did check-ins peak?"
          className="flex-1 glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="gradient-btn px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 text-white shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Box */}
      {response && (
        <div className="mt-4 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>AI Analyst Response</span>
            </div>
            {response.usedFallback ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                Statistical Fallback Engine
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Gemini LLM Live Context
              </span>
            )}
          </div>
          <div className="text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line">
            {response.answer}
          </div>
        </div>
      )}
    </div>
  );
}
