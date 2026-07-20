import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative w-16 h-16">
        {/* Spinner animation */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-400 animate-pulse">Running AI Engine...</p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-32' }) => {
  return (
    <div className={`w-full rounded-2xl animate-shimmer ${className}`} />
  );
};
