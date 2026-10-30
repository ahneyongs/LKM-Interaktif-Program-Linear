export interface ConstraintItem {
  id: string;
  name: string; // e.g., "Bahan Baku Tepung", "Waktu Mesin / Tenaga Kerja"
  coeffX: number; // e.g., 2
  coeffY: number; // e.g., 3
  operator: '<=' | '>=' | '<' | '>';
  capacity: number; // e.g., 60
  unit: string; // e.g., "kg", "jam", "ribu rupiah"
}

export interface BusinessScenario {
  id: number;
  groupNumber: number;
  businessName: string;
  category: string;
  ownerName: string;
  story: string;
  productX: {
    name: string;
    unit: string;
    profitOrCost: number; // e.g., 40000 (profit per unit)
  };
  productY: {
    name: string;
    unit: string;
    profitOrCost: number; // e.g., 50000
  };
  objectiveType: 'maximize' | 'minimize';
  objectiveLabel: string; // "Memaksimalkan Keuntungan" atau "Meminimalkan Biaya"
  constraints: ConstraintItem[];
  tips: string;
}

export interface GroupMember {
  id: string;
  name: string;
  role: string; // e.g., "Ketua Kelompok", "Analis Model Matematika", "Juru Gambar Grafik", "Kalkulator Titik Pojok", "Notulen & Presenter"
}

export interface StudentConstraintInput {
  name: string;
  coeffX: string;
  coeffY: string;
  operator: '<=' | '>=' | '<' | '>';
  capacity: string;
}

export interface StudentCornerPoint {
  id: string;
  label: string; // A, B, C, D
  x: string;
  y: string;
  isCorrect?: boolean | null;
}

export interface StudentObjectiveTest {
  id: string;
  pointLabel: string;
  x: string;
  y: string;
  substitution: string; // e.g. "40000(0) + 50000(15)"
  calculatedZ: string; // e.g. "750000"
  isOptimum?: boolean;
}

export interface LkmProgressData {
  currentPhase: number;
  groupId: number; // 1 to 6 (stands for Permasalahan 1 to 6)
  groupName?: string; // maintained for backward compatibility
  members?: GroupMember[]; // maintained for backward compatibility

  // Identitas Individu Siswa (Fase 2)
  studentName: string;
  studentClass: string;
  studentAbsen: string;

  // Phase 1
  phase1Answers: {
    productFocus: string;
    businessGoal: string;
    resourceConstraints: string;
    product1Name?: string;
    product1Profit?: string;
    product2Name?: string;
    product2Profit?: string;
  };

  // Phase 2
  phase2Answers: {
    knownInfo: string;
    askedQuestion: string;
  };

  // Phase 3
  step1: {
    varXMeaning: string;
    varYMeaning: string;
  };
  step2: {
    constraints: StudentConstraintInput[];
    nonNegativeX: boolean;
    nonNegativeY: boolean;
    objCoeffX: string;
    objCoeffY: string;
    objType: 'maximize' | 'minimize';
  };
  step3: {
    selectedRegion: string; // 'Daerah I', 'Daerah II', 'Daerah III', 'Daerah IV', 'Daerah V'
    explanationDP: string;
    points: StudentCornerPoint[];
    testPoints: Array<{ x: number; y: number; result: string }>;
  };
  step4: {
    points: StudentCornerPoint[];
  };
  step5: {
    evaluations: StudentObjectiveTest[];
    optimumPoint: string;
    optimumValue: string;
  };
  step6: {
    optimalProductX: string;
    optimalProductY: string;
    optimumResultValue: string;
    businessReasoning: string;
  };

  // Phase 4
  phase4Presentation: {
    businessIntro: string;
    graphicExplanation: string;
    optimumPointReason: string;
    conclusionNote: string;
  };

  // Phase 5
  phase5Reflection: {
    easiestPart: string;
    challengingPart: string;
    whyNotOutsideDP: string;
    realLifeBenefit: string;
  };

  completedPhases: number[];
  lastSavedAt: string;
}
