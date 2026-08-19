'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('demo@nexus-urban.ai');
  const [password, setPassword] = useState('demo123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.ok) {
        router.push(callbackUrl);
      } else {
        setError(res?.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#006D77]/5 to-transparent px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006D77] to-[#83C5BE] flex items-center justify-center shadow-xl mx-auto">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            NEXUS Command Center
          </h1>
          <p className="text-xs text-gray-600">
            Enterprise Sign-In for Municipal Traffic Engineers
          </p>
        </div>

        <Card variant="default" className="p-8 shadow-2xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
              <span className="font-bold">Demo Login Pre-filled:</span> Simply click 'Sign In to Command Center' to test live dashboard features.
            </div>

            <Input
              label="Municipal Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Command Center
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-500 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#006D77] mr-1" />
          <span>Encrypted 256-Bit SSL • SOC 2 Type II Certified</span>
        </p>
      </div>
    </div>
  );
}
