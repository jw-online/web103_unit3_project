// server/controllers/events.js
// -----------------------------------------------------------------------------
// Controller functions for the `events` table.
//
// Column names used here match the schema created in config/reset.js:
//   events(id, title, location_id, venue, event_date, description, image, ticket_url)
//
// Every query JOINs `locations` so each event also carries its location's name.
// That means the "all events" page can show or filter by location without a
// second API call.
// -----------------------------------------------------------------------------

import { pool } from '../config/database.js'

// Shared SELECT used by all three queries below, so the response shape is
// identical everywhere: every event column plus `location_name`.
const BASE_QUERY = `
  SELECT events.*, locations.name AS location_name
  FROM events
  JOIN locations ON events.location_id = locations.id
`

// Parses a URL param into an integer, or returns null if it isn't one.
const parseId = (value) => {
  const id = parseInt(value, 10)
  return Number.isNaN(id) ? null : id
}

// GET /api/events
// Returns every event, soonest first (supports the stretch "all events" page).
export const getEvents = async (req, res) => {
  try {
    const result = await pool.query(`${BASE_QUERY} ORDER BY events.event_date ASC`)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('getEvents error:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

// GET /api/events/:id
// Returns a single event.
export const getEventById = async (req, res) => {
  const id = parseId(req.params.id)
  if (id === null) {
    return res.status(400).json({ error: 'Event id must be a number' })
  }

  try {
    const result = await pool.query(`${BASE_QUERY} WHERE events.id = $1`, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('getEventById error:', error)
    res.status(500).json({ error: 'Failed to fetch event' })
  }
}

// GET /api/locations/:locationId/events
// Returns all events for one location (powers the location detail page).
// The route param name must match what routes/events.js defines: :locationId
export const getEventsByLocation = async (req, res) => {
  const locationId = parseId(req.params.locationId)
  if (locationId === null) {
    return res.status(400).json({ error: 'Location id must be a number' })
  }

  try {
    const result = await pool.query(
      `${BASE_QUERY} WHERE events.location_id = $1 ORDER BY events.event_date ASC`,
      [locationId]
    )

    // An empty array is a valid answer: the location exists but has no events.
    // (A nonexistent location also returns [], which is fine for this project.
    // The front end gets the location itself from getLocationById.)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('getEventsByLocation error:', error)
    res.status(500).json({ error: 'Failed to fetch events for this location' })
  }
}
