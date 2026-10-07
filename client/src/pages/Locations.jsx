// client/src/pages/Locations.jsx
// -----------------------------------------------------------------------------
// Front page. Shows a title and one image card per location. Clicking a card
// navigates to that location's events page (/locations/:id).
// -----------------------------------------------------------------------------

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllLocations } from '../services/LocationsAPI'
import '../css/Pages.css'

const Locations = () => {
  // locations: data from the API; loading/error drive what the page shows.
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the page first mounts (empty dependency array).
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await getAllLocations()
        setLocations(data)
      } catch (err) {
        console.error(err)
        setError('Could not load locations. Is the server running?')
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  if (loading) return <p className="status-message">Loading locations…</p>
  if (error) return <p className="status-message error">{error}</p>

  return (
    <main className="page">
      <h1 className="page-title">California Music Events</h1>
      <p className="page-subtitle">Pick a city to see what's playing.</p>

      <div className="location-grid">
        {locations.map((location) => (
          // The whole card is a link, so the entire image is clickable.
          <Link
            key={location.id}
            to={`/locations/${location.id}`}
            className="location-card"
          >
            {/* The card's gradient background shows if the image is missing. */}
            {location.image && (
              <img
                src={location.image}
                alt={location.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className="location-card-overlay">
              <h2>{location.name}</h2>
              <p>{location.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Locations
