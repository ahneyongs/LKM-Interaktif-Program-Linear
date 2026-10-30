import { ConstraintItem } from '../types/lkm';
import { analyzeLinearProgram, Point2D } from './mathSolver';

/**
 * Renders an offline high-resolution PNG DataURL of the Cartesian Coordinate Plane
 * and Linear Programming Feasible Region (DP).
 * This ensures the PDF generator ALWAYS has a crisp, verified graph image regardless of DOM mount state!
 */
export function renderLPGraphToDataUrl(
  constraints: ConstraintItem[],
  objCoeffX: number = 0,
  objCoeffY: number = 0,
  selectedRegionLabel: string = 'Daerah I'
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const padding = 70;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // LP Analysis
  const analysis = analyzeLinearProgram(constraints, objCoeffX, objCoeffY);

  // Dynamic max bound
  let maxVal = 100;
  constraints.forEach((c) => {
    if (c.coeffX > 0) {
      const xInt = c.capacity / c.coeffX;
      if (xInt > maxVal && xInt < 1000) maxVal = xInt;
    }
    if (c.coeffY > 0) {
      const yInt = c.capacity / c.coeffY;
      if (yInt > maxVal && yInt < 1000) maxVal = yInt;
    }
  });
  const axisMax = Math.ceil((maxVal * 1.25) / 10) * 10;

  const toX = (x: number) => padding + (x / axisMax) * plotWidth;
  const toY = (y: number) => height - padding - (y / axisMax) * plotHeight;

  // Grid lines
  let gridStep = 10;
  if (axisMax <= 20) gridStep = 5;
  else if (axisMax <= 50) gridStep = 10;
  else if (axisMax <= 120) gridStep = 20;
  else if (axisMax <= 250) gridStep = 50;
  else gridStep = 100;

  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';

  for (let v = 0; v <= axisMax; v += gridStep) {
    const xPos = toX(v);
    const yPos = toY(v);

    // Vertical grid
    ctx.beginPath();
    ctx.moveTo(xPos, padding);
    ctx.lineTo(xPos, height - padding);
    ctx.stroke();

    // Horizontal grid
    ctx.beginPath();
    ctx.moveTo(padding, yPos);
    ctx.lineTo(width - padding, yPos);
    ctx.stroke();

    // Ticks & Labels
    ctx.textAlign = 'center';
    ctx.fillText(v.toString(), xPos, height - padding + 20);

    if (v > 0) {
      ctx.textAlign = 'right';
      ctx.fillText(v.toString(), padding - 10, yPos + 4);
    }
  }

  // Draw Feasible Polygon (DP) Shading
  if (analysis.isFeasible && analysis.vertices.length >= 3) {
    ctx.save();
    ctx.beginPath();
    analysis.vertices.forEach((pt, i) => {
      const px = toX(pt.x);
      const py = toY(pt.y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    ctx.fillStyle = 'rgba(79, 70, 229, 0.25)'; // Indigo semi-transparent
    ctx.fill();

    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text in DP
    const cx = analysis.vertices.reduce((s, p) => s + p.x, 0) / analysis.vertices.length;
    const cy = analysis.vertices.reduce((s, p) => s + p.y, 0) / analysis.vertices.length;

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAERAH I (DP)', toX(cx), toY(cy));
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Daerah Penyelesaian', toX(cx), toY(cy) + 16);
    ctx.restore();
  }

  // Draw Boundary Lines
  const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed'];
  constraints.forEach((c, idx) => {
    const a = c.coeffX;
    const b = c.coeffY;
    const k = c.capacity;
    if (a <= 0 && b <= 0) return;

    ctx.save();
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    // Find x-intercept and y-intercept
    const pts: Point2D[] = [];
    if (b > 0) pts.push({ x: 0, y: k / b });
    if (a > 0) pts.push({ x: k / a, y: 0 });

    if (pts.length >= 2) {
      ctx.moveTo(toX(pts[0].x), toY(pts[0].y));
      ctx.lineTo(toX(pts[1].x), toY(pts[1].y));
      ctx.stroke();

      // Label on line
      ctx.fillStyle = colors[idx % colors.length];
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      ctx.fillText(`${a}x + ${b}y = ${k}`, toX(midX) + 8, toY(midY) - 8);
    }
    ctx.restore();
  });

  // Region Labels (Daerah I, II, III, IV, V) for pedagogical diagram
  ctx.save();
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';

  // Helper function to draw region tag
  const drawRegionTag = (label: string, xPos: number, yPos: number, isDP = false) => {
    ctx.save();
    ctx.fillStyle = isDP ? '#4338ca' : '#64748b';
    ctx.fillRect(xPos - 36, yPos - 12, 72, 24);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(label, xPos, yPos + 4);
    ctx.restore();
  };

  // Region markers positioned appropriately
  if (analysis.isFeasible && analysis.vertices.length >= 3) {
    const vMaxX = Math.max(...analysis.vertices.map((v) => v.x));
    const vMaxY = Math.max(...analysis.vertices.map((v) => v.y));

    // Region II (to the right of DP, under constraint 1 or 2)
    drawRegionTag('Daerah II', toX(Math.min(axisMax * 0.75, vMaxX + 25)), toY(15));
    // Region III (above DP)
    drawRegionTag('Daerah III', toX(15), toY(Math.min(axisMax * 0.75, vMaxY + 25)));
    // Region IV (far upper right, above all constraints)
    drawRegionTag('Daerah IV', toX(axisMax * 0.65), toY(axisMax * 0.65));
    // Region V (outside Kuadran I or origin border)
    drawRegionTag('Daerah V', toX(axisMax * 0.85), toY(axisMax * 0.85));
  }
  ctx.restore();

  // Draw Main Axes X and Y
  ctx.save();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  // X Axis
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding + 20, height - padding);
  ctx.stroke();

  // Arrow X
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(width - padding + 25, height - padding);
  ctx.lineTo(width - padding + 15, height - padding - 5);
  ctx.lineTo(width - padding + 15, height - padding + 5);
  ctx.closePath();
  ctx.fill();

  // Y Axis
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(padding, padding - 20);
  ctx.stroke();

  // Arrow Y
  ctx.beginPath();
  ctx.moveTo(padding, padding - 25);
  ctx.lineTo(padding - 5, padding - 15);
  ctx.lineTo(padding + 5, padding - 15);
  ctx.closePath();
  ctx.fill();

  // Axis Labels
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('X (Produk X)', width - padding + 30, height - padding + 5);
  ctx.textAlign = 'center';
  ctx.fillText('Y (Produk Y)', padding, padding - 35);
  ctx.fillText('O(0,0)', padding - 15, height - padding + 18);
  ctx.restore();

  // Draw Corner Points (Vertices)
  if (analysis.vertices.length > 0) {
    const labels = ['O', 'A', 'B', 'C', 'D', 'E'];
    analysis.vertices.forEach((pt, i) => {
      const label = pt.x === 0 && pt.y === 0 ? 'O' : labels[i] || `P${i}`;
      const px = toX(pt.x);
      const py = toY(pt.y);

      // Red dot
      ctx.save();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Coordinate tag badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      const tagText = `${label}(${pt.x}, ${pt.y})`;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      const textW = ctx.measureText(tagText).width;
      ctx.fillRect(px + 8, py - 20, textW + 10, 20);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(tagText, px + 13, py - 6);
      ctx.restore();
    });
  }

  return canvas.toDataURL('image/png');
}
