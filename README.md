# Interactive Mathematical Function and Data Analysis Software
**โปรแกรมวิเคราะห์ฟังก์ชันและข้อมูลทางคณิตศาสตร์แบบเชิงโต้ตอบ**

[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg?style=flat&logo=rust)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue.svg?style=flat&logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-Embedded%20PyO3-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 บทนำและแนวคิดของโครงงาน (Overview)

**Interactive Mathematical Function and Data Analysis Software** เป็นซอฟต์แวร์ Desktop ประสิทธิภาพสูงสำหรับการวิเคราะห์ฟังก์ชันทางคณิตศาสตร์และข้อมูลเชิงตัวเลขอย่างเป็นระบบ โดยผสาน:
1. **Symbolic Mathematics** (คณิตศาสตร์เชิงสัญลักษณ์: แคลคูลัส, พีชคณิต, อนุกรมเทย์เลอร์)
2. **Numerical Mathematics** (การคำนวณเชิงตัวเลข: ระเบียบวิธีเชิงตัวเลข, Root finding, Numerical calculus)
3. **Statistical & Data Analysis** (สถิติพรรณนา, สหสัมพันธ์, การจัดการข้อมูลทดลอง)
4. **Mathematical Modeling & Curve Fitting** (การสร้างแบบจำลอง, การประมาณค่าพารามิเตอร์ทางฟิสิกส์)
5. **Verification & Validation** (การทดสอบความถูกต้องของขั้นตอนวิธี และการประเมินความสอดคล้องของแบบจำลอง)
6. **Real-time Interactive Visualization** (การแสดงผลเชิงโต้ตอบระดับ 60 FPS ปรับเปลี่ยนพารามิเตอร์แบบทันที)

```
Equation / Data → Mathematics → Statistics → Model → Validation → Visualization
```

---

## 🏛️ สถาปัตยกรรมระบบ (Hybrid Architecture)

ระบบใช้สถาปัตยกรรม **Rust Core + Tauri (React UI) + Embedded Python (PyO3)** เพื่อดึงประสิทธิภาพสูงสุด:

```text
       [ User (Desktop OS) ]
              │
[ Tauri Frontend (React + TypeScript + Plotly/ECharts) ]
              │  (IPC / Tauri Commands)
[ Rust Core Engine ]
    ├── [Polars]       → การประมวลผลข้อมูลและสถิติขนาดใหญ่ (ความเร็วระดับฮาร์ดแวร์)
    ├── [ndarray]      → การคำนวณเชิงตัวเลขและการประเมินฟังก์ชัน
    └── [PyO3 Engine]  → ฝัง Python runtime ภายในสำหรับงานเฉพาะทาง
            ├── [SymPy]   → Symbolic Differentiation, Integration, Equation Solving
            └── [SciPy]   → Advanced Non-linear Curve Fitting & Optimization
```

