import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
// Loads server/.env into process.env. Using the side-effect import (instead of
// calling dotenv.config() further down) guarantees it runs BEFORE the router
// imports below. ES module imports are hoisted, so database.js (imported by the
// controllers) would otherwise load before the env vars exist.
import 'dotenv/config'
// Allows the React client (a different origin, e.g. localhost:5173) to call this
// API directly by its full URL. Install with: npm install cors
import cors from 'cors'

// import the router from your routes file
import locationsRouter from './routes/locations.js'
import eventsRouter from './routes/events.js'

const PORT = process.env.PORT || 3000

const app = express()

// Must come before the routes so every API response gets the CORS headers.
app.use(cors())

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(favicon(path.resolve('../', 'client', 'public', 'party.png')))
}
else if (process.env.NODE_ENV === 'production') {
    app.use(favicon(path.resolve('public', 'party.png')))
    app.use(express.static('public'))
}

// specify the api path for the server to use
// Both routers are mounted under /api, e.g. /api/locations and /api/events
app.use('/api', locationsRouter)
app.use('/api', eventsRouter)

// This catch-all must stay AFTER the /api routes, otherwise it would swallow
// API requests and return index.html instead of JSON.
if (process.env.NODE_ENV === 'production') {
    app.get('/*', (_, res) =>
        res.sendFile(path.resolve('public', 'index.html'))
    )
}

app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`)
})
