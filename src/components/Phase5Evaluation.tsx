import React, { useState } from 'react';
import { BusinessScenario, LkmProgressData } from '../types/lkm';
import { CartesianGraphHandle } from './CartesianGraph';
import { generateLkmPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  FileCheck,
  Download,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Award,
  BookOpen,
  Send,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatRupiah } from '../utils/mathSolver';
import { ScenarioCard } from './ScenarioCard';

interface Phase5EvaluationProps {
  selectedScenario: BusinessScenario;
  data: LkmProgressData;
  onChangeData: (updater: (prev: LkmProgressData) => LkmProgressData) => void;
  onPrev: () => void;
  onOpenHint: (title: string, hints: string[]) => void;
  graphRef: React.RefObject<CartesianGraphHandle | null>;
}

export const Phase5Evaluation: React.FC<Phase5EvaluationProps> = ({
  selectedScenario,
  data,
  onChangeData,
  onPrev,
  onOpenHint,
  graphRef,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const hints = [
    'Refleksi diri membantu mengevaluasi pemahaman: apakah Anda lebih mudah memahami pembuatan model, visualisasi grafik, atau perhitungan nilai optimum.',
    'Untuk pertanyaan mengapa titik di luar DP tidak boleh dipilih: Ingat kembali bahwa titik di luar DP melanggar setidaknya satu kendala kapasitas bahan baku atau jam kerja, sehingga secara teknis produksi tersebut mustahil dijalankan.',
    'Pikirkan manfaat program linear di dunia nyata: menghemat modal, mencegah pemborosan sisa bahan baku, memaksimalkan omzet penjualan, dan perencanaan logistik.',
  ];

  const handleReflectionChange = (
    field: keyof LkmProgressData['phase5Reflection'],
    val: string
  ) => {
    onChangeData((prev) => ({
      ...prev,
      phase5Reflection: {
        ...prev.phase5Reflection,
        [field]: val,
      },
    }));
  };

  const isFormComplete =
    data.phase5Reflection.easiestPart.trim().length > 5 &&
    data.phase5Reflection.challengingPart.trim().length > 5 &&
    data.phase5Reflection.whyNotOutsideDP.trim().length > 5 &&
    data.phase5Reflection.realLifeBenefit.trim().length > 5;

  const handleSubmitLkm = () => {
    setIsSubmitted(true);
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if confetti blocked
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      let graphImage = '';
      if (graphRef.current) {
        graphImage = await graphRef.current.getCanvasDataUrl();
      }
      await generateLkmPdf(data, selectedScenario, graphImage);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback without graph
      await generateLkmPdf(data, selectedScenario);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold tracking-widest uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300" />
          Fase 5 PBL • Menganalisis & Mengevaluasi Proses Pemecahan Masalah
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Refleksi Belajar & Pengunduhan Laporan LKM (PDF)
        </h2>
        <p className="mt-2 text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
          Tuliskan refleksi evaluasi pemecahan masalah yang telah kamu lakukan. Setelah semua
          pertanyaan dijawab, selesaikan LKM dan unduh berkas laporan PDF resmi yang siap dikumpulkan
          kepada guru.
        </p>
      </div>

      {/* Skenario Permasalahan Bisnis */}
      <ScenarioCard scenario={selectedScenario} defaultExpanded={false} />

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        {!isSubmitted ? (
          /* Form Pertanyaan Refleksi */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Pertanyaan Refleksi & Evaluasi Proses</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkapi 4 pertanyaan refleksi di bawah ini sebelum menyelesaikan lembar kerja
                </p>
              </div>

              <button
                onClick={() =>
                  onOpenHint('Fase 5: Panduan Refleksi Matematika', hints)
                }
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Buka Petunjuk</span>
              </button>
            </div>

            {/* Reflection 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1. Langkah mana yang paling mudah dipahami? Apa alasannya?{' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Menentukan variabel keputusan x dan y adalah langkah yang paling mudah, karena kita hanya perlu mengidentifikasi nama produk yang dijual..."
                value={data.phase5Reflection.easiestPart}
                onChange={(e) => handleReflectionChange('easiestPart', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              />
            </div>

            {/* Reflection 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                2. Langkah mana yang paling menantang atau membingungkan? Apa kendala yang dihadapi?{' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Menentukan titik potong antar dua garis kendala dengan metode eliminasi dan substitusi membutuhkan ketelitian perhitungan aljabar..."
                value={data.phase5Reflection.challengingPart}
                onChange={(e) => handleReflectionChange('challengingPart', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              />
            </div>

            {/* Reflection 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                3. Mengapa titik di luar daerah penyelesaian tidak boleh dipilih sebagai solusi
                terbaik? <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Karena titik di luar daerah penyelesaian melanggar setidaknya satu kendala ketersediaan bahan baku atau jam kerja, sehingga secara teknis produksi tersebut mustahil diproduksi..."
                value={data.phase5Reflection.whyNotOutsideDP}
                onChange={(e) => handleReflectionChange('whyNotOutsideDP', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              />
            </div>

            {/* Reflection 4 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                4. Bagaimana Program Linear dapat membantu mengelola modal dan bahan baku jika siswa
                kelak membuka bisnis sendiri? <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Program linear membantu kami mengalokasikan modal secara efisien, menghindari pemborosan bahan baku yang tersisa, dan memastikan keuntungan yang diperoleh mencapai titik maksimal secara logis..."
                value={data.phase5Reflection.realLifeBenefit}
                onChange={(e) => handleReflectionChange('realLifeBenefit', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              />
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={onPrev}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Fase 4</span>
              </button>

              <button
                onClick={handleSubmitLkm}
                disabled={!isFormComplete}
                className={`px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
                  isFormComplete
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-emerald-200 shadow'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Selesaikan & Kunci LKM</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Halaman LKM Selesai + Unduh PDF */
          <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                LKM Sukses Diselesaikan!
              </span>
              <h3 className="text-2xl font-extrabold text-slate-800">
                Kerja Bagus, {data.studentName || 'Siswa Hebat'}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Seluruh tahapan Problem Based Learning telah kamu selesaikan dengan lengkap. Silakan
                unduh laporan PDF hasil pekerjaanmu untuk dikumpulkan kepada guru.
              </p>
            </div>

            {/* Quick Result Recap Card */}
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
                <span>Ringkasan Solusi Akhir</span>
                <span className="text-indigo-600">{selectedScenario.businessName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Kombinasi Produksi:</span>
                  <strong className="text-slate-800 font-mono text-sm">
                    {data.step6.optimalProductX || '0'} {selectedScenario.productX.name} &{' '}
                    {data.step6.optimalProductY || '0'} {selectedScenario.productY.name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Laba Maksimum:</span>
                  <strong className="text-emerald-700 font-mono text-sm">
                    {data.step6.optimumResultValue
                      ? formatRupiah(Number(data.step6.optimumResultValue))
                      : '—'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sedang Menyusun Dokumen PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Unduh Hasil Pekerjaan (PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition"
              >
                Edit Kembali Jawaban
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Nama berkas otomatis:{' '}
              <span className="font-mono text-slate-600">
                LKM_Program_Linear_Permasalahan_{selectedScenario.groupNumber}_{(data.studentName || 'Siswa').replace(/\s+/g, '_')}.pdf
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
