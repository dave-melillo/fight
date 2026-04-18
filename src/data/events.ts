import type { UFCEvent, Matchup } from '@/types';
import { fighters } from './fighters';
import { evaluateAllSystems } from '@/lib/systems';

function createMatchup(
  id: string,
  fighter1Id: string,
  fighter2Id: string,
  isMainEvent: boolean = false,
  rounds: 3 | 5 = 3,
): Matchup {
  const f1 = fighters[fighter1Id];
  const f2 = fighters[fighter2Id];
  if (!f1 || !f2) throw new Error(`Fighter not found: ${fighter1Id} or ${fighter2Id}`);

  const matchup: Matchup = {
    id,
    fighter1: f1,
    fighter2: f2,
    weightClass: f1.weightClass,
    isMainEvent,
    rounds,
    systems: [],
  };

  matchup.systems = evaluateAllSystems(matchup);
  return matchup;
}

export const events: UFCEvent[] = [
  {
    id: 'ufc-fn-april-18-2026',
    name: 'UFC Fight Night: Malott vs Burns',
    date: '2026-04-18',
    location: 'Rogers Place, Edmonton, Alberta, Canada',
    status: 'upcoming',
    matchups: [
      createMatchup('malott-burns', 'mike-malott', 'gilbert-burns', true, 5),
      createMatchup('phillips-jourdain', 'kyler-phillips', 'charles-jourdain', false, 3),
      createMatchup('nallo-herbert', 'mandel-nallo', 'jai-herbert'),
      createMatchup('jasudavicius-silva', 'jasmine-jasudavicius', 'karine-silva'),
      createMatchup('young-moises', 'gauge-young', 'thiago-moises'),
      createMatchup('tsarukyan-faber', 'arman-tsarukyan', 'urijah-faber'),
      createMatchup('barbosa-buzukja', 'marcio-barbosa', 'dennis-buzukja'),
      createMatchup('valentin-leblanc', 'robert-valentin', 'julien-leblanc'),
      createMatchup('saricam-boser', 'gokhan-saricam', 'tanner-boser'),
      createMatchup('castaneda-vologdin', 'john-castaneda', 'mark-vologdin'),
      createMatchup('horth-aldrich', 'jamey-lyn-horth', 'jj-aldrich'),
      createMatchup('croden-zheleznyakova', 'melissa-croden', 'darya-zheleznyakova'),
    ],
  },
];

export function getEvent(id: string): UFCEvent | undefined {
  return events.find(e => e.id === id);
}

export function getMatchup(eventId: string, matchupId: string): Matchup | undefined {
  const event = getEvent(eventId);
  return event?.matchups.find(m => m.id === matchupId);
}
