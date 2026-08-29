import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FunctionAnalysisPanel } from './components/FunctionAnalysisPanel';
import { DataAnalysisPanel } from './components/DataAnalysisPanel';
import { ParameterSweepPanel } from './components/ParameterSweepPanel';
import { UncertaintyVerificationPanel } from './components/UncertaintyVerificationPanel';
import { FourierSignalPanel } from './components/FourierSignalPanel';
import { PlotViewer } from './components/PlotViewer';
import { AnalysisMode, FittedModelResult } from './types/math';
import { parseAndEvaluate, numericalDerivative } from './services/mathEngine';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AnalysisMode>('function_analysis');

  // Mathematical Function State
  const [expression, setExpression] = useState<string>('x^2 * sin(x)');
  const [domain, setDomain] = useState<[number, number]>([-6, 6]);
  const [parameters, setParameters] = useState<Record<string, number>>({
    A: 2.0,
    omega: 1.5,
    phi: 0.0,
  });

  // Experimental Dataset State (Initial: Free fall physics test)
  const [xData, setXData] = useState<number[]>([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]);
  const [yData, setYData] = useState<number[]>([1.22, 4.91, 11.02, 19.64, 30.65, 44.15, 60.10, 78.48]);
  const [xName, setXName] = useState<string>('Time (t)');
  const [yName, setYName] = useState<string>('Distance (s)');
  const [fittedModel, setFittedModel] = useState<FittedModelResult | null>(null);

  // Fourier Signal State
  const [fourierData, setFourierData] = useState<{ freq: number[]; amp: number[] } | null>(null);

  const handleParameterChange = (paramName: string, val: number) => {
    setParameters(prev => ({ ...prev, [paramName]: val }));
  };

  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'free_fall') {
      setCurrentMode('data_modeling');
      setXName('Time t (s)');
      setYName('Distance s (m)');
      setXData([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]);
      setYData([1.22, 4.91, 11.02, 19.64, 30.65, 44.15, 60.10, 78.48]);
      setFittedModel(null);
    } else if (presetName === 'hookes_law') {
      setCurrentMode('data_modeling');
      setXName('Displacement x (m)');
      setYName('Force F (N)');
      setXData([0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.14]);
      setYData([1.01, 1.98, 3.02, 4.05, 4.95, 6.08, 6.95]);
      setFittedModel(null);
    } else if (presetName === 'shm') {
      setCurrentMode('parameter_sweep');
      setExpression('A * cos(omega * x + phi)');
      setParameters({ A: 3.0, omega: 2.0, phi: 0.5 });
      setDomain([-4, 4]);
    } else if (presetName === 'decay') {
      setCurrentMode('data_modeling');
      setXName('Time t (days)');
      setYName('Activity N (Bq)');
      setXData([0, 2, 4, 6, 8, 10, 12, 14]);
      setYData([1000, 707, 500, 353, 250, 176, 125, 88]);
      setFittedModel(null);
    }
  };

  // Generate curves for plotting
  const functionCurves = useMemo(() => {
    const numPoints = 250;
    const step = (domain[1] - domain[0]) / numPoints;
    const xArr: number[] = [];
    const yArr: number[] = [];
    const yDerivArr: number[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = domain[0] + i * step;
      xArr.push(x);
      yArr.push(parseAndEvaluate(expression, { x, ...parameters }));
      if (currentMode === 'function_analysis') {
        yDerivArr.push(numericalDerivative(expression, x, 1e-4, parameters));
      }
    }

    const curves: { name: string; x: number[]; y: number[]; color: string; dash?: boolean }[] = [
      { name: 'f(x)', x: xArr, y: yArr, color: '#3b82f6' }
    ];
    if (currentMode === 'function_analysis') {
      curves.push({ name: "f'(x) Derivative", x: xArr, y: yDerivArr, color: '#f59e0b', dash: true });
    }
    return curves;
  }, [expression, domain, parameters, currentMode]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Header 
        currentMode={currentMode} 
        onModeChange={setCurrentMode} 
        onLoadPreset={handleLoadPreset}
      />

      <main className="flex-1 flex overflow-hidden p-4 space-x-4">
        {/* Left Side: Control & Analysis Panel */}
        <div className="w-[480px] overflow-y-auto pr-1">
          {currentMode === 'function_analysis' && (
            <FunctionAnalysisPanel
              expression={expression}
              onExpressionChange={setExpression}
              domain={domain}
              onDomainChange={setDomain}
            />
          )}

          {currentMode === 'data_modeling' && (
            <DataAnalysisPanel
              xData={xData}
              yData={yData}
              xName={xName}
              yName={yName}
              onDataChange={(x, y, xn, yn) => {
                setXData(x);
                setYData(y);
                if (xn) setXName(xn);
                if (yn) setYName(yn);
              }}
              onModelFitted={setFittedModel}
            />
          )}

          {currentMode === 'parameter_sweep' && (
            <ParameterSweepPanel
              expression={expression}
              parameters={parameters}
              onParameterChange={handleParameterChange}
              domain={domain}
            />
          )}

          {currentMode === 'uncertainty_verification' && (
            <UncertaintyVerificationPanel />
          )}

          {currentMode === 'fourier_signal' && (
            <FourierSignalPanel
              onSignalGenerated={(_t, _s, freqs, amps) => {
                setFourierData({ freq: freqs, amp: amps });
              }}
            />
          )}
        </div>

        {/* Right Side: Interactive High-Performance Plot */}
        <PlotViewer
          title={
            currentMode === 'data_modeling'
              ? `Experimental Data Scatter & Model Fit (${xName} vs ${yName})`
              : currentMode === 'fourier_signal'
              ? 'Discrete Fourier Transform (Frequency Spectrum)'
              : `Interactive Function Plot: ${expression}`
          }
          functionCurves={currentMode !== 'data_modeling' && currentMode !== 'fourier_signal' ? functionCurves : []}
          scatterData={currentMode === 'data_modeling' ? { x: xData, y: yData, label: `${xName} vs ${yName}` } : undefined}
          fittedModel={currentMode === 'data_modeling' ? fittedModel : null}
          spectrumData={currentMode === 'fourier_signal' && fourierData ? fourierData : undefined}
        />
      </main>
    </div>
  );
};
