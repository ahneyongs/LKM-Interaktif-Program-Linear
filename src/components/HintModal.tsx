import React from 'react';
import { Lightbulb, X, HelpCircle, ArrowRight } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hints: string[];
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  title,
  hints,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Petunjuk Belajar (Hint)</h3>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints Content */}
        <div className="py-4 space-y-3">
          {hints.map((hint, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-slate-700 text-sm leading-relaxed"
            >
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>{hint}</div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Cobalah mendiskusikan petunjuk ini bersama rekan kelompokmu!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>Paham, Lanjutkan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
