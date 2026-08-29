import { 
  DatasetStatistics, 
  CorrelationResult, 
  FittedModelResult, 
  FourierResult, 
  ConvergencePoint,
  UncertaintyResult
} from '../types/math';

/**
 * High-performance Mathematical Engine
 * Evaluates functions, numerical methods, statistics, curve fitting, and signal analysis.
 */

export function parseAndEvaluate(expr: string, vars: Record<string, number>): number {
  try {
    // Sanitize and replace math functions
    let sanitized = expr
      .replace(/\^/g, '**')
      .replace(/(\d+)([a-zA-Z])/g, '$1 * $2')
      .replace(/\)\(/g, ') * (')
      .replace(/(\d+)\(/g, '$1 * (')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/\bpi\b/gi, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');

    const argNames = Object.keys(vars);
    const argValues = Object.values(vars);
    
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...argNames, `"use strict"; return (${sanitized});`);
    const val = fn(...argValues);
    return isFinite(val) ? val : NaN;
  } catch {
    return NaN;
  }
}

/** Numerical Calculus */
export function numericalDerivative(fnExpr: string, x: number, h = 1e-5, params: Record<string, number> = {}): number {
  const f_plus = parseAndEvaluate(fnExpr, { x: x + h, ...params });
  const f_minus = parseAndEvaluate(fnExpr, { x: x - h, ...params });
  return (f_plus - f_minus) / (2 * h);
}

export function numericalSecondDerivative(fnExpr: string, x: number, h = 1e-4, params: Record<string, number> = {}): number {
  const f_plus = parseAndEvaluate(fnExpr, { x: x + h, ...params });
  const f_mid = parseAndEvaluate(fnExpr, { x, ...params });
  const f_minus = parseAndEvaluate(fnExpr, { x: x - h, ...params });
  return (f_plus - 2 * f_mid + f_minus) / (h * h);
}

export function numericalIntegralSimpson(fnExpr: string, a: number, b: number, n = 1000, params: Record<string, number> = {}): number {
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  let sum = parseAndEvaluate(fnExpr, { x: a, ...params }) + parseAndEvaluate(fnExpr, { x: b, ...params });

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const factor = i % 2 === 0 ? 2 : 4;
    sum += factor * parseAndEvaluate(fnExpr, { x, ...params });
  }
  return (h / 3) * sum;
}

/** Root Finding: Bisection & Newton Raphson */
export function findRoots(fnExpr: string, minX = -10, maxX = 10, step = 0.2, params: Record<string, number> = {}): number[] {
  const roots: number[] = [];
  let prevX = minX;
  let prevY = parseAndEvaluate(fnExpr, { x: prevX, ...params });

  for (let x = minX + step; x <= maxX; x += step) {
    const y = parseAndEvaluate(fnExpr, { x, ...params });
    if (!isNaN(prevY) && !isNaN(y) && prevY * y <= 0) {
      // Root bracket found: Refine with Newton-Raphson or Bisection
      let root = (prevX + x) / 2;
      for (let iter = 0; iter < 20; iter++) {
        const val = parseAndEvaluate(fnExpr, { x: root, ...params });
        const deriv = numericalDerivative(fnExpr, root, 1e-5, params);
        if (Math.abs(deriv) < 1e-12) break;
        const nextRoot = root - val / deriv;
        if (Math.abs(nextRoot - root) < 1e-7) {
          root = nextRoot;
          break;
        }
        root = nextRoot;
      }
      if (!roots.some(r => Math.abs(r - root) < 1e-3) && isFinite(root) && root >= minX && root <= maxX) {
        roots.push(Number(root.toFixed(4)));
      }
    }
    prevX = x;
    prevY = y;
  }
  return roots.sort((a, b) => a - b);
}

