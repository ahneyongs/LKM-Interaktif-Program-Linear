import React from 'react';
import { LkmProgressData, BusinessScenario } from '../types/lkm';
import {
  User,
  GraduationCap,
  Hash,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';

interface Phase2OrganizationProps {
  selectedScenario: BusinessScenario;
  data: LkmProgressData;
  onChangeData: (updater: (prev: LkmProgressData) => LkmProgressData) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenHint: (title: string, hints: string[]) => void;
}

export const Phase2Organization: React.FC<Phase2OrganizationProps> = ({
  selectedScenario,
  data,
  onChangeData,
  onNext,
  onPrev,
  onOpenHint,
}) => {
  const hints = [
    'Isi identitas diri berupa Nama Lengkap, Kelas, dan Nomor Absen dengan jelas sebelum melanjutkan.',
    'Identifikasi "Apa yang diketahui" mencakup: jenis produk yang dibuat, kebutuhan bahan atau waktu per unit produk, ketersediaan maksimum bahan/waktu, dan besarnya keuntungan/biaya per unit.',
    'Identifikasi "Apa yang ditanyakan" biasanya berfokus pada: berapa jumlah unit produk x dan produk y yang harus diproduksi agar tercapai keuntungan maksimum atau biaya minimum.',
  ];

  const handleStudentFieldChange = (
    field: 'studentName' | 'studentClass' | 'studentAbsen',
    val: string
  ) => {
    onChangeData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const isFormValid =
    (data.studentName || '').trim().length > 0 &&
    (data.studentClass || '').trim().length > 0 &&
    (data.studentAbsen || '').trim().length > 0 &&
    data.phase2Answers.knownInfo.trim().length > 5 &&
    data.phase2Answers.askedQuestion.trim().length > 5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-teal-200 text-xs font-bold tracking-widest uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-teal-300" />
          Fase 2 PBL • Mengorganisasi Siswa untuk Belajar
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Identitas Siswa & Identifikasi Awal Masalah
        </h2>
        <p className="mt-2 text-teal-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
          Lengkapi identitas individumu (Nama, Kelas, dan Nomor Absen), lalu identifikasi apa saja
          informasi yang diketahui dan apa yang ditanyakan dari Permasalahan {selectedScenario.groupNumber}.
        </p>
      </div>

      {/* Skenario Permasalahan Bisnis */}
      <ScenarioCard scenario={selectedScenario} defaultExpanded={false} />

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Section 1: Student Identity (Individual) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Identitas Individu Siswa</h3>
                <p className="text-xs text-slate-500">Lengkapi data diri kamu sebelum mengerjakan penyelidikan</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-mono font-semibold">
              Permasalahan {selectedScenario.groupNumber}: {selectedScenario.businessName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nama Lengkap Siswa */}
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Farhan"
                  value={data.studentName || ''}
                  onChange={(e) => handleStudentFieldChange('studentName', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Kelas */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kelas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: X MIPA 2 / X-B"
                  value={data.studentClass || ''}
                  onChange={(e) => handleStudentFieldChange('studentClass', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Nomor Absen */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor Absen <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: 18"
                  value={data.studentAbsen || ''}
                  onChange={(e) => handleStudentFieldChange('studentAbsen', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Initial Problem Identification */}
        <div className="space-y-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Identifikasi Awal Masalah</h3>
                <p className="text-xs text-slate-500">
                  Uraikan informasi kunci dari cerita dalam kalimat yang jelas
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenHint('Fase 2: Identifikasi Awal Masalah', hints)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Buka Petunjuk</span>
            </button>
          </div>

          {/* Question 1: Apa yang diketahui */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              1. Apa yang diketahui dari masalah? <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Sebutkan ketersediaan bahan/waktu per produk, kapasitas maksimal sumber daya, dan
              keuntungan/biaya masing-masing produk.
            </p>
            <textarea
              rows={4}
              placeholder="Contoh: Toko memproduksi Roti Cokelat dan Roti Keju. Dibutuhkan tepung dan mentega dengan stok maksimal... Keuntungan per buah adalah..."
              value={data.phase2Answers.knownInfo}
              onChange={(e) =>
                onChangeData((prev) => ({
                  ...prev,
                  phase2Answers: { ...prev.phase2Answers, knownInfo: e.target.value },
                }))
              }
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
            />
          </div>

          {/* Question 2: Apa yang ditanyakan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              2. Apa yang ditanyakan dari masalah? <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Tuliskan tujuan akhir yang diminta oleh pemilik usaha dalam skenario.
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Berapa banyak jumlah produksi masing-masing produk agar pemilik toko memperoleh keuntungan harian maksimum?"
              value={data.phase2Answers.askedQuestion}
              onChange={(e) =>
                onChangeData((prev) => ({
                  ...prev,
                  phase2Answers: { ...prev.phase2Answers, askedQuestion: e.target.value },
                }))
              }
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={onPrev}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Fase 1</span>
          </button>

          <button
            onClick={onNext}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
              isFormValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer hover:shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjutkan ke Fase 3: Penyelidikan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
