// client/src/pages/LocationEvents.jsx
// -----------------------------------------------------------------------------
// Detail page for one location, at its own URL: /locations/:id
// Shows the location's name and a list of its events.
// -----------------------------------------------------------------------------

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLocationById } from '../services/LocationsAPI'
import { getEventsByLocation } from '../services/EventsAPI'
import Event from '../components/Event'
import '../css/Pages.css'

const LocationEvents = () => {
  // Reads :id from the URL. Always a string, which is fine for building URLs.
  const { id } = useParams()

  const [location, setLocation] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Re-runs whenever `id` changes (e.g. navigating between locations).
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch both at the same time instead of one after the other.
        const [locationData, eventsData] = await Promise.all([
          getLocationById(id),
          getEventsByLocation(id),
        ])
        setLocation(locationData)
        setEvents(eventsData)
      } catch (err) {
        console.error(err)
        setError('Could not load this location. It may not exist.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) return <p className="status-message">Loading events…</p>
  if (error) {
    return (
      <main className="page">
        <p className="status-message error">{error}</p>
        <Link to="/" className="back-link">← Back to all locations</Link>
      </main>
    )
  }

  return (
    <main className="page">
      <Link to="/" className="back-link">← Back to all locations</Link>

      <h1 className="page-title">{location.name}</h1>
      <p className="page-subtitle">{location.description}</p>

      {events.length === 0 ? (
        <p className="status-message">No events listed for this location yet.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <Event key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  )
}

export default LocationEvents
