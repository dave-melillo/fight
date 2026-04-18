'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UFCEvent } from '@/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
  event: UFCEvent;
}

export function EventCard({ event }: EventCardProps) {
  const mainEvent = event.matchups.find(m => m.isMainEvent);
  const totalFights = event.matchups.length;
  const dateFormatted = format(parseISO(event.date), 'EEEE, MMMM d, yyyy');

  const statusStyles = {
    upcoming: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    live: 'bg-red-500/20 text-red-700 border-red-500/30 animate-pulse',
    completed: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  };

  return (
    <Link href={`/event/${event.id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-red-600">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{event.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{dateFormatted}</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={statusStyles[event.status]}>
                {event.status === 'live' ? 'LIVE' : event.status.toUpperCase()}
              </Badge>
              <Badge variant="secondary">{totalFights} Fights</Badge>
            </div>
          </div>
        </CardHeader>
        {mainEvent && (
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Main Event
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="font-bold text-lg">{mainEvent.fighter1.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {mainEvent.fighter1.record.wins}-{mainEvent.fighter1.record.losses}
                    {mainEvent.fighter1.record.draws > 0 ? `-${mainEvent.fighter1.record.draws}` : ''}
                  </div>
                </div>
                <div className="px-4">
                  <span className="text-2xl font-bold text-red-600">VS</span>
                </div>
                <div className="text-center flex-1">
                  <div className="font-bold text-lg">{mainEvent.fighter2.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {mainEvent.fighter2.record.wins}-{mainEvent.fighter2.record.losses}
                    {mainEvent.fighter2.record.draws > 0 ? `-${mainEvent.fighter2.record.draws}` : ''}
                  </div>
                </div>
              </div>
              <div className="text-center mt-2">
                <Badge variant="outline">{mainEvent.weightClass}</Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
