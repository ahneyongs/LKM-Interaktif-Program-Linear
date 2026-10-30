import React, { useState, useEffect, useRef } from 'react';
import { BusinessScenario, LkmProgressData } from './types/lkm';
import { DEFAULT_SCENARIOS } from './data/defaultScenarios';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { Phase1Orientation } from './components/Phase1Orientation';
import { Phase2Organization } from './components/Phase2Organization';
import { Phase3Investigation } from './components/Phase3Investigation';
import { Phase4Presentation } from './components/Phase4Presentation';
import { Phase5Evaluation } from './components/Phase5Evaluation';
import { HintModal } from './components/HintModal';
import { TeacherDrawer } from './components/TeacherDrawer';
import { TeacherPasswordModal } from './components/TeacherPasswordModal';
import { CartesianGraphHandle } from './components/CartesianGraph';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const STORAGE_KEY_PROGRESS = 'lkm_pbl_progress_v2';
const STORAGE_KEY_SCENARIOS = 'lkm_pbl_scenarios_v1';

export default function App() {
  // Halaman Depan Landing state
  const [isLanding, setIsLanding] = useState<boolean>(true);

  // Mode Guru vs Siswa state
  const [userRole, setUserRole] = useState<'siswa' | 'guru'>('siswa');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lkm_teacher_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  // Scenarios state
  const [scenarios, setScenarios] = useState<BusinessScenario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCENARIOS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCENARIOS;
  });

  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(() => {
    return scenarios[0]?.id || 1;
  });

  const selectedScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Helper to initialize blank state for student inquiry - ALL STUDENT FIELDS ARE EMPTY
  const getInitialProgress = (sc: BusinessScenario): LkmProgressData => ({
    currentPhase: 1,
    groupId: sc.groupNumber,
    groupName: '',
    members: [],
    // Identitas Individu Siswa (Fase 2)
    studentName: '',
    studentClass: '',
    studentAbsen: '',
    // Fase 1: Siswa wajib mengisi produk fokus, tujuan, dan batasan sumber daya sendiri
    phase1Answers: {
      productFocus: '',
      businessGoal: '',
      resourceConstraints: '',
      product1Name: '',
      product1Profit: '',
      product2Name: '',
      product2Profit: '',
    },
    // Fase 2: Siswa wajib menuliskan apa yang diketahui dan apa yang ditanyakan
    phase2Answers: {
      knownInfo: '',
      askedQuestion: '',
    },
    // Fase 3 Langkah 1: Siswa mendefinisikan x dan y
    step1: {
      varXMeaning: '',
      varYMeaning: '',
    },
    // Fase 3 Langkah 2: Kolom kendala kosong untuk diisi koefisiennya oleh siswa
    step2: {
      constraints: [
        { name: '', coeffX: '', coeffY: '', operator: '<=', capacity: '' },
        { name: '', coeffX: '', coeffY: '', operator: '<=', capacity: '' },
      ],
      nonNegativeX: false,
      nonNegativeY: false,
      objCoeffX: '',
      objCoeffY: '',
      objType: sc.objectiveType,
    },
    // Fase 3 Langkah 3: Kolom alasan DP, pilihan daerah, dan titik pojok
    step3: {
      selectedRegion: '',
      explanationDP: '',
      points: [
        { id: 'p0', label: 'O', x: '', y: '' },
        { id: 'p1', label: 'A', x: '', y: '' },
        { id: 'p2', label: 'B', x: '', y: '' },
        { id: 'p3', label: 'C', x: '', y: '' },
      ],
      testPoints: [],
    },
    // Fase 3 Langkah 4 (mirror titik pojok untuk kompatibilitas data)
    step4: {
      points: [
        { id: 'p0', label: 'O', x: '', y: '' },
        { id: 'p1', label: 'A', x: '', y: '' },
        { id: 'p2', label: 'B', x: '', y: '' },
        { id: 'p3', label: 'C', x: '', y: '' },
      ],
    },
    // Fase 3 Langkah 5: Tabel evaluasi kosong untuk diuji siswa
    step5: {
      evaluations: [],
      optimumPoint: '',
      optimumValue: '',
    },
    // Fase 3 Langkah 6: Kesimpulan kosong untuk dirumuskan siswa
    step6: {
      optimalProductX: '',
      optimalProductY: '',
      optimumResultValue: '',
      businessReasoning: '',
    },
    // Fase 4: Catatan presentasi kosong
    phase4Presentation: {
      businessIntro: '',
      graphicExplanation: '',
      optimumPointReason: '',
      conclusionNote: '',
    },
    // Fase 5: Refleksi kosong
    phase5Reflection: {
      easiestPart: '',
      challengingPart: '',
      whyNotOutsideDP: '',
      realLifeBenefit: '',
    },
    completedPhases: [],
    lastSavedAt: '',
  });

  // Student progress state
  const [data, setData] = useState<LkmProgressData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.currentPhase) {
          const init = getInitialProgress(selectedScenario);
          return {
            ...init,
            ...parsed,
            studentName: parsed.studentName || '',
            studentClass: parsed.studentClass || '',
            studentAbsen: parsed.studentAbsen || '',
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return getInitialProgress(selectedScenario);
  });

  // Hints modal state
  const [hintModal, setHintModal] = useState<{
    isOpen: boolean;
    title: string;
    hints: string[];
  }>({
    isOpen: false,
    title: '',
    hints: [],
  });

  // Teacher drawer state
  const [isTeacherOpen, setIsTeacherOpen] = useState<boolean>(false);

  // Toast indicator
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Graph Ref
  const graphRef = useRef<CartesianGraphHandle | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  // Persist scenarios if updated by teacher
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios));
    } catch (e) {
      console.error(e);
    }
  }, [scenarios]);

  // Handle switching scenario
  const handleSelectScenario = (scenarioId: number) => {
    setSelectedScenarioId(scenarioId);
    const targetSc = scenarios.find((s) => s.id === scenarioId) || scenarios[0];
    setData((prev) => {
      // If group is changed, pre-fill initial variables for that group
      const next = getInitialProgress(targetSc);
      return {
        ...next,
        members: prev.members, // keep student group roster intact
        groupName: `Kelompok ${targetSc.groupNumber}`,
      };
    });
    showToast(`Beralih ke Skenario Kelompok ${targetSc.groupNumber}: ${targetSc.businessName}`);
  };

  const handleUpdateScenario = (updated: BusinessScenario) => {
    setScenarios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Skenario ${updated.businessName} berhasil diperbarui.`);
  };

  const handleResetScenarios = () => {
    setScenarios(DEFAULT_SCENARIOS);
    localStorage.removeItem(STORAGE_KEY_SCENARIOS);
    showToast('Semua skenario dikembalikan ke setelan awal.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenHint = (title: string, hints: string[]) => {
    setHintModal({
      isOpen: true,
      title,
      hints,
    });
  };

  const handleManualSave = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setData((prev) => ({
      ...prev,
      lastSavedAt: timeStr,
    }));
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
      showToast('Progres berhasil disimpan ke penyimpanan lokal.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang semua isian LKM ke awal?')) {
      const fresh = getInitialProgress(selectedScenario);
      setData(fresh);
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
      showToast('Data LKM telah direset.');
    }
  };

  // Mode Guru vs Mode Siswa handlers
  const handleRequestGuruMode = () => {
    if (isTeacherAuthenticated) {
      setUserRole('guru');
      showToast('Mode Guru aktif.');
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleSwitchToSiswaMode = () => {
    setUserRole('siswa');
    setIsTeacherOpen(false);
    showToast('Beralih ke Mode Siswa.');
  };

  const handlePasswordSuccess = () => {
    try {
      sessionStorage.setItem('lkm_teacher_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsTeacherAuthenticated(true);
    setUserRole('guru');
    setIsPasswordModalOpen(false);
    setIsTeacherOpen(true);
    showToast('Akses Guru Terverifikasi! Selamat datang di Mode Guru.');
  };

  // Phase navigation
  const goToPhase = (phaseNumber: number) => {
    setData((prev) => {
      const completed = new Set(prev.completedPhases);
      completed.add(prev.currentPhase);
      return {
        ...prev,
        currentPhase: phaseNumber,
        completedPhases: Array.from(completed),
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuest = () => {
    setIsLanding(false);
    goToPhase(1);
  };

  const handleGoHome = () => {
    setIsLanding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        isLanding={isLanding}
        onGoHome={handleGoHome}
        currentPhase={data.currentPhase}
        completedPhases={data.completedPhases}
        onSelectPhase={(p) => {
          setIsLanding(false);
          goToPhase(p);
        }}
        activeScenario={selectedScenario}
        userRole={userRole}
        onRequestGuruMode={handleRequestGuruMode}
        onSwitchToSiswaMode={handleSwitchToSiswaMode}
        onOpenTeacherDrawer={() => setIsTeacherOpen(true)}
        onOpenHelp={() =>
          handleOpenHint('Petunjuk Umum PBL Program Linear', [
            'Ikuti 5 fase secara bertahap mulai dari Fase 1 hingga Fase 5.',
            'Jawaban Anda akan otomatis tersimpan di peramban dan dimasukkan ke dalam laporan akhir.',
            'Setelah Fase 5 selesai, Anda dapat mengunduh dokumen resmi LKM dalam format PDF.',
          ])
        }
        onSaveProgress={handleManualSave}
        onResetProgress={handleResetProgress}
        lastSavedText={`Tersimpan: ${data.lastSavedAt || 'Baru saja'}`}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLanding ? (
          <LandingHero
            onStart={handleStartQuest}
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={handleSelectScenario}
            userRole={userRole}
            onRequestGuruMode={handleRequestGuruMode}
          />
        ) : (
          <>
            {data.currentPhase === 1 && (
              <Phase1Orientation
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
                data={data}
                onChangeData={setData}
                onNext={() => goToPhase(2)}
                onOpenHint={handleOpenHint}
                userRole={userRole}
                onOpenTeacher={() => setIsTeacherOpen(true)}
              />
            )}

            {data.currentPhase === 2 && (
              <Phase2Organization
                selectedScenario={selectedScenario}
                data={data}
                onChangeData={setData}
                onNext={() => goToPhase(3)}
                onPrev={() => goToPhase(1)}
                onOpenHint={handleOpenHint}
              />
            )}

            {data.currentPhase === 3 && (
              <Phase3Investigation
                selectedScenario={selectedScenario}
                data={data}
                onChangeData={setData}
                onNext={() => goToPhase(4)}
                onPrev={() => goToPhase(2)}
                onOpenHint={handleOpenHint}
                graphRef={graphRef}
                userRole={userRole}
              />
            )}

            {data.currentPhase === 4 && (
              <Phase4Presentation
                selectedScenario={selectedScenario}
                data={data}
                onChangeData={setData}
                onNext={() => goToPhase(5)}
                onPrev={() => goToPhase(3)}
                onOpenHint={handleOpenHint}
              />
            )}

            {data.currentPhase === 5 && (
              <Phase5Evaluation
                selectedScenario={selectedScenario}
                data={data}
                onChangeData={setData}
                onPrev={() => goToPhase(4)}
                onOpenHint={handleOpenHint}
                graphRef={graphRef}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-700">LinQuest (Linear Quest)</span>
            <span>•</span>
            <span className="italic text-slate-600">Explore, Solve, Optimize!</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Matematika SMA Kelas X PBL</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Jawaban LKM</span>
            </button>
            <span>&copy; {new Date().getFullYear()} Bahan Ajar Kurikulum Merdeka</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hint Modal */}
      <HintModal
        isOpen={hintModal.isOpen}
        onClose={() => setHintModal({ ...hintModal, isOpen: false })}
        title={hintModal.title}
        hints={hintModal.hints}
      />

      {/* Teacher Password Auth Modal */}
      <TeacherPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Teacher Drawer */}
      <TeacherDrawer
        isOpen={isTeacherOpen}
        onClose={() => setIsTeacherOpen(false)}
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => {
          handleSelectScenario(id);
          setIsTeacherOpen(false);
        }}
        onUpdateScenario={handleUpdateScenario}
        onResetScenarios={handleResetScenarios}
      />
    </div>
  );
}
