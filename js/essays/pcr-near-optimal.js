/* PCR amplification explorer — interactive for pcr-near-optimal.html */
(function () {
  'use strict';

  const cyclesSlider    = document.getElementById('cycles-slider');
  const efficiencySlider = document.getElementById('efficiency-slider');
  const cyclesVal       = document.getElementById('cycles-val');
  const efficiencyVal   = document.getElementById('efficiency-val');
  const copiesOut       = document.getElementById('copies-out');
  const copiesSci       = document.getElementById('copies-sci');
  const canvas          = document.getElementById('pcr-canvas');

  if (!cyclesSlider || !canvas) return;

  const ctx = canvas.getContext('2d');

  function toSci(n) {
    if (n === 0) return '0';
    const exp = Math.floor(Math.log10(n));
    const coeff = (n / Math.pow(10, exp)).toFixed(2);
    return coeff + ' &times; 10<sup>' + exp + '</sup>';
  }

  function toReadable(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + ' trillion';
    if (n >= 1e9)  return (n / 1e9).toFixed(1)  + ' billion';
    if (n >= 1e6)  return (n / 1e6).toFixed(1)  + ' million';
    if (n >= 1e3)  return (n / 1e3).toFixed(1)  + ' thousand';
    return n.toFixed(0);
  }

  function computeCopies(cycles, eff) {
    return Math.pow(1 + eff / 100, cycles);
  }

  function drawChart(cycles, eff) {
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const W    = rect.width - 48; /* account for interactive padding */
    const H    = 160;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    /* build data */
    const data = [];
    for (let c = 0; c <= cycles; c++) {
      data.push(computeCopies(c, eff));
    }

    const maxVal = data[data.length - 1];
    const padL = 8, padR = 8, padT = 10, padB = 20;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    /* axis lines */
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    /* curve */
    ctx.strokeStyle = '#4a90a4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach(function (v, i) {
      const x = padL + (i / cycles) * chartW;
      /* use log scale so early cycles are visible */
      const logV   = Math.log1p(v);
      const logMax = Math.log1p(maxVal);
      const y = padT + chartH - (logV / logMax) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    });
    ctx.stroke();

    /* x-axis label */
    ctx.fillStyle = '#666';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Cycle 0', padL, H - 4);
    ctx.textAlign = 'right';
    ctx.fillText('Cycle ' + cycles, padL + chartW, H - 4);
  }

  function update() {
    const cycles = parseInt(cyclesSlider.value, 10);
    const eff    = parseInt(efficiencySlider.value, 10);

    cyclesVal.textContent     = cycles;
    efficiencyVal.textContent = eff;

    const copies = computeCopies(cycles, eff);
    copiesOut.textContent    = toReadable(copies);
    copiesSci.innerHTML      = toSci(copies);

    drawChart(cycles, eff);
  }

  cyclesSlider.addEventListener('input', update);
  efficiencySlider.addEventListener('input', update);
  window.addEventListener('resize', update);

  update();
}());
