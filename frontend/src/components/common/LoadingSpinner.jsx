import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading details...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
      <div className="relative mb-3.5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse"></div>
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-cyan-400`} />
      </div>
      {text && <p className="text-xs font-mono font-medium tracking-wide text-cyan-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
