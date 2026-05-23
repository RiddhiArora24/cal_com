const prisma = require('../config/db');

exports.createBooking = async (req, res) => {
  const { eventTypeId, bookerName, bookerEmail, date, startTime } = req.body;

  try {
    // 1. Pehle Event Type details uthao taaki meeting ki duration pata chal sake
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId }
    });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    // 2. User ki requested date se Day of Week nikallo (e.g., "Wednesday")
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    // 3. Find Availability: Pehle Date Override check karo, nahi toh Weekly standard
    let availability = await prisma.availability.findFirst({
      where: { date: date, isActive: true }
    });

    if (!availability) {
      // Agar specific date exception nahi hai, toh regular weekly day check karo
      availability = await prisma.availability.findFirst({
        where: { dayOfWeek: dayOfWeek, date: null, isActive: true }
      });
    }

    // Agar us din host available hi nahi hai
    if (!availability) {
      return res.status(400).json({ 
        error: `Host is not accepting bookings on this day (${date})!` 
      });
    }

    // 4. TIME VALIDATION MATRIX (String to Minutes comparison)
    // Helper function: "09:30" ko 570 minutes mein convert karne ke liye
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedStart = timeToMinutes(startTime);
    const requestedEnd = requestedStart + eventType.duration; // e.g., 10:30 + 15 min = 10:45
    
    const allowedStart = timeToMinutes(availability.startTime); // e.g., 09:02
    const allowedEnd = timeToMinutes(availability.endTime);     // e.g., 16:05

    // Strict boundary condition check
    if (requestedStart < allowedStart || requestedEnd > allowedEnd) {
      return res.status(400).json({ 
        error: `Selected slot ${startTime} is out of bounds! Allowed window is between ${availability.startTime} and ${availability.endTime}.` 
      });
    }

    // 5. Double Booking Check: Check karo kya same date-time par pehle se koi booked hai
    const existingBooking = await prisma.booking.findUnique({
      where: {
        date_startTime: { date, startTime }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: "This time slot is already booked by someone else!" });
    }

    // 6. Agar saari conditions paas ho gayi, toh booking database me save kar do
    const newBooking = await prisma.booking.create({
      data: {
        eventTypeId,
        bookerName,
        bookerEmail,
        date,
        startTime
      }
    });

    return res.status(201).json({ 
      success: true, 
      message: "Booking confirmed successfully! 🚀", 
      booking: newBooking 
    });

  } catch (error) {
    console.error("Booking verification crash:", error);
    return res.status(500).json({ error: "Internal server error during booking validation." });
  }
};
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { eventType: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch bookings dataset.', details: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Booking successfully canceled and slot freed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Cancellation pipeline failed.', details: err.message });
  }
};