# ISSUE-04: Task Routing & Hybrid Math Pipeline

## Goal
Build the bridge between Rust's speed and Python's intelligence.

## Tasks
- [ ] Define the `EquationState` struct in Rust.
- [ ] Implement task routing:
  - When React sends a new equation string -> Send to Python (SymPy) via PyO3 to validate and extract variables.
  - Compile the equation into a fast evaluator (either using SymPy's lambdify back into Rust, or parsing it into a Rust AST for raw execution).
- [ ] Implement the Curve Fitting command: send the Polars DataFrame data to Python, run `scipy.optimize.curve_fit`, and return the parameters to Rust.

## Blockers
- Blocked by ISSUE-02 and ISSUE-03.
