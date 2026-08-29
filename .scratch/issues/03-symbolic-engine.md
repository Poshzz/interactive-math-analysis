# ISSUE-03: Embedded Python Engine (PyO3 & SymPy)

## Goal
Embed the Python runtime inside Rust to handle Symbolic Mathematics.

## Tasks
- [ ] Add `pyo3` to `Cargo.toml` (configure for embedding).
- [ ] Initialize the Python interpreter on app startup inside Rust.
- [ ] Write a Rust function that uses Python's `sympy.parse_expr` to parse a user string and return the symbolic derivative.
- [ ] Create a Tauri Command to expose this symbolic differentiation to the React UI.
- [ ] Handle Python runtime errors gracefully and return them to the UI console.

## Blockers
- Blocked by ISSUE-01.
