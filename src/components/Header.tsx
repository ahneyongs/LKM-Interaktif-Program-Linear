import React from 'react';
import {
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Layers,
  Settings,
  HelpCircle,
  Save,
  RotateCcw,
  GraduationCap,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { BusinessScenario } from '../types/lkm';

interface HeaderProps {
  currentPhase: number;
  completedPhases: number[];
  onSelectPhase: (phase: number) => void;
  activeScenario: BusinessScenario;
  userRole: 'siswa' | 'guru';
  onRequestGuruMode: () => void;
  onSwitchToSiswaMode: () => void;
  onOpenTeacherDrawer: () => void;
  onOpenHelp: () => void;
  onSaveProgress: () => void;
  onResetProgress: () => void;
  lastSavedText: string;
}

const PHASES = [
  { id: 1, name: 'Fase 1', label: 'Orientasi Masalah' },
  { id: 2, name: 'Fase 2', label: 'Identitas Siswa' },
  { id: 3, name: 'Fase 3', label: 'Penyelidikan' },
  { id: 4, name: 'Fase 4', label: 'Ringkasan Karya' },
  { id: 5, name: 'Fase 5', label: 'Refleksi & PDF' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  completedPhases,
  onSelectPhase,
  activeScenario,
  userRole,
  onRequestGuruMode,
  onSwitchToSiswaMode,
  onOpenTeacherDrawer,
  onOpenHelp,
  onSaveProgress,
  onResetProgress,
  lastSavedText,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Teacher Active Announcement Bar */}
      {userRole === 'guru' && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-extrabold tracking-wide uppercase text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                Mode Guru Aktif
              </span>
              <span className="hidden sm:inline text-indigo-100 text-[11px]">
                Anda memiliki akses penuh untuk mengedit permasalahan 1–6 dan melihat kunci analisis matematika.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTeacherDrawer}
                className="px-2.5 py-0.5 rounded-md bg-white text-indigo-800 hover:bg-indigo-50 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
              >
                <Settings className="w-3 h-3" />
                <span>Panel & Kunci Guru</span>
              </button>
              <button
                onClick={onSwitchToSiswaMode}
                className="px-2 py-0.5 rounded-md bg-indigo-900/60 hover:bg-indigo-900 text-indigo-100 font-semibold text-[11px] transition flex items-center gap-1"
                title="Keluar dari Mode Guru dan kembali ke Mode Siswa"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar Mode Guru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subject */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              LKM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
                  Menyelesaikan Permasalahan Program Linear
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Kelas X SMA • PBL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Permasalahan {activeScenario.groupNumber}:{' '}
                <span className="font-semibold text-slate-700">{activeScenario.businessName}</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mode Switcher Pills */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={onSwitchToSiswaMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition ${
                  userRole === 'siswa'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke Mode Siswa"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Siswa</span>
              </button>
              <button
                onClick={onRequestGuruMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition ${
                  userRole === 'guru'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={userRole === 'guru' ? 'Mode Guru Aktif' : 'Masuk Mode Guru (Perlu Password)'}
              >
                {userRole === 'guru' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Guru</span>
              </button>
            </div>

            {/* Auto save badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lastSavedText}</span>
            </div>

            <button
              onClick={onSaveProgress}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Simpan Progres Jawaban"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simpan</span>
            </button>

            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
              title="Petunjuk Belajar (Hint)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Petunjuk</span>
            </button>

            {userRole === 'guru' && (
              <button
                onClick={onOpenTeacherDrawer}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                title="Buka Panel Pengajar & Kunci Jawaban"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Guru</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 PBL Phases Stepper Navigation */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <nav className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {PHASES.map((phase) => {
              const isActive = currentPhase === phase.id;
              const isCompleted = completedPhases.includes(phase.id);

              return (
                <button
                  key={phase.id}
                  onClick={() => onSelectPhase(phase.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-3 h-3" /> : phase.id}
                  </span>
                  <span className="hidden sm:inline">{phase.name}:</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{phase.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
