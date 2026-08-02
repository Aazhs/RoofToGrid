'use client';

import React, { useEffect, useState } from 'react';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

interface StatProps {
  end: number;
  suffix?: string;
  label: string;
  description: string;
  isVisible: boolean;
}

function AnimatedNumber({ end, suffix = '', label, description, isVisible }: StatProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end]);

  return (
    <div className="text-center font-jakarta">
      <div className="text-[40px] md:text-[48px] font-bold text-on-surface mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm font-semibold text-on-surface mb-1">
        {label}
      </div>
      <div className="text-xs text-on-surface-variant">
        {description}
      </div>
    </div>
  );
}

export function StatsCounter() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 md:py-24 border-y border-outline-variant bg-surface-container-lowest overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        <div 
          ref={ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <AnimatedNumber end={3} label="Sizing Scenarios" description="Conservative · Optimal · Max Roof" isVisible={isVisible} />
          <AnimatedNumber end={17} suffix="+" label="Comparison Metrics" description="Normalized quote analysis" isVisible={isVisible} />
          <AnimatedNumber end={6} label="Red Flag Checks" description="Automated quote screening" isVisible={isVisible} />
          <AnimatedNumber end={9} label="Project Milestones" description="Inquiry to commissioning" isVisible={isVisible} />
        </div>
      </div>

      <div className="mt-12 max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="flex items-center justify-center gap-3 text-sm text-on-surface-variant/60">
          <span>Plan</span>
          <span className="text-primary-container">→</span>
          <span>Compare</span>
          <span className="text-primary-container">→</span>
          <span>Track</span>
          <span className="text-primary-container">→</span>
          <span>Monitor</span>
          <span className="mx-3 text-outline-variant">|</span>
          <span className="text-primary-container/80">Your complete solar journey</span>
        </div>
      </div>
    </section>
  );
}
