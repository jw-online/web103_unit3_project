// server/controllers/locations.js
// -----------------------------------------------------------------------------
// Controller functions for the `locations` table.
//
// Each function is an Express handler: (req, res) => { ... }.
// The routes file (routes/locations.js) imports these and attaches them to URLs.
//
// Column names used here match the schema created in config/reset.js:
//   locations(id, name, city, state, description, image)
// -----------------------------------------------------------------------------

import { pool } from '../config/database.js'

// GET /api/locations
// Returns every location, sorted alphabetically so the front page order is stable.
export const getLocations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name ASC')
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('getLocations error:', error)
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
}

// GET /api/locations/:id
// Returns a single location (used for the detail page header).
export const getLocationById = async (req, res) => {
  // URL params are always strings, so convert to a number and validate it.
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Location id must be a number' })
  }

  try {
    // $1 is a parameterized value, which protects against SQL injection.
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [id])

    // rows is an empty array when nothing matches.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('getLocationById error:', error)
    res.status(500).json({ error: 'Failed to fetch location' })
  }
}
