import React from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function NotificationModal({ isOpen, title, message, onClose }) {
  if (!isOpen) return null;

  // Determine icon based on the message content
  const getIcon = () => {
    const msg = message ? message.toLowerCase() : "";
    if (msg.includes("success") || msg.includes("complete") || msg.includes("successful")) {
      return <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />;
    }
    if (msg.includes("please") || msg.includes("connect") || msg.includes("fail") || msg.includes("error")) {
      return <AlertTriangle size={36} className="text-amber-500 animate-pulse" />;
    }
    return <Info size={36} className="text-purple-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-md glass-panel rounded-2xl border border-main p-6 md:p-8 overflow-hidden shadow-2xl glow-purple animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 text-gray-500 hover:text-main rounded-lg border border-main transition-colors"
        >
          <X size={14} />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-900/60 rounded-full border border-main shadow-inner">
            {getIcon()}
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-main tracking-tight font-sans">
              {title || "System Message"}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-350 leading-relaxed max-h-48 overflow-y-auto">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-950/20 active:scale-98"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
