import React from 'react';
import {
  ArrowRight,
  TrendingUp,
  Compass,
  CheckCircle2,
  BarChart3,
  FileText,
  Target,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { BusinessScenario } from '../types/lkm';

interface LandingHeroProps {
  onStart: () => void;
  scenarios: BusinessScenario[];
  selectedScenarioId: number;
  onSelectScenario: (id: number) => void;
  userRole: 'siswa' | 'guru';
  onRequestGuruMode: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStart,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  userRole,
  onRequestGuruMode,
}) => {
  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-300">
      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 border border-indigo-100 shadow-sm p-6 sm:p-10 lg:p-14">
        {/* Decorative Grid and Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:18px_18px] opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs sm:text-sm font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Bahan Ajar Interaktif Matematika SMA Kelas X</span>
            <span className="text-indigo-300">|</span>
            <span className="text-indigo-800 font-bold">Kurikulum Merdeka • PBL</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                LinQuest
              </span>{' '}
              <span className="text-slate-700 text-3xl sm:text-5xl lg:text-6xl font-light">
                (Linear Quest)
              </span>
            </h1>

            {/* Required Tagline */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-indigo-900">
              Explore, Solve, Optimize!
            </p>
          </div>

          {/* Value Proposition Description */}
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Eksplorasi tantangan optimasi produksi dan keuntungan bisnis nyata melalui pendekatan{' '}
            <strong className="text-slate-800">Problem Based Learning (PBL)</strong>. Ubah narasi masalah menjadi model matematika, tentukan daerah himpunan penyelesaian pada grafik interaktif, dan temukan titik optimumnya!
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base sm:text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {userRole === 'siswa' && (
              <button
                onClick={onRequestGuruMode}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Masuk Mode Guru</span>
              </button>
            )}
          </div>

          {/* Trust & Methodology Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Penyelidikan Mandiri Siswa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Grafik Kartesius Interaktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Otomatis Ekspor PDF Resmi LKM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 PBL Quest Steps Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Alur Quest: 5 Fase Problem Based Learning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Panduan tahapan saintifik terstruktur untuk mengonstruksi konsep program linear.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {[
            {
              phase: 'Fase 1',
              title: 'Orientasi Masalah',
              desc: 'Memilih dan membaca konteks studi kasus UMKM serta merumuskan produk fokus & batasan sumber daya.',
              icon: Target,
              accent: 'border-blue-200 bg-blue-50/50 text-blue-700',
            },
            {
              phase: 'Fase 2',
              title: 'Identifikasi Diri & Data',
              desc: 'Mengisi identitas siswa serta membedah data yang diketahui dan ditanyakan dari permasalahan.',
              icon: GraduationCap,
              accent: 'border-violet-200 bg-violet-50/50 text-violet-700',
            },
            {
              phase: 'Fase 3',
              title: 'Penyelidikan Matematis',
              desc: 'Mendefinisikan variabel x-y, menyusun kendala, menggambar DHP, dan menguji nilai titik pojok.',
              icon: BarChart3,
              accent: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
            },
            {
              phase: 'Fase 4',
              title: 'Ringkasan Hasil',
              desc: 'Menyusun ikhtisar komprehensif solusi bisnis dan rekomendasi keputusan produksi optimal.',
              icon: Layers,
              accent: 'border-amber-200 bg-amber-50/50 text-amber-700',
            },
            {
              phase: 'Fase 5',
              title: 'Evaluasi & Unduh PDF',
              desc: 'Refleksi pengalaman pemecahan masalah dan mengunduh berkas laporan LKM resmi berformat PDF.',
              icon: FileText,
              accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-sm transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {step.phase}
                    </span>
                    <div className={`p-1.5 rounded-lg ${step.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 Real-World Problem Scenarios Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Skenario Permasalahan Nyata
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih salah satu dari 6 skenario UMKM berikut untuk Anda selesaikan di LinQuest.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`group text-left p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-indigo-50/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      Permasalahan {sc.groupNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sc.objectiveType === 'maximize' ? 'Maksimasi Keuntungan' : 'Minimasi Biaya'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-800 group-hover:text-indigo-700 transition">
                    {sc.businessName}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sc.story}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {sc.productX.name} & {sc.productY.name}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>{isSelected ? 'Terpilih' : 'Pilih'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Siap Melakukan Penyelidikan?</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Mulai Petualangan Optimasi Matematika Anda!
          </h3>
          <p className="text-slate-300 text-sm max-w-xl">
            Selesaikan langkah demi langkah, uji hipotesis daerah penyelesaian, dan cetak dokumen resmi LKM Anda setelah selesai.
          </p>
        </div>

        <button
          onClick={onStart}
          className="z-10 shrink-0 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base shadow-md transition flex items-center gap-2 group cursor-pointer"
        >
          <span>Mulai Sekarang</span>
          <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );
};
