'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MatchupCard } from '@/components/MatchupCard';
import { getEvent } from '@/data/events';
import { getFighterByName } from '@/data/fighters';
import { evaluateAllSystems } from '@/lib/systems';
import type { Matchup } from '@/types';
import { format, parseISO } from 'date-fns';

interface OddsData {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number }>;
    }>;
  }>;
}

function getConsensusOddsFromApi(oddsData: OddsData[], fighterName: string): number | null {
  for (const fight of oddsData) {
    if (
      fight.home_team.toLowerCase().includes(fighterName.toLowerCase()) ||
      fight.away_team.toLowerCase().includes(fighterName.toLowerCase())
    ) {
      const prices: number[] = [];
      for (const bm of fight.bookmakers) {
        for (const market of bm.markets) {
          const outcome = market.outcomes.find(o =>
            o.name.toLowerCase().includes(fighterName.toLowerCase())
          );
          if (outcome) prices.push(outcome.price);
        }
      }
      if (prices.length > 0) {
        return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      }
    }
  }
  return null;
}

export default function EventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const event = getEvent(eventId);
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [oddsLoading, setOddsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/odds')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOddsData(data);
      })
      .catch(() => {})
      .finally(() => setOddsLoading(false));
  }, []);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
        <Link href="/" className="text-red-600 hover:underline mt-4 block">
          Back to Events
        </Link>
      </div>
    );
  }

  const dateFormatted = format(parseISO(event.date), 'EEEE, MMMM d, yyyy');

  // Enrich matchups with live odds and re-evaluate systems
  const enrichedMatchups: Array<{
    matchup: Matchup;
    odds: { fighter1: number | null; fighter2: number | null };
  }> = event.matchups.map(matchup => {
    const f1Odds = getConsensusOddsFromApi(oddsData, matchup.fighter1.name);
    const f2Odds = getConsensusOddsFromApi(oddsData, matchup.fighter2.name);

    // Re-evaluate systems with odds data
    if (f1Odds !== null || f2Odds !== null) {
      const oddsForSystem = {
        id: matchup.id,
        commenceTime: '',
        homeTeam: matchup.fighter1.name,
        awayTeam: matchup.fighter2.name,
        bookmakers: oddsData
          .filter(o =>
            o.home_team.toLowerCase().includes(matchup.fighter1.name.split(' ').pop()!.toLowerCase()) ||
            o.away_team.toLowerCase().includes(matchup.fighter1.name.split(' ').pop()!.toLowerCase())
          )
          .flatMap(o => o.bookmakers.map(bm => ({
            key: bm.key,
            title: bm.title,
            lastUpdate: bm.last_update,
            outcomes: bm.markets.flatMap(m => m.outcomes),
          }))),
      };
      matchup = {
        ...matchup,
        odds: oddsForSystem,
        systems: evaluateAllSystems({ ...matchup, odds: oddsForSystem }),
      };
    }

    return {
      matchup,
      odds: { fighter1: f1Odds, fighter2: f2Odds },
    };
  });

  const mainCard = enrichedMatchups.filter(({ matchup }) => matchup.isMainEvent || enrichedMatchups.indexOf({ matchup, odds: { fighter1: null, fighter2: null } }) < 5);
  const prelimCard = enrichedMatchups.slice(5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-6">
        <Link href="/" className="text-sm text-red-600 hover:underline mb-4 inline-block">
          &larr; Back to Events
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="secondary">{dateFormatted}</Badge>
          <Badge variant="outline">{event.location}</Badge>
          <Badge variant="outline" className="text-red-600 border-red-500">
            {event.matchups.length} Fights
          </Badge>
        </div>

        {oddsLoading && (
          <p className="text-sm text-muted-foreground mt-2 animate-pulse">Loading live odds...</p>
        )}
        {!oddsLoading && oddsData.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">Live odds from DraftKings, FanDuel, BetMGM, and more</p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {enrichedMatchups.filter(({ matchup }) => matchup.systems.filter(s => s.triggered).length >= 3).length}
            </div>
            <div className="text-xs text-muted-foreground">Hot Fights</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {enrichedMatchups.reduce((sum, { matchup }) => sum + matchup.systems.filter(s => s.triggered).length, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Systems Hit</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-500">{event.matchups.length}</div>
            <div className="text-xs text-muted-foreground">Total Fights</div>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Main Card</h2>
        <div className="space-y-3">
          {enrichedMatchups.slice(0, 5).map(({ matchup, odds }) => (
            <MatchupCard key={matchup.id} matchup={matchup} eventId={eventId} odds={odds} />
          ))}
        </div>
      </section>

      {/* Prelims */}
      {enrichedMatchups.length > 5 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Prelims</h2>
          <div className="space-y-3">
            {enrichedMatchups.slice(5).map(({ matchup, odds }) => (
              <MatchupCard key={matchup.id} matchup={matchup} eventId={eventId} odds={odds} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Tap any fighter to see detailed stats</p>
        <p className="mt-1 text-xs">
          Odds update hourly &bull; Not financial advice
        </p>
      </footer>
    </div>
  );
}
