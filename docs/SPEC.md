# Software Specification (SPEC)
**Project:** Interactive Mathematical Function and Data Analysis Software
**Architecture:** Hybrid Native Desktop (Rust + Tauri + Python/PyO3)

## 1. Goal
Provide a blistering-fast, interactive desktop environment for mathematical analysis and data exploration, leveraging Rust for raw performance and UI, while utilizing embedded Python for advanced symbolic math.

## 2. Core Features
- **Mathematical Analysis:** Symbolic differentiation/integration, limit, roots (Powered by Python/SymPy via PyO3).
- **Numerical Analysis:** Fast numerical evaluation (Powered by Rust).
- **Data Analysis & Stats:** Data import (CSV), EDA, Mean, Variance, Correlation (Powered by Rust/Polars).
- **Modeling & Regression:** Curve fitting, Parameter estimation (Powered by Python/SciPy via PyO3).
- **Validation & Error:** RMSE, Residuals (Powered by Rust).
- **Visualization:** Real-time charts reacting to parameter sliders (Powered by React/Tauri).

## 3. Technology Stack
- **Frontend/GUI:** Tauri (Rust backend, React + TypeScript frontend).
- **Graphing:** ECharts or Plotly.js (via React).
- **Rust Core:** `polars` (Data), `ndarray` (Math), `pyo3` (Python bridge).
- **Embedded Python Engine:** SymPy, SciPy.

## 4. State Management (Reactivity Engine)
- The React frontend maintains UI state and triggers Tauri Commands.
- For **Slider interactions (Real-time)**: The React UI sends the parameter to Rust. Rust calculates the numerical array using `ndarray` and returns it instantly.
- For **Equation input (Heavy)**: Rust routes the string to the embedded Python engine to parse via SymPy, generates the AST, and returns the simplified form to Rust.

## 5. Constraints & Limitations
- **Packaging Complexity:** Bundling a Python interpreter inside a Rust Tauri app increases build complexity and final application size (~50-100MB).
- **IPC Overhead:** Transferring massive data arrays (e.g., 10M points) between Rust and the Tauri WebView (React) has a slight serialization overhead. Mitigated by downsampling data before sending to the UI.
