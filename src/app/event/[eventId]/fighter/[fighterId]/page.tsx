'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SystemBadge, FighterStyleBadge } from '@/components/SystemBadge';
import { getFighter } from '@/data/fighters';
import { getEvent } from '@/data/events';
import { calculateFightScore } from '@/lib/systems';
import { cn } from '@/lib/utils';

function StatBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 60 ? 'bg-red-500' : pct >= 40 ? 'bg-amber-500' : 'bg-gray-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function FighterPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const fighterId = params.fighterId as string;
  const fighter = getFighter(fighterId);
  const event = getEvent(eventId);

  if (!fighter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Fighter Not Found</h1>
        <Link href={`/event/${eventId}`} className="text-red-600 hover:underline mt-4 block">
          Back to Event
        </Link>
      </div>
    );
  }

  // Find this fighter's matchup to show systems
  const matchup = event?.matchups.find(
    m => m.fighter1.id === fighterId || m.fighter2.id === fighterId
  );
  const systemsForFighter = matchup?.systems.filter(
    s => s.triggered && s.favoredFighter === fighterId
  ) || [];
  const systemsAgainst = matchup?.systems.filter(
    s => s.triggered && s.favoredFighter && s.favoredFighter !== fighterId
  ) || [];

  // Calculate FIGHT score
  const opponent = matchup?.fighter1.id === fighterId ? matchup.fighter2 : matchup?.fighter1;
  const fightScore = matchup && opponent
    ? calculateFightScore(fighter, opponent, matchup.systems)
    : null;

  const { record, finishStats, stats } = fighter;
  const totalFights = record.wins + record.losses + record.draws;
  const winPct = totalFights > 0 ? Math.round((record.wins / totalFights) * 100) : 0;
  const finishRate = record.wins > 0
    ? Math.round(((finishStats.koWins + finishStats.subWins) / record.wins) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href={`/event/${eventId}`} className="text-sm text-red-600 hover:underline mb-4 inline-block">
        &larr; Back to {event?.name || 'Event'}
      </Link>

      {/* Fighter Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fighter.name}</h1>
            {fighter.nickname && (
              <p className="text-lg text-muted-foreground italic">&quot;{fighter.nickname}&quot;</p>
            )}
          </div>
          <FighterStyleBadge style={fighter.style} finishType={fighter.finishType} />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="outline">{fighter.weightClass}</Badge>
          <Badge variant="secondary">{fighter.country}</Badge>
          <Badge variant="outline">{fighter.stance}</Badge>
        </div>

        {/* FIGHT Score */}
        {fightScore !== null && (
          <div className={cn(
            'mt-4 rounded-lg border p-4 text-center',
            fightScore >= 75 ? 'bg-red-50 border-red-200' :
            fightScore >= 60 ? 'bg-amber-50 border-amber-200' :
            'bg-gray-50 border-gray-200'
          )}>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">FIGHT Score for this matchup</div>
            <div className={cn(
              'text-5xl font-black mt-1',
              fightScore >= 75 ? 'text-red-600' :
              fightScore >= 60 ? 'text-amber-600' :
              'text-gray-500'
            )}>
              {fightScore}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {systemsForFighter.length} systems for / {systemsAgainst.length} against
            </div>
          </div>
        )}

        {/* Record */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{record.wins}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-500">{record.losses}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-400">{record.draws}</div>
            <div className="text-xs text-muted-foreground">Draws</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{winPct}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>
      </header>

      {/* Systems */}
      {(systemsForFighter.length > 0 || systemsAgainst.length > 0) && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">Betting Systems</h2>
          </CardHeader>
          <CardContent>
            {systemsForFighter.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-green-700 mb-2">Systems Favoring {fighter.name}</div>
                <div className="space-y-2">
                  {systemsForFighter.map(sys => (
                    <SystemBadge key={sys.id} system={sys} showDescription />
                  ))}
                </div>
              </div>
            )}
            {systemsAgainst.length > 0 && (
              <div>
                <div className="text-sm font-medium text-red-700 mb-2">Systems Against</div>
                <div className="space-y-2">
                  {systemsAgainst.map(sys => (
                    <SystemBadge key={sys.id} system={sys} showDescription />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Physical Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Physical</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{fighter.age}</div>
              <div className="text-xs text-muted-foreground">Age</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fighter.height}</div>
              <div className="text-xs text-muted-foreground">Height</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fighter.weight}</div>
              <div className="text-xs text-muted-foreground">Weight (lbs)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fighter.reach}&quot;</div>
              <div className="text-xs text-muted-foreground">Reach</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Win Breakdown */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Win Method Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{finishStats.koWins}</div>
              <div className="text-xs text-muted-foreground">KO/TKO</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{finishStats.subWins}</div>
              <div className="text-xs text-muted-foreground">Submission</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{finishStats.decWins}</div>
              <div className="text-xs text-muted-foreground">Decision</div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-1">
              {finishRate}% Finish Rate
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Striking Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Striking</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatBar label="Strikes Landed/Min" value={stats.strikesLandedPerMin} max={8} />
          <StatBar label="Striking Accuracy" value={stats.strikingAccuracy} />
          <StatBar label="Strikes Absorbed/Min" value={stats.strikesAbsorbedPerMin} max={8} />
          <StatBar label="Striking Defense" value={stats.strikingDefense} />
        </CardContent>
      </Card>

      {/* Grappling Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Grappling</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatBar label="Takedowns/Fight" value={stats.takedownsPerFight} max={5} />
          <StatBar label="Takedown Accuracy" value={stats.takedownAccuracy} />
          <StatBar label="Takedown Defense" value={stats.takedownDefense} />
          <StatBar label="Sub Attempts/Fight" value={stats.submissionAttempts} max={3} />
        </CardContent>
      </Card>

      {/* Loss Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Loss Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{finishStats.koLosses}</div>
              <div className="text-xs text-muted-foreground">KO/TKO</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{finishStats.subLosses}</div>
              <div className="text-xs text-muted-foreground">Submission</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{finishStats.decLosses}</div>
              <div className="text-xs text-muted-foreground">Decision</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
