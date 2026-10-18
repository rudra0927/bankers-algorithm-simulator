const $ = (id) => document.getElementById(id);

const sample = {
  allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
  maximum:   [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
  available: [3, 3, 2]
};

function makeTable(targetId, matrix, prefix) {
  const resources = matrix[0].length;
  let html = '<table><thead><tr><th>Process</th>';
  for (let r = 0; r < resources; r++) html += `<th>R${r}</th>`;
  html += '</tr></thead><tbody>';
  matrix.forEach((row, p) => {
    html += `<tr><td>P${p}</td>`;
    row.forEach((value, r) => {
      html += `<td><input type="number" min="0" step="1" value="${value}" data-matrix="${prefix}" data-process="${p}" data-resource="${r}" aria-label="${prefix} P${p} R${r}"></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  $(targetId).innerHTML = html;
}

function renderAvailable(values) {
  $('availableInputs').innerHTML = values.map((v, r) =>
    `<label>Resource R${r}<input type="number" min="0" step="1" value="${v}" data-available="${r}" aria-label="Available resource R${r}"></label>`
  ).join('');
}

function renderMatrices(data) {
  $('processCount').value = data.allocation.length;
  $('resourceCount').value = data.available.length;
  makeTable('allocationMatrix', data.allocation, 'allocation');
  makeTable('maximumMatrix', data.maximum, 'maximum');
  renderAvailable(data.available);
  $('resultsSection').hidden = true;
  showMessage('', '');
}

function getInputs() {
  const processCount = Number($('processCount').value);
  const resourceCount = Number($('resourceCount').value);
  if (!Number.isInteger(processCount) || processCount < 1 || processCount > 8 ||
      !Number.isInteger(resourceCount) || resourceCount < 1 || resourceCount > 5) {
    throw new Error('Choose 1–8 processes and 1–5 resource types.');
  }
  const readMatrix = (name) => {
    const matrix = Array.from({ length: processCount }, () => Array(resourceCount).fill(0));
    document.querySelectorAll(`[data-matrix="${name}"]`).forEach((input) => {
      const value = Number(input.value);
      if (input.value.trim() === '' || !Number.isInteger(value) || value < 0) {
        throw new Error('Matrix values must be non-negative whole numbers.');
      }
      matrix[Number(input.dataset.process)][Number(input.dataset.resource)] = value;
    });
    return matrix;
  };
  const allocation = readMatrix('allocation');
  const maximum = readMatrix('maximum');
  const available = Array.from({ length: resourceCount }, (_, r) => {
    const input = document.querySelector(`[data-available="${r}"]`);
    const value = Number(input.value);
    if (!input || input.value.trim() === '' || !Number.isInteger(value) || value < 0) {
      throw new Error('Available resource values must be non-negative whole numbers.');
    }
    return value;
  });
  for (let p = 0; p < processCount; p++) {
    for (let r = 0; r < resourceCount; r++) {
      if (allocation[p][r] > maximum[p][r]) {
        throw new Error(`Allocation for P${p}, R${r} cannot exceed its Maximum.`);
      }
    }
  }
  return { allocation, maximum, available };
}

function safetyAlgorithm({ allocation, maximum, available }) {
  const n = allocation.length;
  const m = available.length;
  const need = maximum.map((row, p) => row.map((maxValue, r) => maxValue - allocation[p][r]));
  const work = [...available];
  const finish = Array(n).fill(false);
  const sequence = [];
  const steps = [];
  let progress = true;

  while (sequence.length < n && progress) {
    progress = false;
    for (let p = 0; p < n; p++) {
      if (finish[p]) continue;
      const canFinish = need[p].every((value, r) => value <= work[r]);
      steps.push({
        process: `P${p}`,
        need: [...need[p]],
        workBefore: [...work],
        canFinish,
        finishBefore: [...finish],
        workAfter: canFinish ? work.map((value, r) => value + allocation[p][r]) : [...work]
      });
      if (canFinish) {
        for (let r = 0; r < m; r++) work[r] += allocation[p][r];
        finish[p] = true;
        sequence.push(`P${p}`);
        progress = true;
        break;
      }
    }
  }
  return { safe: sequence.length === n, sequence, need, steps, finish, finalWork: work };
}

function vector(values) { return '[' + values.join(', ') + ']'; }

function showMessage(text, type) {
  const box = $('message');
  box.textContent = text;
  box.className = text ? `message show ${type}` : 'message';
}

function renderPlainMatrix(targetId, matrix) {
  const resources = matrix[0].length;
  let html = '<table><thead><tr><th>Process</th>';
  for (let r = 0; r < resources; r++) html += `<th>R${r}</th>`;
  html += '</tr></thead><tbody>';
  matrix.forEach((row, p) => {
    html += `<tr><td>P${p}</td>${row.map((v) => `<td>${v}</td>`).join('')}</tr>`;
  });
  $(targetId).innerHTML = html + '</tbody></table>';
}

function renderSteps(steps) {
  if (!steps.length) { $('stepsTable').innerHTML = '<p>No steps were required.</p>'; return; }
  let html = '<table><thead><tr><th>Checked process</th><th>Need</th><th>Work before</th><th>Can finish?</th><th>Work after</th></tr></thead><tbody>';
  steps.forEach((step, index) => {
    html += `<tr class="${step.canFinish ? 'step-current' : ''}">
      <td>${step.process}</td><td>${vector(step.need)}</td><td>${vector(step.workBefore)}</td>
      <td>${step.canFinish ? 'Yes — finish' : 'Not yet'}</td><td>${vector(step.workAfter)}</td></tr>`;
  });
  $('stepsTable').innerHTML = html + '</tbody></table>';
}

function calculate() {
  try {
    const input = getInputs();
    const result = safetyAlgorithm(input);
    renderPlainMatrix('needMatrix', result.need);
    renderSteps(result.steps);
    $('resultsSection').hidden = false;
    $('stateValue').textContent = result.safe ? 'SAFE' : 'UNSAFE';
    $('sequenceValue').textContent = result.safe ? result.sequence.join(' → ') : 'No safe sequence found';
    $('completedValue').textContent = `${result.sequence.length} / ${input.allocation.length}`;
    $('stateBadge').textContent = result.safe ? 'Safe state' : 'Unsafe state';
    $('stateBadge').className = `state-badge ${result.safe ? 'safe' : 'unsafe'}`;
    $('resultExplanation').textContent = result.safe
      ? `The system is in a safe state because every process can finish in this order: ${result.sequence.join(' → ')}. Each process's allocated resources are returned to Work when it completes.`
      : `The system is unsafe under the current snapshot: only ${result.sequence.length} of ${input.allocation.length} processes could be completed by the safety algorithm. This does not mean deadlock has already occurred, but a safe sequence could not be found.`;
    showMessage(result.safe ? 'Safety check complete: a safe sequence exists.' : 'Safety check complete: no safe sequence exists for these inputs.', result.safe ? 'success' : 'error');
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showMessage(error.message || 'Please check your inputs.', 'error');
  }
}

$('generateBtn').addEventListener('click', () => {
  const n = Number($('processCount').value);
  const m = Number($('resourceCount').value);
  if (!Number.isInteger(n) || n < 1 || n > 8 || !Number.isInteger(m) || m < 1 || m > 5) {
    showMessage('Choose 1–8 processes and 1–5 resource types.', 'error');
    return;
  }
  renderMatrices({
    allocation: Array.from({ length: n }, () => Array(m).fill(0)),
    maximum: Array.from({ length: n }, () => Array(m).fill(0)),
    available: Array(m).fill(0)
  });
});
$('sampleBtn').addEventListener('click', () => renderMatrices(sample));
$('resetBtn').addEventListener('click', () => renderMatrices(sample));
$('calculateBtn').addEventListener('click', calculate);
renderMatrices(sample);
