import React from 'react';
import { BusinessScenario, LkmProgressData } from '../types/lkm';
import {
  FileText,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Calculator,
  TrendingUp,
  MapPin,
  Check,
} from 'lucide-react';
import { formatRupiah } from '../utils/mathSolver';
import { ScenarioCard } from './ScenarioCard';

interface Phase4PresentationProps {
  selectedScenario: BusinessScenario;
  data: LkmProgressData;
  onChangeData: (updater: (prev: LkmProgressData) => LkmProgressData) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenHint: (title: string, hints: string[]) => void;
}

export const Phase4Presentation: React.FC<Phase4PresentationProps> = ({
  selectedScenario,
  data,
  onChangeData,
  onNext,
  onPrev,
  onOpenHint,
}) => {
  const hints = [
    'Rangkum inti permasalahan: sebutkan apa saja keterbatasan bahan baku atau waktu yang membatasi produksi usaha.',
    'Jelaskan makna daerah penyelesaian (DP): arsiran yang memenuhi seluruh kendala dan bagaimana titik-titik sudutnya membatasi pilihan produksi.',
    'Sampaikan rekomendasi nyata: berapa banyak masing-masing produk yang wajib diproduksi pemilik usaha agar memperoleh keuntungan maksimal.',
    'Pastikan seluruh kesimpulan selaras dengan perhitungan uji fungsi objektif yang telah kamu lakukan pada langkah sebelumnya.',
  ];

  const handleFieldChange = (
    field: keyof LkmProgressData['phase4Presentation'],
    val: string
  ) => {
    onChangeData((prev) => ({
      ...prev,
      phase4Presentation: {
        ...prev.phase4Presentation,
        [field]: val,
      },
    }));
  };

  const isFormValid =
    (data.phase4Presentation.businessIntro || '').trim().length > 5 &&
    (data.phase4Presentation.graphicExplanation || '').trim().length > 5 &&
    (data.phase4Presentation.optimumPointReason || '').trim().length > 5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-purple-200 text-xs font-bold tracking-widest uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-purple-300" />
          Fase 4 PBL • Mengembangkan & Menyajikan Hasil Karya
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ringkasan Hasil Penyelidikan & Solusi Optimum
        </h2>
        <p className="mt-2 text-purple-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
          Berikut adalah rangkuman terstruktur dari seluruh tahapan penyelidikan yang telah kamu selesaikan
          pada Permasalahan {selectedScenario.groupNumber}. Periksa kembali keterpaduan model, grafik, dan rumuskan
          ringkasan solusi akhir di bawah.
        </p>
      </div>

      {/* Skenario Permasalahan Bisnis */}
      <ScenarioCard scenario={selectedScenario} defaultExpanded={false} />

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Ringkasan Visual Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Rangkuman Hasil Kerja Sebelumnya</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              Data Otomatis dari Fase 1–3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Model Matematika */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>1. Model Matematika</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Variabel Keputusan:</span>
                  <div className="font-medium text-slate-800">
                    x = {data.step1.varXMeaning || selectedScenario.productX.name}
                  </div>
                  <div className="font-medium text-slate-800">
                    y = {data.step1.varYMeaning || selectedScenario.productY.name}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Fungsi Objektif:</span>
                  <div className="font-mono font-bold text-indigo-700">
                    Z = {data.step2.objCoeffX || selectedScenario.productX.profitOrCost}x +{' '}
                    {data.step2.objCoeffY || selectedScenario.productY.profitOrCost}y
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Grafik & DP */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Daerah Penyelesaian</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Daerah Terpilih:</span>
                  <div className="font-bold text-emerald-700">
                    {data.step3.selectedRegion || 'Daerah I (Arsiran DP)'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Titik Pojok Teridentifikasi:</span>
                  <div className="font-mono text-slate-800 flex flex-wrap gap-1 mt-1">
                    {data.step3.points
                      .filter((p) => p.x && p.y)
                      .map((p) => (
                        <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-semibold">
                          {p.label}({p.x},{p.y})
                        </span>
                      ))}
                    {data.step3.points.filter((p) => p.x && p.y).length === 0 && (
                      <span className="text-slate-400 italic">Belum terisi lengkap</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Solusi Optimum */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>3. Solusi Bisnis Optimum</span>
              </div>
              <div className="text-xs space-y-1.5 text-emerald-950">
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Produksi Rekomendasi:</span>
                  <div className="font-bold text-slate-800">
                    {data.step6.optimalProductX || '...'} {selectedScenario.productX.unit} {selectedScenario.productX.name}
                  </div>
                  <div className="font-bold text-slate-800">
                    {data.step6.optimalProductY || '...'} {selectedScenario.productY.unit} {selectedScenario.productY.name}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 block font-mono">Keuntungan Maksimal:</span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    {data.step6.optimumResultValue
                      ? formatRupiah(Number(data.step6.optimumResultValue))
                      : 'Belum dihitung'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Written Summary Worksheet */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Lembar Ringkasan Hasil Penyelidikan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tuliskan rangkuman sistematis dari temuan penyelidikan kamu untuk laporan resmi
              </p>
            </div>
            <button
              onClick={() => onOpenHint('Fase 4: Panduan Ringkasan Hasil', hints)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Buka Petunjuk</span>
            </button>
          </div>

          {/* Section 1: Ringkasan Analisis Kendala & Keterbatasan Sumber Daya */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              1. Ringkasan Analisis Masalah & Batasan Sumber Daya: <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Uraikan intisari masalah yang dihadapi oleh {selectedScenario.businessName}, jenis produk yang diproduksi, serta batasan ketersediaan bahan baku atau jam kerja harian.
            </p>
            <textarea
              rows={3}
              placeholder={`Contoh: Usaha ${selectedScenario.businessName} memproduksi dua produk unggulan yaitu ${selectedScenario.productX.name} dan ${selectedScenario.productY.name}. Keterbatasan utama yang dihadapi adalah ketersediaan bahan baku maksimal...`}
              value={data.phase4Presentation.businessIntro}
              onChange={(e) => handleFieldChange('businessIntro', e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
            />
          </div>

          {/* Section 2: Ringkasan Daerah Penyelesaian Grafik */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              2. Ringkasan Interpretasi Grafik & Daerah Penyelesaian (DP): <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Uraikan bagaimana garis-garis kendala membatasi daerah layak (DP) pada Kuadran I dan bagaimana titik-titik sudut (titik pojok) diperoleh.
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Dari penggambaran garis kendala pada bidang koordinat Cartesius, Daerah Penyelesaian (DP) terbentuk pada daerah yang memenuhi semua pertidaksamaan. Diperoleh titik-titik pojok pembatas yaitu..."
              value={data.phase4Presentation.graphicExplanation}
              onChange={(e) => handleFieldChange('graphicExplanation', e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
            />
          </div>

          {/* Section 3: Rekomendasi Solusi Akhir */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              3. Rekomendasi Keputusan Akhir untuk Pemilik Usaha: <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Sampaikan kesimpulan akhir kombinasi produksi terbaik yang harus dijalankan pemilik usaha dan mengapa solusi ini memberikan keuntungan tertinggi tanpa melanggar batasan kapasitas.
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Berdasarkan hasil uji titik pojok ke fungsi objektif, pemilik usaha direkomendasikan untuk memproduksi ... unit produk X dan ... unit produk Y, sehingga keuntungan maksimal sebesar Rp ... dapat dicapai tanpa melebihi stok bahan baku yang ada."
              value={data.phase4Presentation.optimumPointReason}
              onChange={(e) => handleFieldChange('optimumPointReason', e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
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
            <span>Kembali ke Fase 3</span>
          </button>

          <button
            onClick={onNext}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
              isFormValid
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer hover:shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjutkan ke Fase 5: Evaluasi & Refleksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
