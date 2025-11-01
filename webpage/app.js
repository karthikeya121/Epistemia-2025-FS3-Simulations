// Forensic Blood Simulations – JavaScript Logic
// ------------------------------------------------

/*
The sandboxed environment blocks localStorage/sessionStorage & cookies.
All state is therefore kept in memory only.
*/

// Global Chart instances – so we can destroy & recreate them
let deathChart = null;
let growthChart = null;

// Tab switching -----------------------------------------------------------
function activateTab(tab) {
  // buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('tab-btn--active');
    btn.setAttribute('aria-selected', 'false');
  });
  tab.classList.add('tab-btn--active');
  tab.setAttribute('aria-selected', 'true');

  // panels
  const targetPanelId = tab.getAttribute('aria-controls');
  document.querySelectorAll('.simulation-panel').forEach((p) => {
    if (p.id === targetPanelId) {
      p.classList.remove('hidden');
    } else {
      p.classList.add('hidden');
    }
  });
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn));
  });
}

// -------------------------------------------------------------------------
// Mathematical helper functions (Death Simulation)
// -------------------------------------------------------------------------
function tempPreserveFactor(T, T_reference = 25.0, Q10 = 2.0) {
  const tempFactor = Math.pow(Q10, (T - T_reference) / 10.0);
  return 1.0 - tempFactor; // Low temperature => strong preservation
}

function deathRate(T, RH, a = 0.2, b = 0.8) {
  const tp = tempPreserveFactor(T);
  return a * (1 - tp) + b * (1 - RH / 100.0);
}

function deterministicDecay(N0, d, tDays, nPoints = 300) {
  const t = [];
  const N = [];
  const dt = tDays / (nPoints - 1);
  for (let i = 0; i < nPoints; i++) {
    const time = i * dt;
    t.push(time);
    N.push(N0 * Math.exp(-d * time));
  }
  return { t, N };
}

// -------------------------------------------------------------------------
// Mathematical helper functions (Growth Simulation)
// -------------------------------------------------------------------------
function q10TempFactor(T, T_ref = 25.0, Q10 = 2.0) {
  return Math.pow(Q10, (T - T_ref) / 10.0);
}

function localRh(ambientRh, offset) {
  return Math.min(100.0, ambientRh + offset);
}

function simulateClothLogistic({
  N0 = 100.0,
  rBase = 0.8,
  K = 5e5,
  T = 2.0,
  ambientRh = 0.0,
  offset = 20.0,
  tMax = 30.0,
  dt = 0.05,
}) {
  const rhLocal = localRh(ambientRh, offset);
  const tempFac = q10TempFactor(T);
  const moistureFac = rhLocal < 20.0 ? 0.02 : rhLocal / 100.0;
  const mult = tempFac * moistureFac;
  const rEnv = rBase * mult;

  const tArr = [];
  const NArr = [];
  let N = N0;
  for (let t = 0.0; t <= tMax + 1e-9; t += dt) {
    tArr.push(t);
    NArr.push(N);
    // Logistic growth with environmental adjustments
    let dN = rEnv * N * (1 - N / K);
    if (rhLocal < 30.0) {
      dN -= 0.01 * N; // extra death under very dry conditions
    }
    N = Math.max(0, N + dN * dt);
  }
  return { t: tArr, N: NArr, rhLocal, rEnv };
}

// -------------------------------------------------------------------------
// Chart utilities
// -------------------------------------------------------------------------
function buildLineChart(ctx, datasets, logScale = false, xLabel = 'Time (days)', yLabel = 'Value') {
  return new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: xLabel },
        },
        y: {
          type: logScale ? 'logarithmic' : 'linear',
          title: { display: true, text: yLabel },
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return logScale ? Number.parseFloat(value).toExponential(1) : value;
            },
          },
        },
      },
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
      },
    },
  });
}

