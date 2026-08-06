document.addEventListener("DOMContentLoaded", () => {
    const complaintInput = document.getElementById("complaintInput");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const loading = document.getElementById("loading");
    const resultSection = document.getElementById("resultSection");
    const resultContent = document.getElementById("resultContent");
    const historyTable = document.getElementById("historyTable");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    renderHistory();

    analyzeBtn.addEventListener("click", () => {
        const text = complaintInput.value.trim();
        if (!text) {
            alert("Harap masukkan teks komplain terlebih dahulu!");
            return;
        }
        analyzeComplaint(text);
    });

    clearBtn.addEventListener("click", () => {
        complaintInput.value = "";
    });

    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Yakin ingin menghapus seluruh riwayat komplain?")) {
            StorageManager.clearAll();
            renderHistory();
        }
    });

    function analyzeComplaint(text) {
        loading.style.display = "flex";
        resultSection.classList.add("hidden");

        setTimeout(() => {
            loading.style.display = "none";
            const result = processComplaintAI(text);
            generateResult(text, result);
        }, 1800);
    }

    function generateResult(text, result) {
        const newRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString("id-ID"),
            original: text,
            departments: result.departments,
            actionPlan: result.actionPlan
        };

        StorageManager.saveComplaint(newRecord);

        resultContent.innerHTML = `
            <div class="p-4 bg-gray-50 rounded-lg space-y-2 border">
                <p class="font-medium text-blue-900">${result.summary}</p>
                <div class="pt-1">
                    <span class="font-semibold text-gray-700">Departemen Terkait:</span> 
                    ${result.departments.map(d => `<span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-semibold">${d}</span>`).join(" ")}
                </div>
                <p class="text-gray-700 pt-1"><strong>Rekomendasi Tindakan:</strong> ${result.actionPlan}</p>
            </div>
        `;

        resultSection.classList.remove("hidden");
        renderHistory();
    }

    function renderHistory() {
        const data = StorageManager.getComplaints();
        historyTable.innerHTML = "";

        if (data.length === 0) {
            historyTable.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">Belum ada riwayat komplain.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-gray-50 border-b";
            tr.innerHTML = `
                <td class="p-3 text-xs text-gray-500 whitespace-nowrap">${item.date}</td>
                <td class="p-3 font-medium text-gray-800">${item.original}</td>
                <td class="p-3">${item.departments.map(d => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold mr-1">${d}</span>`).join("")}</td>
                <td class="p-3 text-gray-600 text-xs">${item.actionPlan}</td>
            `;
            historyTable.appendChild(tr);
        });
    }
});