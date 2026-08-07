// stayZIN Insight Controller v2.0
let currentPendingResult = null;
let deptChartInstance = null;
let priorityChartInstance = null;

// Kamar yang dipantau untuk Heat Map (Contoh)
const ROOM_LIST = ["101", "102", "103", "104", "201", "202", "203", "204", "301", "302", "303", "304"];

document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();

    document.getElementById("analyzeBtn").addEventListener("click", () => {
        const text = document.getElementById("complaintInput").value.trim();
        const room = document.getElementById("roomInput").value.trim();
        const impact = document.getElementById("impactInput").value;
        const guestName = document.getElementById("guestNameInput").value.trim();

        if (!text || !room) {
            alert("Harap isi Nomor Kamar dan Detail Komplain!");
            return;
        }

        document.getElementById("loading").classList.remove("hidden");
        document.getElementById("loading").classList.add("flex");
        document.getElementById("resultSection").classList.add("hidden");

        setTimeout(() => {
            document.getElementById("loading").classList.add("hidden");
            document.getElementById("loading").classList.remove("flex");

            const aiResult = analyzeComplaintAI(text, room, impact, guestName);
            currentPendingResult = {
                id: Date.now(),
                date: new Date().toLocaleDateString("id-ID"),
                rawDate: new Date().toISOString().split("T")[0],
                room,
                guestName: guestName || "Guest",
                text,
                impact,
                ...aiResult
            };

            displayAIResult(currentPendingResult);
        }, 1200);
    });

    document.getElementById("saveCaseBtn").addEventListener("click", () => {
        if (currentPendingResult) {
            StorageManager.saveComplaint(currentPendingResult);
            currentPendingResult = null;
            document.getElementById("resultSection").classList.add("hidden");
            document.getElementById("complaintInput").value = "";
            document.getElementById("roomInput").value = "";
            document.getElementById("guestNameInput").value = "";
            renderDashboard();
            alert("Case tersimpan & Dashboard terbarui!");
        }
    });

    document.getElementById("clearBtn").addEventListener("click", () => {
        document.getElementById("complaintInput").value = "";
        document.getElementById("roomInput").value = "";
        document.getElementById("guestNameInput").value = "";
    });
});

function displayAIResult(res) {
    document.getElementById("resDept").innerText = res.dept;
    document.getElementById("resCategory").innerText = res.category;
    document.getElementById("resSubCategory").innerText = res.subCategory;
    document.getElementById("resSentiment").innerText = res.sentiment;

    document.getElementById("resSeverityScore").innerText = `${res.severityScore}/100`;
    document.getElementById("resReviewRiskPct").innerText = `${res.reviewRiskPct}%`;
    document.getElementById("resPredictedStar").innerText = res.predictedStar;
    document.getElementById("resRevenueAtRisk").innerText = `IDR ${res.revenueAtRisk.toLocaleString("id-ID")}`;

    document.getElementById("resRootCause").innerText = res.rootCause;
    document.getElementById("resSummary").innerText = res.summary;

    const checklistContainer = document.getElementById("resRecoveryChecklist");
    checklistContainer.innerHTML = res.recoveryChecklist.map(item => `<div class="flex items-center gap-1.5 text-slate-700"><span class="text-emerald-600 font-bold">✔</span> ${item}</div>`).join("");

    const badge = document.getElementById("resPriorityBadge");
    badge.innerText = `Priority: ${res.priority}`;
    badge.className = `text-xs px-3 py-1 rounded-full font-bold ${res.priority === 'Critical' || res.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`;

    document.getElementById("resultSection").classList.remove("hidden");
}

function renderDashboard() {
    const data = StorageManager.getComplaints();

    // 1. KPI Calculation
    document.getElementById("kpiToday").innerText = data.length;
    const highPri = data.filter(d => d.priority === "High" || d.priority === "Critical").length;
    document.getElementById("kpiHighPriority").innerText = highPri;

    let totalRevenueRisk = data.reduce((acc, curr) => acc + (curr.revenueAtRisk || 0), 0);
    document.getElementById("kpiRevenueRisk").innerText = `IDR ${totalRevenueRisk.toLocaleString("id-ID")}`;

    // Most Dept Issue
    let deptCounts = {};
    data.forEach(d => { deptCounts[d.dept] = (deptCounts[d.dept] || 0) + 1; });
    let topDept = Object.keys(deptCounts).reduce((a, b) => deptCounts[a] > deptCounts[b] ? a : b, "-");
    document.getElementById("kpiMostDept").innerText = topDept;

    // 2. Room Heat Map Renderer
    renderRoomHeatMap(data);

    // 3. Render Table
    renderTable(data);

    // 4. Render Analytics Charts
    renderAnalyticsCharts(data, deptCounts);
}