/** Critical Points (f'(x) = 0) & Classification */
export function findCriticalPoints(fnExpr: string, minX = -10, maxX = 10, step = 0.1, params: Record<string, number> = {}) {
  const points: { x: number; y: number; type: 'min' | 'max' | 'inflection' }[] = [];
  
  let prevX = minX;
  let prevD = numericalDerivative(fnExpr, prevX, 1e-5, params);

  for (let x = minX + step; x <= maxX; x += step) {
    const d = numericalDerivative(fnExpr, x, 1e-5, params);
    if (!isNaN(prevD) && !isNaN(d) && prevD * d <= 0) {
      // Derivative crosses 0
      const critX = (prevX + x) / 2;
      const y = parseAndEvaluate(fnExpr, { x: critX, ...params });
      const secondD = numericalSecondDerivative(fnExpr, critX, 1e-4, params);
      
      let type: 'min' | 'max' | 'inflection' = 'inflection';
      if (secondD > 1e-4) type = 'min';
      else if (secondD < -1e-4) type = 'max';

      if (!points.some(p => Math.abs(p.x - critX) < 1e-2) && isFinite(y)) {
        points.push({ x: Number(critX.toFixed(4)), y: Number(y.toFixed(4)), type });
      }
    }
    prevX = x;
    prevD = d;
  }
  return points;
}

/** Convergence Testing for Step-size Verification */
export function testConvergence(fnExpr: string, x: number, analyticalDeriv?: number): ConvergencePoint[] {
  const points: ConvergencePoint[] = [];
  const baseH = 0.2;
  
  for (let i = 0; i < 8; i++) {
    const h = baseH / Math.pow(2, i);
    const num = numericalDerivative(fnExpr, x, h);
    const err = analyticalDeriv !== undefined ? Math.abs(num - analyticalDeriv) : 0;
    points.push({
      stepSize: Number(h.toFixed(6)),
      numericalResult: Number(num.toFixed(6)),
      error: Number(err.toExponential(4))
    });
  }
  return points;
}

/** Descriptive Statistics */
export function computeStatistics(values: number[]): DatasetStatistics {
  const filtered = values.filter(v => isFinite(v));
  const n = filtered.length;
  if (n === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0, variance: 0, stdDev: 0, q1: 0, q3: 0, iqr: 0, skewness: 0, outliers: [] };
  }

  const sorted = [...filtered].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Variance & StdDev (sample n-1)
  const sqDiffSum = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = n > 1 ? sqDiffSum / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Median & Quartiles
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Outliers (IQR 1.5 rule)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = sorted.filter(v => v < lowerBound || v > upperBound);

  // Skewness
  const skewness = n > 2 && stdDev > 0 
    ? (sorted.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 3), 0) * n) / ((n - 1) * (n - 2))
    : 0;

  return {
    count: n,
    min,
    max,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4)),
    skewness: Number(skewness.toFixed(4)),
    outliers
  };
}

/** Pearson Correlation & Covariance */
export function computeCorrelation(xVals: number[], yVals: number[], varX = 'X', varY = 'Y'): CorrelationResult {
  const n = Math.min(xVals.length, yVals.length);
  if (n < 2) return { varX, varY, pearsonR: 0, covariance: 0, rSquared: 0 };

  const xMean = xVals.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const yMean = yVals.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let cov = 0;
  let xSqSum = 0;
  let ySqSum = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = xVals[i] - xMean;
    const yDiff = yVals[i] - yMean;
    cov += xDiff * yDiff;
    xSqSum += xDiff * xDiff;
    ySqSum += yDiff * yDiff;
  }

  const covariance = cov / (n - 1);
  const r = (xSqSum > 0 && ySqSum > 0) ? cov / Math.sqrt(xSqSum * ySqSum) : 0;

  return {
    varX,
    varY,
    pearsonR: Number(r.toFixed(4)),
    covariance: Number(covariance.toFixed(4)),
    rSquared: Number(Math.pow(r, 2).toFixed(4))
  };
}

