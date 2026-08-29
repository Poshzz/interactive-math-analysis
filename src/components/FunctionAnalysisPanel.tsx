import React, { useState, useMemo } from 'react';
import { 
  findRoots, 
  findCriticalPoints, 
  numericalDerivative, 
  numericalIntegralSimpson,
  testConvergence 
} from '../services/mathEngine';
import { Play, TrendingUp, CheckCircle2 } from 'lucide-react';

interface Props {
  expression: string;
  onExpressionChange: (expr: string) => void;
  domain: [number, number];
  onDomainChange: (domain: [number, number]) => void;
}

export const FunctionAnalysisPanel: React.FC<Props> = ({
  expression,
  onExpressionChange,
  domain,
  onDomainChange,
}) => {
  const [integralA, setIntegralA] = useState<number>(-2);
  const [integralB, setIntegralB] = useState<number>(2);
  const [evalX, setEvalX] = useState<number>(1.0);

  // Compute math properties
  const roots = useMemo(() => findRoots(expression, domain[0], domain[1]), [expression, domain]);
  const criticalPoints = useMemo(() => findCriticalPoints(expression, domain[0], domain[1]), [expression, domain]);
  const integralVal = useMemo(() => numericalIntegralSimpson(expression, integralA, integralB), [expression, integralA, integralB]);
  const derivAtX = useMemo(() => numericalDerivative(expression, evalX), [expression, evalX]);
  const convergencePoints = useMemo(() => testConvergence(expression, evalX, derivAtX), [expression, evalX, derivAtX]);

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Expression Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Mathematical Function f(x)</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">SymPy + Rust Evaluator</span>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder="e.g. x^2 * sin(x) or x^3 - 3*x + 1"
            className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg font-mono text-sm text-blue-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Domain Bounds */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400">Min X:</span>
            <input
              type="number"
              value={domain[0]}
              onChange={(e) => onDomainChange([parseFloat(e.target.value) || -10, domain[1]])}
              className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded mt-1 font-mono text-xs"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Max X:</span>
            <input
              type="number"
              value={domain[1]}
              onChange={(e) => onDomainChange([domain[0], parseFloat(e.target.value) || 10])}
              className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded mt-1 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Calculus & Behavior Analysis Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Calculus & Function Behavior</span>
        </h3>

        {/* Definite Integral */}
        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span>Numerical Definite Integral ∫ f(x) dx (Simpson's 1/3 Rule):</span>
            <span className="font-mono text-indigo-300 font-bold text-sm">
              {isNaN(integralVal) ? 'NaN' : integralVal.toFixed(5)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span>Bounds: [a:</span>
            <input
              type="number"
              value={integralA}
              onChange={(e) => setIntegralA(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono"
            />
            <span>, b:</span>
            <input
              type="number"
              value={integralB}
              onChange={(e) => setIntegralB(parseFloat(e.target.value) || 0)}
              className="w-14 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono"
            />
            <span>]</span>
          </div>
        </div>

        {/* Roots */}
        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 mb-1 flex justify-between">
            <span>Roots found (f(x) = 0):</span>
            <span className="font-mono text-blue-400">{roots.length} root(s)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roots.length === 0 ? (
              <span className="text-slate-500 italic">No real roots in domain</span>
            ) : (
              roots.map((r, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded font-mono">
                  x = {r}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Critical Points */}
        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 mb-1 flex justify-between">
            <span>Critical Points (f'(x) = 0):</span>
            <span className="font-mono text-purple-400">{criticalPoints.length} point(s)</span>
          </div>
          <div className="space-y-1">
            {criticalPoints.length === 0 ? (
              <span className="text-slate-500 italic">No critical points detected</span>
            ) : (
              criticalPoints.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded font-mono text-[11px]">
                  <span>({p.x}, {p.y})</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-medium uppercase ${
                    p.type === 'min' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    p.type === 'max' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {p.type === 'min' ? 'Local Min' : p.type === 'max' ? 'Local Max' : 'Inflection'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Verification & Convergence Table */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-2">
        <h3 className="font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Algorithm Convergence Test</span>
          </span>
          <div className="flex items-center space-x-1 text-[11px] font-normal">
            <span>at x =</span>
            <input
              type="number"
              value={evalX}
              onChange={(e) => setEvalX(parseFloat(e.target.value) || 0)}
              className="w-12 bg-slate-950 border border-slate-700 px-1 py-0.5 rounded font-mono text-xs"
            />
          </div>
        </h3>

        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-1">Step (h)</th>
              <th className="py-1">f'(x) Approx</th>
              <th className="py-1 text-right">Error (ε)</th>
            </tr>
          </thead>
          <tbody>
            {convergencePoints.slice(0, 5).map((cp, idx) => (
              <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                <td className="py-1 text-slate-400">{cp.stepSize}</td>
                <td className="py-1 text-indigo-300">{cp.numericalResult}</td>
                <td className="py-1 text-right text-emerald-400">{cp.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
