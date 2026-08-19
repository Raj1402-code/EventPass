'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const TestimonialCarousel: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote:
        'NEXUS reduced morning bus corridor delays on Grand Avenue by 34% within 60 days of deployment. The reinforcement learning signal extensions run flawlessly without backing up side streets.',
      author: 'Marcus Vance',
      role: 'Director of Intelligent Transportation Systems',
      city: 'City of Metro Transit Authority',
      rating: 5,
      metrics: '34% Bus Corridor Latency Reduction',
    },
    {
      id: 2,
      quote:
        'During major stadium events, static timing plans used to cause 45-minute gridlocks. NEXUS adaptive signal timing clears post-event traffic 28 minutes faster than our previous system.',
      author: 'Elena Rostova',
      role: 'Lead Municipal Traffic Engineer',
      city: 'Department of Public Works & Mobility',
      rating: 5,
      metrics: '28 Min Faster Event Gridlock Clearance',
    },
    {
      id: 3,
      quote:
        'The Emergency Green Wave priority feature has transformed our ambulance dispatch routes. Fire trucks clear central intersections effortlessly while V2X encryption ensures zero unauthorized overrides.',
      author: 'Captain David Thorne',
      role: 'Metropolitan Fleet Operations Chief',
      city: 'Municipal Emergency Services',
      rating: 5,
      metrics: '4.5 Min Faster Emergency Arrival Times',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#006D77]">
            TESTIMONIALS & CASE STUDIES
          </h2>
          <p className="text-3xl font-extrabold text-gray-900">
            Trusted by Municipal Engineers Worldwide
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <Card variant="glass" className="p-8 sm:p-12 relative overflow-hidden border-2 border-[#006D77]/20 shadow-xl">
            <Quote className="w-16 h-16 text-[#006D77]/10 absolute -top-2 -left-2 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Rating Stars */}
              <div className="flex items-center space-x-1">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {current.metrics}
                </span>
              </div>

              {/* Quote Body */}
              <p className="text-lg sm:text-2xl font-medium text-gray-800 italic leading-relaxed">
                "{current.quote}"
              </p>

              {/* Author Details */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {current.author}
                  </h4>
                  <p className="text-sm text-[#006D77] font-semibold">
                    {current.role} • {current.city}
                  </p>
                </div>

                {/* Control Arrows */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={prevTestimonial}
                    className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-[#006D77] hover:text-white transition-colors focus:ring-2 focus:ring-[#006D77]"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    {currentIndex + 1} / {testimonials.length}
                  </span>
                  <button
                    type="button"
                    onClick={nextTestimonial}
                    className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-[#006D77] hover:text-white transition-colors focus:ring-2 focus:ring-[#006D77]"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
