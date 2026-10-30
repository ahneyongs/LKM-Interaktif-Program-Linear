import React, { useState, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { ConstraintItem } from '../types/lkm';
import { analyzeLinearProgram, Point2D, isPointFeasible } from '../utils/mathSolver';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Eye, Info, CheckCircle2, XCircle } from 'lucide-react';

interface CartesianGraphProps {
  constraints: ConstraintItem[];
  objectiveCoeffX?: number;
  objectiveCoeffY?: number;
  highlightPoints?: Point2D[];
  interactiveTestPoint?: boolean;
  onSelectPoint?: (p: Point2D) => void;
}

export interface CartesianGraphHandle {
  getSvgElement: () => SVGSVGElement | null;
  getCanvasDataUrl: () => Promise<string>;
}

export const CartesianGraph = forwardRef<CartesianGraphHandle, CartesianGraphProps>(
  (
    {
      constraints,
      objectiveCoeffX = 0,
      objectiveCoeffY = 0,
      highlightPoints = [],
      interactiveTestPoint = true,
      onSelectPoint,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Coordinate view state
    const [scaleFactor, setScaleFactor] = useState<number>(1);
    const [testPoint, setTestPoint] = useState<Point2D>({ x: 20, y: 20 });
    const [showIndividualHatching, setShowIndividualHatching] = useState<boolean>(false);
    const [hoveredPoint, setHoveredPoint] = useState<Point2D | null>(null);

    // Compute LP analysis
    const analysis = useMemo(() => {
      return analyzeLinearProgram(constraints, objectiveCoeffX, objectiveCoeffY);
    }, [constraints, objectiveCoeffX, objectiveCoeffY]);

    // Calculate dynamic axis maximum bounds based on intercepts
    const maxCalculatedBound = useMemo(() => {
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
      // Round up to nice number
      return Math.ceil((maxVal * 1.25) / 10) * 10;
    }, [constraints]);

    const axisMax = maxCalculatedBound / scaleFactor;

    // ViewBox dimensions
    const width = 640;
    const height = 480;
    const padding = 55;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    // Mapping coordinates
    const toSvgX = (x: number) => padding + (x / axisMax) * plotWidth;
    const toSvgY = (y: number) => height - padding - (y / axisMax) * plotHeight;
    const toMathX = (svgX: number) => ((svgX - padding) / plotWidth) * axisMax;
    const toMathY = (svgY: number) => ((height - padding - svgY) / plotHeight) * axisMax;

    // Line colors
    const lineColors = [
      '#2563eb', // blue-600
      '#059669', // emerald-600
      '#d97706', // amber-600
      '#7c3aed', // violet-600
    ];

    // Compute line endpoints across visible box
    const getLinePoints = (c: ConstraintItem) => {
      // a*x + b*y = capacity
      // At x = 0: y = capacity / b
      // At y = 0: x = capacity / a
      const a = c.coeffX;
      const b = c.coeffY;
      const k = c.capacity;

      const pts: Point2D[] = [];

      // Intersect with x = 0 (left)
      if (Math.abs(b) > 0.0001) {
        const y = k / b;
        if (y >= 0 && y <= axisMax * 1.5) pts.push({ x: 0, y });
      }

      // Intersect with y = 0 (bottom)
      if (Math.abs(a) > 0.0001) {
        const x = k / a;
        if (x >= 0 && x <= axisMax * 1.5) pts.push({ x, y: 0 });
      }

      // Intersect with x = axisMax
      if (Math.abs(b) > 0.0001) {
        const y = (k - a * axisMax * 1.2) / b;
        if (y >= 0 && y <= axisMax * 1.5) pts.push({ x: axisMax * 1.2, y });
      }

      // Intersect with y = axisMax
      if (Math.abs(a) > 0.0001) {
        const x = (k - b * axisMax * 1.2) / a;
        if (x >= 0 && x <= axisMax * 1.2) pts.push({ x, y: axisMax * 1.2 });
      }

      if (pts.length >= 2) {
        return {
          x1: toSvgX(pts[0].x),
          y1: toSvgY(pts[0].y),
          x2: toSvgX(pts[1].x),
          y2: toSvgY(pts[1].y),
          p1: pts[0],
          p2: pts[1],
        };
      }
      return null;
    };

    // Feasible Polygon SVG path
    const polygonPath = useMemo(() => {
      if (!analysis.isFeasible || analysis.vertices.length < 3) return '';
      return (
        analysis.vertices
          .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(v.x).toFixed(1)} ${toSvgY(v.y).toFixed(1)}`)
          .join(' ') + ' Z'
      );
    }, [analysis.vertices, axisMax]);

    // Handle click on canvas to set test point
    const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactiveTestPoint || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert from screen pixels to SVG viewBox coords
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const svgClickX = clickX * scaleX;
      const svgClickY = clickY * scaleY;

      if (
        svgClickX >= padding &&
        svgClickX <= width - padding &&
        svgClickY >= padding &&
        svgClickY <= height - padding
      ) {
        const mathX = Math.round(Math.max(0, toMathX(svgClickX)));
        const mathY = Math.round(Math.max(0, toMathY(svgClickY)));
        setTestPoint({ x: mathX, y: mathY });
      }
    };

    // Test point evaluation
    const isTestFeasible = useMemo(() => {
      return isPointFeasible(testPoint, constraints, true);
    }, [testPoint, constraints]);

    // Export handle for PDF rendering
    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current,
      getCanvasDataUrl: async () => {
        if (!svgRef.current) return '';
        const svgString = new XMLSerializer().serializeToString(svgRef.current);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve('');
            }
            URL.revokeObjectURL(blobURL);
          };
          img.onerror = () => {
            resolve('');
            URL.revokeObjectURL(blobURL);
          };
          img.src = blobURL;
        });
      },
    }));

    // Grid step calculation
    const gridStep = useMemo(() => {
      if (axisMax <= 20) return 5;
      if (axisMax <= 50) return 10;
      if (axisMax <= 120) return 20;
      if (axisMax <= 250) return 50;
      return 100;
    }, [axisMax]);

    const gridTicks = useMemo(() => {
      const ticks: number[] = [];
      for (let v = 0; v <= axisMax; v += gridStep) {
        ticks.push(v);
      }
      return ticks;
    }, [axisMax, gridStep]);

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 transition-all">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">
              Bidang Koordinat Kartesius & Daerah Penyelesaian (DP)
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              Interaktif
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScaleFactor((prev) => Math.min(prev * 1.25, 2.5))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Perbesar Skala (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScaleFactor((prev) => Math.max(prev * 0.8, 0.5))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Perkecil Skala (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScaleFactor(1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Reset Skala"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowIndividualHatching(!showIndividualHatching)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition font-medium ${
                showIndividualHatching
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showIndividualHatching ? 'Sembunyikan Garis Intersep' : 'Tampilkan Intersep'}
            </button>
          </div>
        </div>

        {/* Graph Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-3 text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
            <span className="w-3.5 h-3.5 rounded-sm bg-indigo-500/30 border border-indigo-500 inline-block" />
            <span className="font-medium text-slate-700">Daerah Penyelesaian (DP)</span>
          </div>

          {constraints.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200"
            >
              <span
                className="w-3 h-0.5 inline-block"
                style={{
                  backgroundColor: lineColors[i % lineColors.length],
                  borderStyle: c.operator === '<=' || c.operator === '>=' ? 'solid' : 'dashed',
                }}
              />
              <span>
                {c.coeffX}x + {c.coeffY}y {c.operator} {c.capacity}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Titik Pojok DP</span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto cursor-crosshair select-none block"
            onClick={handleSvgClick}
          >
            {/* Defs for gradients & patterns */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
              <linearGradient id="feasibleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.22" />
              </linearGradient>
            </defs>

            {/* Grid background */}
            <rect x={padding} y={padding} width={plotWidth} height={plotHeight} fill="url(#grid)" />

            {/* Coordinate Grid Lines & Labels */}
            {gridTicks.map((tick) => {
              const svgX = toSvgX(tick);
              const svgY = toSvgY(tick);
              return (
                <g key={`grid-tick-${tick}`}>
                  {/* Vertical grid line */}
                  {tick > 0 && (
                    <line
                      x1={svgX}
                      y1={padding}
                      x2={svgX}
                      y2={height - padding}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}
                  {/* Horizontal grid line */}
                  {tick > 0 && (
                    <line
                      x1={padding}
                      y1={svgY}
                      x2={width - padding}
                      y2={svgY}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}
                  {/* X Axis number */}
                  <text
                    x={svgX}
                    y={height - padding + 18}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 font-mono font-medium"
                  >
                    {tick}
                  </text>
                  {/* Y Axis number */}
                  {tick > 0 && (
                    <text
                      x={padding - 10}
                      y={svgY + 4}
                      textAnchor="end"
                      className="text-[11px] fill-slate-500 font-mono font-medium"
                    >
                      {tick}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Main Axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding + 15}
              y2={height - padding}
              stroke="#1e293b"
              strokeWidth="2"
            />
            <polygon
              points={`${width - padding + 20},${height - padding} ${width - padding + 12},${height - padding - 4} ${width - padding + 12},${height - padding + 4}`}
              fill="#1e293b"
            />

            <line
              x1={padding}
              y1={height - padding}
              x2={padding}
              y2={padding - 15}
              stroke="#1e293b"
              strokeWidth="2"
            />
            <polygon
              points={`${padding},${padding - 20} ${padding - 4},${padding - 12} ${padding + 4},${padding - 12}`}
              fill="#1e293b"
            />

            {/* Axis Titles */}
            <text
              x={width - padding + 25}
              y={height - padding + 4}
              className="text-xs font-bold fill-slate-800 font-mono"
            >
              X
            </text>
            <text
              x={padding - 2}
              y={padding - 24}
              textAnchor="middle"
              className="text-xs font-bold fill-slate-800 font-mono"
            >
              Y
            </text>
            <text
              x={padding - 8}
              y={height - padding + 18}
              className="text-[11px] font-bold fill-slate-600 font-mono"
            >
              0
            </text>

            {/* Feasible Region Shading (DP) */}
            {polygonPath && (
              <path
                d={polygonPath}
                fill="url(#feasibleGrad)"
                stroke="#4338ca"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* Numbered Regions (Daerah I, II, III, IV, V) */}
            {analysis.isFeasible && analysis.vertices.length >= 3 && (
              <g className="select-none pointer-events-none">
                {/* Daerah I (DP) */}
                <g>
                  <rect
                    x={toSvgX(analysis.vertices.reduce((s, p) => s + p.x, 0) / analysis.vertices.length) - 55}
                    y={toSvgY(analysis.vertices.reduce((s, p) => s + p.y, 0) / analysis.vertices.length) - 15}
                    width={110}
                    height={30}
                    rx={8}
                    fill="#312e81"
                    opacity={0.92}
                  />
                  <text
                    x={toSvgX(analysis.vertices.reduce((s, p) => s + p.x, 0) / analysis.vertices.length)}
                    y={toSvgY(analysis.vertices.reduce((s, p) => s + p.y, 0) / analysis.vertices.length) + 4}
                    textAnchor="middle"
                    className="text-xs font-black fill-white tracking-wider font-sans"
                  >
                    DAERAH I (DP)
                  </text>
                </g>

                {/* Daerah II (Sebelah kanan garis batas DP) */}
                <g>
                  <rect
                    x={toSvgX(Math.min(axisMax * 0.78, Math.max(...analysis.vertices.map((v) => v.x)) + 20)) - 42}
                    y={toSvgY(Math.max(8, axisMax * 0.1)) - 12}
                    width={84}
                    height={24}
                    rx={6}
                    fill="#475569"
                    opacity={0.85}
                  />
                  <text
                    x={toSvgX(Math.min(axisMax * 0.78, Math.max(...analysis.vertices.map((v) => v.x)) + 20))}
                    y={toSvgY(Math.max(8, axisMax * 0.1)) + 4}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-white"
                  >
                    DAERAH II
                  </text>
                </g>

                {/* Daerah III (Sebelah atas garis batas DP) */}
                <g>
                  <rect
                    x={toSvgX(Math.max(8, axisMax * 0.1)) - 42}
                    y={toSvgY(Math.min(axisMax * 0.78, Math.max(...analysis.vertices.map((v) => v.y)) + 20)) - 12}
                    width={84}
                    height={24}
                    rx={6}
                    fill="#475569"
                    opacity={0.85}
                  />
                  <text
                    x={toSvgX(Math.max(8, axisMax * 0.1))}
                    y={toSvgY(Math.min(axisMax * 0.78, Math.max(...analysis.vertices.map((v) => v.y)) + 20)) + 4}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-white"
                  >
                    DAERAH III
                  </text>
                </g>

                {/* Daerah IV (Kanan atas, di luar kedua kendala) */}
                <g>
                  <rect
                    x={toSvgX(axisMax * 0.62) - 42}
                    y={toSvgY(axisMax * 0.62) - 12}
                    width={84}
                    height={24}
                    rx={6}
                    fill="#475569"
                    opacity={0.85}
                  />
                  <text
                    x={toSvgX(axisMax * 0.62)}
                    y={toSvgY(axisMax * 0.62) + 4}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-white"
                  >
                    DAERAH IV
                  </text>
                </g>

                {/* Daerah V (Pojok atas luar) */}
                <g>
                  <rect
                    x={toSvgX(axisMax * 0.82) - 42}
                    y={toSvgY(axisMax * 0.82) - 12}
                    width={84}
                    height={24}
                    rx={6}
                    fill="#475569"
                    opacity={0.85}
                  />
                  <text
                    x={toSvgX(axisMax * 0.82)}
                    y={toSvgY(axisMax * 0.82) + 4}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-white"
                  >
                    DAERAH V
                  </text>
                </g>
              </g>
            )}

            {/* Boundary Lines for each constraint */}
            {constraints.map((c, idx) => {
              const lineData = getLinePoints(c);
              if (!lineData) return null;
              const color = lineColors[idx % lineColors.length];
              const isDashed = c.operator === '<' || c.operator === '>';

              return (
                <g key={`line-group-${c.id}`}>
                  <line
                    x1={lineData.x1}
                    y1={lineData.y1}
                    x2={lineData.x2}
                    y2={lineData.y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray={isDashed ? '6,4' : 'none'}
                  />

                  {/* Intercept dots if toggled */}
                  {showIndividualHatching && (
                    <>
                      {c.coeffX > 0 && (
                        <circle
                          cx={toSvgX(c.capacity / c.coeffX)}
                          cy={toSvgY(0)}
                          r="4"
                          fill={color}
                        />
                      )}
                      {c.coeffY > 0 && (
                        <circle
                          cx={toSvgX(0)}
                          cy={toSvgY(c.capacity / c.coeffY)}
                          r="4"
                          fill={color}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {/* Feasible Vertices (Corner Points) */}
            {analysis.vertices.map((pt, index) => {
              const labels = ['O', 'A', 'B', 'C', 'D', 'E'];
              const label = pt.x === 0 && pt.y === 0 ? 'O' : labels[index] || `P${index}`;
              const isHovered = hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y;

              return (
                <g
                  key={`vertex-${pt.x}-${pt.y}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onSelectPoint && onSelectPoint(pt)}
                >
                  <circle
                    cx={toSvgX(pt.x)}
                    cy={toSvgY(pt.y)}
                    r={isHovered ? 8 : 6}
                    fill="#e11d48"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all"
                  />
                  <rect
                    x={toSvgX(pt.x) + 8}
                    y={toSvgY(pt.y) - 20}
                    width={56}
                    height={20}
                    rx="4"
                    fill="#1e293b"
                    opacity="0.9"
                  />
                  <text
                    x={toSvgX(pt.x) + 12}
                    y={toSvgY(pt.y) - 6}
                    className="text-[11px] fill-white font-bold font-mono"
                  >
                    {label}({pt.x},{pt.y})
                  </text>
                </g>
              );
            })}

            {/* Highlighted additional points if supplied */}
            {highlightPoints.map((pt, idx) => (
              <g key={`hl-${idx}`}>
                <circle
                  cx={toSvgX(pt.x)}
                  cy={toSvgY(pt.y)}
                  r="5"
                  fill="#0ea5e9"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Test Point (Titik Uji) */}
            {interactiveTestPoint && (
              <g>
                <circle
                  cx={toSvgX(testPoint.x)}
                  cy={toSvgY(testPoint.y)}
                  r="7"
                  fill={isTestFeasible ? '#10b981' : '#f43f5e'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
                <circle
                  cx={toSvgX(testPoint.x)}
                  cy={toSvgY(testPoint.y)}
                  r="12"
                  fill="none"
                  stroke={isTestFeasible ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <text
                  x={toSvgX(testPoint.x) + 10}
                  y={toSvgY(testPoint.y) + 16}
                  className="text-[11px] font-bold font-mono fill-slate-800"
                  style={{ filter: 'drop-shadow(0px 1px 2px rgba(255,255,255,0.9))' }}
                >
                  Uji ({testPoint.x}, {testPoint.y})
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Interactive Test Point Inspector */}
        {interactiveTestPoint && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Uji Titik Sembarang (Klik grafik atau ketik koordinat):
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-medium text-slate-500">x:</span>
                  <input
                    type="number"
                    min="0"
                    max={axisMax * 1.5}
                    value={testPoint.x}
                    onChange={(e) =>
                      setTestPoint({ ...testPoint, x: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-medium text-slate-500">y:</span>
                  <input
                    type="number"
                    min="0"
                    max={axisMax * 1.5}
                    value={testPoint.y}
                    onChange={(e) =>
                      setTestPoint({ ...testPoint, y: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Test Point Result Verification */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                {isTestFeasible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-semibold">
                      Titik ({testPoint.x}, {testPoint.y}) memenuhi SEMUA kendala (Berada di DALAM Daerah Penyelesaian).
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-rose-700 font-semibold">
                      Titik ({testPoint.x}, {testPoint.y}) TIDAK memenuhi kendala (Berada di LUAR Daerah Penyelesaian).
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                {constraints.map((c, i) => {
                  const val = c.coeffX * testPoint.x + c.coeffY * testPoint.y;
                  const satisfied =
                    c.operator === '<=' ? val <= c.capacity : val >= c.capacity;
                  return (
                    <span
                      key={c.id}
                      className={`px-1.5 py-0.5 rounded ${
                        satisfied ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      K{i + 1}: {val} {c.operator} {c.capacity}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
