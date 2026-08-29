export type AnalysisMode = 
  | 'function_analysis' 
  | 'data_modeling' 
  | 'parameter_sweep' 
  | 'uncertainty_verification' 
  | 'fourier_signal';

export interface FunctionAnalysisResult {
  expression: string;
  latex: string;
  derivative: string;
  secondDerivative: string;
  indefiniteIntegral: string;
  roots: number[];
  criticalPoints: { x: number; y: number; type: 'min' | 'max' | 'inflection' }[];
  domain: [number, number];
  taylorSeries: string;
}

export interface NumericalVerificationResult {
  x: number;
  symbolicValue: number;
  numericalValue: number;
  stepSize: number;
  error: number;
  method: string;
}

export interface ConvergencePoint {
  stepSize: number;
  error: number;
  numericalResult: number;
}

export interface DatasetColumn {
  name: string;
  values: number[];
}

export interface DatasetStatistics {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outliers: number[];
}

export interface CorrelationResult {
  varX: string;
  varY: string;
  pearsonR: number;
  covariance: number;
  rSquared: number;
}

export interface FittedModelResult {
  modelName: string;
  formula: string;
  parameters: Record<string, number>;
  rSquared: number;
  rmse: number;
  mae: number;
  residuals: { x: number; yActual: number; yPred: number; residual: number }[];
  fittedCurve: { x: number[]; y: number[] };
}

export interface SensitivityPoint {
  parameterValue: number;
  outputMetric: number;
  sensitivity: number; // partial derivative dy/dp
}

export interface FourierResult {
  frequencies: number[];
  amplitudes: number[];
  dominantFrequency: number;
  dominantPeriod: number;
}

export interface UncertaintyResult {
  formula: string;
  nominalValue: number;
  totalUncertainty: number;
  contributions: { variable: string; partialDerivative: number; stdDev: number; contributionPercent: number }[];
}
