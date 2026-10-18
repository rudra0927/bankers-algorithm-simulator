# Banker's Algorithm Simulator

An interactive, browser-based Operating Systems mini-project that demonstrates the Banker's Safety Algorithm and safe/unsafe resource-allocation states.

**Institution:** Alard University  
**Program:** Computer Science and Engineering (CSE)  
**Project type:** Operating Systems Mini Project

## Features

- Editable Allocation and Maximum matrices
- Editable Available resource vector
- Automatic Need matrix calculation (`Need = Maximum - Allocation`)
- Safety algorithm implementation with safe-sequence detection
- Step-by-step Work-vector display
- Sample scenario and reset controls
- Input validation for negative values, invalid dimensions, and Allocation greater than Maximum
- Responsive interface for desktop and mobile

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Click **Load Sample**, then **Check Safety** to run the sample.
4. Edit the matrices to explore other cases.

No installation, backend, database, API key, or build step is required.

## GitHub upload

1. Create a new repository on GitHub, for example `bankers-algorithm-simulator`.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and `LICENSE`.
3. To publish it as a website, open repository **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then save.

## Algorithm

For each process `Pi`:

- `Need[i][j] = Maximum[i][j] - Allocation[i][j]`
- Initialize `Work = Available` and every `Finish[i] = false`.
- Find an unfinished process whose `Need[i] <= Work` for every resource type.
- Mark that process finished and add its Allocation to Work.
- Repeat until all processes finish or no eligible process remains.

If every process can finish, the state is safe and the completion order is a safe sequence. Otherwise, the algorithm cannot find a safe sequence for the current state.

## Project structure

```text
bankers-algorithm-simulator/
├── index.html
├── style.css
├── script.js
├── README.md
└── LICENSE
```

## Academic note

Use this as a learning and demonstration project. Review the source code, run your own test cases, and customize the report and project according to your course requirements. Add your own name, roll number, faculty guide, academic year, and genuine screenshots before submitting.

## License

MIT License. See `LICENSE`.
