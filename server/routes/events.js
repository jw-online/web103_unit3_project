// server/routes/events.js
// -----------------------------------------------------------------------------
// Routes for events.
//
// server.js mounts this router at '/api', so the full URLs are:
//   GET /api/events                          -> all events
//   GET /api/events/:id                      -> one event
//   GET /api/locations/:locationId/events    -> all events at one location
// -----------------------------------------------------------------------------

import express from 'express'

// Controllers that talk to the database (see controllers/events.js).
import {
  getEvents,
  getEventById,
  getEventsByLocation,
} from '../controllers/events.js'

const router = express.Router()

router.get('/events', getEvents)
router.get('/events/:id', getEventById)

// This nested route lives here (not in routes/locations.js) because it returns
// events. The param must be named :locationId because getEventsByLocation reads
// req.params.locationId. It does not conflict with '/locations/:id' in the
// locations router, since that path has fewer segments.
router.get('/locations/:locationId/events', getEventsByLocation)

export default router