// -------------------------------------------------------------------------
// Death Simulation logic
// -------------------------------------------------------------------------
function runDeathSimulation(event) {
  event.preventDefault();

  // Parameter extraction & validation
  const cond1RH = Number(document.getElementById('cond1RH').value);
  const cond2RH = Number(document.getElementById('cond2RH').value);
  const aVar = Number(document.getElementById('aVar').value);
  const bVar = Number(document.getElementById('bVar').value);
  const tDays = Number(document.getElementById('tDays').value);

  const errors = [];
  const rhValid = (v) => v >= 0 && v <= 100;
  if (!rhValid(cond1RH)) errors.push('Condition 1 RH must be between 0 and 100.');
  if (!rhValid(cond2RH)) errors.push('Condition 2 RH must be between 0 and 100.');
  if (tDays <= 0) errors.push('Simulation length must be positive.');
  if (errors.length) {
    alert(errors.join('\n'));
    return;
  }

  const N0 = 1e6;
  const temperature = 2.0;

  const conditions = [
    { RH: cond1RH, label: `2°C, ${cond1RH}% RH` },
    { RH: cond2RH, label: `2°C, ${cond2RH}% RH` },
  ];

  // Calculate & build datasets
  const datasets = [];
  let resultsText = '';

  conditions.forEach((c, idx) => {
    const d = deathRate(temperature, c.RH, aVar, bVar);
    const { t, N } = deterministicDecay(N0, d, tDays);
    const pSurvive = Math.exp(-d * tDays);
    const expected = N0 * pSurvive;
    const probAllExtinct = Math.pow(1 - pSurvive, N0);

    datasets.push({
      label: `${c.label} (d = ${d.toFixed(3)} day⁻¹)`,
      data: t.map((time, i) => ({ x: time, y: N[i] })),
      borderWidth: 2,
      fill: false,
    });

    resultsText += `Condition: ${c.label}\n`;
    resultsText += `  Death rate = ${d.toFixed(3)} / day\n`;
    resultsText += `  Survival probability p = ${pSurvive.toExponential(3)}\n`;
    resultsText += `  Expected survivors = ${expected.toFixed(2)}\n`;
    resultsText += `  Extinction probability = ${probAllExtinct.toExponential(3)}\n\n`;
  });

  // Render chart
  const ctx = document.getElementById('deathChart').getContext('2d');
  if (deathChart) deathChart.destroy();
  deathChart = buildLineChart(ctx, datasets, true, 'Time (days)', 'Viable cells');

  // Display results
  document.getElementById('deathResults').textContent = resultsText.trim();
}

// -------------------------------------------------------------------------
// Growth Simulation logic
// -------------------------------------------------------------------------
function runGrowthSimulation(event) {
  event.preventDefault();

  // Parameter extraction
  const case1RH = Number(document.getElementById('case1RH').value);
  const case2RH = Number(document.getElementById('case2RH').value);
  const arhVar = Number(document.getElementById('arhVar').value);
  const N0 = Number(document.getElementById('gN0').value);
  const tMax = Number(document.getElementById('tMax').value);

  // Fixed parameters
  const rBase = 0.8;
  const K = 5e5;

  const errors = [];
  const rhValid = (v) => v >= 0 && v <= 100;
  if (!rhValid(case1RH)) errors.push('Case 1 Humidity must be between 0 and 100.');
  if (!rhValid(case2RH)) errors.push('Case 2 Humidity must be between 0 and 100.');
  if (tMax <= 0) errors.push('Simulation length must be positive.');
  if (N0 <= 0) errors.push('Initial population must be positive.');
  if (N0 > 100000) errors.push('Initial population must not exceed 100,000.')
  if (errors.length) {
    alert(errors.join('\n'));
    return;
  }

  const temperature = 2.0;
  const conditions = [
    { ambientRh: case1RH, label: `2°C, ${case1RH}% RH (cloth local RH)` },
    { ambientRh: case2RH, label: `2°C, ${case2RH}% RH (cloth local RH)` },
  ];

  const datasets = [];
  let resultsText = '';

  conditions.forEach((c) => {
    const { t, N, rhLocal, rEnv } = simulateClothLogistic({
      N0,
      rBase,
      K,
      T: temperature,
      ambientRh: c.ambientRh,
      offset: arhVar,
      tMax,
    });

    datasets.push({
      label: `${c.label} (local RH = ${rhLocal.toFixed(0)}%, r_env = ${rEnv.toExponential(3)})`,
      data: t.map((time, i) => ({ x: time, y: N[i] })),
      borderWidth: 2,
      fill: false,
    });

    resultsText += `Condition: ${c.label}\n`;
    resultsText += `  Local RH = ${rhLocal.toFixed(1)} %\n`;
    resultsText += `  r_env = ${rEnv.toExponential(4)}\n\n`;
  });

  // Render chart
  const ctx = document.getElementById('growthChart').getContext('2d');
  if (growthChart) growthChart.destroy();
  growthChart = buildLineChart(ctx, datasets, true, 'Time (days)', 'Population');

  document.getElementById('growthResults').textContent = resultsText.trim();
}

// -------------------------------------------------------------------------
// Event binding after DOM is ready
// -------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  document.getElementById('deathForm').addEventListener('submit', runDeathSimulation);
  document.getElementById('growthForm').addEventListener('submit', runGrowthSimulation);

  // Run default simulations on first load for immediate feedback
  document.getElementById('deathForm').dispatchEvent(new Event('submit'));
});
