import React, { useState, useMemo } from 'react';
import { computeUncertainty, numericalDerivative, numericalIntegralSimpson } from '../services/mathEngine';
import { ShieldCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const UncertaintyVerificationPanel: React.FC = () => {
  const [formula, setFormula] = useState<string>('x * y^2 / sqrt(z)');
  const [variables, setVariables] = useState<Array<{ name: string; nominal: number; uncertainty: number }>>([
    { name: 'x', nominal: 10.0, uncertainty: 0.2 },
    { name: 'y', nominal: 4.0, uncertainty: 0.1 },
    { name: 'z', nominal: 25.0, uncertainty: 0.5 },
  ]);

  // Compute uncertainty
  const uncertaintyResult = useMemo(() => {
    return computeUncertainty(formula, variables);
  }, [formula, variables]);

  const handleAddVar = () => {
    setVariables([...variables, { name: `v${variables.length + 1}`, nominal: 1.0, uncertainty: 0.05 }]);
  };

  const handleRemoveVar = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleUpdateVar = (index: number, field: 'name' | 'nominal' | 'uncertainty', val: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: val };
    setVariables(updated);
  };

  // Verification: Test f(x) = x^3
  const testFn = 'x^3';
  const testX = 2.0;
  const exactDeriv = 3 * testX * testX; // 12
  const numDeriv = numericalDerivative(testFn, testX);
  const diffDeriv = Math.abs(exactDeriv - numDeriv);

  const exactIntegral = (Math.pow(2, 4) - Math.pow(0, 4)) / 4; // 4.0 for x^3 from 0 to 2
  const numIntegral = numericalIntegralSimpson(testFn, 0, 2);
  const diffIntegral = Math.abs(exactIntegral - numIntegral);

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Uncertainty Propagation */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Error & Uncertainty Propagation Analysis</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Partial Derivative Expansion</span>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Target Formula z = f(x₁, x₂, ...):</label>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg font-mono text-sm text-blue-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Variables Table */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>Independent Variables (xᵢ ± Δxᵢ):</span>
            <button
              onClick={handleAddVar}
              className="flex items-center space-x-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>Add Var</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {variables.map((v, i) => (
              <div key={i} className="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => handleUpdateVar(i, 'name', e.target.value)}
                  className="w-12 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono text-center text-blue-300"
                  placeholder="name"
                />
                <span className="text-slate-400">=</span>
                <input
                  type="number"
                  value={v.nominal}
                  onChange={(e) => handleUpdateVar(i, 'nominal', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono text-center"
                  placeholder="nominal"
                />
                <span className="text-slate-400">±</span>
                <input
                  type="number"
                  value={v.uncertainty}
                  onChange={(e) => handleUpdateVar(i, 'uncertainty', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono text-center text-amber-300"
                  placeholder="Δx"
                />
                <button
                  onClick={() => handleRemoveVar(i)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-800/40 space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400 text-xs">Propagated Result:</span>
            <span className="font-mono text-base font-bold text-emerald-400">
              z = {uncertaintyResult.nominalValue} ± {uncertaintyResult.totalUncertainty}
            </span>
          </div>

          <div className="space-y-1 pt-1 text-[11px] font-mono">
            <div className="text-slate-400 text-[10px] uppercase tracking-wide">Error Contribution Breakdown:</div>
            {uncertaintyResult.contributions.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-slate-300">
                <span>∂z/∂{c.variable} = {c.partialDerivative}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${c.contributionPercent}%` }} />
                  </div>
                  <span className="text-emerald-300 w-12 text-right">{c.contributionPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Benchmark Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>Verification & Accuracy Benchmark</span>
        </h3>

        <div className="space-y-2 text-[11px] font-mono">
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-slate-300">Derivative Verification [f(x) = x³ at x=2]</div>
              <div className="text-[10px] text-slate-500">Exact: {exactDeriv} vs Num: {numDeriv.toFixed(6)}</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">
                ε = {diffDeriv.toExponential(2)}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-slate-300">Integral Verification [∫₀² x³ dx]</div>
              <div className="text-[10px] text-slate-500">Exact: {exactIntegral} vs Num: {numIntegral.toFixed(6)}</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">
                ε = {diffIntegral.toExponential(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