/** Curve Fitting & Mathematical Modeling */
export function fitLinear(xData: number[], yData: number[]): FittedModelResult {
  const n = Math.min(xData.length, yData.length);
  const xMean = xData.reduce((a, b) => a + b, 0) / n;
  const yMean = yData.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xData[i] - xMean) * (yData[i] - yMean);
    den += Math.pow(xData[i] - xMean, 2);
  }

  const a = den !== 0 ? num / den : 0;
  const b = yMean - a * xMean;

  return buildFitResult('Linear Regression', `y = ${a.toFixed(4)}x + ${b.toFixed(4)}`, { a, b }, xData, yData, (x) => a * x + b);
}

export function fitFreeFall(tData: number[], sData: number[]): FittedModelResult {
  // s = 0.5 * g * t^2 -> linear fit on T = t^2 -> s = (g/2) * T
  const n = Math.min(tData.length, sData.length);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const tSq = tData[i] * tData[i];
    num += tSq * sData[i];
    den += tSq * tSq;
  }

  const halfG = den !== 0 ? num / den : 0;
  const g = 2 * halfG;

  return buildFitResult('Physics: Free Fall', `s(t) = 0.5 · (${g.toFixed(4)}) · t²`, { g, 'g/2': halfG }, tData, sData, (t) => 0.5 * g * t * t);
}

export function fitHookesLaw(xData: number[], fData: number[]): FittedModelResult {
  // F = k * x (ignoring sign for magnitude or F = -kx)
  const n = Math.min(xData.length, fData.length);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += xData[i] * fData[i];
    den += xData[i] * xData[i];
  }
  const k = den !== 0 ? num / den : 0;

  return buildFitResult("Physics: Hooke's Law", `F(x) = ${k.toFixed(4)} · x`, { k }, xData, fData, (x) => k * x);
}

export function fitExponentialDecay(tData: number[], nData: number[]): FittedModelResult {
  // N = N0 * exp(-lambda * t) -> ln(N) = ln(N0) - lambda * t
  const validIndices = tData.map((_, i) => i).filter(i => nData[i] > 0);
  const n = validIndices.length;
  if (n < 2) return fitLinear(tData, nData);

  const tFiltered = validIndices.map(i => tData[i]);
  const lnN = validIndices.map(i => Math.log(nData[i]));

  const tMean = tFiltered.reduce((a, b) => a + b, 0) / n;
  const lnMean = lnN.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (tFiltered[i] - tMean) * (lnN[i] - lnMean);
    den += Math.pow(tFiltered[i] - tMean, 2);
  }

  const slope = den !== 0 ? num / den : 0;
  const intercept = lnMean - slope * tMean;

  const lambda = -slope;
  const N0 = Math.exp(intercept);

  return buildFitResult('Physics: Radioactive Decay', `N(t) = ${N0.toFixed(4)} · e^(-${lambda.toFixed(4)}t)`, { N0, lambda }, tData, nData, (t) => N0 * Math.exp(-lambda * t));
}

function buildFitResult(
  modelName: string, 
  formula: string, 
  parameters: Record<string, number>, 
  xData: number[], 
  yData: number[], 
  predictFn: (x: number) => number
): FittedModelResult {
  const n = Math.min(xData.length, yData.length);
  const residuals: { x: number; yActual: number; yPred: number; residual: number }[] = [];
  
  let ssRes = 0;
  let ssTot = 0;
  let absErrSum = 0;
  const yMean = yData.reduce((a, b) => a + b, 0) / n;

  for (let i = 0; i < n; i++) {
    const yPred = predictFn(xData[i]);
    const res = yData[i] - yPred;
    residuals.push({ x: xData[i], yActual: yData[i], yPred, residual: Number(res.toFixed(4)) });
    
    ssRes += res * res;
    ssTot += Math.pow(yData[i] - yMean, 2);
    absErrSum += Math.abs(res);
  }

  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const rmse = Math.sqrt(ssRes / n);
  const mae = absErrSum / n;

  // Generate smooth curve for plotting
  const minX = Math.min(...xData);
  const maxX = Math.max(...xData);
  const span = maxX - minX || 1;
  const curveX: number[] = [];
  const curveY: number[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = minX + (span * i) / 100;
    curveX.push(x);
    curveY.push(predictFn(x));
  }

  return {
    modelName,
    formula,
    parameters,
    rSquared: Number(rSquared.toFixed(4)),
    rmse: Number(rmse.toFixed(4)),
    mae: Number(mae.toFixed(4)),
    residuals,
    fittedCurve: { x: curveX, y: curveY }
  };
}

