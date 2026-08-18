import { cache } from 'react';
import type { Club, FixtureRow, GameweekEvent, PlayerRow } from '@/types/platform';

const FPL_BASE = process.env.FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';

async function fetchJson<T>(url: string, revalidate = 300): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'FPL-Hafid/1.0', Accept: 'application/json' },
      next: { revalidate },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

const POSITION_MAP: Record<number, PlayerRow['position']> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

// Deduplicated per-request via React cache(); revalidates every 5 minutes across requests via fetch cache.
export const getBootstrap = cache(async (): Promise<any> => {
  return fetchJson<any>(`${FPL_BASE}/bootstrap-static/`);
});

export const getRawFixtures = cache(async (): Promise<any[]> => {
  return fetchJson<any[]>(`${FPL_BASE}/fixtures/`);
});

export async function getClubs(): Promise<Club[]> {
  const bootstrap = await getBootstrap();
  return (bootstrap?.teams || []).map((team: any) => ({
    id: Number(team.id),
    name: team.name,
    short_name: team.short_name,
    strength: Number(team.strength ?? 0),
    strength_attack_home: Number(team.strength_attack_home ?? 0),
    strength_attack_away: Number(team.strength_attack_away ?? 0),
    strength_defence_home: Number(team.strength_defence_home ?? 0),
    strength_defence_away: Number(team.strength_defence_away ?? 0),
  }));
}

export async function getEvents(): Promise<GameweekEvent[]> {
  const bootstrap = await getBootstrap();
  return (bootstrap?.events || []).map((event: any) => ({
    id: Number(event.id),
    name: event.name,
    deadline_time: event.deadline_time,
    finished: Boolean(event.finished),
    is_current: Boolean(event.is_current),
    is_next: Boolean(event.is_next),
    average_entry_score: Number(event.average_entry_score ?? 0),
    highest_score: event.highest_score ?? null,
  }));
}

export async function getCurrentEvent(): Promise<GameweekEvent | undefined> {
  const events = await getEvents();
  return (
    events.find((event) => event.is_current) ||
    events.find((event) => event.is_next) ||
    events[0]
  );
}

export async function getPlayers(): Promise<PlayerRow[]> {
  const bootstrap = await getBootstrap();
  const clubs = await getClubs();
  const clubMap = new Map(clubs.map((club) => [club.id, club]));

  return (bootstrap?.elements || []).map((element: any): PlayerRow => {
    const club = clubMap.get(Number(element.team));
    return {
      id: Number(element.id),
      code: Number(element.code),
      first_name: element.first_name || '',
      second_name: element.second_name || '',
      web_name: element.web_name || element.first_name || 'لاعب',
      position: POSITION_MAP[Number(element.element_type)] || 'MID',
      team: Number(element.team),
      team_name: club?.name || 'غير معروف',
      team_short: club?.short_name || '—',
      now_cost: Number(element.now_cost ?? 0),
      total_points: Number(element.total_points ?? 0),
      points_per_game: Number(element.points_per_game ?? 0),
      form: Number(element.form ?? 0),
      selected_by_percent: Number(element.selected_by_percent ?? 0),
      minutes: Number(element.minutes ?? 0),
      goals_scored: Number(element.goals_scored ?? 0),
      assists: Number(element.assists ?? 0),
      clean_sheets: Number(element.clean_sheets ?? 0),
      goals_conceded: Number(element.goals_conceded ?? 0),
      bonus: Number(element.bonus ?? 0),
      bps: Number(element.bps ?? 0),
      influence: Number(element.influence ?? 0),
      creativity: Number(element.creativity ?? 0),
      threat: Number(element.threat ?? 0),
      ict_index: Number(element.ict_index ?? 0),
      expected_goals: element.expected_goals !== undefined ? Number(element.expected_goals) : undefined,
      expected_assists: element.expected_assists !== undefined ? Number(element.expected_assists) : undefined,
      expected_goal_involvements:
        element.expected_goal_involvements !== undefined ? Number(element.expected_goal_involvements) : undefined,
      status: element.status || 'a',
      news: element.news || '',
      chance_of_playing_next_round:
        element.chance_of_playing_next_round === null || element.chance_of_playing_next_round === undefined
          ? null
          : Number(element.chance_of_playing_next_round),
      photo_code: Number(String(element.code || 0)),
    };
  });
}

export async function getPlayerById(id: number): Promise<PlayerRow | undefined> {
  const players = await getPlayers();
  return players.find((player) => player.id === id);
}

function difficultyFor(fixture: any, isHome: boolean): number {
  const value = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
  return Number(value ?? 3);
}

export async function getFixtures(): Promise<FixtureRow[]> {
  const raw = await getRawFixtures();
  const clubs = await getClubs();
  const clubMap = new Map(clubs.map((club) => [club.id, club]));

  return raw
    .filter((fixture) => fixture && Number.isFinite(Number(fixture.id)))
    .map((fixture): FixtureRow => {
      const homeClub = clubMap.get(Number(fixture.team_h));
      const awayClub = clubMap.get(Number(fixture.team_a));
      return {
        id: Number(fixture.id),
        event: fixture.event === null ? null : Number(fixture.event),
        kickoff_time: fixture.kickoff_time || '',
        team_h: Number(fixture.team_h),
        team_h_name: homeClub?.name || 'غير معروف',
        team_h_short: homeClub?.short_name || '—',
        team_a: Number(fixture.team_a),
        team_a_name: awayClub?.name || 'غير معروف',
        team_a_short: awayClub?.short_name || '—',
        team_h_score: fixture.team_h_score === null || fixture.team_h_score === undefined ? null : Number(fixture.team_h_score),
        team_a_score: fixture.team_a_score === null || fixture.team_a_score === undefined ? null : Number(fixture.team_a_score),
        team_h_difficulty: difficultyFor(fixture, true),
        team_a_difficulty: difficultyFor(fixture, false),
        finished: Boolean(fixture.finished),
        started: Boolean(fixture.started),
      };
    })
    .sort((a, b) => new Date(a.kickoff_time || 0).getTime() - new Date(b.kickoff_time || 0).getTime());
}

export async function getUpcomingFixturesForClub(clubId: number, count = 5): Promise<FixtureRow[]> {
  const fixtures = await getFixtures();
  return fixtures
    .filter((fixture) => !fixture.finished && (fixture.team_h === clubId || fixture.team_a === clubId))
    .slice(0, count);
}

export function playerSlug(player: Pick<PlayerRow, 'id' | 'web_name'>): string {
  const normalized = player.web_name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9À-ɏ\s-]/g, '')
    .replace(/\s+/g, '-');
  return normalized ? `${player.id}-${normalized}` : `${player.id}`;
}

export function parseIdFromSlug(slug: string): number {
  const match = slug.match(/^(\d+)/);
  return match ? Number(match[1]) : NaN;
}

export function formatPrice(now_cost: number): string {
  return `£${(now_cost / 10).toFixed(1)}`;
}

export function getPlayerPositionLabel(position: PlayerRow['position']): string {
  const map: Record<PlayerRow['position'], string> = {
    GK: 'حارس مرمى',
    DEF: 'مدافع',
    MID: 'لاعب وسط',
    FWD: 'مهاجم',
  };
  return map[position];
}
