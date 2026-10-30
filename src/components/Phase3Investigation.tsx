import React, { useState, useMemo } from 'react';
import {
  BusinessScenario,
  LkmProgressData,
  StudentCornerPoint,
  StudentObjectiveTest,
} from '../types/lkm';
import { CartesianGraph, CartesianGraphHandle } from './CartesianGraph';
import { ScenarioCard } from './ScenarioCard';
import {
  analyzeLinearProgram,
  formatRupiah,
  isPointFeasible,
  Point2D,
} from '../utils/mathSolver';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  TrendingUp,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';

interface Phase3InvestigationProps {
  selectedScenario: BusinessScenario;
  data: LkmProgressData;
  onChangeData: (updater: (prev: LkmProgressData) => LkmProgressData) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenHint: (title: string, hints: string[]) => void;
  graphRef: React.RefObject<CartesianGraphHandle | null>;
  userRole?: 'siswa' | 'guru';
}

export const Phase3Investigation: React.FC<Phase3InvestigationProps> = ({
  selectedScenario,
  data,
  onChangeData,
  onNext,
  onPrev,
  onOpenHint,
  graphRef,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [modelFeedback, setModelFeedback] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [cornerCheckFeedback, setCornerCheckFeedback] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [optimumFeedback, setOptimumFeedback] = useState<{
    status: 'idle' | 'success' | 'warning';
    message: string;
    optimalPointName?: string;
  }>({ status: 'idle', message: '' });

  // Ground truth analysis for automated mathematical verification
  const trueAnalysis = useMemo(() => {
    return analyzeLinearProgram(
      selectedScenario.constraints,
      selectedScenario.productX.profitOrCost,
      selectedScenario.productY.profitOrCost,
      selectedScenario.objectiveType
    );
  }, [selectedScenario]);

  // Dynamic constraints based on student input (for live graph rendering)
  const studentGraphConstraints = useMemo(() => {
    const valid = data.step2.constraints
      .filter((c) => (Number(c.coeffX) > 0 || Number(c.coeffY) > 0) && Number(c.capacity) > 0)
      .map((c, i) => ({
        id: `sc-${i}`,
        name: c.name || `Kendala ${i + 1}`,
        coeffX: Number(c.coeffX) || 0,
        coeffY: Number(c.coeffY) || 0,
        operator: c.operator,
        capacity: Number(c.capacity) || 0,
        unit: 'unit',
      }));

    return valid;
  }, [data.step2.constraints]);

  // Hints per step (5 steps total now)
  const stepHints: Record<number, { title: string; hints: string[] }> = {
    1: {
      title: 'Langkah 1: Menentukan Variabel Keputusan',
      hints: [
        'Variabel keputusan harus merepresentasikan kuantitas produk yang diproduksi oleh pemilik usaha.',
        `Dalam kasus ${selectedScenario.businessName}, variabel x menyatakan banyaknya ${selectedScenario.productX.name} (satuan: ${selectedScenario.productX.unit}).`,
        `Variabel y menyatakan banyaknya ${selectedScenario.productY.name} (satuan: ${selectedScenario.productY.unit}).`,
        'Ingat: Jumlah produksi fisik tidak mungkin bernilai negatif (x >= 0, y >= 0).',
      ],
    },
    2: {
      title: 'Langkah 2: Menyusun Model SPtLDV & Fungsi Objektif',
      hints: [
        'Perhatikan kata "maksimal", "paling banyak", atau "tidak lebih dari", ini mengindikasikan tanda pertidaksamaan <= (kurang dari sama dengan).',
        `Kebutuhan bahan untuk Kendala 1: (${selectedScenario.constraints[0]?.coeffX || 0})x + (${selectedScenario.constraints[0]?.coeffY || 0})y <= ${selectedScenario.constraints[0]?.capacity || 0}.`,
        `Kebutuhan bahan untuk Kendala 2: (${selectedScenario.constraints[1]?.coeffX || 0})x + (${selectedScenario.constraints[1]?.coeffY || 0})y <= ${selectedScenario.constraints[1]?.capacity || 0}.`,
        'Syarat non-negatif: x >= 0 dan y >= 0 wajib dicentang.',
        `Fungsi objektif Z = ${selectedScenario.productX.profitOrCost}x + ${selectedScenario.productY.profitOrCost}y.`,
        'Klik tombol "Periksa Model Matematika" untuk memvalidasi model yang Anda susun.',
      ],
    },
    3: {
      title: 'Langkah 3: Menggambar Daerah Penyelesaian (DP) & Menentukan Titik Pojok',
      hints: [
        'Daerah Penyelesaian (DP) adalah daerah arsiran (Daerah I) yang berada di Kuadran I (x >= 0, y >= 0) dan memenuhi seluruh pertidaksamaan kendala.',
        'Daerah II, III, IV, dan V berada di luar batas kendala sehingga bukan merupakan daerah penyelesaian yang layak.',
        'Titik pojok adalah titik sudut yang membatasi poligon Daerah Penyelesaian: titik asal O(0,0), titik potong garis dengan sumbu, dan titik potong antar garis kendala.',
        'Nama titik adalah label huruf (O, A, B, C). Koordinat x adalah jumlah Produk X, dan Koordinat y adalah jumlah Produk Y.',
        'Anda dapat mengklik titik merah pada grafik atau mengetikkan koordinatnya ke dalam tabel titik pojok.',
      ],
    },
    4: {
      title: 'Langkah 4: Menguji Titik Pojok ke Fungsi Objektif',
      hints: [
        'Klik tombol "Salin Titik Pojok dari Langkah 3" untuk memuat seluruh titik pojok ke tabel uji.',
        'Substitusikan nilai x dan y dari masing-masing titik ke rumus fungsi objektif Z = ax + by.',
        'Hitung nilai Z untuk masing-masing titik secara teliti.',
        'Nilai optimum adalah nilai Z terbesar (jika memaksimumkan keuntungan) atau nilai Z terkecil (jika meminimumkan biaya).',
      ],
    },
    5: {
      title: 'Langkah 5: Membuat Kesimpulan Solusi Bisnis',
      hints: [
        `Tuliskan jumlah produksi terbaik: berapa ${selectedScenario.productX.unit} ${selectedScenario.productX.name} dan berapa ${selectedScenario.productY.unit} ${selectedScenario.productY.name}.`,
        'Sebutkan total keuntungan maksimal yang didapatkan oleh pemilik usaha.',
        'Jelaskan alasan matematis dan bisnis mengapa kombinasi tersebut menjadi solusi yang paling optimal dan aman bagi batas sumber daya.',
      ],
    },
  };

  // Step 2: Strict Model Verification
  const handleCheckModel = () => {
    const studentC = data.step2.constraints;
    const trueC = selectedScenario.constraints;

    // Check if empty
    if (studentC.length === 0 || !studentC[0].coeffX || !studentC[0].capacity) {
      setModelFeedback({
        status: 'error',
        message: 'Mohon lengkapi koefisien kebutuhan bahan dan kapasitas kendala pada tabel terlebih dahulu.',
      });
      return;
    }

    if (studentC.length < trueC.length) {
      setModelFeedback({
        status: 'warning',
        message: `Skenario ${selectedScenario.businessName} memiliki ${trueC.length} kendala sumber daya. Mohon tambahkan baris kendala hingga berjumlah ${trueC.length}.`,
      });
      return;
    }

    let hasMismatch = false;
    let mismatchNote = '';

    // Check each constraint strictly against true constraints
    for (let i = 0; i < trueC.length; i++) {
      const s = studentC[i];
      const t = trueC[i];

      const sX = Number(s.coeffX);
      const sY = Number(s.coeffY);
      const sCap = Number(s.capacity);

      if (isNaN(sX) || isNaN(sY) || isNaN(sCap) || sX <= 0 || sY <= 0 || sCap <= 0) {
        hasMismatch = true;
        mismatchNote = `Angka pada baris Kendala ${i + 1} (${s.name || t.name}) belum lengkap atau bernilai tidak valid.`;
        break;
      }

      // Check proportional equivalence (allowing simplified equations e.g. 2x + 3y <= 180 vs 200x + 300y <= 18000)
      const ratioX = sX / t.coeffX;
      const ratioY = sY / t.coeffY;
      const ratioCap = sCap / t.capacity;

      const isExactMatch = sX === t.coeffX && sY === t.coeffY && sCap === t.capacity;
      const isProportional =
        Math.abs(ratioX - ratioY) < 0.001 && Math.abs(ratioY - ratioCap) < 0.001;

      if (!isExactMatch && !isProportional) {
        hasMismatch = true;
        mismatchNote = `Koefisien pada Kendala ${i + 1} (${s.name || t.name}) tidak sesuai dengan data skenario bisnis. Pastikan kebutuhan bahan untuk ${selectedScenario.productX.name} (${t.coeffX} ${t.unit}) dan ${selectedScenario.productY.name} (${t.coeffY} ${t.unit}) serta batas kapasitas (${t.capacity} ${t.unit}) diisi dengan benar.`;
        break;
      }

      if (s.operator !== t.operator) {
        hasMismatch = true;
        mismatchNote = `Perhatikan tanda pertidaksamaan pada Kendala ${i + 1}. Karena sumber daya dibatasi oleh batas kapasitas maksimal, tanda yang tepat adalah ${t.operator}.`;
        break;
      }
    }

    // Check non-negativity condition
    if (!hasMismatch) {
      if (!data.step2.nonNegativeX || !data.step2.nonNegativeY) {
        hasMismatch = true;
        mismatchNote = 'Syarat non-negatif produksi (x >= 0 dan y >= 0) wajib dicentang, karena jumlah fisik barang produksi tidak mungkin bernilai negatif.';
      }
    }

    // Check objective function coefficients
    if (!hasMismatch) {
      const sObjX = Number(data.step2.objCoeffX);
      const sObjY = Number(data.step2.objCoeffY);

      if (isNaN(sObjX) || isNaN(sObjY) || sObjX <= 0 || sObjY <= 0) {
        hasMismatch = true;
        mismatchNote = 'Fungsi objektif Z belum diisi lengkap dengan angka keuntungan/biaya per unit.';
      } else if (
        sObjX !== selectedScenario.productX.profitOrCost ||
        sObjY !== selectedScenario.productY.profitOrCost
      ) {
        hasMismatch = true;
        mismatchNote = `Koefisien fungsi objektif Z belum sesuai. Keuntungan per unit Produk X (${selectedScenario.productX.name}) adalah Rp ${selectedScenario.productX.profitOrCost.toLocaleString('id-ID')} dan Produk Y (${selectedScenario.productY.name}) adalah Rp ${selectedScenario.productY.profitOrCost.toLocaleString('id-ID')}.`;
      }
    }

    if (hasMismatch) {
      setModelFeedback({
        status: 'error',
        message: `Pemeriksaan Model: ${mismatchNote}`,
      });
    } else {
      setModelFeedback({
        status: 'success',
        message:
          'Luar biasa! Model pertidaksamaan SPtLDV, syarat non-negatif, dan fungsi objektif yang Anda susun sudah 100% konsisten dengan data skenario bisnis. Anda siap lanjut ke Langkah 3 untuk menganalisis grafik dan menentukan titik pojok!',
      });
    }
  };

  // Step 3 (Merged): Corner Point handlers
  // Ensure we have current points array from step3 (or fallback to step4 for compatibility)
  const currentCornerPoints = useMemo(() => {
    if (data.step3.points && data.step3.points.length > 0) {
      return data.step3.points;
    }
    return data.step4.points || [];
  }, [data.step3.points, data.step4.points]);

  const handleAddCornerPoint = () => {
    const labels = ['O', 'A', 'B', 'C', 'D', 'E', 'F'];
    const currentCount = currentCornerPoints.length;
    const label = labels[currentCount] || `P${currentCount + 1}`;
    const newPt: StudentCornerPoint = {
      id: Date.now().toString(),
      label,
      x: '',
      y: '',
    };
    const updated = [...currentCornerPoints, newPt];
    onChangeData((prev) => ({
      ...prev,
      step3: { ...prev.step3, points: updated },
      step4: { ...prev.step4, points: updated },
    }));
  };

  const handleRemoveCornerPoint = (id: string) => {
    const updated = currentCornerPoints.filter((p) => p.id !== id);
    onChangeData((prev) => ({
      ...prev,
      step3: { ...prev.step3, points: updated },
      step4: { ...prev.step4, points: updated },
    }));
  };

  const handleUpdateCornerPoint = (id: string, field: 'label' | 'x' | 'y', val: string) => {
    const updated = currentCornerPoints.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    onChangeData((prev) => ({
      ...prev,
      step3: { ...prev.step3, points: updated },
      step4: { ...prev.step4, points: updated },
    }));
  };

  // When a student clicks a corner point on the interactive graph, auto-populate or assist
  const handleGraphSelectPoint = (pt: Point2D) => {
    // Check if point already exists in the table
    const exists = currentCornerPoints.some(
      (cp) => Number(cp.x) === pt.x && Number(cp.y) === pt.y
    );
    if (!exists) {
      // Find first empty row, or add new row
      const emptyIdx = currentCornerPoints.findIndex((cp) => cp.x === '' && cp.y === '');
      if (emptyIdx !== -1) {
        const updated = [...currentCornerPoints];
        updated[emptyIdx] = {
          ...updated[emptyIdx],
          x: pt.x.toString(),
          y: pt.y.toString(),
        };
        onChangeData((prev) => ({
          ...prev,
          step3: { ...prev.step3, points: updated },
          step4: { ...prev.step4, points: updated },
        }));
      } else {
        const labels = ['O', 'A', 'B', 'C', 'D', 'E', 'F'];
        const label = pt.x === 0 && pt.y === 0 ? 'O' : labels[currentCornerPoints.length] || `P${currentCornerPoints.length + 1}`;
        const newPt: StudentCornerPoint = {
          id: Date.now().toString(),
          label,
          x: pt.x.toString(),
          y: pt.y.toString(),
        };
        const updated = [...currentCornerPoints, newPt];
        onChangeData((prev) => ({
          ...prev,
          step3: { ...prev.step3, points: updated },
          step4: { ...prev.step4, points: updated },
        }));
      }
    }
  };

  // Step 3 (Merged): Check Corner Points
  const handleCheckCornerPoints = () => {
    const studentPts = currentCornerPoints;
    const filledPts = studentPts.filter((p) => p.x.trim() !== '' && p.y.trim() !== '');

    if (filledPts.length < 3) {
      setCornerCheckFeedback({
        status: 'error',
        message: 'Mohon masukkan setidaknya 3 titik pojok (titik sudut poligon DP) beserta koordinat x dan y yang lengkap.',
      });
      return;
    }

    const trueVertices = trueAnalysis.vertices;
    let foundOutside = false;
    let matchedCount = 0;

    filledPts.forEach((sp) => {
      const px = Number(sp.x);
      const py = Number(sp.y);
      if (isNaN(px) || isNaN(py)) return;

      const ptObj: Point2D = { x: px, y: py };
      const feasible = isPointFeasible(ptObj, selectedScenario.constraints, true);

      if (!feasible) {
        foundOutside = true;
      }

      const matchesTrue = trueVertices.some(
        (tv) => Math.abs(tv.x - px) < 0.1 && Math.abs(tv.y - py) < 0.1
      );
      if (matchesTrue) matchedCount++;
    });

    if (foundOutside) {
      setCornerCheckFeedback({
        status: 'warning',
        message:
          'Peringatan: Ada titik yang Anda masukkan berada di LUAR Daerah Penyelesaian (melanggar salah satu kendala). Amati kembali batas garis pada grafik.',
      });
    } else if (matchedCount < trueVertices.length) {
      setCornerCheckFeedback({
        status: 'warning',
        message: `Bagus! ${matchedCount} titik pojok sudah tepat, namun masih ada ${
          trueVertices.length - matchedCount
        } titik pojok lainnya yang membatasi daerah penyelesaian. Cermati seluruh sudut poligon DP (termasuk titik asal O(0,0), titik potong sumbu, dan titik potong dua garis kendala).`,
      });
    } else {
      setCornerCheckFeedback({
        status: 'success',
        message:
          'Sempurna! Seluruh titik pojok Daerah Penyelesaian (DP) berhasil diidentifikasi dengan benar. Silakan lanjut ke Langkah 4 untuk menguji nilai fungsi objektif pada setiap titik!',
      });
    }
  };

  // Step 4 (was Step 5): Sync Corner Points to Evaluation Table
  const handleSyncPointsToTable = () => {
    const validPoints = currentCornerPoints.filter((pt) => pt.x.trim() !== '' && pt.y.trim() !== '');
    if (validPoints.length === 0) {
      setOptimumFeedback({
        status: 'warning',
        message: 'Belum ada titik pojok dengan koordinat lengkap pada Langkah 3. Silakan tentukan titik pojok pada Langkah 3 terlebih dahulu.',
      });
      return;
    }

    const newEvals: StudentObjectiveTest[] = validPoints.map((pt) => {
      return {
        id: pt.id,
        pointLabel: `${pt.label}(${pt.x}, ${pt.y})`,
        x: pt.x,
        y: pt.y,
        substitution: '', // Student fills in manually
        calculatedZ: '', // Student calculates manually
      };
    });

    onChangeData((prev) => ({
      ...prev,
      step5: { ...prev.step5, evaluations: newEvals },
    }));
  };

  const handleAddEvalRow = () => {
    const newIdx = data.step5.evaluations.length + 1;
    const newRow: StudentObjectiveTest = {
      id: Date.now().toString(),
      pointLabel: `Titik ${newIdx}`,
      x: '',
      y: '',
      substitution: '',
      calculatedZ: '',
    };
    onChangeData((prev) => ({
      ...prev,
      step5: { ...prev.step5, evaluations: [...prev.step5.evaluations, newRow] },
    }));
  };

  const handleRemoveEvalRow = (id: string) => {
    onChangeData((prev) => ({
      ...prev,
      step5: {
        ...prev.step5,
        evaluations: prev.step5.evaluations.filter((ev) => ev.id !== id),
      },
    }));
  };

  // Step 4: Check Evaluations & Determine Optimum
  const handleCheckEvaluations = () => {
    const evals = data.step5.evaluations;
    if (evals.length === 0) {
      setOptimumFeedback({
        status: 'warning',
        message: 'Lengkapi tabel perhitungan fungsi objektif untuk setiap titik pojok terlebih dahulu.',
      });
      return;
    }

    let highestVal = -Infinity;
    let bestPointLabel = '';

    evals.forEach((ev) => {
      const val = Number(ev.calculatedZ) || 0;
      if (val > highestVal) {
        highestVal = val;
        bestPointLabel = ev.pointLabel;
      }
    });

    const trueMax = trueAnalysis.optimalValue || 0;

    if (Math.abs(highestVal - trueMax) < 10) {
      setOptimumFeedback({
        status: 'success',
        message: `Selamat! Perhitungan Anda akurat. Nilai optimum maksimum diperoleh pada titik pojok ${bestPointLabel} dengan nilai Z = ${formatRupiah(
          highestVal
        )}.`,
        optimalPointName: bestPointLabel,
      });

      onChangeData((prev) => ({
        ...prev,
        step5: {
          ...prev.step5,
          optimumPoint: bestPointLabel,
          optimumValue: highestVal.toString(),
        },
      }));
    } else {
      setOptimumFeedback({
        status: 'warning',
        message:
          'Hasil perhitungan nilai Z masih terdapat selisih. Periksa kembali perkalian dan penjumlahan nilai (x, y) saat disubstitusi ke Z = ax + by.',
      });
    }
  };

  const handleAddConstraint = () => {
    const newIdx = data.step2.constraints.length + 1;
    onChangeData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        constraints: [
          ...prev.step2.constraints,
          { name: `Kendala ${newIdx}`, coeffX: '', coeffY: '', operator: '<=', capacity: '' },
        ],
      },
    }));
  };

  const handleRemoveConstraint = (idx: number) => {
    if (data.step2.constraints.length <= 1) return;
    onChangeData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        constraints: prev.step2.constraints.filter((_, i) => i !== idx),
      },
    }));
  };

  // 5 Steps List (merged Step 3 and 4)
  const stepsList = [
    { num: 1, label: 'Variabel Keputusan' },
    { num: 2, label: 'Model SPtLDV' },
    { num: 3, label: 'Grafik DP & Titik Pojok' },
    { num: 4, label: 'Uji Fungsi Objektif' },
    { num: 5, label: 'Kesimpulan Solusi' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Business Scenario Story Card - Displayed across all phases as requested */}
      <ScenarioCard scenario={selectedScenario} />

      {/* Phase Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold tracking-widest uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
          Fase 3 PBL • Membimbing Penyelidikan Mandiri & Kelompok
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Penyelidikan Terstruktur Program Linear
        </h2>
        <p className="mt-2 text-indigo-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
          Ikuti 5 langkah penyelidikan matematika interaktif berikut untuk menyusun model SPtLDV,
          mengamati daerah penyelesaian pada bidang koordinat, menentukan titik pojok, dan merumuskan
          solusi bisnis optimum bagi {selectedScenario.businessName}.
        </p>

        {/* Steps Sub-stepper */}
        <div className="mt-6 pt-5 border-t border-indigo-500/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {stepsList.map((step) => {
              const isActive = activeStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border text-left ${
                    isActive
                      ? 'bg-white text-indigo-900 border-white shadow-md'
                      : 'bg-indigo-950/50 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-800 text-indigo-200'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Body */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step Header with Hint button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
              Langkah {activeStep} dari 5
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">
              {stepHints[activeStep]?.title}
            </h3>
          </div>

          <button
            onClick={() =>
              onOpenHint(stepHints[activeStep].title, stepHints[activeStep].hints)
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Petunjuk Langkah {activeStep}</span>
          </button>
        </div>

        {/* ----------------- STEP 1: VARIABEL KEPUTUSAN ----------------- */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong>Instruksi Penyelidikan:</strong> Tentukan besaran apa yang menjadi keputusan
              produksi yang dapat diatur kuantitasnya oleh pemilik bisnis. Variabel keputusan harus
              merepresentasikan banyaknya kuantitas produk yang diproduksi.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm">
                    x
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Variabel Keputusan Pertama</h4>
                    <span className="text-[11px] text-slate-500">Sumbu horizontal (absis) pada grafik</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    x menyatakan: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`Contoh: Banyaknya ${selectedScenario.productX.name} yang diproduksi (${selectedScenario.productX.unit})`}
                    value={data.step1.varXMeaning}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, varXMeaning: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-sm">
                    y
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Variabel Keputusan Kedua</h4>
                    <span className="text-[11px] text-slate-500">Sumbu vertikal (ordinat) pada grafik</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    y menyatakan: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`Contoh: Banyaknya ${selectedScenario.productY.name} yang diproduksi (${selectedScenario.productY.unit})`}
                    value={data.step1.varYMeaning}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, varYMeaning: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Completion Callout */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
              <span className="text-lg">💡</span>
              <div>
                <strong>Pengingat Logika Matematika:</strong> Karena jumlah barang fisik yang diproduksi
                tidak mungkin bernilai negatif, maka secara otomatis berlaku kendala nonnegatif:{' '}
                <span className="font-mono font-bold text-indigo-700">x &ge; 0</span> dan{' '}
                <span className="font-mono font-bold text-indigo-700">y &ge; 0</span>.
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: MODEL MATEMATIKA & FUNGSI OBJEKTIF ----------------- */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong>Instruksi Penyelidikan:</strong> Isilah tabel interaktif berikut berdasarkan
              kebutuhan bahan baku/waktu per unit dan kapasitas maksimumnya. Kemudian, susun model
              SPtLDV, centang syarat nonnegatif, serta masukkan koefisien fungsi objektif.
            </div>

            {/* Constraint Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">Jenis Kendala / Sumber Daya</th>
                      <th className="p-3">Kebutuhan Produk X (x)</th>
                      <th className="p-3">Kebutuhan Produk Y (y)</th>
                      <th className="p-3 text-center">Tanda</th>
                      <th className="p-3">Kapasitas Maksimum</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    {data.step2.constraints.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-sans">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => {
                              const newC = [...data.step2.constraints];
                              newC[idx].name = e.target.value;
                              onChangeData((prev) => ({
                                ...prev,
                                step2: { ...prev.step2, constraints: newC },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            placeholder={selectedScenario.constraints[idx]?.name || `Kendala ${idx + 1}`}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={c.coeffX}
                              onChange={(e) => {
                                const newC = [...data.step2.constraints];
                                newC[idx].coeffX = e.target.value;
                                onChangeData((prev) => ({
                                  ...prev,
                                  step2: { ...prev.step2, constraints: newC },
                                }));
                              }}
                              className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                              placeholder="0"
                            />
                            <span className="text-slate-500 font-bold">x</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={c.coeffY}
                              onChange={(e) => {
                                const newC = [...data.step2.constraints];
                                newC[idx].coeffY = e.target.value;
                                onChangeData((prev) => ({
                                  ...prev,
                                  step2: { ...prev.step2, constraints: newC },
                                }));
                              }}
                              className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                              placeholder="0"
                            />
                            <span className="text-slate-500 font-bold">y</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={c.operator}
                            onChange={(e) => {
                              const newC = [...data.step2.constraints];
                              newC[idx].operator = e.target.value as any;
                              onChangeData((prev) => ({
                                ...prev,
                                step2: { ...prev.step2, constraints: newC },
                              }));
                            }}
                            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                          >
                            <option value="<=">&le; (maksimal / tidak lebih dari)</option>
                            <option value=">=">&ge; (minimal / sekurang-kurangnya)</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={c.capacity}
                            onChange={(e) => {
                              const newC = [...data.step2.constraints];
                              newC[idx].capacity = e.target.value;
                              onChangeData((prev) => ({
                                ...prev,
                                step2: { ...prev.step2, constraints: newC },
                              }));
                            }}
                            className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3 text-center">
                          {data.step2.constraints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveConstraint(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Hapus baris kendala"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddConstraint}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Kendala</span>
                </button>
              </div>
            </div>

            {/* Non-negativity Checkbox */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Syarat Non-negatif Produksi (Wajib Dicentang):</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-mono font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={data.step2.nonNegativeX}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, nonNegativeX: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>x &ge; 0</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-mono font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={data.step2.nonNegativeY}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, nonNegativeY: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>y &ge; 0</span>
                </label>
              </div>
            </div>

            {/* Objective Function Formulation */}
            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Fungsi Objektif (Fungsi Sasaran) Z = ax + by
                  </h4>
                  <p className="text-xs text-slate-500">
                    Masukkan keuntungan atau biaya per unit masing-masing produk
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-200 text-indigo-900">
                  {selectedScenario.objectiveLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
                <span className="font-bold text-indigo-900">Z =</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Keuntungan X (Rp)"
                    value={data.step2.objCoeffX}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, objCoeffX: e.target.value },
                      }))
                    }
                    className="w-36 px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                  />
                  <span className="font-bold text-slate-700">x</span>
                </div>
                <span className="font-bold text-slate-500">+</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Keuntungan Y (Rp)"
                    value={data.step2.objCoeffY}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, objCoeffY: e.target.value },
                      }))
                    }
                    className="w-36 px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                  />
                  <span className="font-bold text-slate-700">y</span>
                </div>
              </div>
            </div>

            {/* Check Model Button & Feedback */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckModel}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Periksa Model Matematika</span>
                </button>
              </div>

              {modelFeedback.status !== 'idle' && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
                    modelFeedback.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : modelFeedback.status === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {modelFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{modelFeedback.message}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- STEP 3: MENGGAMBAR DP & MENENTUKAN TITIK POJOK (MERGED) ----------------- */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong>Instruksi Penyelidikan:</strong> Amati bidang koordinat Kartesius berikut. Garis
              pembatas dilukis berdasarkan model pertidaksamaan yang Anda buat. Perhatikan pembagian
              daerah (Daerah I, II, III, IV, V). Tentukan daerah mana yang merupakan{' '}
              <strong>Daerah Penyelesaian (DP)</strong>, lalu tentukan titik-titik sudut (titik pojok)
              yang membatasi DP tersebut langsung pada tabel di bawah grafik!
            </div>

            {studentGraphConstraints.length === 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm font-bold text-amber-950 mb-0.5">
                    Model Matematika Belum Diisi pada Langkah 2
                  </strong>
                  Silakan kembali ke <strong>Langkah 2 (Model SPtLDV)</strong> dan isi koefisien
                  kebutuhan bahan serta batas kapasitas kendala. Begitu Anda mengisi model matematika,
                  garis pembatas dan Daerah Penyelesaian (DP) akan langsung terlukis secara dinamis
                  pada grafik di bawah ini.
                </div>
              </div>
            )}

            {/* Interactive Graph Component */}
            <CartesianGraph
              ref={graphRef}
              constraints={studentGraphConstraints}
              objectiveCoeffX={Number(data.step2.objCoeffX) || selectedScenario.productX.profitOrCost}
              objectiveCoeffY={Number(data.step2.objCoeffY) || selectedScenario.productY.profitOrCost}
              onSelectPoint={handleGraphSelectPoint}
            />

            {/* Region Selection Question (Daerah I to V) */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block">
                  1. Pilihlah daerah pada grafik yang merupakan Daerah Penyelesaian (DP) yang memenuhi seluruh sistem pertidaksamaan: <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Perhatikan badge penanda daerah (Daerah I, II, III, IV, V) pada bidang grafik di atas.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {['Daerah I', 'Daerah II', 'Daerah III', 'Daerah IV', 'Daerah V'].map((region) => {
                  const isSelected = data.step3.selectedRegion === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() =>
                        onChangeData((prev) => ({
                          ...prev,
                          step3: { ...prev.step3, selectedRegion: region },
                        }))
                      }
                      className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{region}</span>
                      {region === 'Daerah I' && isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {data.step3.selectedRegion && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    data.step3.selectedRegion === 'Daerah I'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {data.step3.selectedRegion === 'Daerah I' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Tepat sekali! <strong>Daerah I</strong> adalah Daerah Penyelesaian (DP) karena
                        berada di Kuadran I (memenuhi $x \ge 0, y \ge 0$) dan memenuhi seluruh garis kendala secara bersamaan.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{data.step3.selectedRegion}</strong> berada di luar batas kendala sumber daya. Perhatikan arsiran berwarna di Kuadran I (Daerah I)!
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Rationale Textarea */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  2. Jelaskan alasan mengapa daerah tersebut yang dipilih sebagai Daerah Penyelesaian: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Daerah I dipilih karena merupakan daerah irisan (arsiran) yang berada di Kuadran I (x >= 0, y >= 0) dan memenuhi semua pertidaksamaan kendala secara bersamaan..."
                  value={data.step3.explanationDP}
                  onChange={(e) =>
                    onChangeData((prev) => ({
                      ...prev,
                      step3: { ...prev.step3, explanationDP: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed bg-white"
                />
              </div>
            </div>

            {/* Explanatory Guide: Pengertian Titik Pojok, Nama Titik, Koordinat x dan y */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Panduan Memahami Istilah Titik Pojok & Koordinat (x, y)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <strong className="block text-amber-900 font-bold mb-1">🔤 Nama Titik:</strong>
                  Label huruf kapital (misal: <strong>O, A, B, C</strong>) yang digunakan untuk
                  menamai setiap titik sudut poligon pembatas Daerah Penyelesaian (DP).
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <strong className="block text-amber-900 font-bold mb-1">📍 Koordinat x:</strong>
                  Nilai absis pada sumbu horizontal, menyatakan <strong>banyaknya unit {selectedScenario.productX.name}</strong> ({selectedScenario.productX.unit}) yang diproduksi pada titik tersebut.
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <strong className="block text-amber-900 font-bold mb-1">📍 Koordinat y:</strong>
                  Nilai ordinat pada sumbu vertikal, menyatakan <strong>banyaknya unit {selectedScenario.productY.name}</strong> ({selectedScenario.productY.unit}) yang diproduksi pada titik tersebut.
                </div>
              </div>
              <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-lg">
                💡 <strong>Contoh Pembacaan:</strong> Titik <span className="font-mono font-bold">B(60, 20)</span> berarti rencana produksi terdiri atas <strong>60 {selectedScenario.productX.unit} {selectedScenario.productX.name}</strong> dan <strong>20 {selectedScenario.productY.unit} {selectedScenario.productY.name}</strong>. Nilai optimum SELALU terletak pada salah satu titik pojok ini!
              </div>
            </div>

            {/* Corner Points Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Tabel Penentuan Titik Pojok (Titik Ekstrim DP)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Isilah koordinat titik sudut pembatas DP dari grafik (atau klik titik merah pada grafik di atas)
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3">Nama Titik</th>
                        <th className="p-3">Koordinat x ({selectedScenario.productX.unit})</th>
                        <th className="p-3">Koordinat y ({selectedScenario.productY.unit})</th>
                        <th className="p-3">Keterangan / Asal Titik</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-mono">
                      {currentCornerPoints.map((pt) => (
                        <tr key={pt.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <input
                              type="text"
                              value={pt.label}
                              onChange={(e) =>
                                handleUpdateCornerPoint(pt.id, 'label', e.target.value)
                              }
                              className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={pt.x}
                              placeholder="0"
                              onChange={(e) => handleUpdateCornerPoint(pt.id, 'x', e.target.value)}
                              className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={pt.y}
                              placeholder="0"
                              onChange={(e) => handleUpdateCornerPoint(pt.id, 'y', e.target.value)}
                              className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="p-3 font-sans text-xs text-slate-500">
                            {Number(pt.x) === 0 && Number(pt.y) === 0
                              ? 'Titik Asal O(0, 0)'
                              : Number(pt.y) === 0 && Number(pt.x) > 0
                              ? 'Titik potong sumbu X'
                              : Number(pt.x) === 0 && Number(pt.y) > 0
                              ? 'Titik potong sumbu Y'
                              : 'Titik potong antar garis kendala'}
                          </td>
                          <td className="p-3 text-right">
                            {currentCornerPoints.length > 2 && (
                              <button
                                onClick={() => handleRemoveCornerPoint(pt.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="Hapus baris titik"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions: Add point + Check */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddCornerPoint}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl border border-indigo-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Titik Pojok</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckCornerPoints}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Periksa Titik Pojok</span>
                </button>
              </div>

              {/* Corner Points Check Feedback */}
              {cornerCheckFeedback.status !== 'idle' && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
                    cornerCheckFeedback.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : cornerCheckFeedback.status === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {cornerCheckFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{cornerCheckFeedback.message}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- STEP 4: UJI TITIK POJOK KE FUNGSI OBJEKTIF ----------------- */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong>Instruksi Penyelidikan:</strong> Ujilah setiap titik pojok yang telah Anda temukan
              pada Langkah 3 ke dalam fungsi objektif $Z = {data.step2.objCoeffX || 'a'}x +{' '}
              {data.step2.objCoeffY || 'b'}y$. Hitung nilai $Z$ untuk masing-masing titik, lalu
              bandingkan untuk menentukan nilai optimum (maksimum/minimum).
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Tabel Uji Nilai Fungsi Objektif Z:
              </span>
              <button
                type="button"
                onClick={handleSyncPointsToTable}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Salin Titik Pojok dari Langkah 3</span>
              </button>
            </div>

            {/* Evaluation Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">Nama Titik</th>
                      <th className="p-3">Koordinat (x, y)</th>
                      <th className="p-3">Substitusi ke Fungsi Objektif</th>
                      <th className="p-3">Hasil Perhitungan Z (Rp)</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    {data.step5.evaluations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 font-sans text-xs">
                          Belum ada titik pojok di tabel uji. Klik tombol{' '}
                          <strong className="text-indigo-600">"Salin Titik Pojok dari Langkah 3"</strong>{' '}
                          di atas atau klik tombol <strong>"Tambah Baris Uji"</strong> di bawah untuk mulai menguji nilai fungsi objektif.
                        </td>
                      </tr>
                    ) : (
                      data.step5.evaluations.map((ev, index) => (
                        <tr key={ev.id || index} className="hover:bg-slate-50/50">
                          <td className="p-3 font-sans font-bold text-slate-800">
                            <input
                              type="text"
                              value={ev.pointLabel}
                              onChange={(e) => {
                                const newE = [...data.step5.evaluations];
                                newE[index].pointLabel = e.target.value;
                                onChangeData((prev) => ({
                                  ...prev,
                                  step5: { ...prev.step5, evaluations: newE },
                                }));
                              }}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-xs"
                            />
                          </td>
                          <td className="p-3 text-slate-600">
                            ({ev.x || 0}, {ev.y || 0})
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Ketik substitusi, misal: 4000(60) + 5000(20)"
                              value={ev.substitution}
                              onChange={(e) => {
                                const newE = [...data.step5.evaluations];
                                newE[index].substitution = e.target.value;
                                onChangeData((prev) => ({
                                  ...prev,
                                  step5: { ...prev.step5, evaluations: newE },
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              placeholder="Hitung nilai Z"
                              value={ev.calculatedZ}
                              onChange={(e) => {
                                const newE = [...data.step5.evaluations];
                                newE[index].calculatedZ = e.target.value;
                                onChangeData((prev) => ({
                                  ...prev,
                                  step5: { ...prev.step5, evaluations: newE },
                                }));
                              }}
                              className="w-32 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveEvalRow(ev.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Hapus baris uji"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEvalRow}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Uji</span>
                </button>
              </div>
            </div>

            {/* Check Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCheckEvaluations}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                <Calculator className="w-4 h-4" />
                <span>Periksa Perhitungan & Tentukan Nilai Optimum</span>
              </button>

              {optimumFeedback.status !== 'idle' && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
                    optimumFeedback.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {optimumFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{optimumFeedback.message}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- STEP 5: MEMBUAT KESIMPULAN BISNIS ----------------- */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong>Instruksi Penyelidikan:</strong> Berdasarkan uji titik pojok yang telah
              dilakukan, rumuskan kesimpulan akhir untuk membantu{' '}
              <strong>{selectedScenario.ownerName}</strong> dalam mengambil keputusan bisnis.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Produksi Optimal {selectedScenario.productX.name} (x):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={data.step6.optimalProductX}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step6: { ...prev.step6, optimalProductX: e.target.value },
                      }))
                    }
                    placeholder="Contoh: 60"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono text-sm bg-white"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedScenario.productX.unit}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Produksi Optimal {selectedScenario.productY.name} (y):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={data.step6.optimalProductY}
                    onChange={(e) =>
                      onChangeData((prev) => ({
                        ...prev,
                        step6: { ...prev.step6, optimalProductY: e.target.value },
                      }))
                    }
                    placeholder="Contoh: 20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono text-sm bg-white"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedScenario.productY.unit}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Total Nilai Optimum (Rp):
                </label>
                <input
                  type="number"
                  value={data.step6.optimumResultValue}
                  onChange={(e) =>
                    onChangeData((prev) => ({
                      ...prev,
                      step6: { ...prev.step6, optimumResultValue: e.target.value },
                    }))
                  }
                  placeholder="Contoh: 340000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono text-sm text-emerald-700 bg-white"
                />
              </div>
            </div>

            {/* Reasoning Essay */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Alasan mengapa kombinasi tersebut menjadi solusi terbaik berdasarkan kendala yang
                tersedia: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Contoh: Kombinasi produksi ini menjadi solusi terbaik karena seluruh kapasitas bahan baku tepung dan mentega terpakai secara efisien tanpa melanggar batas ketersediaan, serta menghasilkan keuntungan tertinggi dibandingkan titik pojok lainnya..."
                value={data.step6.businessReasoning}
                onChange={(e) =>
                  onChangeData((prev) => ({
                    ...prev,
                    step6: { ...prev.step6, businessReasoning: e.target.value },
                  }))
                }
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-6 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={() => {
              if (activeStep > 1) {
                setActiveStep(activeStep - 1);
              } else {
                onPrev();
              }
            }}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{activeStep === 1 ? 'Kembali ke Fase 2' : `Langkah ${activeStep - 1}`}</span>
          </button>

          <button
            onClick={() => {
              if (activeStep < 5) {
                setActiveStep(activeStep + 1);
              } else {
                onNext();
              }
            }}
            className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition shadow-sm"
          >
            <span>
              {activeStep === 5
                ? 'Lanjutkan ke Fase 4: Penyajian Karya'
                : `Lanjutkan ke Langkah ${activeStep + 1}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
