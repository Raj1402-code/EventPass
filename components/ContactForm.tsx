'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid work email address.'),
  organization: z.string().min(2, 'Organization / City department is required.'),
  roleTitle: z.string().min(2, 'Job title is required.'),
  cityRegion: z.string().min(2, 'City / Region name is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setIsSubmitted(true);
        reset();
      } else {
        setServerError(result.error || 'Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      setServerError('A network error occurred. Please check your connection.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
      {isSubmitted ? (
        <div className="text-center py-12 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Demo Request Received!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm leading-relaxed">
            Thank you for reaching out. A Senior NEXUS Systems Specialist will review your city corridor requirements and schedule a live simulation demo within 24 hours.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsSubmitted(false)}
          >
            Submit Another Request
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Schedule a Live Municipal Demo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Speak directly with our traffic RL engineers and evaluate hardware compatibility.
            </p>
          </div>

          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Dr. Sarah Jenkins"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Work Email *"
              type="email"
              placeholder="jenkins@cityofmetro.gov"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization / Department *"
              placeholder="Dept of Transportation"
              error={errors.organization?.message}
              {...register('organization')}
            />
            <Input
              label="Job Title *"
              placeholder="Chief Mobility Officer"
              error={errors.roleTitle?.message}
              {...register('roleTitle')}
            />
          </div>

          <Input
            label="City & Region *"
            placeholder="Metro City, CA"
            error={errors.cityRegion?.message}
            {...register('cityRegion')}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Corridor Scope & Technical Requirements *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your current traffic signal controllers (NEMA/SCATS), number of intersections, and priority goals (e.g. Bus corridor priority, congestion reduction)."
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 text-sm focus:ring-2 focus:ring-[#006D77] focus:border-transparent transition-colors"
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Submit Request to Solutions Team
          </Button>

          <p className="text-center text-xs text-gray-500">
            NEXUS respects municipal privacy. Your contact info is never shared with third parties.
          </p>
        </form>
      )}
    </div>
  );
};
