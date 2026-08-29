import React, { useState, useMemo } from 'react';
import { computeFourierTransform } from '../services/mathEngine';
import { Activity, Radio, Waves } from 'lucide-react';

interface Props {
  onSignalGenerated: (timeData: number[], signalData: number[], freqData: number[], ampData: number[]) => void;
}

export const FourierSignalPanel: React.FC<Props> = ({ onSignalGenerated }) => {
  const [f1, setF1] = useState<number>(5.0); // 5 Hz
  const [a1, setA1] = useState<number>(2.0);
  const [f2, setF2] = useState<number>(12.0); // 12 Hz
  const [a2, setA2] = useState<number>(1.0);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.2);

  // Generate composite time series signal: x(t) = a1*sin(2*pi*f1*t) + a2*sin(2*pi*f2*t) + noise
  const { time, signal, fourier } = useMemo(() => {
    const N = 512;
    const duration = 2.0; // 2 seconds
    const dt = duration / N;
    const tArr: number[] = [];
    const sArr: number[] = [];

    for (let i = 0; i < N; i++) {
      const t = i * dt;
      const noise = (Math.random() - 0.5) * 2 * noiseLevel;
      const val = a1 * Math.sin(2 * Math.PI * f1 * t) + a2 * Math.sin(2 * Math.PI * f2 * t) + noise;
      tArr.push(t);
      sArr.push(val);
    }

    const ft = computeFourierTransform(tArr, sArr);
    return { time: tArr, signal: sArr, fourier: ft };
  }, [f1, a1, f2, a2, noiseLevel]);

  const handlePushToPlot = () => {
    onSignalGenerated(time, signal, fourier.frequencies, fourier.amplitudes);
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Signal Generator Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Time Series Signal Synthesizer</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">DFT / FFT Spectrum</span>
        </div>

        {/* Component 1 */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
          <div className="font-bold text-blue-400 font-mono text-[11px]">Primary Wave: A₁ sin(2π f₁ t)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">Frequency f₁ (Hz):</span>
              <input
                type="number"
                value={f1}
                onChange={(e) => setF1(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded mt-1 font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Amplitude A₁:</span>
              <input
                type="number"
                value={a1}
                onChange={(e) => setA1(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded mt-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Component 2 */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
          <div className="font-bold text-purple-400 font-mono text-[11px]">Secondary Wave: A₂ sin(2π f₂ t)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">Frequency f₂ (Hz):</span>
              <input
                type="number"
                value={f2}
                onChange={(e) => setF2(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded mt-1 font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Amplitude A₂:</span>
              <input
                type="number"
                value={a2}
                onChange={(e) => setA2(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded mt-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Noise */}
        <div>
          <span className="text-[11px] text-slate-400">Experimental Noise Level:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
          />
        </div>

        <button
          onClick={handlePushToPlot}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition text-xs shadow flex items-center justify-center space-x-1.5"
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Update Spectral Graph</span>
        </button>
      </div>

      {/* Spectral Findings */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
        <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Frequency Domain Analysis (Fourier Output)</span>
        </h3>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2 font-mono text-[11px]">
          <div className="flex justify-between">
            <span>Dominant Frequency (f₀):</span>
            <span className="text-emerald-400 font-bold">{fourier.dominantFrequency} Hz</span>
          </div>
          <div className="flex justify-between">
            <span>Dominant Period (T₀ = 1/f₀):</span>
            <span className="text-blue-300 font-bold">{fourier.dominantPeriod} s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
