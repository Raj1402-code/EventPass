"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '../utils/useRouter';
import { useAuth } from '../context/AuthContext';
import { SOCKET_URL } from '../config';
import { ShieldCheck, UserCheck, LayoutDashboard, Ticket, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'organizer' | 'attendee'>('organizer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/attendee');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(`${SOCKET_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      login(data.token, data.user);
      if (data.user.role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/attendee');
      }
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-btn mb-4 shadow-xl shadow-indigo-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            EventPass <span className="gradient-text">AI</span>
          </h1>
          <p className="text-xs text-gray-400">
            {isRegister ? 'Create an account to manage or attend events' : 'Sign in to access real-time event operations'}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="flex bg-gray-900/80 p-1 rounded-2xl mb-6 border border-gray-800">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isRegister ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isRegister ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            I am an:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                role === 'organizer'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/10'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Organizer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('attendee')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                role === 'attendee'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-md shadow-pink-500/10'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Attendee</span>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account & Continue' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
