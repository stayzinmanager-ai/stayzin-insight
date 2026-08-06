// stayZIN Insight Controller v2.0
let trendChartInstance = null;
let heatMapChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    const complaintInput = document.getElementById("complaintInput");
    const roomInput = document.getElementById("roomInput");
    const impactInput = document.getElementById("impactInput");
    const guestNameInput = document.getElementById("guestNameInput");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const loading = document.getElementById("loading");
    const resultSection = document.getElementById("resultSection");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    renderDashboard();

    analyzeBtn.addEventListener("click", () => {
        const text = complaintInput.value.trim();
        if (!text) {
            alert("Harap masukkan detail komplain terlebih dahulu!");
            return;
        }

        loading.classList.remove("hidden");
        loading.classList.add("flex");
        resultSection.classList.add("hidden");

        setTimeout(() => {
            loading.classList.add("hidden");
            loading.classList.remove("flex");

            const room = roomInput.value.trim() || "N/A";
            const impact = impactInput.value;
            const guestName = guestNameInput.value.trim();

            const aiResult = processComplaintAI(text, room, impact);

            const record = {
                id: Date.now(),
                date: new Date().toLocaleDateString("id-ID"),
                rawDate: new Date().toISOString().split("T")[0],
                room,
                guestName,
                text,
                departments: aiResult.departments,
                severityLevel: aiResult.severityLevel,
                severityBadgeClass: aiResult.severityBadgeClass,
                reviewRisk: aiResult.reviewRisk,
                recoveryPlan: aiResult.recoveryPlan
            };

            StorageManager.saveComplaint(record);
            displayAIResult(aiResult);
            renderDashboard();
        }, 1500);
    });

    clearBtn.addEventListener("click", () => {
        complaintInput.value = "";
        roomInput.value = "";
        guestNameInput.value = "";
    });

    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Yakin ingin menghapus seluruh log insiden?")) {
            StorageManager.clearAll();
            renderDashboard();
        }
    });
});

function displayAIResult(result) {
    document.getElementById("resSeverity").innerText = result.severityLevel;
    document.getElementById("resSeverityBadge").innerText = `Severity: ${result.severityLevel}`;
    document.getElementById("resSeverityBadge").className = `text-xs px-3 py-1 rounded-full font-bold ${result.severityBadgeClass}`;
    document.getElementById("resRisk").innerText = result.reviewRisk;
    document.getElementById("resRecovery").innerText = result.recoveryPlan;

    const deptsContainer = document.getElementById("resDepts");
    deptsContainer.innerHTML = result.departments.map(d => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">${d}</span>`).join("");

    document.getElementById("resultSection").classList.remove("hidden");
}

function renderDashboard() {
    const data = StorageManager.getComplaints();

    // 1. Update KPI Cards
    document.getElementById("kpiTotal").innerText = data.length;
    
    const criticalCount = data.filter(d => d.severityLevel.includes("HIGH")).length;
    document.getElementById("kpiCritical").innerText = criticalCount;

    const highRiskCount = data.filter(d => d.reviewRisk.includes("🔴")).length;
    document.getElementById("kpiHighRisk").innerText = highRiskCount;

    // Calculate Top Dept
    let deptCounts = {};
    data.forEach(item => {
        item.departments.forEach(dept => {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
    });
    let topDept = Object.keys(deptCounts).reduce((a, b) => deptCounts[a] > deptCounts[b] ? a : b, "-");
    document.getElementById("kpiTopDept").innerText = topDept;

    // 2. Render History Table
    const tbody = document.getElementById("historyTable");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Belum ada histori komplain tersimpan.</td></tr>`;
    } else {
        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-50 border-b";
            tr.innerHTML = `
                <td class="p-3 font-semibold whitespace-nowrap">${item.date}<br><span class="text-blue-600">Rm ${item.room}</span></td>
                <td class="p-3">${item.text} ${item.guestName ? `<br><i class="text-slate-400">(${item.guestName})</i>` : ''}</td>
                <td class="p-3">${item.departments.map(d => `<span class="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border font-semibold mr-0.5">${d}</span>`).join("")}</td>
                <td class="p-3"><span class="text-[10px] px-2 py-0.5 rounded font-bold ${item.severityBadgeClass}">${item.severityLevel}</span></td>
                <td class="p-3 text-[11px] font-medium">${item.reviewRisk}</td>
                <td class="p-3 text-[11px] text-slate-600 whitespace-pre-line">${item.recoveryPlan}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. Render Charts (Trend & Heat Map)
    renderCharts(data, deptCounts);
}

function renderCharts(data, deptCounts) {
    // 📈 Trend Chart (By Date)
    let dateCounts = {};
    data.slice().reverse().forEach(item => {
        dateCounts[item.date] = (dateCounts[item.date] || 0) + 1;
    });

    const trendCtx = document.getElementById("trendChart").getContext("2d");
    if (trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dateCounts),
            datasets: [{
                label: 'Jumlah Insiden',
                data: Object.values(dateCounts),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 📊 Heat Map Chart (By Department)
    const heatCtx = document.getElementById("heatMapChart").getContext("2d");
    if (heatMapChartInstance) heatMapChartInstance.destroy();
    heatMapChartInstance = new Chart(heatCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{
                label: 'Insiden per Departemen',
                data: Object.values(deptCounts),
                backgroundColor: ['#e11d48', '#3b82f6', '#10b981', '#8b5cf6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// EXPORT TO EXCEL
function exportExcel() {
    const data = StorageManager.getComplaints();
    if (data.length === 0) return alert("Tidak ada data untuk di-export!");

    const exportData = data.map(item => ({
        Tanggal: item.date,
        Kamar: item.room,
        Tamu: item.guestName || "-",
        Komplain: item.text,
        Departemen: item.departments.join(", "),
        Severity: item.severityLevel,
        ReviewRisk: item.reviewRisk,
        RecoveryPlan: item.recoveryPlan
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaint Analytics");
    XLSX.writeFile(wb, `stayZIN_Insight_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// EXPORT TO PDF
function exportPDF() {
    const element = document.getElementById("exportableArea");
    const opt = {
        margin: 0.3,
        filename: `stayZIN_Executive_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}
