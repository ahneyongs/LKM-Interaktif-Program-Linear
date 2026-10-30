import { jsPDF } from 'jspdf';
import { BusinessScenario, LkmProgressData } from '../types/lkm';
import { formatRupiah } from './mathSolver';
import { renderLPGraphToDataUrl } from './graphRenderer';

export async function generateLkmPdf(
  data: LkmProgressData,
  scenario: BusinessScenario,
  graphDataUrl?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      currentY = margin;
      drawPageHeaderFooter();
    }
  };

  const drawPageHeaderFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `LKM Interaktif Program Linear Kelas X (PBL) — Permasalahan ${scenario.groupNumber}: ${scenario.businessName}`,
      margin,
      10
    );
    doc.text(`Halaman ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 12, pageWidth - margin, 12);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  };

  // ---------------- PAGE 1: HEADER & IDENTITAS ----------------
  drawPageHeaderFooter();

  // Top School Header Box
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LEMBAR KERJA SISWA (LKM) DIGITAL', margin + 8, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    'Materi: Program Linear Dua Variabel (SPtLDV) • Model: Problem Based Learning (PBL)',
    margin + 8,
    currentY + 16
  );
  doc.text(
    `Mata Pelajaran: Matematika Kelas X SMA • Tanggal Pengumpulan: ${new Date().toLocaleDateString(
      'id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' }
    )}`,
    margin + 8,
    currentY + 21
  );

  currentY += 28;

  // Student Individual Information Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`IDENTITAS SISWA & PERMASALAHAN`, margin + 5, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nama Lengkap: ${data.studentName || '—'}`, margin + 5, currentY + 13);
  doc.text(`Kelas: ${data.studentClass || '—'}`, margin + 80, currentY + 13);
  doc.text(`No. Absen: ${data.studentAbsen || '—'}`, margin + 140, currentY + 13);

  doc.text(`Permasalahan: Permasalahan ${scenario.groupNumber} — ${scenario.businessName} (${scenario.category})`, margin + 5, currentY + 19);
  doc.text(`Pemilik Usaha: ${scenario.ownerName}`, margin + 5, currentY + 24);
  doc.text(`Tujuan Optimasi: ${scenario.objectiveLabel}`, margin + 5, currentY + 29);

  currentY += 36;

  // ---------------- SECTION 1 & 2: MASALAH & IDENTIFIKASI ----------------
  checkPageBreak(35);
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('FASE 1 & 2: ORIENTASI & IDENTIFIKASI MASALAH BISNIS', margin + 4, currentY + 4.5);
  currentY += 8;

  // Story summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Skenario Masalah:', margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const splitStory = doc.splitTextToSize(scenario.story, contentWidth);
  doc.text(splitStory, margin, currentY);
  currentY += splitStory.length * 4 + 4;

  // Student Answers to Phase 1 & 2
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Fokus Produk Bisnis: ', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.phase1Answers.productFocus || '—', margin + 40, currentY);
  currentY += 5;

  if (data.phase1Answers.product1Name || data.phase1Answers.product2Name) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `• Produk 1 (x): ${data.phase1Answers.product1Name || '—'} (Rp ${Number(data.phase1Answers.product1Profit || 0).toLocaleString('id-ID')}) | Produk 2 (y): ${data.phase1Answers.product2Name || '—'} (Rp ${Number(data.phase1Answers.product2Profit || 0).toLocaleString('id-ID')})`,
      margin + 4,
      currentY
    );
    currentY += 4.5;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('2. Tujuan Pemilik Usaha: ', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    data.phase1Answers.businessGoal === 'maximize'
      ? 'Memaksimalkan Keuntungan Bersih (Laba)'
      : 'Meminimalkan Biaya Pengeluaran',
    margin + 40,
    currentY
  );
  currentY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('3. Apa yang Diketahui:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const splitKnown = doc.splitTextToSize(data.phase2Answers.knownInfo || '—', contentWidth);
  doc.text(splitKnown, margin, currentY);
  currentY += splitKnown.length * 4 + 4;

  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Apa yang Ditanyakan:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const splitAsked = doc.splitTextToSize(data.phase2Answers.askedQuestion || '—', contentWidth);
  doc.text(splitAsked, margin, currentY);
  currentY += splitAsked.length * 4 + 6;

  // ---------------- FASE 3: MODEL MATEMATIKA ----------------
  checkPageBreak(40);
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('FASE 3: MODEL MATEMATIKA SPtLDV & FUNGSI OBJEKTIF', margin + 4, currentY + 4.5);
  currentY += 8;

  // Variabel keputusan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Variabel Keputusan:', margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`• x menyatakan: ${data.step1.varXMeaning || `Banyaknya ${scenario.productX.name}`}`, margin + 4, currentY);
  currentY += 4.5;
  doc.text(`• y menyatakan: ${data.step1.varYMeaning || `Banyaknya ${scenario.productY.name}`}`, margin + 4, currentY);
  currentY += 6;

  // Table of constraints
  doc.setFont('helvetica', 'bold');
  doc.text('Tabel Kendala Sumber Daya & Sistem Pertidaksamaan Linear (SPtLDV):', margin, currentY);
  currentY += 4;

  // Draw constraints table
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Kendala', margin + 3, currentY + 4);
  doc.text('Koef X (x)', margin + 60, currentY + 4);
  doc.text('Koef Y (y)', margin + 85, currentY + 4);
  doc.text('Tanda', margin + 110, currentY + 4);
  doc.text('Kapasitas', margin + 130, currentY + 4);
  doc.text('Bentuk Pertidaksamaan', margin + 150, currentY + 4);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  data.step2.constraints.forEach((c, idx) => {
    checkPageBreak(7);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    doc.text(c.name || `Kendala ${idx + 1}`, margin + 3, currentY + 4.5);
    doc.text(`${c.coeffX}x`, margin + 60, currentY + 4.5);
    doc.text(`${c.coeffY}y`, margin + 85, currentY + 4.5);
    doc.text(c.operator, margin + 110, currentY + 4.5);
    doc.text(c.capacity.toString(), margin + 130, currentY + 4.5);
    doc.text(`${c.coeffX}x + ${c.coeffY}y ${c.operator} ${c.capacity}`, margin + 150, currentY + 4.5);
    currentY += 6;
  });

  // Non-negativity condition
  currentY += 2;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Syarat Non-negatif Produksi: x >= 0, y >= 0', margin + 3, currentY + 3);
  currentY += 6;

  // Objective function
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Fungsi Objektif: Z = ${data.step2.objCoeffX || scenario.productX.profitOrCost}x + ${
      data.step2.objCoeffY || scenario.productY.profitOrCost
    }y (${scenario.objectiveLabel})`,
    margin,
    currentY + 2
  );
  currentY += 8;

  // ---------------- GRAFIK DAERAH PENYELESAIAN ----------------
  checkPageBreak(90);
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('GRAFIK BIDANG KOORDINAT KARTESIUS & DAERAH PENYELESAIAN (DP)', margin + 4, currentY + 4.5);
  currentY += 8;

  // Pastikan gambar grafik selalu ter-generate dengan kualitas tinggi
  let effectiveGraphUrl = graphDataUrl;
  if (!effectiveGraphUrl) {
    const studentValid = data.step2.constraints
      .filter((c) => (Number(c.coeffX) > 0 || Number(c.coeffY) > 0) && Number(c.capacity) > 0)
      .map((c, i) => ({
        id: `c-${i}`,
        name: c.name || `Kendala ${i + 1}`,
        coeffX: Number(c.coeffX),
        coeffY: Number(c.coeffY),
        operator: c.operator,
        capacity: Number(c.capacity),
        unit: 'unit',
      }));

    const constraintsToRender = studentValid.length > 0 ? studentValid : scenario.constraints;
    effectiveGraphUrl = renderLPGraphToDataUrl(
      constraintsToRender,
      Number(data.step2.objCoeffX) || scenario.productX.profitOrCost,
      Number(data.step2.objCoeffY) || scenario.productY.profitOrCost,
      data.step3.selectedRegion || 'Daerah I'
    );
  }

  if (effectiveGraphUrl) {
    try {
      const imgWidth = 135;
      const imgHeight = 98;
      const imgX = margin + (contentWidth - imgWidth) / 2;
      doc.addImage(effectiveGraphUrl, 'PNG', imgX, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 4;
    } catch (err) {
      console.error('Failed to attach image to PDF:', err);
    }
  }

  // Explanation of DP
  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Penjelasan Pemilihan Daerah Penyelesaian (DP):', margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  const splitDpReason = doc.splitTextToSize(data.step3.explanationDP || '—', contentWidth);
  doc.text(splitDpReason, margin, currentY);
  currentY += splitDpReason.length * 4 + 6;

  // ---------------- TITIK POJOK & UJI FUNGSI OBJEKTIF ----------------
  checkPageBreak(50);
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('DAFTAR TITIK POJOK & TABEL UJI NILAI FUNGSI OBJEKTIF', margin + 4, currentY + 4.5);
  currentY += 8;

  // Evaluation table
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Titik Pojok', margin + 3, currentY + 4);
  doc.text('Koordinat (x, y)', margin + 40, currentY + 4);
  doc.text('Substitusi ke Fungsi Objektif Z', margin + 80, currentY + 4);
  doc.text('Nilai Z (Rp)', margin + 140, currentY + 4);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  data.step5.evaluations.forEach((ev) => {
    checkPageBreak(7);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    doc.text(ev.pointLabel, margin + 3, currentY + 4.5);
    doc.text(`(${ev.x || 0}, ${ev.y || 0})`, margin + 40, currentY + 4.5);
    doc.text(ev.substitution || '—', margin + 80, currentY + 4.5);
    doc.text(formatRupiah(Number(ev.calculatedZ) || 0), margin + 140, currentY + 4.5);
    currentY += 6;
  });

  currentY += 4;

  // ---------------- KESIMPULAN SOLUSI OPTIMUM ----------------
  checkPageBreak(30);
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70);
  doc.text('KESIMPULAN SOLUSI BISNIS OPTIMUM:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text(
    `• Kombinasi Produksi: ${data.step6.optimalProductX || '0'} ${scenario.productX.unit} ${
      scenario.productX.name
    } dan ${data.step6.optimalProductY || '0'} ${scenario.productY.unit} ${scenario.productY.name}`,
    margin + 4,
    currentY + 12
  );
  doc.text(
    `• Nilai Optimum: Keuntungan Maksimum Sebesar ${formatRupiah(
      Number(data.step6.optimumResultValue) || 0
    )}`,
    margin + 4,
    currentY + 17
  );
  doc.text(
    `• Alasan Keputusan: ${data.step6.businessReasoning || 'Semua sumber daya teroptimasi penuh tanpa melewati batas kapasitas.'}`,
    margin + 4,
    currentY + 22
  );

  currentY += 28;

  // ---------------- FASE 4: RINGKASAN HASIL PENYELIDIKAN & SOLUSI ----------------
  checkPageBreak(40);
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('FASE 4: RINGKASAN HASIL PENYELIDIKAN & SOLUSI OPTIMUM', margin + 4, currentY + 4.5);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Ringkasan Analisis Masalah & Batasan Sumber Daya:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const splitP1 = doc.splitTextToSize(data.phase4Presentation.businessIntro || '—', contentWidth);
  doc.text(splitP1, margin, currentY);
  currentY += splitP1.length * 4 + 4;

  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Ringkasan Interpretasi Grafik & Daerah Penyelesaian (DP):', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const splitP2 = doc.splitTextToSize(data.phase4Presentation.graphicExplanation || '—', contentWidth);
  doc.text(splitP2, margin, currentY);
  currentY += splitP2.length * 4 + 4;

  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Rekomendasi Keputusan Akhir untuk Pemilik Usaha:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  const splitP3 = doc.splitTextToSize(data.phase4Presentation.optimumPointReason || '—', contentWidth);
  doc.text(splitP3, margin, currentY);
  currentY += splitP3.length * 4 + 6;

  // ---------------- FASE 5: REFLEKSI SISWA ----------------
  checkPageBreak(50);
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('FASE 5: ANALISIS & REFLEKSI PROSES PEMECAHAN MASALAH', margin + 4, currentY + 4.5);
  currentY += 8;

  const reflections = [
    {
      q: '1. Langkah mana yang paling mudah dipahami? Apa alasannya?',
      a: data.phase5Reflection.easiestPart,
    },
    {
      q: '2. Langkah mana yang paling menantang atau membingungkan? Apa kendala yang dihadapi?',
      a: data.phase5Reflection.challengingPart,
    },
    {
      q: '3. Mengapa titik di luar daerah penyelesaian tidak boleh dipilih sebagai solusi terbaik?',
      a: data.phase5Reflection.whyNotOutsideDP,
    },
    {
      q: '4. Bagaimana Program Linear membantu mengelola modal dan bahan baku jika siswa kelak berbisnis?',
      a: data.phase5Reflection.realLifeBenefit,
    },
  ];

  reflections.forEach((rf) => {
    checkPageBreak(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(rf.q, margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    const splitA = doc.splitTextToSize(rf.a || '—', contentWidth);
    doc.text(splitA, margin, currentY);
    currentY += splitA.length * 4 + 4;
  });

  // Signature Block
  checkPageBreak(35);
  currentY += 6;
  const colW = contentWidth / 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Mengetahui / Mengesahkan,', margin + 10, currentY);
  doc.text('Siswa Penyusun,', margin + colW + 10, currentY);
  currentY += 4;

  doc.text('Guru Mata Pelajaran Matematika', margin + 10, currentY);
  doc.text(`Permasalahan ${scenario.groupNumber}: ${scenario.businessName}`, margin + colW + 10, currentY);
  currentY += 18;

  doc.setDrawColor(180, 180, 180);
  doc.line(margin + 10, currentY, margin + colW - 20, currentY);
  doc.line(margin + colW + 10, currentY, margin + contentWidth - 20, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('(Tanda Tangan & Nama Terang Guru)', margin + 10, currentY);
  doc.text(`(${data.studentName || 'Nama Siswa'})`, margin + colW + 10, currentY);

  // Save PDF file
  const safeName = (data.studentName || 'Siswa').trim().replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `LKM_Program_Linear_Permasalahan_${scenario.groupNumber}_${safeName}.pdf`;
  doc.save(fileName);
}
