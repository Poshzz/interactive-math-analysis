# ISSUE-05: Interactive Visualization

## Goal
Wire up the frontend graphs to respond to the Rust backend in real-time.

## Tasks
- [ ] Integrate a charting library (Plotly.js or ECharts) into React.
- [ ] Connect the Parameter Sliders in React to trigger a Tauri Command.
- [ ] In Rust, rapidly evaluate the numerical array based on the new parameter and send the Float array back via IPC.
- [ ] Implement data downsampling in Rust: if an array has 10,000,000 points, downsample it to 2,000 points before sending to the UI to maintain 60 FPS plotting.
- [ ] Render the Curve Fitting model over the experimental data.

## Blockers
- Blocked by ISSUE-04.
