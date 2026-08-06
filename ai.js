// stayZIN Insight AI Engine v2.0
function processComplaintAI(text, room, impact) {
    const textLower = text.toLowerCase();
    let departments = [];
    let actions = [];
    let severityScore = 1;

    // 1. DEPARTMENT IDENTIFICATION & SEVERITY WEIGHT
    if (textLower.includes("kotor") || textLower.includes("seprai") || textLower.includes("handuk") || textLower.includes("hk") || textLower.includes("bau") || textLower.includes("sampah") || textLower.includes("linen") || textLower.includes("kecoa") || textLower.includes("serangga")) {
        departments.push("Housekeeping");
        actions.push("• HK: Inspeksi ulang kamar, re-clean, dan ganti linen/amenities.");
        severityScore += 1;
    }

    if (textLower.includes("ac") || textLower.includes("dingin") || textLower.includes("panas") || textLower.includes("bocor") || textLower.includes("air") || textLower.includes("lampu") || textLower.includes("tv") || textLower.includes("kipas") || textLower.includes("fan") || textLower.includes("outlet") || textLower.includes("power") || textLower.includes("matif")) {
        departments.push("Engineering");
        actions.push("• ENG: Cek teknis mendesak & lakukan perbaikan fasilitas.");
        severityScore += 1;
    }

    if (textLower.includes("check in") || textLower.includes("check out") || textLower.includes("staf") || textLower.includes("lama") || textLower.includes("antri") || textLower.includes("ramah") || textLower.includes("lobby") || textLower.includes("sopan")) {
        departments.push("Front Office");
        actions.push("• FO: Follow up komunikasi langsung & jamin kelancaran alur tamu.");
        severityScore += 1;
    }

    if (departments.length === 0) {
        departments.push("Management");
        actions.push("• MGMT: Duty Manager langsung handle & investigasi masalah.");
    }

    // Adjust severity by Impact Input
    if (impact === "Medium") severityScore += 1;
    if (impact === "High") severityScore += 2;

    // 2. SEVERITY MATRIX EVALUATION
    let severityLevel = "LOW";
    let severityBadgeClass = "bg-green-100 text-green-800";
    if (severityScore >= 3 && severityScore < 4) {
        severityLevel = "MEDIUM";
        severityBadgeClass = "bg-amber-100 text-amber-800";
    } else if (severityScore >= 4) {
        severityLevel = "HIGH / CRITICAL";
        severityBadgeClass = "bg-rose-100 text-rose-800";
    }

    // 3. REVIEW RISK PREDICTION
    let reviewRisk = "🟢 Low Risk (Bisa diselesaikan dengan perbaikan cepat)";
    if (severityLevel === "MEDIUM") {
        reviewRisk = "🟡 Medium Risk (Potensi review 3-4 bintang jika tak ada ucapan maaf)";
    } else if (severityLevel === "HIGH / CRITICAL") {
        reviewRisk = "🔴 High Risk (Risiko tinggi review 1-2 bintang di Google/OTA!)";
    }

    // 4. AI RECOVERY RECOMMENDATION
    let recoveryPlan = actions.join("\n");
    if (severityLevel === "HIGH / CRITICAL") {
        recoveryPlan += "\n🎁 RECOVERY INITIATIVE: Berikan complimentary drink/breakfast voucher atau tawarkan pindah kamar (room move) segera + Personal Apology dari Duty Manager.";
    } else if (severityLevel === "MEDIUM") {
        recoveryPlan += "\n☕ RECOVERY INITIATIVE: Berikan welcome drink/late check-out gratis 1 jam sebagai bentuk empati.";
    }

    return {
        departments,
        severityLevel,
        severityBadgeClass,
        reviewRisk,
        recoveryPlan
    };
}
