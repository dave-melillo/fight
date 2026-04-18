'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemCountBadge, FighterStyleBadge } from '@/components/SystemBadge';
import type { Matchup, Fighter } from '@/types';
import { getSystemCount, calculateFightScore, SYSTEM_DESCRIPTIONS } from '@/lib/systems';
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

function FightScore({ score }: { score: number }) {
  const color = score >= 75 ? 'text-red-600 bg-red-50 border-red-200'
    : score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-gray-500 bg-gray-50 border-gray-200';

  return (
    <div className={cn('rounded-lg border px-3 py-1.5 text-center', color)}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">FIGHT</div>
      <div className="text-2xl font-black">{score}</div>
    </div>
  );
}

export function MatchupCard({ matchup, eventId, odds }: MatchupCardProps) {
  const { fighter1, fighter2, systems } = matchup;

  const f1Systems = getSystemCount(systems, fighter1.id);
  const f2Systems = getSystemCount(systems, fighter2.id);

  const f1Score = calculateFightScore(fighter1, fighter2, systems);
  const f2Score = calculateFightScore(fighter2, fighter1, systems);

  const f1Record = `${fighter1.record.wins}-${fighter1.record.losses}${fighter1.record.draws > 0 ? `-${fighter1.record.draws}` : ''}`;
  const f2Record = `${fighter2.record.wins}-${fighter2.record.losses}${fighter2.record.draws > 0 ? `-${fighter2.record.draws}` : ''}`;

  const f1Odds = odds?.fighter1 ?? null;
  const f2Odds = odds?.fighter2 ?? null;
  const f1IsFav = f1Odds !== null && f1Odds < 0;
  const f2IsFav = f2Odds !== null && f2Odds < 0;

  // Group systems by which fighter they favor
  const f1TriggeredSystems = systems.filter(s => s.triggered && s.favoredFighter === fighter1.id);
  const f2TriggeredSystems = systems.filter(s => s.triggered && s.favoredFighter === fighter2.id);

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
        <div className="flex items-stretch gap-2 sm:gap-4">
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
            <span className={cn(
              'text-sm font-mono font-bold',
              f1Odds === null ? 'text-gray-400' : f1IsFav ? 'text-red-600' : 'text-green-700'
            )}>
              {formatOdds(f1Odds)}
            </span>
            <div className="mt-2">
              <FightScore score={f1Score} />
            </div>
            <div className="mt-2 flex justify-center gap-1 flex-wrap">
              <FighterStyleBadge style={fighter1.style} finishType={fighter1.finishType} />
              <SystemCountBadge count={f1Systems} />
            </div>
          </Link>

          {/* VS */}
          <div className="flex items-center text-2xl font-bold text-red-600 shrink-0">VS</div>

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
            <span className={cn(
              'text-sm font-mono font-bold',
              f2Odds === null ? 'text-gray-400' : f2IsFav ? 'text-red-600' : 'text-green-700'
            )}>
              {formatOdds(f2Odds)}
            </span>
            <div className="mt-2">
              <FightScore score={f2Score} />
            </div>
            <div className="mt-2 flex justify-center gap-1 flex-wrap">
              <FighterStyleBadge style={fighter2.style} finishType={fighter2.finishType} />
              <SystemCountBadge count={f2Systems} />
            </div>
          </Link>
        </div>

        {/* Systems - now clearly attributed to each fighter */}
        {(f1TriggeredSystems.length > 0 || f2TriggeredSystems.length > 0) && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
            {/* Fighter 1 systems */}
            <div>
              {f1TriggeredSystems.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground truncate">{fighter1.name}</div>
                  {f1TriggeredSystems.map(sys => {
                    const meta = SYSTEM_DESCRIPTIONS[sys.id];
                    const confidenceStyles = {
                      HIGH: 'bg-red-500/20 text-red-700 border-red-500/30',
                      MEDIUM: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
                      LOW: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
                    };
                    return (
                      <div key={sys.id}>
                        <Badge
                          variant="outline"
                          className={cn(confidenceStyles[sys.confidence], 'font-medium gap-1 text-xs')}
                        >
                          {meta.emoji} {meta.name}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sys.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Fighter 2 systems */}
            <div>
              {f2TriggeredSystems.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground truncate">{fighter2.name}</div>
                  {f2TriggeredSystems.map(sys => {
                    const meta = SYSTEM_DESCRIPTIONS[sys.id];
                    const confidenceStyles = {
                      HIGH: 'bg-red-500/20 text-red-700 border-red-500/30',
                      MEDIUM: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
                      LOW: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
                    };
                    return (
                      <div key={sys.id}>
                        <Badge
                          variant="outline"
                          className={cn(confidenceStyles[sys.confidence], 'font-medium gap-1 text-xs')}
                        >
                          {meta.emoji} {meta.name}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sys.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