function renderRoomHeatMap(data) {
    const container = document.getElementById("roomHeatMap");
    container.innerHTML = "";

    // Group complaints per room
    let roomIncidents = {};
    data.forEach(d => {
        roomIncidents[d.room] = (roomIncidents[d.room] || 0) + 1;
    });

    ROOM_LIST.forEach(roomNum => {
        const count = roomIncidents[roomNum] || 0;
        let colorClass = "bg-emerald-100 border-emerald-300 text-emerald-800"; // Safe (Green)
        let indicator = "🟢";

        if (count >= 3) {
            colorClass = "bg-rose-100 border-rose-300 text-rose-800 font-bold"; // Critical (Red)
            indicator = "🔴";
        } else if (count >= 1) {
            colorClass = "bg-amber-100 border-amber-300 text-amber-800 font-semibold"; // Warning (Yellow)
            indicator = "🟡";
        }

        const div = document.createElement("div");
        div.className = `p-2.5 rounded-lg border text-center text-xs flex flex-col items-center justify-center ${colorClass}`;
        div.innerHTML = `
            <span>Room ${roomNum} ${indicator}</span>
            <span class="text-[10px] opacity-75">${count} Insiden</span>
        `;
        container.appendChild(div);
    });
}

function renderTable(data) {
    const tbody = document.getElementById("historyTable");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">Belum ada komplain tersimpan.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 border-b";
        tr.innerHTML = `
            <td class="p-3 font-semibold">${item.date}<br><span class="text-blue-600">Rm ${item.room}</span></td>
            <td class="p-3 font-medium">${item.guestName}</td>
            <td class="p-3"><b>${item.category}</b><br><span class="text-slate-400 text-[10px]">${item.rootCause}</span></td>
            <td class="p-3"><span class="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-semibold">${item.dept}</span></td>
            <td class="p-3"><span class="text-[10px] px-2 py-0.5 rounded font-bold ${item.priority === 'Critical' || item.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${item.priority}</span></td>
            <td class="p-3 font-semibold text-amber-700">${item.reviewRiskPct}% (${item.predictedStar})</td>
            <td class="p-3 text-[11px] text-slate-600">${item.recoveryChecklist ? item.recoveryChecklist.join(", ") : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterHistoryTable() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const dept = document.getElementById("deptFilter").value;
    const priority = document.getElementById("priorityFilter").value;

    const data = StorageManager.getComplaints().filter(item => {
        const matchSearch = item.guestName.toLowerCase().includes(search) || item.room.includes(search) || item.text.toLowerCase().includes(search);
        const matchDept = dept === "" || item.dept === dept;
        const matchPriority = priority === "" || item.priority === priority;
        return matchSearch && matchDept && matchPriority;
    });

    renderTable(data);
}

function renderAnalyticsCharts(data, deptCounts) {
    // Dept Chart
    const deptCtx = document.getElementById("deptChart").getContext("2d");
    if (deptChartInstance) deptChartInstance.destroy();
    deptChartInstance = new Chart(deptCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{ label: 'Insiden per Dept', data: Object.values(deptCounts), backgroundColor: '#3b82f6' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Priority Chart
    let priCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    data.forEach(d => { if (priCounts[d.priority] !== undefined) priCounts[d.priority]++; });

    const priCtx = document.getElementById("priorityChart").getContext("2d");
    if (priorityChartInstance) priorityChartInstance.destroy();
    priorityChartInstance = new Chart(priCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(priCounts),
            datasets: [{ data: Object.values(priCounts), backgroundColor: ['#e11d48', '#f97316', '#f59e0b', '#10b981'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// PDF & Excel Export
function exportExcel() {
    const data = StorageManager.getComplaints();
    if (!data.length) return alert("Tidak ada data untuk di-export!");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Executive Complaint Report");
    XLSX.writeFile(wb, `stayZIN_Insight_v2_Report.xlsx`);
}

function exportPDF() {
    const element = document.getElementById("exportableArea");
    html2pdf().set({ margin: 0.3, filename: 'stayZIN_Insight_v2_Executive_Report.pdf', html2canvas: { scale: 2 } }).from(element).save();
}
