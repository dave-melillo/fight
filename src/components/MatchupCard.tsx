'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemBadge, SystemCountBadge, FighterStyleBadge } from '@/components/SystemBadge';
import type { Matchup } from '@/types';
import { getSystemCount } from '@/lib/systems';
import { cn } from '@/lib/utils';

interface MatchupCardProps {
  matchup: Matchup;
  eventId: string;
  odds?: { fighter1: number | null; fighter2: number | null };
}

function formatOdds(odds: number | null): string {
  if (odds === null) return '--';
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function OddsDisplay({ odds, isFavorite }: { odds: number | null; isFavorite: boolean }) {
  return (
    <span className={cn(
      'text-sm font-mono font-bold',
      odds === null ? 'text-gray-400' :
      isFavorite ? 'text-red-600' : 'text-gray-600'
    )}>
      {formatOdds(odds)}
    </span>
  );
}

export function MatchupCard({ matchup, eventId, odds }: MatchupCardProps) {
  const { fighter1, fighter2, systems } = matchup;

  const f1Systems = getSystemCount(systems, fighter1.id);
  const f2Systems = getSystemCount(systems, fighter2.id);
  const triggeredSystems = systems.filter(s => s.triggered);

  const f1Record = `${fighter1.record.wins}-${fighter1.record.losses}${fighter1.record.draws > 0 ? `-${fighter1.record.draws}` : ''}`;
  const f2Record = `${fighter2.record.wins}-${fighter2.record.losses}${fighter2.record.draws > 0 ? `-${fighter2.record.draws}` : ''}`;

  const f1Odds = odds?.fighter1 ?? null;
  const f2Odds = odds?.fighter2 ?? null;
  const f1IsFav = f1Odds !== null && f1Odds < 0;
  const f2IsFav = f2Odds !== null && f2Odds < 0;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      matchup.isMainEvent && 'border-l-4 border-l-red-600 bg-red-50/30'
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {matchup.isMainEvent && (
              <Badge className="bg-red-600 text-white">MAIN EVENT</Badge>
            )}
            <Badge variant="outline">{matchup.weightClass}</Badge>
            <Badge variant="secondary">{matchup.rounds} Rds</Badge>
          </div>
        </div>

        {/* Fighters */}
        <div className="flex items-center gap-4">
          {/* Fighter 1 */}
          <Link
            href={`/event/${eventId}/fighter/${fighter1.id}`}
            className="flex-1 text-center hover:bg-gray-50 rounded-lg p-3 transition-colors"
          >
            <div className="font-bold text-lg">{fighter1.name}</div>
            {fighter1.nickname && (
              <div className="text-xs text-muted-foreground italic">&quot;{fighter1.nickname}&quot;</div>
            )}
            <div className="text-sm text-muted-foreground">{f1Record}</div>
            <OddsDisplay odds={f1Odds} isFavorite={f1IsFav} />
            <div className="mt-2 flex justify-center gap-1 flex-wrap">
              <FighterStyleBadge style={fighter1.style} finishType={fighter1.finishType} />
              <SystemCountBadge count={f1Systems} />
            </div>
          </Link>

          {/* VS */}
          <div className="text-2xl font-bold text-red-600 shrink-0">VS</div>

          {/* Fighter 2 */}
          <Link
            href={`/event/${eventId}/fighter/${fighter2.id}`}
            className="flex-1 text-center hover:bg-gray-50 rounded-lg p-3 transition-colors"
          >
            <div className="font-bold text-lg">{fighter2.name}</div>
            {fighter2.nickname && (
              <div className="text-xs text-muted-foreground italic">&quot;{fighter2.nickname}&quot;</div>
            )}
            <div className="text-sm text-muted-foreground">{f2Record}</div>
            <OddsDisplay odds={f2Odds} isFavorite={f2IsFav} />
            <div className="mt-2 flex justify-center gap-1 flex-wrap">
              <FighterStyleBadge style={fighter2.style} finishType={fighter2.finishType} />
              <SystemCountBadge count={f2Systems} />
            </div>
          </Link>
        </div>

        {/* Triggered Systems */}
        {triggeredSystems.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1.5">
              {triggeredSystems.map(sys => (
                <SystemBadge key={sys.id} system={sys} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
