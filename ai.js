// stayZIN Insight Machine Learning Engine v2.0
function analyzeComplaintAI(text, room, impact, guestName) {
    const lower = text.toLowerCase();
    
    let dept = "Management";
    let category = "General Service";
    let subCategory = "Operational Issue";
    let rootCause = "Unspecified Operational Failure";
    let priority = "Medium";
    let severityScore = 50;
    let reviewRiskPct = 50;
    let predictedStar = "⭐⭐⭐ (3/5)";
    let sentiment = "Negative";
    let revenueAtRisk = 500000; // IDR

    let recoveryChecklist = ["Apology Letter from Management"];

    // 🧠 MACHINE LEARNING KNOWLEDGE BASE (Pola Kata Kunci)
    if (lower.includes("musty") || lower.includes("bau") || lower.includes("apek") || lower.includes("kotor") || lower.includes("humidity") || lower.includes("lembap") || lower.includes("mold") || lower.includes("jamur") || lower.includes("sprei") || lower.includes("serangga") || lower.includes("kecoa")) {
        dept = "Housekeeping";
        category = "Humidity / Cleanliness";
        if (lower.includes("bau") || lower.includes("musty") || lower.includes("apek") || lower.includes("lembap")) {
            subCategory = "Musty Smell / Moldy Room";
            rootCause = "High Room Humidity & Lack of Ventilation / Dehumidifier";
            recoveryChecklist.push("Deep Cleaning & Air Purifier", "Room Move Offer", "Fruit Basket");
        } else {
            subCategory = "Linen / Sanitation";
            rootCause = "Inadequate Housekeeping Inspection SOP";
            recoveryChecklist.push("Re-clean Room & Replace Linen", "Late Check-out Offer");
        }
        severityScore += 25;
    } 
    else if (lower.includes("ac") || lower.includes("dingin") || lower.includes("panas") || lower.includes("bocor") || lower.includes("air") || lower.includes("matif") || lower.includes("tv") || lower.includes("bising") || lower.includes("wifi")) {
        dept = "Engineering";
        category = "Facilities & AC";
        subCategory = lower.includes("ac") ? "AC Malfunction / Water Leakage" : "Hardware / Network Failure";
        rootCause = "Preventive Maintenance Schedule Lapse";
        recoveryChecklist.push("Immediate Engineering Fix", "Drink Voucher at Bar", "Room Upgrade");
        severityScore += 30;
    }
    else if (lower.includes("check in") || lower.includes("lama") || lower.includes("staf") || lower.includes("ramah") || lower.includes("antri") || lower.includes("sopan")) {
        dept = "Front Office";
        category = "Service Speed & Courtesy";
        subCategory = "Check-in Delay / Staff Attitude";
        rootCause = "Peak Hour Staffing Shortage / Communication Gap";
        recoveryChecklist.push("Duty Manager Apology", "Welcome Drink / Discount Voucher");
        severityScore += 20;
    }

    // Dynamic Impact Multiplier
    if (impact === "High") {
        severityScore += 20;
        priority = "Critical";
        reviewRiskPct = 90;
        predictedStar = "⭐ (1/5)";
        revenueAtRisk = 2500000;
        recoveryChecklist.push("Full Room Upgrade", "Complimentary Dinner / Discount");
    } else if (impact === "Medium") {
        severityScore += 10;
        priority = "High";
        reviewRiskPct = 65;
        predictedStar = "⭐⭐⭐ (3/5)";
        revenueAtRisk = 1200000;
    } else {
        priority = "Low";
        reviewRiskPct = 25;
        predictedStar = "⭐⭐⭐⭐ (4/5)";
        revenueAtRisk = 300000;
    }

    severityScore = Math.min(Math.max(severityScore, 10), 99);

    const summary = `Komplain terkait ${category} (${subCategory}) di Kamar ${room}. Terindikasi disebabkan oleh ${rootCause}. Risiko ulasan negatif mencapai ${reviewRiskPct}%.`;

    return {
        dept,
        category,
        subCategory,
        rootCause,
        priority,
        severityScore,
        reviewRiskPct,
        predictedStar,
        sentiment,
        revenueAtRisk,
        recoveryChecklist,
        summary
    };
}
