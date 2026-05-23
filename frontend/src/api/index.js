import axios from 'axios';

const API = axios.create({
  baseURL: "https://cal-com-backend-k159.onrender.com/api",
});

// Clean, modular API handlers matching your professional controllers
export const fetchEventTypes = () => API.get('/event-types');
export const createEventType = (eventData) => API.post('/event-types', eventData);
export const deleteEventType = (id) => API.delete(`/event-types/${id}`);

export const fetchBookings = () => API.get('/bookings');
export const createBooking = (bookingData) => API.post('/bookings', bookingData);
export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

export const fetchAvailability = () => API.get('/availability');
export const updateAvailability = (scheduleData) => API.put('/availability', { schedule: scheduleData });