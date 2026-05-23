const prisma = require('../config/db');

// 1. Get all event types safely
exports.getAllEventTypes = async (req, res) => {
  try {
    const types = await prisma.eventType.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(types);
  } catch (error) {
    console.error("❌ Error fetching event types:", error);
    return res.status(500).json({ error: "Failed to fetch event types records" });
  }
};

// 2. Create Event Type with absolute strict parameter parsing
exports.createEventType = async (req, res) => {
  let { title, description, duration, slug } = req.body;

  try {
    // Basic Guard check clauses
    if (!title || !slug) {
      return res.status(400).json({ error: "Title and URL Slug are mandatory fields." });
    }

    // 🔥 CRITICAL FIX: Frontend dropdown string input ko absolute integer mein convert karna
    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration)) {
      return res.status(400).json({ error: "Duration must be a valid numeric integer value." });
    }

    // Safe slug transformation (spaces ko hyphens mein convert karna aur clean format)
    const cleanedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

    // Duplicate Check: Check karo kya same slug ka event pehle se database mein hai?
    const existingEvent = await prisma.eventType.findUnique({
      where: { slug: cleanedSlug }
    });

    if (existingEvent) {
      return res.status(400).json({ error: `An event layer with slug '${cleanedSlug}' already exists!` });
    }

    console.log(`⏳ Writing new Event Module '${title}' into Neon cluster data layers...`);

    // Create database entry parameters
    const newEvent = await prisma.eventType.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        duration: parsedDuration, // Injected as native integer type
        slug: cleanedSlug
      }
    });

    return res.status(201).json(newEvent);

  } catch (error) {
    console.error("❌ Event Creation Failure Engine Error Stack:", error);
    return res.status(500).json({ 
      error: "Internal Server Error during model instance compilation.",
      details: error.message 
    });
  }
};

// 3. Delete event type module
exports.deleteEventType = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.eventType.delete({
      where: { id: id }
    });
    return res.status(200).json({ success: true, message: "Event type dropped safely." });
  } catch (error) {
    console.error("❌ Error dropping event layer entry:", error);
    return res.status(500).json({ error: "Failed to delete target event block structure." });
  }
};