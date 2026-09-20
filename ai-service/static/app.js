// ============================================================
// AI CROWD DETECTION & ALERT SYSTEM - CLIENT FRONT-END APP
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let soundAlarmEnabled = true;
    let trendChart = null;
    let currentSettings = {
        confidence_threshold: 0.50,
        nms_threshold: 0.40,
        low_crowd: 30,
        medium_crowd: 70,
        high_crowd: 100
    };

    // --- Web Audio Siren Synthesizer ---
    let audioCtx = null;
    let alarmOsc = null;

    function playAlarmSound() {
        if (!soundAlarmEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            // Create alarm oscillator pattern (two-tone security siren)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            console.warn("Audio alarm warning failed:", e);
        }
    }

    // --- Tab Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTabId = item.getAttribute('data-tab');
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            item.classList.add('active');
            const targetPane = document.getElementById(targetTabId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Button view all alerts
    document.getElementById('btn-view-all-alerts')?.addEventListener('click', () => {
        document.getElementById('nav-alerts')?.click();
    });

    // Sound toggle header button
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn?.addEventListener('click', () => {
        soundAlarmEnabled = !soundAlarmEnabled;
        if (soundAlarmEnabled) {
            soundIcon.className = 'fa-solid fa-volume-high';
            playAlarmSound();
        } else {
            soundIcon.className = 'fa-solid fa-volume-xmark';
        }
    });

    // --- Live Clock ---
    function updateClock() {
        const clockElem = document.getElementById('clock-time');
        if (clockElem) {
            const now = new Date();
            clockElem.textContent = now.toLocaleTimeString();
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Chart.js Real-time Trend Graph ---
    function initChart() {
        const ctx = document.getElementById('crowdTrendChart')?.getContext('2d');
        if (!ctx) return;

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40'],
                datasets: [{
                    label: 'People Count',
                    data: [45, 52, 68, 85, 110, 124, 118, 95, 124],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' },
                        suggestedMax: 150,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initChart();

    // --- Spatial 5x5 Grid Heatmap ---
    function renderSpatialGrid(matrix = null) {
        const gridElem = document.getElementById('spatial-density-matrix');
        if (!gridElem) return;

        gridElem.innerHTML = '';
        const rows = 5, cols = 5;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';

                let val = 0;
                if (matrix && matrix[r] && matrix[r][c] !== undefined) {
                    val = matrix[r][c];
                } else {
                    // Realistic dummy grid count if not provided
                    val = Math.floor(Math.random() * 8);
                }

                if (val > 6) cell.classList.add('cell-high');
                else if (val > 3) cell.classList.add('cell-med');
                else if (val > 0) cell.classList.add('cell-low');

                cell.innerHTML = `<span>Z${r+1}-${c+1}</span><strong>${val}</strong>`;
                gridElem.appendChild(cell);
            }
        }
    }

    renderSpatialGrid();

    // --- REST API Data Poller ---
    async function fetchStats() {
        try {
            const res = await fetch('/api/stats');
            if (!res.ok) return;
            const data = await res.json();

            // Update KPI cards
            const currentValElem = document.getElementById('kpi-current-val');
            if (currentValElem) currentValElem.textContent = data.current_count;

            const statusValElem = document.getElementById('kpi-status-val');
            if (statusValElem) {
                statusValElem.textContent = data.status;
                statusValElem.style.color = data.status_color;
            }

            const statusDescElem = document.getElementById('kpi-status-desc');
            if (statusDescElem) statusDescElem.textContent = `${data.status_message} (>=${data.current_count})`;

            const hudCountElem = document.getElementById('dash-hud-count');
            if (hudCountElem) hudCountElem.textContent = `PEOPLE: ${data.current_count}`;

            const unackCountBadge = document.getElementById('unack-count-badge');
            if (unackCountBadge) unackCountBadge.textContent = data.unacknowledged_alerts;

            const kpiAlertsVal = document.getElementById('kpi-alerts-val');
            if (kpiAlertsVal) kpiAlertsVal.textContent = data.unacknowledged_alerts;

            // Trigger alarm siren if critical
            if (data.status === 'CRITICAL') {
                playAlarmSound();
            }

            // Update trend graph chart
            if (trendChart && data.timeline) {
                trendChart.data.labels = data.timeline.map(t => t.time);
                trendChart.data.datasets[0].data = data.timeline.map(t => t.count);
                trendChart.update('none');
            }
        } catch (e) {
            console.warn("Failed to fetch stats:", e);
        }
    }

    async function fetchAlerts() {
        try {
            const res = await fetch('/api/alerts');
            if (!res.ok) return;
            const data = await res.json();
            const alerts = data.alerts || [];

            // Populate dashboard table (top 4)
            const dashTbody = document.getElementById('dash-alerts-tbody');
            if (dashTbody) {
                dashTbody.innerHTML = '';
                alerts.slice(0, 4).forEach(a => {
                    const tr = document.createElement('tr');
                    const colorClass = a.status === 'CRITICAL' ? 'status-red' : (a.status === 'HIGH' ? 'status-orange' : 'status-amber');
                    tr.innerHTML = `
                        <td class="font-mono">${a.timestamp}</td>
                        <td>${a.zone}</td>
                        <td><strong>${a.count}</strong></td>
                        <td><span class="status-pill ${colorClass}">${a.status}</span></td>
                        <td>
                            ${a.acknowledged 
                                ? '<span class="text-dim"><i class="fa-solid fa-check"></i> Resolved</span>' 
                                : `<button class="btn-sm btn-outline ack-btn" data-id="${a.id}">Ack</button>`}
                        </td>
                    `;
                    dashTbody.appendChild(tr);
                });
            }

            // Populate all alerts table
            const allTbody = document.getElementById('all-alerts-tbody');
            if (allTbody) {
                allTbody.innerHTML = '';
                alerts.forEach(a => {
                    const tr = document.createElement('tr');
                    const colorClass = a.status === 'CRITICAL' ? 'status-red' : (a.status === 'HIGH' ? 'status-orange' : 'status-amber');
                    tr.innerHTML = `
                        <td class="font-mono">${a.id}</td>
                        <td class="font-mono">${a.date} ${a.timestamp}</td>
                        <td>${a.zone}</td>
                        <td><strong>${a.count}</strong></td>
                        <td><span class="status-pill ${colorClass}">${a.status}</span></td>
                        <td>${a.message}</td>
                        <td>${a.acknowledged ? '<span class="status-pill status-green">Acknowledged</span>' : '<span class="status-pill status-red">Unresolved</span>'}</td>
                        <td>
                            ${a.acknowledged 
                                ? '-' 
                                : `<button class="btn-sm btn-primary ack-btn" data-id="${a.id}"><i class="fa-solid fa-check"></i> Acknowledge</button>`}
                        </td>
                    `;
                    allTbody.appendChild(tr);
                });
            }

            // Attach event listener to acknowledge buttons
            document.querySelectorAll('.ack-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const alertId = e.target.closest('.ack-btn').getAttribute('data-id');
                    await acknowledgeAlert(alertId);
                });
            });

        } catch (e) {
            console.warn("Failed to fetch alerts:", e);
        }
    }

    async function acknowledgeAlert(alertId) {
        try {
            await fetch('/api/alerts/acknowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alert_id: alertId })
            });
            fetchAlerts();
            fetchStats();
        } catch (e) {
            console.error("Ack error:", e);
        }
    }

    // Start background poller
    setInterval(() => {
        fetchStats();
        fetchAlerts();
    }, 4000);
    fetchStats();
    fetchAlerts();

    // --- AI Sandbox Uploader Logic ---
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('sandbox-file-input');
    const btnLoadSample = document.getElementById('btn-load-sample');
    const progressBox = document.getElementById('upload-progress-box');
    const resultImg = document.getElementById('sandbox-result-img');
    const placeholderMsg = document.getElementById('sandbox-placeholder');
    const predictionsCard = document.getElementById('predictions-details-card');
    const predictionsTbody = document.getElementById('predictions-tbody');
    const resultStatsPill = document.getElementById('result-stats-pill');

    dropzone?.addEventListener('click', () => fileInput?.click());

    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#38bdf8';
    });
    dropzone?.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'rgba(56, 189, 248, 0.3)';
    });
    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    btnLoadSample?.addEventListener('click', async () => {
        try {
            progressBox?.classList.remove('hidden');
            const res = await fetch('/crowd.jpg');
            const blob = await res.blob();
            const file = new File([blob], 'crowd.jpg', { type: 'image/jpeg' });
            handleFileUpload(file);
        } catch (e) {
            alert('Sample file load error: ' + e);
        }
    });

    async function handleFileUpload(file) {
        try {
            progressBox?.classList.remove('hidden');
            placeholderMsg?.classList.add('hidden');
            resultImg?.classList.add('hidden');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API server returned error');
            const data = await response.json();

            // Display annotated result image
            if (resultImg) {
                resultImg.src = data.annotated_image;
                resultImg.classList.remove('hidden');
            }

            // Update stats pill
            if (resultStatsPill) {
                resultStatsPill.classList.remove('hidden');
                document.getElementById('res-count-num').textContent = data.count;
                const statusTag = document.getElementById('res-status-tag');
                if (statusTag) {
                    statusTag.textContent = data.status;
                    statusTag.style.color = data.color;
                }
            }

            // Populate Spatial Grid Heatmap matrix with real uploaded image grid data
            renderSpatialGrid(data.density_grid);

            // Populate predictions detail table
            if (predictionsTbody) {
                predictionsTbody.innerHTML = '';
                (data.predictions || []).slice(0, 50).forEach((p, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${idx + 1}</td>
                        <td><strong style="color:#10b981">${(p.confidence * 100).toFixed(1)}%</strong></td>
                        <td class="font-mono">(${p.x}, ${p.y})</td>
                        <td class="font-mono">${p.width} x ${p.height}</td>
                    `;
                    predictionsTbody.appendChild(tr);
                });
                predictionsCard?.classList.remove('hidden');
            }

            // Trigger siren audio if status is high or critical
            if (data.status === 'CRITICAL' || data.status === 'HIGH') {
                playAlarmSound();
            }

            fetchStats();
            fetchAlerts();
        } catch (err) {
            alert('Analysis Error: ' + err.message);
        } finally {
            progressBox?.classList.add('hidden');
        }
    }

    // --- CSV Alert Exporter ---
    document.getElementById('btn-export-alerts-csv')?.addEventListener('click', async () => {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        const alerts = data.alerts || [];

        let csv = 'Alert ID,Date,Time,Zone,Count,Severity,Message,Acknowledged\n';
        alerts.forEach(a => {
            csv += `"${a.id}","${a.date}","${a.timestamp}","${a.zone}",${a.count},"${a.status}","${a.message}",${a.acknowledged}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crowd_alerts_log_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    });

    // --- Settings & Threshold Sliders ---
    const rangeLow = document.getElementById('range-low');
    const rangeMed = document.getElementById('range-medium');
    const rangeHigh = document.getElementById('range-high');
    const rangeConf = document.getElementById('range-conf');
    const rangeNms = document.getElementById('range-nms');

    rangeLow?.addEventListener('input', (e) => document.getElementById('val-low').textContent = e.target.value);
    rangeMed?.addEventListener('input', (e) => document.getElementById('val-medium').textContent = e.target.value);
    rangeHigh?.addEventListener('input', (e) => document.getElementById('val-high').textContent = e.target.value);
    rangeConf?.addEventListener('input', (e) => document.getElementById('val-conf').textContent = e.target.value + '%');
    rangeNms?.addEventListener('input', (e) => document.getElementById('val-nms').textContent = (e.target.value / 100).toFixed(2));

    document.getElementById('btn-save-thresholds')?.addEventListener('click', async () => {
        const body = {
            low_crowd: parseInt(rangeLow.value),
            medium_crowd: parseInt(rangeMed.value),
            high_crowd: parseInt(rangeHigh.value),
            confidence_threshold: parseFloat(rangeConf.value) / 100.0,
            nms_threshold: parseFloat(rangeNms.value) / 100.0
        };

        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert('Threshold Settings saved successfully!');
            fetchStats();
        }
    });

    document.getElementById('btn-test-alarm')?.addEventListener('click', () => {
        playAlarmSound();
    });

    // Refresh Feed Button
    document.getElementById('btn-refresh-feed')?.addEventListener('click', () => {
        const img = document.getElementById('dash-stream-img');
        if (img) img.src = `/api/stream?cam=1&t=${Date.now()}`;
    });
});
