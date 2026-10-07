// client/src/services/LocationsAPI.jsx
// -----------------------------------------------------------------------------
// Client-side functions that fetch location data from the Express API.
// Components call these instead of using fetch() directly, so the URLs live in
// one place.
// -----------------------------------------------------------------------------

// Full URL of the Express server. Set VITE_API_URL in client/.env to change it
// (for example to your deployed Render URL in production):
//   VITE_API_URL=https://your-app.onrender.com
// Falls back to the local dev server. Match the PORT in server/.env.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Shared helper: fetches a URL, throws if the server returned an error status
// (fetch itself only rejects on network failures, not on 404/500), and
// returns the parsed JSON.
const request = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`)
  }
  return response.json()
}

// GET /api/locations -> array of all locations
export const getAllLocations = () => request(`${API_BASE}/api/locations`)

// GET /api/locations/:id -> a single location object
export const getLocationById = (id) => request(`${API_BASE}/api/locations/${id}`)

export default { getAllLocations, getLocationById }
