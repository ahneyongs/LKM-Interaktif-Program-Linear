import React, { useState } from 'react';
import { BusinessScenario } from '../types/lkm';
import { X, Settings, Edit3, Check, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { formatRupiah, analyzeLinearProgram } from '../utils/mathSolver';

interface TeacherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: BusinessScenario[];
  selectedScenarioId: number;
  onSelectScenario: (id: number) => void;
  onUpdateScenario: (updated: BusinessScenario) => void;
  onResetScenarios: () => void;
}

export const TeacherDrawer: React.FC<TeacherDrawerProps> = ({
  isOpen,
  onClose,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onUpdateScenario,
  onResetScenarios,
}) => {
  const [editingScenario, setEditingScenario] = useState<BusinessScenario | null>(null);
  const [activeTab, setActiveTab] = useState<'switch' | 'edit' | 'key'>('switch');

  if (!isOpen) return null;

  const currentScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const analysis = analyzeLinearProgram(
    currentScenario.constraints,
    currentScenario.productX.profitOrCost,
    currentScenario.productY.profitOrCost,
    currentScenario.objectiveType
  );

  const handleStartEdit = (scenario: BusinessScenario) => {
    setEditingScenario(JSON.parse(JSON.stringify(scenario)));
    setActiveTab('edit');
  };

  const handleSaveEdit = () => {
    if (editingScenario) {
      onUpdateScenario(editingScenario);
      setEditingScenario(null);
      setActiveTab('switch');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">Panel Pengajar / Guru</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Mode Guru
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kelola 6 permasalahan bisnis, modifikasi data kendala, atau lihat kunci analisis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 pt-2">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'switch'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pilih Permasalahan (1–6)
          </button>
          <button
            onClick={() => {
              if (!editingScenario) setEditingScenario(JSON.parse(JSON.stringify(currentScenario)));
              setActiveTab('edit');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'edit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Edit Skenario Bisnis
          </button>
          <button
            onClick={() => setActiveTab('key')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'key'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kunci Analisis Matematika
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Permasalahan Terdaftar
                </span>
                <button
                  onClick={onResetScenarios}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                      sc.id === selectedScenarioId
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                          Permasalahan {sc.groupNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">{sc.businessName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sc.story}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600 font-mono">
                        <span>
                          X: {sc.productX.name} ({formatRupiah(sc.productX.profitOrCost)})
                        </span>
                        <span>•</span>
                        <span>
                          Y: {sc.productY.name} ({formatRupiah(sc.productY.profitOrCost)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => handleStartEdit(sc)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        title="Edit Skenario Ini"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectScenario(sc.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          sc.id === selectedScenarioId
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sc.id === selectedScenarioId ? 'Aktif' : 'Pilih'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit' && editingScenario && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                Guru dapat mengedit parameter bisnis. Pastikan data kapasitas dan koefisien
                menghasilkan daerah penyelesaian yang konsisten dan memiliki titik potong.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nama Bisnis</label>
                <input
                  type="text"
                  value={editingScenario.businessName}
                  onChange={(e) =>
                    setEditingScenario({ ...editingScenario, businessName: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Deskripsi Masalah / Cerita</label>
                <textarea
                  rows={4}
                  value={editingScenario.story}
                  onChange={(e) =>
                    setEditingScenario({ ...editingScenario, story: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>

              {/* Products & Objective */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-indigo-700">Produk X (Variabel x)</span>
                  <input
                    type="text"
                    value={editingScenario.productX.name}
                    onChange={(e) =>
                      setEditingScenario({
                        ...editingScenario,
                        productX: { ...editingScenario.productX, name: e.target.value },
                      })
                    }
                    placeholder="Nama Produk X"
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500">Keuntungan per unit (Rp):</span>
                    <input
                      type="number"
                      value={editingScenario.productX.profitOrCost}
                      onChange={(e) =>
                        setEditingScenario({
                          ...editingScenario,
                          productX: {
                            ...editingScenario.productX,
                            profitOrCost: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-indigo-700">Produk Y (Variabel y)</span>
                  <input
                    type="text"
                    value={editingScenario.productY.name}
                    onChange={(e) =>
                      setEditingScenario({
                        ...editingScenario,
                        productY: { ...editingScenario.productY, name: e.target.value },
                      })
                    }
                    placeholder="Nama Produk Y"
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500">Keuntungan per unit (Rp):</span>
                    <input
                      type="number"
                      value={editingScenario.productY.profitOrCost}
                      onChange={(e) =>
                        setEditingScenario({
                          ...editingScenario,
                          productY: {
                            ...editingScenario.productY,
                            profitOrCost: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700">Kendala Sumber Daya (SPtLDV)</span>
                {editingScenario.constraints.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const newConstraints = [...editingScenario.constraints];
                        newConstraints[i].name = e.target.value;
                        setEditingScenario({ ...editingScenario, constraints: newConstraints });
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      placeholder="Nama Kendala"
                    />
                    <div className="grid grid-cols-4 gap-2 items-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500">Koef X:</span>
                        <input
                          type="number"
                          value={c.coeffX}
                          onChange={(e) => {
                            const newConstraints = [...editingScenario.constraints];
                            newConstraints[i].coeffX = Number(e.target.value) || 0;
                            setEditingScenario({ ...editingScenario, constraints: newConstraints });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Koef Y:</span>
                        <input
                          type="number"
                          value={c.coeffY}
                          onChange={(e) => {
                            const newConstraints = [...editingScenario.constraints];
                            newConstraints[i].coeffY = Number(e.target.value) || 0;
                            setEditingScenario({ ...editingScenario, constraints: newConstraints });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Tanda:</span>
                        <select
                          value={c.operator}
                          onChange={(e) => {
                            const newConstraints = [...editingScenario.constraints];
                            newConstraints[i].operator = e.target.value as any;
                            setEditingScenario({ ...editingScenario, constraints: newConstraints });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="<=">&le;</option>
                          <option value=">=">&ge;</option>
                          <option value="<">&lt;</option>
                          <option value=">">&gt;</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Kapasitas:</span>
                        <input
                          type="number"
                          value={c.capacity}
                          onChange={(e) => {
                            const newConstraints = [...editingScenario.constraints];
                            newConstraints[i].capacity = Number(e.target.value) || 0;
                            setEditingScenario({ ...editingScenario, constraints: newConstraints });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setActiveTab('switch')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'key' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Kunci Penyelesaian: {currentScenario.businessName}</span>
                </div>
                <p className="text-xs text-indigo-800">
                  Berikut adalah model matematika murni dan titik-titik pojok terverifikasi untuk
                  skenario Kelompok {currentScenario.groupNumber}.
                </p>
              </div>

              {/* System Equations */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <span className="font-bold text-slate-700">Model SPtLDV:</span>
                <div className="font-mono space-y-1 text-slate-800 pl-3 border-l-2 border-indigo-500">
                  {currentScenario.constraints.map((c, i) => (
                    <div key={c.id}>
                      Kendala {i + 1}: {c.coeffX}x + {c.coeffY}y {c.operator} {c.capacity}
                    </div>
                  ))}
                  <div>Syarat non-negatif: x &ge; 0, y &ge; 0</div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-700">Fungsi Objektif:</span>
                  <div className="font-mono text-slate-800 pl-3 border-l-2 border-emerald-500 mt-1">
                    Z = {currentScenario.productX.profitOrCost}x +{' '}
                    {currentScenario.productY.profitOrCost}y ({currentScenario.objectiveLabel})
                  </div>
                </div>
              </div>

              {/* Corner Points Table */}
              <div>
                <span className="text-xs font-bold text-slate-700 mb-2 block">
                  Daftar Titik Pojok & Uji Nilai Z:
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Titik</th>
                        <th className="p-2.5">Koordinat (x, y)</th>
                        <th className="p-2.5">Perhitungan Z</th>
                        <th className="p-2.5">Nilai Z (Rp)</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {analysis.evaluatedVertices.map((ev, i) => {
                        const labels = ['O', 'A', 'B', 'C', 'D'];
                        const isOpt =
                          analysis.optimalPoint &&
                          analysis.optimalPoint.x === ev.point.x &&
                          analysis.optimalPoint.y === ev.point.y;

                        return (
                          <tr
                            key={i}
                            className={isOpt ? 'bg-emerald-50 font-semibold text-emerald-900' : ''}
                          >
                            <td className="p-2.5">{labels[i] || `P${i}`}</td>
                            <td className="p-2.5">
                              ({ev.point.x}, {ev.point.y})
                            </td>
                            <td className="p-2.5 text-slate-600">
                              {currentScenario.productX.profitOrCost}({ev.point.x}) +{' '}
                              {currentScenario.productY.profitOrCost}({ev.point.y})
                            </td>
                            <td className="p-2.5 font-bold">{formatRupiah(ev.value)}</td>
                            <td className="p-2.5">
                              {isOpt ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px]">
                                  OPTIMUM (MAKSIMAL)
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary note */}
              {analysis.optimalPoint && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                  <strong>Kesimpulan Solusi Terbaik:</strong> Produksi {analysis.optimalPoint.x}{' '}
                  unit {currentScenario.productX.name} dan {analysis.optimalPoint.y} unit{' '}
                  {currentScenario.productY.name} untuk menghasilkan keuntungan maksimal sebesar{' '}
                  <strong>{formatRupiah(analysis.optimalValue || 0)}</strong>.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
