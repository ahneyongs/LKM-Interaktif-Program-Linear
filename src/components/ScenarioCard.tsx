import React, { useState } from 'react';
import { BusinessScenario } from '../types/lkm';
import { Store, ChevronDown, ChevronUp, BookOpen, PackageCheck, TrendingUp, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/mathSolver';

interface ScenarioCardProps {
  scenario: BusinessScenario;
  defaultExpanded?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 flex items-center justify-between cursor-pointer select-none hover:bg-indigo-50/60 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                Permasalahan {scenario.groupNumber}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">• {scenario.category}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {scenario.businessName} —{' '}
              <span className="text-xs font-normal text-slate-600">
                Pemilik: <strong>{scenario.ownerName}</strong>
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 hidden md:inline">
            {isExpanded ? 'Tutup Teks Masalah' : 'Baca Teks Permasalahan Bisnis'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Story Narrative & Highlights */}
      {isExpanded && (
        <div className="p-5 border-t border-indigo-100 space-y-4 animate-in slide-in-from-top-1 duration-200">
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/80 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Deskripsi Masalah Bisnis Nyata:</span>
            </div>
            <p className="whitespace-pre-line">{scenario.story}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block">Produk X (Variabel x):</span>
                <strong className="text-slate-800 font-medium">{scenario.productX.name}</strong>
              </div>
              <span className="font-mono font-bold text-emerald-700">
                +{formatRupiah(scenario.productX.profitOrCost)} / {scenario.productX.unit}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block">Produk Y (Variabel y):</span>
                <strong className="text-slate-800 font-medium">{scenario.productY.name}</strong>
              </div>
              <span className="font-mono font-bold text-emerald-700">
                +{formatRupiah(scenario.productY.profitOrCost)} / {scenario.productY.unit}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
