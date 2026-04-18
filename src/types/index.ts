export type FighterStyle = 'STRIKER' | 'GRAPPLER' | 'SUBMISSION' | 'WRESTLER' | 'BALANCED';
export type FinishType = 'KO' | 'SUB' | 'BOTH' | 'DECISION';
export type WeightClass =
  | 'Strawweight' | 'Flyweight' | 'Bantamweight' | 'Featherweight'
  | 'Lightweight' | 'Welterweight' | 'Middleweight' | 'Light Heavyweight'
  | 'Heavyweight' | "Women's Strawweight" | "Women's Flyweight"
  | "Women's Bantamweight" | "Women's Featherweight";

export interface FighterRecord {
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
}

export interface FighterFinishStats {
  koWins: number;
  subWins: number;
  decWins: number;
  koLosses: number;
  subLosses: number;
  decLosses: number;
}

export interface FighterStats {
  strikesLandedPerMin: number;
  strikingAccuracy: number; // percentage 0-100
  strikesAbsorbedPerMin: number;
  strikingDefense: number; // percentage 0-100
  takedownsPerFight: number;
  takedownAccuracy: number; // percentage 0-100
  takedownDefense: number; // percentage 0-100
  submissionAttempts: number;
}

export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  age: number;
  height: string; // e.g. "5'11\""
  heightInches: number;
  weight: number; // in lbs
  reach: number; // in inches
  stance: 'Orthodox' | 'Southpaw' | 'Switch';
  record: FighterRecord;
  finishStats: FighterFinishStats;
  stats: FighterStats;
  style: FighterStyle;
  finishType: FinishType;
  weightClass: WeightClass;
  country: string;
  imageUrl?: string;
}

export interface OddsOutcome {
  name: string;
  price: number;
}

export interface Bookmaker {
  key: string;
  title: string;
  lastUpdate: string;
  outcomes: OddsOutcome[];
}

export interface FightOdds {
  id: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: Bookmaker[];
}

export type SystemId = 'FINISH' | 'AGE' | 'REACH' | 'STYLE' | 'MOMENTUM' | 'ACTIVITY' | 'DEFENSE' | 'PRESSURE';

export interface SystemResult {
  id: SystemId;
  name: string;
  triggered: boolean;
  favoredFighter?: string; // fighter id
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Matchup {
  id: string;
  fighter1: Fighter;
  fighter2: Fighter;
  weightClass: WeightClass;
  isMainEvent: boolean;
  rounds: 3 | 5;
  odds?: FightOdds;
  systems: SystemResult[];
}

export interface UFCEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  matchups: Matchup[];
  status: 'upcoming' | 'live' | 'completed';
}
