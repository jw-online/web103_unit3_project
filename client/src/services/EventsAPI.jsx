// client/src/services/EventsAPI.jsx
// -----------------------------------------------------------------------------
// Client-side functions that fetch event data from the Express API.
// Every event returned includes `location_name` (the server JOINs locations).
// -----------------------------------------------------------------------------

// Full URL of the Express server. Set VITE_API_URL in client/.env to change it
// (for example to your deployed Render URL in production). Same value as in
// LocationsAPI.jsx. Falls back to the local dev server.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Shared helper: fetches a URL, throws on a non-2xx status, returns parsed JSON.
const request = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`)
  }
  return response.json()
}

// GET /api/events -> array of all events, soonest first
export const getAllEvents = () => request(`${API_BASE}/api/events`)

// GET /api/events/:id -> a single event object
export const getEventById = (id) => request(`${API_BASE}/api/events/${id}`)

// GET /api/locations/:locationId/events -> events at one location
export const getEventsByLocation = (locationId) =>
  request(`${API_BASE}/api/locations/${locationId}/events`)

export default { getAllEvents, getEventById, getEventsByLocation }
