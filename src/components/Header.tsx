import React from 'react';
import { AnalysisMode } from '../types/math';
import { 
  Calculator, 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Github, 
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  onLoadPreset: (presetName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, onLoadPreset }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-md">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Interactive Math & Data Analyzer
          </h1>
          <p className="text-xs text-slate-400">
            โปรแกรมวิเคราะห์ฟังก์ชันและข้อมูลเชิงตัวเลข (Hybrid Engine: Rust + Python/PyO3)
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
        <button
          onClick={() => onModeChange('function_analysis')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'function_analysis'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Function Analysis</span>
        </button>

        <button
          onClick={() => onModeChange('data_modeling')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'data_modeling'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Data & Modeling</span>
        </button>

        <button
          onClick={() => onModeChange('parameter_sweep')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'parameter_sweep'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Parameter Sweep</span>
        </button>

        <button
          onClick={() => onModeChange('uncertainty_verification')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'uncertainty_verification'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verification & Uncertainty</span>
        </button>

        <button
          onClick={() => onModeChange('fourier_signal')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === 'fourier_signal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Fourier / Signal</span>
        </button>
      </nav>

      {/* Quick Presets & Repo link */}
      <div className="flex items-center space-x-2">
        <div className="relative group">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Physics Presets</span>
          </button>
          <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
            <button 
              onClick={() => onLoadPreset('free_fall')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-blue-400"
            >
              🚀 Free Fall (s = 0.5gt²)
            </button>
            <button 
              onClick={() => onLoadPreset('hookes_law')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-blue-400"
            >
              🌀 Hooke's Law (F = -kx)
            </button>
            <button 
              onClick={() => onLoadPreset('shm')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-blue-400"
            >
              🌊 Harmonic Motion (A cos(ωt))
            </button>
            <button 
              onClick={() => onLoadPreset('decay')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-blue-400"
            >
              ☢️ Radioactive Decay
            </button>
          </div>
        </div>

        <a 
          href="https://github.com/Poshzz/interactive-math-analysis" 
          target="_blank" 
          rel="noreferrer"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="View on GitHub"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
