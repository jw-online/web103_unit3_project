// client/src/components/Event.jsx
// -----------------------------------------------------------------------------
// A single event card. Reused anywhere events are listed (the location detail
// page now, and the stretch "all events" page later).
//
// Props: `event` is one row from the API:
//   { id, title, location_id, location_name, venue, event_date,
//     description, image, ticket_url }
// -----------------------------------------------------------------------------

import '../css/Event.css'

// Turns the ISO timestamp from the API into something readable,
// e.g. "Saturday, November 14, 2026 at 12:00 PM".
const formatDate = (isoString) =>
  new Date(isoString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const Event = ({ event }) => {
  return (
    <article className="event-card">
      {/* Image on the left. If the file is missing, hide it and let the
          gradient background on .event-image show instead. */}
      <div className="event-image">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
      </div>

      <div className="event-info">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">{formatDate(event.event_date)}</p>

        {/* Only show the venue when we have a real one (the seed uses 'TBD'
            as a placeholder, which is still fine to display). */}
        {event.venue && <p className="event-venue">📍 {event.venue}</p>}

        {event.description && (
          <p className="event-description">{event.description}</p>
        )}

        {/* Only render the button when a ticket link exists. */}
        {event.ticket_url && (
          <a
            className="event-ticket-link"
            href={event.ticket_url}
            target="_blank"
            rel="noreferrer"
          >
            Get tickets
          </a>
        )}
      </div>
    </article>
  )
}

export default Event
