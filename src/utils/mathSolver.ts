import { ConstraintItem } from '../types/lkm';

export interface Point2D {
  x: number;
  y: number;
}

export interface FeasibleAnalysis {
  isFeasible: boolean;
  isBounded: boolean;
  vertices: Point2D[];
  allIntersections: Array<{ point: Point2D; label: string; lines: string[] }>;
  optimalPoint: Point2D | null;
  optimalValue: number | null;
  evaluatedVertices: Array<{ point: Point2D; value: number }>;
}

const EPSILON = 1e-6;

/**
 * Checks if a point (x, y) satisfies all constraints including non-negativity
 */
export function isPointFeasible(
  p: Point2D,
  constraints: ConstraintItem[],
  includeNonNegative = true
): boolean {
  if (includeNonNegative) {
    if (p.x < -EPSILON || p.y < -EPSILON) return false;
  }

  for (const c of constraints) {
    const val = c.coeffX * p.x + c.coeffY * p.y;
    if (c.operator === '<=' && val > c.capacity + EPSILON) return false;
    if (c.operator === '>=' && val < c.capacity - EPSILON) return false;
    if (c.operator === '<' && val >= c.capacity - EPSILON) return false;
    if (c.operator === '>' && val <= c.capacity + EPSILON) return false;
  }

  return true;
}

/**
 * Finds intersection between two lines:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 */
export function findIntersection(
  a1: number,
  b1: number,
  c1: number,
  a2: number,
  b2: number,
  c2: number
): Point2D | null {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < EPSILON) return null; // Parallel or identical

  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;

  return {
    x: Math.abs(x) < EPSILON ? 0 : Number(x.toFixed(4)),
    y: Math.abs(y) < EPSILON ? 0 : Number(y.toFixed(4)),
  };
}

/**
 * Sorts 2D points in counter-clockwise order around their centroid to form a clean polygon
 */
export function sortPolygonPoints(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return points;

  // Calculate centroid
  const cx = points.reduce((acc, p) => acc + p.x, 0) / points.length;
  const cy = points.reduce((acc, p) => acc + p.y, 0) / points.length;

  return [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });
}

/**
 * Solves standard 2D LP problem with corner point method
 */
export function analyzeLinearProgram(
  constraints: ConstraintItem[],
  objCoeffX: number,
  objCoeffY: number,
  objectiveType: 'maximize' | 'minimize' = 'maximize'
): FeasibleAnalysis {
  const allLines: Array<{ a: number; b: number; c: number; name: string }> = [];

  // Add boundary lines for constraints
  constraints.forEach((c, idx) => {
    allLines.push({
      a: c.coeffX,
      b: c.coeffY,
      c: c.capacity,
      name: `Kendala ${idx + 1}`,
    });
  });

  // Add axis lines: x = 0 (1*x + 0*y = 0) and y = 0 (0*x + 1*y = 0)
  allLines.push({ a: 1, b: 0, c: 0, name: 'Sumbu Y (x = 0)' });
  allLines.push({ a: 0, b: 1, c: 0, name: 'Sumbu X (y = 0)' });

  const rawIntersections: Array<{ point: Point2D; lines: string[] }> = [];

  for (let i = 0; i < allLines.length; i++) {
    for (let j = i + 1; j < allLines.length; j++) {
      const pt = findIntersection(
        allLines[i].a,
        allLines[i].b,
        allLines[i].c,
        allLines[j].a,
        allLines[j].b,
        allLines[j].c
      );

      if (pt) {
        rawIntersections.push({
          point: pt,
          lines: [allLines[i].name, allLines[j].name],
        });
      }
    }
  }

  // Filter feasible points
  const uniqueFeasiblePoints: Point2D[] = [];
  const labeledIntersections: Array<{ point: Point2D; label: string; lines: string[] }> = [];

  rawIntersections.forEach((item, index) => {
    const p = item.point;
    const isFeas = isPointFeasible(p, constraints, true);
    labeledIntersections.push({
      point: p,
      label: `P${index + 1}`,
      lines: item.lines,
    });

    if (isFeas) {
      // Check if already in unique points
      const exists = uniqueFeasiblePoints.some(
        (existing) => Math.abs(existing.x - p.x) < 0.05 && Math.abs(existing.y - p.y) < 0.05
      );
      if (!exists) {
        uniqueFeasiblePoints.push(p);
      }
    }
  });

  // Sort feasible vertices to form a proper closed polygon
  const sortedVertices = sortPolygonPoints(uniqueFeasiblePoints);

  // Evaluate objective function on all feasible vertices
  const evaluated = sortedVertices.map((p) => {
    const val = objCoeffX * p.x + objCoeffY * p.y;
    return { point: p, value: val };
  });

  let optimalPoint: Point2D | null = null;
  let optimalValue: number | null = null;

  if (evaluated.length > 0) {
    if (objectiveType === 'maximize') {
      let maxVal = -Infinity;
      evaluated.forEach((ev) => {
        if (ev.value > maxVal) {
          maxVal = ev.value;
          optimalPoint = ev.point;
          optimalValue = ev.value;
        }
      });
    } else {
      let minVal = Infinity;
      evaluated.forEach((ev) => {
        if (ev.value < minVal) {
          minVal = ev.value;
          optimalPoint = ev.point;
          optimalValue = ev.value;
        }
      });
    }
  }

  return {
    isFeasible: sortedVertices.length > 0,
    isBounded: true, // Typical standard school LP constraints x>=0, y>=0, ax+by<=c
    vertices: sortedVertices,
    allIntersections: labeledIntersections,
    optimalPoint,
    optimalValue,
    evaluatedVertices: evaluated,
  };
}

/**
 * Format currency in Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format standard numbers
 */
export function formatNumber(val: number): string {
  if (Number.isInteger(val)) return val.toString();
  return Number(val.toFixed(2)).toString();
}
