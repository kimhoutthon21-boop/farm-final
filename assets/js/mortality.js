(function () {
  var m = window.__mort; if (!m || !window.Chart) return;
  PFM.base(); var C = PFM.colors;
  if (m.daily.hasData) PFM.line('ch-daily', m.daily.labels, m.daily.sets);
  var cum = document.getElementById('ch-cum');
  if (cum && m.cum.length) new Chart(cum, { type: 'line', data: { datasets: m.cum.map(function (s, i) { return { label: s.label, data: s.data, borderColor: C[i % C.length], backgroundColor: C[i % C.length], borderWidth: 2, tension: .3, pointRadius: 2, pointHoverRadius: 5 }; }) },
    options: { parsing: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } } }, scales: { x: { type: 'linear', title: { display: true, text: 'Cycle day' }, ticks: { maxTicksLimit: 8 }, grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#edf1ed' } } } } });
  var ca = document.getElementById('ch-cause');
  if (ca && m.cause.length) new Chart(ca, { type: 'doughnut', data: { labels: m.cause.map(function (x) { return x.cause; }), datasets: [{ data: m.cause.map(function (x) { return +x.n; }), backgroundColor: C.concat(['#9aa5a0', '#d0a35a']), borderWidth: 2 }] }, options: { cutout: '62%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } } } });
  var ho = document.getElementById('ch-house');
  if (ho && m.house.length) new Chart(ho, { type: 'bar', data: { labels: m.house.map(function (x) { return x.l; }), datasets: [{ label: 'Deaths', data: m.house.map(function (x) { return x.n; }), backgroundColor: '#14663b', borderRadius: 6 }] }, options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#edf1ed' } } } } });
})();
