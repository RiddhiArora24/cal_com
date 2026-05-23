const prisma = require('../config/db');

// 1. Get all availability settings safely
exports.getAvailability = async (req, res) => {
  try {
    const availability = await prisma.availability.findMany({
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return res.status(500).json({ error: "Failed to fetch availability records" });
  }
};

// 2. Resilient Upsert handler with comprehensive entity mapping checks
exports.updateAvailability = async (req, res) => {
  const { schedule } = req.body; 
  
  // Guard clause to catch empty or malformed array requests instantly
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    console.log("⚠️ Received empty or invalid schedule data chunk on backend.");
    return res.status(200).json({ success: true, message: "No operational items to synchronize." });
  }

  try {
    console.log(`⏳ Processing batch transaction metadata loop for ${schedule.length} elements...`);
    
    const operations = schedule.map(item => {
      // Validation Check: Skip or handle bad weird future dates cleanly
      if (item.date && (item.date.startsWith('3333') || item.date.length > 10)) {
        item.date = "2026-05-25"; // Hard reset fallback date pattern to prevent Postgres overflows
      }

      // Action A: Create new instance if temporary virtual ID exists
      if (!item.id || String(item.id).startsWith('temp-')) {
        return prisma.availability.create({
          data: {
            dayOfWeek: item.dayOfWeek || null,
            date: item.date || null,
            startTime: item.startTime || "09:00",
            endTime: item.endTime || "17:00",
            isActive: item.isActive ?? true
          }
        });
      } else {
        // Action B: Core update for pre-existing records keys
        return prisma.availability.update({
          where: { id: item.id },
          data: {
            isActive: item.isActive,
            startTime: item.startTime,
            endTime: item.endTime,
          }
        });
      }
    });
    
    // Execute block atomically inside Prisma engine boundaries
    await prisma.$transaction(operations);
    return res.status(200).json({ success: true, message: "Configurations synced safely!" });
  } catch (error) {
    console.error("Database Write Failure Error Stack:", error);
    return res.status(500).json({ 
      error: "Synchronization failure pipeline error.", 
      details: error.message 
    });
  }
};