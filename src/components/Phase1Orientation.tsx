import React from 'react';
import { BusinessScenario, LkmProgressData } from '../types/lkm';
import {
  Store,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  PackageCheck,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { formatRupiah } from '../utils/mathSolver';

interface Phase1OrientationProps {
  scenarios: BusinessScenario[];
  selectedScenario: BusinessScenario;
  onSelectScenario: (scenarioId: number) => void;
  data: LkmProgressData;
  onChangeData: (updater: (prev: LkmProgressData) => LkmProgressData) => void;
  onNext: () => void;
  onOpenHint: (title: string, hints: string[]) => void;
  userRole?: 'siswa' | 'guru';
  onOpenTeacher?: () => void;
}

export const Phase1Orientation: React.FC<Phase1OrientationProps> = ({
  scenarios,
  selectedScenario,
  onSelectScenario,
  data,
  onChangeData,
  onNext,
  onOpenHint,
  userRole = 'siswa',
  onOpenTeacher,
}) => {
  const hints = [
    'Perhatikan apa yang diproduksi dan dijual oleh pemilik bisnis dalam cerita di atas. Ada dua jenis barang unggulan yang menjadi variabel keputusan.',
    'Cermati kata kunci apakah pemilik usaha ingin memperoleh pendapatan setinggi-tingginya ("keuntungan maksimal") atau menekan pengeluaran serendah-rendahnya ("biaya minimal").',
    'Catat ketersediaan bahan baku atau batasan waktu kerja yang tidak boleh dilanggar dalam produksi harian.',
  ];

  const handleFocusChange = (val: string) => {
    onChangeData((prev) => ({
      ...prev,
      phase1Answers: { ...prev.phase1Answers, productFocus: val },
    }));
  };

  const handleGoalChange = (val: string) => {
    onChangeData((prev) => ({
      ...prev,
      phase1Answers: { ...prev.phase1Answers, businessGoal: val },
    }));
  };

  const handleResourceConstraintsChange = (val: string) => {
    onChangeData((prev) => ({
      ...prev,
      phase1Answers: { ...prev.phase1Answers, resourceConstraints: val },
    }));
  };

  const isFormValid =
    (data.phase1Answers.productFocus.trim().length > 2 ||
      (Boolean(data.phase1Answers.product1Name?.trim()) && Boolean(data.phase1Answers.product2Name?.trim()))) &&
    data.phase1Answers.businessGoal.trim().length > 0 &&
    (data.phase1Answers.resourceConstraints || '').trim().length > 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold tracking-widest uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Fase 1 PBL • Orientasi Siswa pada Masalah
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Menelaah Skenario Permasalahan Nyata
        </h2>
        <p className="mt-2 text-indigo-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
          Pilihlah salah satu permasalahan bisnis UMKM (Permasalahan 1 s.d. 6) yang akan kamu selesaikan. Bacalah studi kasus dengan
          saksama untuk mengidentifikasi produk fokus serta batasan sumber dayanya.
        </p>

        {/* Problem Selector Pill Bar */}
        <div className="mt-6 pt-5 border-t border-indigo-600/50">
          <label className="text-xs font-semibold text-indigo-200 block mb-2">
            Pilih Permasalahan yang Dikerjakan (Permasalahan 1 s.d. 6):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {scenarios.map((sc) => {
              const isSelected = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border ${
                    isSelected
                      ? 'bg-white text-indigo-900 border-white shadow-md scale-102 ring-2 ring-indigo-300'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900/60'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Masalah</span>
                  <span className="text-base font-extrabold">{sc.groupNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Scenario Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold font-mono">
                  Permasalahan {selectedScenario.groupNumber}
                </span>
                <span className="text-xs text-slate-500">• {selectedScenario.category}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                {selectedScenario.businessName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span>Pemilik Usaha:</span>
              <strong className="text-slate-800">{selectedScenario.ownerName}</strong>
            </div>

            {userRole === 'guru' && onOpenTeacher && (
              <button
                onClick={onOpenTeacher}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-xs"
                title="Edit data skenario ini di Panel Guru"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Skenario</span>
              </button>
            )}
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-slate-700 text-sm sm:text-base leading-relaxed space-y-3">
          <p>{selectedScenario.story}</p>
        </div>

        {/* Key Product & Constraint Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Cards */}
          <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
              <PackageCheck className="w-4 h-4 text-indigo-600" />
              <span>Identifikasi Produk yang Dihasilkan (Isi Manual)</span>
            </div>
            <div className="space-y-2 text-xs">
              {/* Kolom Isian Produk 1 (Variabel x) */}
              <div className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                      x
                    </span>
                    <span className="font-bold text-slate-800 text-xs">Produk 1 (Variabel x)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Variabel Keputusan 1</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Produk 1: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ketik nama produk 1..."
                      value={data.phase1Answers.product1Name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeData((prev) => ({
                          ...prev,
                          phase1Answers: {
                            ...prev.phase1Answers,
                            product1Name: val,
                            productFocus:
                              val && prev.phase1Answers.product2Name
                                ? `${val} dan ${prev.phase1Answers.product2Name}`
                                : val || prev.phase1Answers.productFocus,
                          },
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Keuntungan/Biaya per Unit (Rp): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 40000"
                      value={data.phase1Answers.product1Profit || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeData((prev) => ({
                          ...prev,
                          phase1Answers: { ...prev.phase1Answers, product1Profit: val },
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-emerald-700 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Isian Produk 2 (Variabel y) */}
              <div className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                      y
                    </span>
                    <span className="font-bold text-slate-800 text-xs">Produk 2 (Variabel y)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Variabel Keputusan 2</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Produk 2: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ketik nama produk 2..."
                      value={data.phase1Answers.product2Name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeData((prev) => ({
                          ...prev,
                          phase1Answers: {
                            ...prev.phase1Answers,
                            product2Name: val,
                            productFocus:
                              prev.phase1Answers.product1Name && val
                                ? `${prev.phase1Answers.product1Name} dan ${val}`
                                : val || prev.phase1Answers.productFocus,
                          },
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Keuntungan/Biaya per Unit (Rp): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 50000"
                      value={data.phase1Answers.product2Profit || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeData((prev) => ({
                          ...prev,
                          phase1Answers: { ...prev.phase1Answers, product2Profit: val },
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-emerald-700 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Constraints Prompt Card */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wide">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Batasan Sumber Daya / Kendala (Isi Manual)</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
                  Wajib Diisi Siswa
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Pemilik usaha memiliki keterbatasan bahan baku dan kapasitas waktu produksi harian. Temukan informasi batasan-batasan tersebut di dalam cerita di atas dan tuliskan pada kolom berikut:
              </p>
              
              {/* Kolom Input Jawaban Siswa */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 block">
                  Tuliskan Batasan Sumber Daya / Bahan Baku yang Ditemukan: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Contoh: Ketersediaan tepung terigu maksimal 18.000 gram dan persediaan mentega maksimal 8.000 gram..."
                  value={data.phase1Answers.resourceConstraints || ''}
                  onChange={(e) => handleResourceConstraintsChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none leading-relaxed transition shadow-inner"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-100/70 text-[11px] text-amber-900 font-medium">
              💡 <strong>Tips Penyelidikan:</strong> Perhatikan kata-kata seperti <em>"tersedia paling banyak"</em>, <em>"maksimal"</em>, atau <em>"tidak lebih dari"</em>.
            </div>
          </div>
        </div>

        {/* Phase 1 Student Questions */}
        <div className="pt-4 border-t border-slate-100 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                ?
              </span>
              Pertanyaan Orientasi Siswa
            </h4>
            <button
              onClick={() => onOpenHint('Fase 1: Orientasi Siswa pada Masalah', hints)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Buka Petunjuk</span>
            </button>
          </div>

          {/* Question 1 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              1. Berdasarkan skenario, produk atau hal apa saja yang menjadi fokus utama bisnis?
            </label>
            <input
              type="text"
              placeholder={`Contoh: ${selectedScenario.productX.name} dan ${selectedScenario.productY.name}`}
              value={data.phase1Answers.productFocus}
              onChange={(e) => handleFocusChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              2. Apa tujuan pemilik usaha: memaksimalkan keuntungan atau meminimalkan biaya?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  data.phase1Answers.businessGoal === 'maximize'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-1 ring-indigo-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="businessGoal"
                  value="maximize"
                  checked={data.phase1Answers.businessGoal === 'maximize'}
                  onChange={() => handleGoalChange('maximize')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="text-xs">
                  <div className="font-bold">Memaksimalkan Keuntungan (Laba)</div>
                  <div className="text-slate-500 text-[11px]">
                    Mendapatkan total pendapatan/laba setinggi mungkin dari hasil produksi
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  data.phase1Answers.businessGoal === 'minimize'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-1 ring-indigo-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="businessGoal"
                  value="minimize"
                  checked={data.phase1Answers.businessGoal === 'minimize'}
                  onChange={() => handleGoalChange('minimize')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="text-xs">
                  <div className="font-bold">Meminimalkan Biaya (Pengeluaran)</div>
                  <div className="text-slate-500 text-[11px]">
                    Menekan biaya pembelian bahan baku atau operasional sekecil mungkin
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Question 3: Batasan Sumber Daya (Kendala) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 block">
                3. Berdasarkan skenario di atas, batasan sumber daya (kendala) apa saja yang dihadapi oleh pemilik usaha? <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Tersinkronisasi dengan kartu di atas
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sebutkan jenis bahan baku atau waktu yang ketersediaannya dibatasi beserta jumlah kapasitas maksimalnya.
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Persediaan tepung terigu maksimal 18.000 gram dan persediaan mentega maksimal 8.000 gram..."
              value={data.phase1Answers.resourceConstraints || ''}
              onChange={(e) => handleResourceConstraintsChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition leading-relaxed"
            />
          </div>
        </div>

        {/* Navigation Next */}
        <div className="pt-4 flex items-center justify-end">
          <button
            onClick={onNext}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
              isFormValid
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-indigo-200 shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjutkan ke Fase 2: Organisasi Belajar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
