// server/config/reset.js
// -----------------------------------------------------------------------------
// Resets the database for the California Music Events app.
//
// What this script does (in order):
//   1. Drops the `events` and `locations` tables if they already exist
//   2. Creates both tables from scratch
//   3. Seeds 4 locations and 4 events (one event per location)
//
// Run it from the /server directory with:   node config/reset.js
// (or add  "reset": "node config/reset.js"  to server/package.json scripts
//  and run  npm run reset)
//
// WARNING: this DELETES all existing data in both tables every time it runs.
// -----------------------------------------------------------------------------

// Loads PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE from server/.env into
// process.env. This must come BEFORE importing database.js, because database.js
// reads process.env when the pool is created.
// (If you don't have it yet:  npm install dotenv)
import 'dotenv/config'

import { pool } from './database.js'

// -----------------------------------------------------------------------------
// SEED DATA
// -----------------------------------------------------------------------------
// TODO: The dates below are PLACEHOLDERS. Replace them (and the venue/ticket
// details) with the real information for each festival before you submit.
// Dates use ISO format: 'YYYY-MM-DD HH:MM:SS'. One is intentionally in the past
// so the stretch-feature "event has passed" styling can be tested.

const locationsData = [
    {
        name: 'Eureka',
        city: 'Eureka',
        state: 'California',
        description: 'Redwood-coast city in Humboldt County on the far north coast.',
        image: '/images/eureka.jpg', // TODO: add images to client/public/images
    },
    {
        name: 'Santa Cruz',
        city: 'Santa Cruz',
        state: 'California',
        description: 'Beach town on Monterey Bay surrounded by redwoods and mountains.',
        image: '/images/santa-cruz.jpg',
    },
    {
        name: 'Los Angeles',
        city: 'Los Angeles',
        state: 'California',
        description: 'Southern California’s sprawling music and culture hub.',
        image: '/images/los-angeles.jpg',
    },
    {
        name: 'San Diego',
        city: 'San Diego',
        state: 'California',
        description: 'Coastal city at the southern edge of California.',
        image: '/images/san-diego.jpg',
    },
]

// `location_name` is only used by this script to look up the matching location
// id after the locations are inserted. It is NOT a column in the events table.
const eventsData = [
    {
        title: 'North of Nowhere',
        location_name: 'Eureka',
        venue: 'TBD', // TODO
        event_date: '2026-07-10 12:00:00', // TODO: placeholder (past event)
        description: 'A music festival in Eureka, California.',
        image: '/images/north-of-nowhere.jpg',
        ticket_url: '', // TODO
    },
    {
        title: 'Eagle Rock Festival',
        location_name: 'Santa Cruz',
        venue: 'TBD', // TODO
        event_date: '2026-11-14 12:00:00', // TODO: placeholder
        description: 'A music festival in Santa Cruz, California.',
        image: '/images/eagle-rock-festival.jpg',
        ticket_url: '', // TODO
    },
    {
        title: 'Remember, Forget Festival',
        location_name: 'Los Angeles',
        venue: 'TBD', // TODO
        event_date: '2026-12-05 12:00:00', // TODO: placeholder
        description: 'A music festival in Los Angeles, California.',
        image: '/images/remember-forget-festival.jpg',
        ticket_url: '', // TODO
    },
    {
        title: 'Tomorrow! Today!',
        location_name: 'San Diego',
        venue: 'TBD', // TODO
        event_date: '2027-01-23 12:00:00', // TODO: placeholder
        description: 'A music festival in San Diego, California.',
        image: '/images/tomorrow-today.jpg',
        ticket_url: '', // TODO
    },
]

// -----------------------------------------------------------------------------
// STEP 1: CREATE TABLES
// -----------------------------------------------------------------------------
// Drop `events` first because it depends on `locations` through a foreign key.
// Create `locations` first for the same reason.
const createTables = async () => {
    const createTablesQuery = `
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS locations;

    CREATE TABLE locations (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL UNIQUE,
      city        VARCHAR(100) NOT NULL,
      state       VARCHAR(50)  NOT NULL DEFAULT 'California',
      description TEXT,
      image       VARCHAR(255)
    );

    CREATE TABLE events (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(150) NOT NULL,
      -- Links each event to exactly one location. ON DELETE CASCADE removes a
      -- location's events automatically if that location is deleted.
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      venue       VARCHAR(150),
      event_date  TIMESTAMP NOT NULL,  -- used for sorting and the countdown
      description TEXT,
      image       VARCHAR(255),
      ticket_url  VARCHAR(255)
    );
  `

    try {
        await pool.query(createTablesQuery)
        console.log('🎉 locations and events tables created successfully')
    } catch (err) {
        console.error('⚠️ error creating tables', err)
        throw err // stop the reset so we don't try to seed missing tables
    }
}

// -----------------------------------------------------------------------------
// STEP 2: SEED LOCATIONS
// -----------------------------------------------------------------------------
// Inserts each location and returns a map of { locationName: generatedId }
// so the events can be linked to the correct location_id in the next step.
const seedLocations = async () => {
    const locationIds = {}

    for (const location of locationsData) {
        // $1, $2... are parameterized values: they prevent SQL injection and
        // handle special characters (like the ’ in descriptions) safely.
        const insertQuery = `
      INSERT INTO locations (name, city, state, description, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name
    `
        const values = [
            location.name,
            location.city,
            location.state,
            location.description,
            location.image,
        ]

        try {
            const result = await pool.query(insertQuery, values)
            locationIds[result.rows[0].name] = result.rows[0].id
            console.log(`✅ ${location.name} added to locations`)
        } catch (err) {
            console.error(`⚠️ error inserting location ${location.name}`, err)
            throw err
        }
    }

    return locationIds
}

// -----------------------------------------------------------------------------
// STEP 3: SEED EVENTS
// -----------------------------------------------------------------------------
// Looks up each event's location_id from the map built in seedLocations().
const seedEvents = async (locationIds) => {
    for (const event of eventsData) {
        const insertQuery = `
      INSERT INTO events
        (title, location_id, venue, event_date, description, image, ticket_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
        const values = [
            event.title,
            locationIds[event.location_name], // foreign key to locations.id
            event.venue,
            event.event_date,
            event.description,
            event.image,
            event.ticket_url,
        ]

        try {
            await pool.query(insertQuery, values)
            console.log(`✅ ${event.title} added to events`)
        } catch (err) {
            console.error(`⚠️ error inserting event ${event.title}`, err)
            throw err
        }
    }
}

// -----------------------------------------------------------------------------
// RUN EVERYTHING
// -----------------------------------------------------------------------------
const resetDatabase = async () => {
    try {
        await createTables()
        const locationIds = await seedLocations()
        await seedEvents(locationIds)
        console.log('🌴 Database reset complete')
    } catch (err) {
        console.error('Database reset failed:', err.message)
        process.exitCode = 1
    } finally {
        // Close the connection pool so the script exits instead of hanging.
        await pool.end()
    }
}

resetDatabase()