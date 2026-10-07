// server/routes/locations.js
// -----------------------------------------------------------------------------
// Routes for locations.
//
// server.js mounts this router at '/api', so the full URLs are:
//   GET /api/locations       -> all locations
//   GET /api/locations/:id   -> one location
// -----------------------------------------------------------------------------

import express from 'express'

// Controllers that talk to the database (see controllers/locations.js).
// ES modules require the .js extension in relative imports.
import { getLocations, getLocationById } from '../controllers/locations.js'

const router = express.Router()

// Paths here are relative to wherever the router is mounted ('/api').
router.get('/locations', getLocations)
router.get('/locations/:id', getLocationById)

// NOTE: the starter template says `export default Router` (capital R). That is
// a typo: the variable above is lowercase `router`.
export default router