### ทำไมต้อง Hybrid (Rust + Python)?
* **Rust (Speed & Concurrency):** จัดการ State, Multi-threading, File I/O, และการประมวลผลข้อมูลมหาศาลด้วย `Polars` ทำให้อินเทอร์เฟซตอบสนองแบบ 60 FPS ตลอดเวลา
* **Python (Mathematical Intelligence):** ใช้ `SymPy` และ `SciPy` ผ่าน `PyO3` เพื่อคงความสามารถในการคำนวณสัญลักษณ์ระดับโลกโดยไม่ต้องเขียน Computer Algebra System (CAS) ขึ้นมาใหม่จากศูนย์

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 1. Function Input & Symbolic Analysis
- รองรับ Polynomial, Rational, Trigonometric, Exponential, Logarithmic, Piecewise, และ Multivariable functions
- **Algebraic:** Simplification, Expansion, Factorization, Equation Solving
- **Calculus:** Derivative ($f'(x), f''(x)$), Indefinite/Definite Integral, Limits, Taylor & Maclaurin series
- **Behavior Analysis:** Roots, Critical Points, Max/Min, Inflection points, Asymptotes

### 2. Numerical Analysis & Verification
- **Numerical Calculus:** Finite Difference, Trapezoidal / Simpson's Rule
- **Root Finding:** Bisection, Newton-Raphson, Secant Method
- **Verification Engine:** ตรวจสอบความถูกต้องของ Numerical Methods เปรียบเทียบกับ Analytical Solution ($\varepsilon = |f'_{sym} - f'_{num}|$)
- **Convergence Testing:** ศึกษากราฟความสัมพันธ์ระหว่าง Step Size ($h$) กับ Error

### 3. Data Processing & Exploratory Data Analysis (EDA)
- นำเข้าข้อมูล CSV / ตารางข้อมูลการทดลองทางวิทยาศาสตร์
- Data Cleaning, Missing value check, Outlier detection
- สถิติพรรณนา: Mean, Median, Variance, Standard Deviation, Quartiles, Covariance, Pearson Correlation
- Data Visualization: Histogram, Box Plot, Scatter Plot, Line Plot

### 4. Mathematical Modeling & Parameter Estimation
- Linear, Polynomial, Exponential, Power Law, และ Custom Models ($y = f(x; \theta)$)
- การประยุกต์ใช้กับโจทย์ฟิสิกส์: Free Fall ($s = \frac{1}{2}gt^2$), Hooke's Law ($F = -kx$), Simple Harmonic Motion ($x = A\cos(\omega t + \phi)$), Radioactive Decay ($N = N_0 e^{-\lambda t}$)
- Model Validation: $R^2$, RMSE, Residual Plot, Error & Uncertainty Analysis ($\sigma_z^2 \approx \sum (\frac{\partial z}{\partial x_i}\sigma_{x_i})^2$)
- Parameter Sweep & Sensitivity Analysis

### 5. Frequency & Signal Analysis
- Fast Fourier Transform (FFT) สำหรับ Time Series Data
- Dominant Frequency, Period, Power Spectrum

---

## 🛠️ โครงสร้างโปรเจกต์ (Project Structure)

```text
interactive_math_analysis/
├── src-tauri/             # Rust Core & Tauri Backend
│   ├── src/
│   │   ├── main.rs        # Tauri entry point & command registrations
│   │   ├── core/          # Mathematical state & routing engine
│   │   ├── data/          # Polars data engine & statistical computations
│   │   └── python/        # PyO3 bridge for SymPy/SciPy execution
│   └── Cargo.toml
├── src/                   # React Frontend (UI & Visualization)
│   ├── components/        # UI components (Formula Editor, Sliders, Table, Charts)
│   ├── hooks/             # Custom hooks for Tauri IPC
│   ├── types/             # TypeScript interfaces for math models & data
│   └── App.tsx
├── docs/                  # Architecture & Specifications
│   ├── SPEC.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── ARCHITECTURE_ANALYSIS.md
├── CONTEXT.md             # Domain modeling & terminology dictionary
└── README.md
```

---

## 📋 Roadmaps & Milestone Issues

งานทั้งหมดถูกแบ่งออกเป็น 5 Tracer-bullet Issues:
1. **[ISSUE-01: Foundation](.scratch/issues/01-foundation.md)** - โครงสร้าง Tauri + React และระบบ IPC พื้นฐาน
2. **[ISSUE-02: Rust Core & Polars](.scratch/issues/02-shared-memory.md)** - ระบบ Data Engine ประสิทธิภาพสูง
3. **[ISSUE-03: Embedded Python (PyO3)](.scratch/issues/03-symbolic-engine.md)** - เชื่อมต่อ SymPy/SciPy เข้ากับ Rust runtime
4. **[ISSUE-04: Hybrid Math Pipeline](.scratch/issues/04-visualization.md)** - ระบบ Routing จัดสรรงานระหว่าง Rust และ Python
5. **[ISSUE-05: Interactive Visualization](.scratch/issues/05-data-modeling.md)** - UI กราฟฟิกตอบสนอง 60 FPS และระบบ Downsampling

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
