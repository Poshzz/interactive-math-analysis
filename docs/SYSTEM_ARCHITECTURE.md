# System Architecture Design
Project: Interactive Mathematical Function and Data Analysis Software
Architecture: **Hybrid Native Desktop (Rust + Tauri + Python/PyO3)**

## 1. System Overview
The system uses a cutting-edge hybrid architecture. Rust serves as the high-performance core and orchestrator. Tauri handles the UI using modern web technologies. Python is embedded internally via PyO3 exclusively to handle complex mathematical domains where Rust's ecosystem is currently immature.

```text
       [ User (Desktop OS) ]
              |
[ Tauri Frontend (React + TypeScript + Plotly/ECharts) ]
              |  (IPC / Tauri Commands)
[ Rust Core Backend (Tauri App) ]
    |              |              |
[Polars]       [ndarray]      [ PyO3 (Embedded Python) ]
(Data Analysis)(Numerical)        |              |
                              [SymPy]        [SciPy]
                             (Symbolic)    (Advanced Fit)
```

## 2. Core Technical Decisions

### 2.1 Tech Stack
- **UI Framework:** Tauri + React + TypeScript. (Gives the flexibility and beauty of web UI but compiles to a tiny, fast native desktop app).
- **Core Engine:** Rust. (Handles state, concurrency, file I/O, and data processing).
- **Data Analysis:** `Polars` (Rust). Processes massive CSVs blazingly fast.
- **Symbolic Math & Advanced Algorithms:** Python embedded via `PyO3`. Used strictly as an internal calculation engine for `SymPy` (equation parsing, derivatives) and complex `SciPy` optimization.

### 2.2 Concurrency & Main Thread Isolation
- Rust will spawn background threads (`std::thread` or `tokio`) for all heavy computations.
- The Tauri Main Thread remains completely unblocked, ensuring the React UI operates at 60 FPS.

### 2.3 Task Routing Strategy (Rust vs Python)
The Rust core acts as a router.
- **Task: Load 1M row CSV & Calculate Mean/Variance** -> Routed to Rust (`Polars`). Execution time: < 10ms.
- **Task: Drag Slider for Numerical Evaluation** -> Routed to Rust (`ndarray` / compiled functions).
- **Task: "Find derivative of x^2 * sin(x)"** -> Routed to Embedded Python (`SymPy`). Result string returned to Rust.
- **Task: "Curve fit custom equation to data"** -> Routed to Embedded Python (`SciPy`). Parameters returned to Rust.

## 3. Data Flow & Reactivity
- React UI sends a command via Tauri IPC: `invoke('evaluate_equation', { eq: "x^2", x_range: [0, 100] })`.
- Rust receives the command. If symbolic parsing is needed, Rust calls the PyO3 Python instance.
- Python returns the parsed data. Rust generates the numerical array and sends it back to the UI.

## 4. Packaging
- Tauri compiles the React UI and Rust Core into a single native executable (`.exe`, `.app`).
- The Python runtime and necessary pip packages (SymPy, SciPy) must be bundled alongside the executable (e.g., using a standalone Python distribution).
