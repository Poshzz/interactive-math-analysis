# ISSUE-02: Rust Core & Data Engine (Polars)

## Goal
Implement the high-performance data processing backend in Rust.

## Tasks
- [ ] Add `polars` and `serde` to `Cargo.toml`.
- [ ] Create a Tauri Command to open a file dialog, read a CSV file, and load it into a Polars DataFrame.
- [ ] Implement Rust functions to calculate statistical summaries (Mean, Variance, Correlation) using Polars.
- [ ] Return the summary data to the React UI and display it in a Data Table.

## Blockers
- Blocked by ISSUE-01.