/** Uncertainty Propagation Calculator: σ_z = sqrt(Σ (∂z/∂xi * σ_xi)^2) */
export function computeUncertainty(
  expr: string, 
  variables: { name: string; nominal: number; uncertainty: number }[]
): UncertaintyResult {
  const varsMap: Record<string, number> = {};
  variables.forEach(v => { varsMap[v.name] = v.nominal; });

  const nominalValue = parseAndEvaluate(expr, varsMap);
  let totalVariance = 0;
  const contributions: { variable: string; partialDerivative: number; stdDev: number; contributionPercent: number }[] = [];

  const h = 1e-5;
  variables.forEach(v => {
    // Partial derivative ∂z/∂xi via central difference
    const plusMap = { ...varsMap, [v.name]: v.nominal + h };
    const minusMap = { ...varsMap, [v.name]: v.nominal - h };
    const pd = (parseAndEvaluate(expr, plusMap) - parseAndEvaluate(expr, minusMap)) / (2 * h);
    
    const varianceTerm = Math.pow(pd * v.uncertainty, 2);
    totalVariance += varianceTerm;

    contributions.push({
      variable: v.name,
      partialDerivative: Number(pd.toFixed(4)),
      stdDev: v.uncertainty,
      contributionPercent: 0 // calculate after total
    });
  });

  const totalUncertainty = Math.sqrt(totalVariance);

  // Normalize contribution percentages
  contributions.forEach(c => {
    const term = Math.pow(c.partialDerivative * c.stdDev, 2);
    c.contributionPercent = totalVariance > 0 ? Number(((term / totalVariance) * 100).toFixed(2)) : 0;
  });

  return {
    formula: expr,
    nominalValue: Number(nominalValue.toFixed(4)),
    totalUncertainty: Number(totalUncertainty.toFixed(4)),
    contributions
  };
}

/** Discrete Fourier Transform (DFT) for Frequency Analysis */
export function computeFourierTransform(timeData: number[], signalData: number[]): FourierResult {
  const N = Math.min(timeData.length, signalData.length);
  if (N < 4) return { frequencies: [], amplitudes: [], dominantFrequency: 0, dominantPeriod: 0 };

  const dt = (timeData[N - 1] - timeData[0]) / (N - 1);
  const samplingRate = 1 / dt;
  const halfN = Math.floor(N / 2);

  const frequencies: number[] = [];
  const amplitudes: number[] = [];

  let maxAmp = -1;
  let dominantFreq = 0;

  for (let k = 0; k < halfN; k++) {
    const freq = (k * samplingRate) / N;
    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signalData[n] * Math.cos(angle);
      imag -= signalData[n] * Math.sin(angle);
    }

    // Normalized magnitude
    let mag = Math.sqrt(real * real + imag * imag) / N;
    if (k > 0) mag *= 2; // single-sided spectrum

    frequencies.push(Number(freq.toFixed(3)));
    amplitudes.push(Number(mag.toFixed(4)));

    if (k > 0 && mag > maxAmp) {
      maxAmp = mag;
      dominantFreq = freq;
    }
  }

  return {
    frequencies,
    amplitudes,
    dominantFrequency: Number(dominantFreq.toFixed(3)),
    dominantPeriod: dominantFreq > 0 ? Number((1 / dominantFreq).toFixed(4)) : 0
  };
}
