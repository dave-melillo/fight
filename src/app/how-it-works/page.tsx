import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SYSTEM_DESCRIPTIONS } from '@/lib/systems';
import type { SystemId } from '@/types';

export default function HowItWorksPage() {
  const systems = Object.entries(SYSTEM_DESCRIPTIONS) as [SystemId, typeof SYSTEM_DESCRIPTIONS[SystemId]][];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
        <p className="text-muted-foreground mt-2">
          FIGHT uses multiple betting systems to analyze UFC matchups. Each system evaluates a
          different angle - when multiple systems align on the same fighter, it signals a
          stronger betting opportunity.
        </p>
      </header>

      {/* How to Read the Badges */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Reading the Badges</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500/20 text-red-700 border border-red-500/30">HIGH</Badge>
              <span className="text-sm text-muted-foreground">
                Strong signal - system triggers with high confidence
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-700 border border-amber-500/30">MEDIUM</Badge>
              <span className="text-sm text-muted-foreground">
                Moderate signal - system triggers but edge is smaller
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gray-500/20 text-gray-600 border border-gray-500/30">LOW</Badge>
              <span className="text-sm text-muted-foreground">
                Weak signal - barely triggers, use with caution
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="font-semibold text-red-800 mb-2">System Count Badges</div>
            <p className="text-sm text-red-700">
              Each fighter shows how many systems favor them. When one fighter has 3+ systems
              in their favor, it&apos;s a strong indicator. Look for lopsided system counts (e.g. 4 vs 1)
              for the best opportunities.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fighter Style Badges */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Fighter Style Types</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl">👊</span>
              <div>
                <div className="font-semibold text-orange-700">Striker</div>
                <p className="text-sm text-muted-foreground">
                  Primarily stands and trades. Wins via knockouts or outpointing on the feet.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🤼</span>
              <div>
                <div className="font-semibold text-blue-700">Grappler</div>
                <p className="text-sm text-muted-foreground">
                  Takes fights to the ground. Controls position and works for ground-and-pound or submissions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🔒</span>
              <div>
                <div className="font-semibold text-purple-700">Submission Artist</div>
                <p className="text-sm text-muted-foreground">
                  Specializes in submissions. Dangerous off their back and from top position.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
              <span className="text-2xl">🏋️</span>
              <div>
                <div className="font-semibold text-teal-700">Wrestler</div>
                <p className="text-sm text-muted-foreground">
                  Elite takedowns and top control. Grinds opponents with relentless pressure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
              <span className="text-2xl">⚖️</span>
              <div>
                <div className="font-semibold text-gray-700">Balanced</div>
                <p className="text-sm text-muted-foreground">
                  Well-rounded with no glaring weaknesses. Can fight effectively anywhere.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Betting Systems */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">The Systems</h2>
      <div className="space-y-4">
        {systems.map(([id, sys]) => (
          <Card key={id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{sys.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold">{sys.name}</h3>
                  <Badge variant="outline" className="text-xs">{id}</Badge>
                </div>
              </div>
              <p className="text-muted-foreground">{sys.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Betting Tips */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">General Betting Tips</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">1.</span>
              <span>Never bet more than you can afford to lose. MMA is unpredictable.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">2.</span>
              <span>Systems are guides, not guarantees. Use them to narrow down research, not as the final word.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">3.</span>
              <span>Line shopping matters. Compare odds across DraftKings, FanDuel, BetMGM, and others.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">4.</span>
              <span>Prop bets (method of victory) often have more value than straight moneyline bets on heavy favorites.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">5.</span>
              <span>Watch for late odds movement - sharp money moving lines can signal insider knowledge or injury news.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>For entertainment purposes only. Please gamble responsibly.</p>
      </footer>
    </div>
  );
}
