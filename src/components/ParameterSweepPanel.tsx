import React, { useState, useMemo } from 'react';
import { numericalDerivative } from '../services/mathEngine';
import { Sliders, Gauge, Flame } from 'lucide-react';

interface Props {
  expression: string;
  parameters: Record<string, number>;
  onParameterChange: (paramName: string, value: number) => void;
  domain: [number, number];
}

export const ParameterSweepPanel: React.FC<Props> = ({
  expression,
  parameters,
  onParameterChange,
  domain,
}) => {
  const [activeParam, setActiveParam] = useState<string>(Object.keys(parameters)[0] || 'A');
  const [sweepMin, setSweepMin] = useState<number>(0.5);
  const [sweepMax, setSweepMax] = useState<number>(5.0);
  const [sweepSteps, setSweepSteps] = useState<number>(5);

  // Compute sensitivity dy/dp at mid x
  const midX = (domain[0] + domain[1]) / 2;
  const currentVal = parameters[activeParam] ?? 1;

  // Sensitivity calculation via finite difference on parameter
  const sensitivity = useMemo(() => {
    const dp = 1e-4;
    const plusParams = { ...parameters, [activeParam]: currentVal + dp };
    const minusParams = { ...parameters, [activeParam]: currentVal - dp };
    const yPlus = numericalDerivative(expression, midX, 1e-4, plusParams);
    const yMinus = numericalDerivative(expression, midX, 1e-4, minusParams);
    return (yPlus - yMinus) / (2 * dp);
  }, [expression, parameters, activeParam, currentVal, midX]);

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Parameter Sliders Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Interactive Parameter Sliders (60 FPS)</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">Real-time Reactive</span>
        </div>

        <div className="space-y-3">
          {Object.entries(parameters).map(([key, val]) => (
            <div key={key} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-blue-300 font-mono">{key} = {val.toFixed(2)}</span>
                <button
                  onClick={() => setActiveParam(key)}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    activeParam === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Analyze Sensitivity
                </button>
              </div>

              <input
                type="range"
                min="0.1"
                max="10"
                step="0.05"
                value={val}
                onChange={(e) => onParameterChange(key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity Analysis Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Gauge className="w-3.5 h-3.5 text-purple-400" />
          <span>Sensitivity Analysis (∂y/∂p)</span>
        </h3>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2 font-mono text-[11px]">
          <div className="flex justify-between">
            <span>Target Parameter:</span>
            <span className="text-blue-400 font-bold">{activeParam}</span>
          </div>
          <div className="flex justify-between">
            <span>Evaluation point x₀:</span>
            <span className="text-slate-300">{midX.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1.5">
            <span>Sensitivity Index (∂y/∂{activeParam}):</span>
            <span className={`font-bold ${Math.abs(sensitivity) > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isNaN(sensitivity) ? '0.00' : sensitivity.toFixed(4)}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400">
          * Sensitivity สูง แสดงว่าระบบมีความไวต่อพารามิเตอร์นี้มาก การเปลี่ยนแปลงเล็กน้อยจะส่งผลกระทบต่อผลลัพธ์สูง
        </p>
      </div>

      {/* Parameter Sweep Generator */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Multi-curve Parameter Sweep</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Min {activeParam}:</span>
            <input
              type="number"
              value={sweepMin}
              onChange={(e) => setSweepMin(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded mt-1 font-mono text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Max {activeParam}:</span>
            <input
              type="number"
              value={sweepMax}
              onChange={(e) => setSweepMax(parseFloat(e.target.value) || 10)}
              className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded mt-1 font-mono text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Curves (N):</span>
            <input
              type="number"
              value={sweepSteps}
              onChange={(e) => setSweepSteps(parseInt(e.target.value) || 5)}
              className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded mt-1 font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
