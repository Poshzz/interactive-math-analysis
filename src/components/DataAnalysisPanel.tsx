import React, { useState, useMemo } from 'react';
import { 
  computeStatistics, 
  computeCorrelation, 
  fitLinear, 
  fitFreeFall, 
  fitHookesLaw, 
  fitExponentialDecay 
} from '../services/mathEngine';
import { FittedModelResult } from '../types/math';
import { Upload, BarChart2, Target } from 'lucide-react';

interface Props {
  xData: number[];
  yData: number[];
  xName: string;
  yName: string;
  onDataChange: (x: number[], y: number[], xName?: string, yName?: string) => void;
  onModelFitted: (model: FittedModelResult) => void;
}

export const DataAnalysisPanel: React.FC<Props> = ({
  xData,
  yData,
  xName,
  yName,
  onDataChange,
  onModelFitted
}) => {
  const [activeModel, setActiveModel] = useState<'linear' | 'free_fall' | 'hooke' | 'decay'>('linear');

  // Compute statistics
  const xStats = useMemo(() => computeStatistics(xData), [xData]);
  const yStats = useMemo(() => computeStatistics(yData), [yData]);
  const correlation = useMemo(() => computeCorrelation(xData, yData, xName, yName), [xData, yData, xName, yName]);

  // Curve fitting models
  const fittedModels = useMemo(() => {
    return {
      linear: fitLinear(xData, yData),
      free_fall: fitFreeFall(xData, yData),
      hooke: fitHookesLaw(xData, yData),
      decay: fitExponentialDecay(xData, yData)
    };
  }, [xData, yData]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const colX: number[] = [];
      const colY: number[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          colX.push(parts[0]);
          colY.push(parts[1]);
        }
      }

      if (colX.length > 0) {
        onDataChange(colX, colY, headers[0] || 'X', headers[1] || 'Y');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyModel = (type: 'linear' | 'free_fall' | 'hooke' | 'decay') => {
    setActiveModel(type);
    onModelFitted(fittedModels[type]);
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* CSV Upload & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Dataset Import (CSV / Experimental)</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Polars Data Engine</span>
        </div>

        <div className="flex items-center space-x-3">
          <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition text-xs shadow-sm flex items-center space-x-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-slate-400 text-[11px] font-mono">
            {xData.length} records loaded ({xName}, {yName})
          </span>
        </div>
      </div>

      {/* Exploratory Data Analysis (EDA) Summary */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Exploratory Data Analysis (EDA)</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* X Stats */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
            <div className="font-bold text-blue-400 border-b border-slate-800 pb-1 flex justify-between">
              <span>{xName} (Mean: {xStats.mean})</span>
              <span className="text-slate-500">n={xStats.count}</span>
            </div>
            <div className="flex justify-between"><span>Std Dev (σ):</span> <span className="text-slate-300">{xStats.stdDev}</span></div>
            <div className="flex justify-between"><span>Variance (s²):</span> <span className="text-slate-300">{xStats.variance}</span></div>
            <div className="flex justify-between"><span>Median:</span> <span className="text-slate-300">{xStats.median}</span></div>
            <div className="flex justify-between"><span>IQR (Q3-Q1):</span> <span className="text-slate-300">{xStats.iqr}</span></div>
            <div className="flex justify-between"><span>Skewness:</span> <span className="text-slate-300">{xStats.skewness}</span></div>
            <div className="flex justify-between">
              <span>Outliers:</span> 
              <span className={xStats.outliers.length > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                {xStats.outliers.length} detected
              </span>
            </div>
          </div>

          {/* Y Stats */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
            <div className="font-bold text-purple-400 border-b border-slate-800 pb-1 flex justify-between">
              <span>{yName} (Mean: {yStats.mean})</span>
              <span className="text-slate-500">n={yStats.count}</span>
            </div>
            <div className="flex justify-between"><span>Std Dev (σ):</span> <span className="text-slate-300">{yStats.stdDev}</span></div>
            <div className="flex justify-between"><span>Variance (s²):</span> <span className="text-slate-300">{yStats.variance}</span></div>
            <div className="flex justify-between"><span>Median:</span> <span className="text-slate-300">{yStats.median}</span></div>
            <div className="flex justify-between"><span>IQR (Q3-Q1):</span> <span className="text-slate-300">{yStats.iqr}</span></div>
            <div className="flex justify-between"><span>Skewness:</span> <span className="text-slate-300">{yStats.skewness}</span></div>
            <div className="flex justify-between">
              <span>Outliers:</span> 
              <span className={yStats.outliers.length > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                {yStats.outliers.length} detected
              </span>
            </div>
          </div>
        </div>

        {/* Correlation */}
        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <span>Pearson Correlation r({xName}, {yName}):</span>
          <div className="space-x-3">
            <span className="text-blue-300 font-bold">r = {correlation.pearsonR}</span>
            <span className="text-slate-400">R² = {correlation.rSquared}</span>
            <span className="text-slate-400">Cov = {correlation.covariance}</span>
          </div>
        </div>
      </div>

      {/* Model Fitting & Parameter Estimation */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mathematical Model Comparison & Fitting</span>
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleApplyModel('linear')}
            className={`p-2.5 rounded-lg border text-left transition ${
              activeModel === 'linear'
                ? 'bg-blue-950/70 border-blue-600 text-blue-200'
                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="font-bold text-[11px]">Linear Model (y = ax + b)</div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{fittedModels.linear.formula}</div>
            <div className="flex justify-between mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">R²: {fittedModels.linear.rSquared}</span>
              <span className="text-slate-400">RMSE: {fittedModels.linear.rmse}</span>
            </div>
          </button>

          <button
            onClick={() => handleApplyModel('free_fall')}
            className={`p-2.5 rounded-lg border text-left transition ${
              activeModel === 'free_fall'
                ? 'bg-blue-950/70 border-blue-600 text-blue-200'
                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="font-bold text-[11px]">Free Fall (s = 1/2 gt²)</div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{fittedModels.free_fall.formula}</div>
            <div className="flex justify-between mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">R²: {fittedModels.free_fall.rSquared}</span>
              <span className="text-blue-300 font-bold">g ≈ {fittedModels.free_fall.parameters.g?.toFixed(2)} m/s²</span>
            </div>
          </button>

          <button
            onClick={() => handleApplyModel('hooke')}
            className={`p-2.5 rounded-lg border text-left transition ${
              activeModel === 'hooke'
                ? 'bg-blue-950/70 border-blue-600 text-blue-200'
                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="font-bold text-[11px]">Hooke's Law (F = kx)</div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{fittedModels.hooke.formula}</div>
            <div className="flex justify-between mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">R²: {fittedModels.hooke.rSquared}</span>
              <span className="text-blue-300 font-bold">k ≈ {fittedModels.hooke.parameters.k?.toFixed(2)} N/m</span>
            </div>
          </button>

          <button
            onClick={() => handleApplyModel('decay')}
            className={`p-2.5 rounded-lg border text-left transition ${
              activeModel === 'decay'
                ? 'bg-blue-950/70 border-blue-600 text-blue-200'
                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="font-bold text-[11px]">Radioactive Decay (N = N₀e^-λt)</div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{fittedModels.decay.formula}</div>
            <div className="flex justify-between mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">R²: {fittedModels.decay.rSquared}</span>
              <span className="text-blue-300 font-bold">λ ≈ {fittedModels.decay.parameters.lambda?.toFixed(4)}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
