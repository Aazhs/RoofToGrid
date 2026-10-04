'use client';

import React, { useState, useEffect } from 'react';

export function FeedbackPrompt({ context = 'sizing' }: { context?: 'sizing' | 'quotes' }) {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(`rtg_feedback_${context}`);
      if (existing) setDismissed(true);
    } catch {
      // ignore
    }
  }, [context]);

  if (dismissed) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    try {
      localStorage.setItem(
        `rtg_feedback_${context}`,
        JSON.stringify({ rating, comment, date: new Date().toISOString() })
      );
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => setDismissed(true), 3500);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm my-6 transition-all">
      {submitted ? (
        <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-3 rounded-lg text-sm">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Thank you! Your feedback helps us build the best solar planning experience for India.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">
              How helpful was this {context === 'sizing' ? 'solar sizing estimate' : 'quote comparison'}?
            </h4>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-xs text-slate-400 hover:text-slate-600"
              aria-label="Dismiss feedback prompt"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1.5 rounded-lg text-lg transition-transform hover:scale-125 focus:outline-none ${
                  rating && star <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
                }`}
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            {rating && (
              <span className="text-xs font-medium text-slate-600 ml-2">
                {rating === 5 ? 'Excellent! 🌟' : rating >= 4 ? 'Very helpful 👍' : 'Thank you!'}
              </span>
            )}
          </div>

          {rating && (
            <div className="space-y-2 pt-1 animate-in fade-in">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any suggestions or questions about this analysis? (optional)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-700 text-white px-4 py-1.5 text-xs font-medium hover:bg-brand-800 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
