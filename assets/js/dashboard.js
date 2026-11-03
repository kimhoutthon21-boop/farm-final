(function () {
  var d = window.__dash; if (!d || !window.PFM) return;
  if (d.hasData) {
    PFM.line('ch-deaths', d.deathLabels, d.deaths);
    PFM.line('ch-feed', d.labels, d.feed, { type: 'bar', stacked: true, wholeNumbers: true });
  }
  var el = document.getElementById('ch-pop');
  if (el && d.pop.labels.length) {
    PFM.base();
    new Chart(el, { type: 'bar', data: { labels: d.pop.labels, datasets: [
      { label: 'Living now', data: d.pop.living, backgroundColor: '#14663b', borderRadius: 6 },
      { label: 'Originally placed', data: d.pop.placed, backgroundColor: '#cfe0d4', borderRadius: 6 } ] },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#edf1ed' } } } } });
  }
})();
