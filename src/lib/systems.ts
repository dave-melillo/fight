import type { Fighter, Matchup, SystemResult, FightOdds, SystemId } from '@/types';

function getConsensusOdds(odds: FightOdds | undefined, fighterName: string): number | null {
  if (!odds) return null;
  const prices: number[] = [];
  for (const bm of odds.bookmakers) {
    const outcome = bm.outcomes.find(o => o.name === fighterName);
    if (outcome) prices.push(outcome.price);
  }
  if (prices.length === 0) return null;
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

function isFavorite(odds: number): boolean {
  return odds < 0;
}

function isHeavyFavorite(odds: number): boolean {
  return odds <= -150;
}

// SYSTEM 1: HEAVY FAVORITE + FINISH
// When heavy favorite (-150+) and fighter is a finisher (KO or SUB specialist)
function evaluateFinishSystem(matchup: Matchup): SystemResult {
  const f1Odds = getConsensusOdds(matchup.odds, matchup.fighter1.name);
  const f2Odds = getConsensusOdds(matchup.odds, matchup.fighter2.name);

  let favoredFighter: Fighter | null = null;
  let favoredOdds: number | null = null;

  if (f1Odds !== null && isHeavyFavorite(f1Odds)) {
    favoredFighter = matchup.fighter1;
    favoredOdds = f1Odds;
  } else if (f2Odds !== null && isHeavyFavorite(f2Odds)) {
    favoredFighter = matchup.fighter2;
    favoredOdds = f2Odds;
  }

  if (!favoredFighter || !favoredOdds) {
    return {
      id: 'FINISH',
      name: 'Finish Machine',
      triggered: false,
      description: 'No heavy favorite in this fight',
      confidence: 'LOW',
    };
  }

  const totalWins = favoredFighter.record.wins;
  const finishRate = totalWins > 0
    ? ((favoredFighter.finishStats.koWins + favoredFighter.finishStats.subWins) / totalWins) * 100
    : 0;

  const triggered = finishRate >= 50;
  const finishTypeLabel = favoredFighter.finishType === 'KO' ? 'by KO/TKO'
    : favoredFighter.finishType === 'SUB' ? 'by Submission'
    : favoredFighter.finishType === 'BOTH' ? 'by KO or Sub'
    : 'by Decision';

  return {
    id: 'FINISH',
    name: 'Finish Machine',
    triggered,
    favoredFighter: triggered ? favoredFighter.id : undefined,
    description: triggered
      ? `${favoredFighter.name} (${favoredOdds}) finishes ${Math.round(finishRate)}% of wins ${finishTypeLabel}`
      : `Heavy favorite but low finish rate (${Math.round(finishRate)}%)`,
    confidence: triggered && favoredOdds <= -250 ? 'HIGH' : triggered ? 'MEDIUM' : 'LOW',
  };
}

// SYSTEM 2: AGE ADVANTAGE
function evaluateAgeSystem(matchup: Matchup): SystemResult {
  const ageDiff = matchup.fighter2.age - matchup.fighter1.age;
  const youngerFighter = ageDiff > 0 ? matchup.fighter1 : matchup.fighter2;
  const absAgeDiff = Math.abs(ageDiff);

  const triggered = absAgeDiff >= 3;
  const confidence = absAgeDiff >= 7 ? 'HIGH' : absAgeDiff >= 5 ? 'MEDIUM' : 'LOW';

  return {
    id: 'AGE',
    name: 'Youth Edge',
    triggered,
    favoredFighter: triggered ? youngerFighter.id : undefined,
    description: triggered
      ? `${youngerFighter.name} is ${absAgeDiff} years younger`
      : `Age difference only ${absAgeDiff} year${absAgeDiff === 1 ? '' : 's'}`,
    confidence,
  };
}

// SYSTEM 3: REACH ADVANTAGE
function evaluateReachSystem(matchup: Matchup): SystemResult {
  const reachDiff = matchup.fighter1.reach - matchup.fighter2.reach;
  const longerFighter = reachDiff > 0 ? matchup.fighter1 : matchup.fighter2;
  const absReachDiff = Math.abs(reachDiff);

  const triggered = absReachDiff >= 3;
  const confidence = absReachDiff >= 5 ? 'HIGH' : absReachDiff >= 3 ? 'MEDIUM' : 'LOW';

  return {
    id: 'REACH',
    name: 'Reach Advantage',
    triggered,
    favoredFighter: triggered ? longerFighter.id : undefined,
    description: triggered
      ? `${longerFighter.name} has ${absReachDiff}" more reach`
      : `Reach difference only ${absReachDiff}"`,
    confidence,
  };
}

// SYSTEM 4: STYLE MATCHUP
function evaluateStyleSystem(matchup: Matchup): SystemResult {
  const { fighter1, fighter2 } = matchup;

  // Striker vs Grappler - check takedown defense
  const styleClash =
    (fighter1.style === 'STRIKER' && (fighter2.style === 'GRAPPLER' || fighter2.style === 'WRESTLER')) ||
    (fighter2.style === 'STRIKER' && (fighter1.style === 'GRAPPLER' || fighter1.style === 'WRESTLER'));

  if (styleClash) {
    const striker = fighter1.style === 'STRIKER' ? fighter1 : fighter2;
    const grappler = fighter1.style === 'STRIKER' ? fighter2 : fighter1;

    // If striker has good TDD, favor striker
    if (striker.stats.takedownDefense >= 75) {
      return {
        id: 'STYLE',
        name: 'Style Clash',
        triggered: true,
        favoredFighter: striker.id,
        description: `${striker.name} (Striker) has ${striker.stats.takedownDefense}% TDD vs ${grappler.name} (${grappler.style})`,
        confidence: striker.stats.takedownDefense >= 85 ? 'HIGH' : 'MEDIUM',
      };
    }

    // If grappler has good TD accuracy, favor grappler
    if (grappler.stats.takedownAccuracy >= 45) {
      return {
        id: 'STYLE',
        name: 'Style Clash',
        triggered: true,
        favoredFighter: grappler.id,
        description: `${grappler.name} (${grappler.style}) has ${grappler.stats.takedownAccuracy}% TD accuracy`,
        confidence: 'MEDIUM',
      };
    }
  }

  return {
    id: 'STYLE',
    name: 'Style Clash',
    triggered: false,
    description: `${fighter1.style} vs ${fighter2.style} - no clear style advantage`,
    confidence: 'LOW',
  };
}

// SYSTEM 5: MOMENTUM (Win/Loss streak)
function evaluateMomentumSystem(matchup: Matchup): SystemResult {
  const { fighter1, fighter2 } = matchup;

  // Simple momentum: compare win percentages and finish stats
  const f1WinPct = fighter1.record.wins / Math.max(1, fighter1.record.wins + fighter1.record.losses);
  const f2WinPct = fighter2.record.wins / Math.max(1, fighter2.record.wins + fighter2.record.losses);
  const pctDiff = Math.abs(f1WinPct - f2WinPct);

  const betterFighter = f1WinPct > f2WinPct ? fighter1 : fighter2;
  const triggered = pctDiff >= 0.15;

  return {
    id: 'MOMENTUM',
    name: 'Win Rate Edge',
    triggered,
    favoredFighter: triggered ? betterFighter.id : undefined,
    description: triggered
      ? `${betterFighter.name} has ${Math.round(Math.max(f1WinPct, f2WinPct) * 100)}% win rate vs ${Math.round(Math.min(f1WinPct, f2WinPct) * 100)}%`
      : `Similar win rates (${Math.round(f1WinPct * 100)}% vs ${Math.round(f2WinPct * 100)}%)`,
    confidence: pctDiff >= 0.25 ? 'HIGH' : 'MEDIUM',
  };
}

// SYSTEM 6: ACTIVITY (recently active fighters do better)
function evaluateActivitySystem(matchup: Matchup): SystemResult {
  // Placeholder - in a full app this would check fight dates
  return {
    id: 'ACTIVITY',
    name: 'Ring Rust',
    triggered: false,
    description: 'Activity data requires fight history dates',
    confidence: 'LOW',
  };
}

// SYSTEM 7: DEFENSIVE EDGE
function evaluateDefenseSystem(matchup: Matchup): SystemResult {
  const { fighter1, fighter2 } = matchup;

  const f1DefScore = (fighter1.stats.strikingDefense + fighter1.stats.takedownDefense) / 2;
  const f2DefScore = (fighter2.stats.strikingDefense + fighter2.stats.takedownDefense) / 2;
  const diff = Math.abs(f1DefScore - f2DefScore);

  const betterDefender = f1DefScore > f2DefScore ? fighter1 : fighter2;
  const triggered = diff >= 10;

  return {
    id: 'DEFENSE',
    name: 'Iron Chin',
    triggered,
    favoredFighter: triggered ? betterDefender.id : undefined,
    description: triggered
      ? `${betterDefender.name} has superior defense (${Math.round(Math.max(f1DefScore, f2DefScore))}% avg)`
      : `Similar defensive profiles`,
    confidence: diff >= 15 ? 'HIGH' : 'MEDIUM',
  };
}

// SYSTEM 8: PRESSURE FIGHTER
function evaluatePressureSystem(matchup: Matchup): SystemResult {
  const { fighter1, fighter2 } = matchup;

  const f1Output = fighter1.stats.strikesLandedPerMin;
  const f2Output = fighter2.stats.strikesLandedPerMin;
  const diff = Math.abs(f1Output - f2Output);

  const morePressure = f1Output > f2Output ? fighter1 : fighter2;
  const triggered = diff >= 1.5;

  return {
    id: 'PRESSURE',
    name: 'Volume Striker',
    triggered,
    favoredFighter: triggered ? morePressure.id : undefined,
    description: triggered
      ? `${morePressure.name} lands ${Math.max(f1Output, f2Output).toFixed(1)} strikes/min vs ${Math.min(f1Output, f2Output).toFixed(1)}`
      : `Similar striking output`,
    confidence: diff >= 2.5 ? 'HIGH' : 'MEDIUM',
  };
}

export function evaluateAllSystems(matchup: Matchup): SystemResult[] {
  return [
    evaluateFinishSystem(matchup),
    evaluateAgeSystem(matchup),
    evaluateReachSystem(matchup),
    evaluateStyleSystem(matchup),
    evaluateMomentumSystem(matchup),
    evaluateDefenseSystem(matchup),
    evaluatePressureSystem(matchup),
  ];
}

export function getSystemCount(systems: SystemResult[], fighterId: string): number {
  return systems.filter(s => s.triggered && s.favoredFighter === fighterId).length;
}

export const SYSTEM_DESCRIPTIONS: Record<SystemId, { name: string; emoji: string; description: string }> = {
  FINISH: {
    name: 'Finish Machine',
    emoji: '💥',
    description: 'Heavy favorite (-150+) who finishes 50%+ of their wins. Look for KO/TKO or Submission prop bets.',
  },
  AGE: {
    name: 'Youth Edge',
    emoji: '⚡',
    description: 'Fighter is 3+ years younger than opponent. Younger fighters historically have better cardio, speed, and recovery.',
  },
  REACH: {
    name: 'Reach Advantage',
    emoji: '📏',
    description: 'Fighter has 3"+ reach advantage. Longer reach = better distance management, more jab effectiveness, harder to close distance.',
  },
  STYLE: {
    name: 'Style Clash',
    emoji: '🎯',
    description: 'Favorable style matchup. Striker with good TDD vs grappler, or grappler with high TD accuracy vs striker with poor TDD.',
  },
  MOMENTUM: {
    name: 'Win Rate Edge',
    emoji: '🔥',
    description: 'Significantly higher career win rate (15%+ difference). Indicates overall fighter quality and consistency.',
  },
  ACTIVITY: {
    name: 'Ring Rust',
    emoji: '⏰',
    description: 'Fighter who has been more active recently. Long layoffs (12+ months) can lead to ring rust and timing issues.',
  },
  DEFENSE: {
    name: 'Iron Chin',
    emoji: '🛡️',
    description: 'Superior combined striking + takedown defense (10%+ better). Harder to hit and harder to take down = harder to beat.',
  },
  PRESSURE: {
    name: 'Volume Striker',
    emoji: '👊',
    description: 'Lands 1.5+ more significant strikes per minute. Higher output fighters control rounds and pile up damage.',
  },
};
