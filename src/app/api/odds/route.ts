import { NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Cache for 1 hour to preserve API quota
const CACHE_DURATION = 3600;

export async function GET() {
  if (!ODDS_API_KEY) {
    return NextResponse.json({ error: 'Odds API key not configured' }, { status: 503 });
  }

  try {
    const url = `${ODDS_API_BASE}/sports/mma_mixed_martial_arts/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american&dateFormat=iso`;

    const response = await fetch(url, {
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.statusText}`);
    }

    const data = await response.json();

    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');
    console.log(`Odds API: ${used} used, ${remaining} remaining`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    console.error('Error fetching odds:', error);
    return NextResponse.json({ error: 'Failed to fetch odds' }, { status: 500 });
  }
}
