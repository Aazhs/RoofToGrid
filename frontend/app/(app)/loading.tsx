import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading page content">
      {/* Page Title skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-100" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>

      {/* Top 3 KPI metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-6 w-6 rounded-full bg-slate-100" />
            </div>
            <div className="h-8 w-32 rounded bg-slate-200" />
            <div className="h-3 w-40 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-32 w-full rounded-lg bg-slate-100" />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="h-10 rounded-lg bg-slate-100" />
          <div className="h-10 rounded-lg bg-slate-100" />
        </div>
      </div>

      {/* List items skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div className="space-y-1.5">
                <div className="h-4 w-48 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
              <div className="h-6 w-16 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
