import { events } from '@/data/events';
import { EventCard } from '@/components/EventCard';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const upcoming = events.filter(e => e.status === 'upcoming' || e.status === 'live');
  const past = events.filter(e => e.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UFC Events</h1>
            <p className="text-muted-foreground mt-1">
              Upcoming cards with betting system analysis
            </p>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-500">
            {events.length} {events.length === 1 ? 'Event' : 'Events'}
          </Badge>
        </div>
      </header>

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming</h2>
          <div className="grid gap-4">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Past Events</h2>
          <div className="grid gap-4">
            {past.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Tap any event to see matchup breakdowns</p>
        <p className="mt-1 text-xs">
          Built for Dave &bull; Odds via The Odds API &bull; Stats via UFCStats
        </p>
      </footer>
    </div>
  );
}
