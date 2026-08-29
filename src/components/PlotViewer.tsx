import React, { useRef, useEffect } from 'react';
import { FittedModelResult } from '../types/math';

interface Props {
  title: string;
  // Mode 1: Function plot
  functionCurves?: { name: string; x: number[]; y: number[]; color: string; dash?: boolean }[];
  // Mode 2: Data + Fit
  scatterData?: { x: number[]; y: number[]; label: string };
  fittedModel?: FittedModelResult | null;
  // Mode 3: Spectrum
  spectrumData?: { freq: number[]; amp: number[] };
  showResiduals?: boolean;
}

export const PlotViewer: React.FC<Props> = ({
  title,
  functionCurves = [],
  scatterData,
  fittedModel,
  spectrumData,
  showResiduals = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Collect all data bounds
    let allX: number[] = [];
    let allY: number[] = [];

    if (spectrumData && spectrumData.freq.length > 0) {
      allX = spectrumData.freq;
      allY = spectrumData.amp;
    } else {
      functionCurves.forEach(c => {
        allX.push(...c.x);
        allY.push(...c.y.filter(v => isFinite(v)));
      });
      if (scatterData) {
        allX.push(...scatterData.x);
        allY.push(...scatterData.y);
      }
      if (fittedModel) {
        allX.push(...fittedModel.fittedCurve.x);
        allY.push(...fittedModel.fittedCurve.y);
      }
    }

    if (allX.length === 0 || allY.length === 0) {
      // Default bounds
      allX = [-5, 5];
      allY = [-5, 5];
    }

    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);
    let minY = Math.min(...allY);
    let maxY = Math.max(...allY);

    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }

    // Add 10% margin
    const xSpan = maxX - minX;
    const ySpan = maxY - minY;
    minX -= xSpan * 0.05;
    maxX += xSpan * 0.05;
    minY -= ySpan * 0.08;
    maxY += ySpan * 0.08;

    const toScreenX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
    const toScreenY = (y: number) => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';

    const numTicks = 8;
    for (let i = 0; i <= numTicks; i++) {
      // X grid
      const gx = minX + (i / numTicks) * (maxX - minX);
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, padding.top);
      ctx.lineTo(sx, padding.top + plotHeight);
      ctx.stroke();
      ctx.fillText(gx.toFixed(1), sx - 10, height - 15);

      // Y grid
      const gy = minY + (i / numTicks) * (maxY - minY);
      const sy = toScreenY(gy);
      ctx.beginPath();
      ctx.moveTo(padding.left, sy);
      ctx.lineTo(padding.left + plotWidth, sy);
      ctx.stroke();
      ctx.fillText(gy.toFixed(1), 10, sy + 3);
    }

    // Zero axes if within bounds
    if (minX <= 0 && maxX >= 0) {
      const zx = toScreenX(0);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(zx, padding.top);
      ctx.lineTo(zx, padding.top + plotHeight);
      ctx.stroke();
    }
    if (minY <= 0 && maxY >= 0) {
      const zy = toScreenY(0);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, zy);
      ctx.lineTo(padding.left + plotWidth, zy);
      ctx.stroke();
    }

    // Render Spectrum if in Fourier mode
    if (spectrumData && spectrumData.freq.length > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;

      for (let i = 0; i < spectrumData.freq.length; i++) {
        const sx = toScreenX(spectrumData.freq[i]);
        const sy = toScreenY(spectrumData.amp[i]);
        const baseSy = toScreenY(0);

        ctx.beginPath();
        ctx.moveTo(sx, baseSy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
      return;
    }

    // Draw Function Curves
    functionCurves.forEach((curve) => {
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2.5;
      if (curve.dash) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      let started = false;
      for (let i = 0; i < curve.x.length; i++) {
        const yVal = curve.y[i];
        if (!isFinite(yVal)) {
          started = false;
          continue;
        }
        const sx = toScreenX(curve.x[i]);
        const sy = toScreenY(yVal);
        if (!started) {
          ctx.moveTo(sx, sy);
          started = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Fitted Model Curve
    if (fittedModel) {
      ctx.strokeStyle = '#a855f7'; // purple
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < fittedModel.fittedCurve.x.length; i++) {
        const sx = toScreenX(fittedModel.fittedCurve.x[i]);
        const sy = toScreenY(fittedModel.fittedCurve.y[i]);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Draw Scatter Data Points
    if (scatterData && scatterData.x.length > 0) {
      ctx.fillStyle = '#38bdf8'; // sky blue
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;

      for (let i = 0; i < scatterData.x.length; i++) {
        const sx = toScreenX(scatterData.x[i]);
        const sy = toScreenY(scatterData.y[i]);
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [functionCurves, scatterData, fittedModel, spectrumData, showResiduals]);

  return (
    <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h2 className="font-bold text-sm text-slate-200 tracking-wide">{title}</h2>
        <div className="flex items-center space-x-4 text-xs">
          {functionCurves.map((c, i) => (
            <div key={i} className="flex items-center space-x-1.5 font-mono text-[11px]">
              <div className="w-3 h-0.5" style={{ backgroundColor: c.color }} />
              <span className="text-slate-300">{c.name}</span>
            </div>
          ))}
          {scatterData && (
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-slate-300">{scatterData.label}</span>
            </div>
          )}
          {fittedModel && (
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <div className="w-3 h-0.5 bg-purple-400" />
              <span className="text-purple-300">Model: {fittedModel.modelName} (R²={fittedModel.rSquared})</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative min-h-[380px]">
        <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};
