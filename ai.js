function processComplaintAI(text) {
    const textLower = text.toLowerCase();
    let departments = [];
    let actions = [];

    // Housekeeping
    if (textLower.includes("kotor") || textLower.includes("seprai") || textLower.includes("handuk") || textLower.includes("hk") || textLower.includes("bau") || textLower.includes("sampah") || textLower.includes("linen")) {
        departments.push("Housekeeping");
        actions.push("Lakukan re-clean/inspeksi kamar & penggantian linen segera.");
    }

    // Engineering
    if (textLower.includes("ac") || textLower.includes("dingin") || textLower.includes("panas") || textLower.includes("bocor") || textLower.includes("air") || textLower.includes("lampu") || textLower.includes("tv") || textLower.includes("kipas") || textLower.includes("fan") || textLower.includes("outlet") || textLower.includes("power")) {
        departments.push("Engineering");
        actions.push("Pemeriksaan teknis fasilitas & perbaikan oleh tim Engineering.");
    }

    // Front Office
    if (textLower.includes("check in") || textLower.includes("check out") || textLower.includes("staf") || textLower.includes("lama") || textLower.includes("antri") || textLower.includes("ramah") || textLower.includes("lobby")) {
        departments.push("Front Office");
        actions.push("Koordinasi alur tamu & briefing pelayanan staf FO.");
    }

    // Default Management
    if (departments.length === 0) {
        departments.push("Management");
        actions.push("Eskalasi langsung ke Duty Manager / GM untuk penanganan personal.");
    }

    return {
        departments: departments,
        actionPlan: actions.join(" "),
        summary: `Terdeteksi ${departments.length} penanganan departemen (${departments.join(", ")})`
    };
}