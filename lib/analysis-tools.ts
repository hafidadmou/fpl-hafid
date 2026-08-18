import type { FixtureRow, PlayerRow } from '@/types/platform';

export type CaptainCandidate = {
  player: PlayerRow;
  score: number;
  nextFixture?: FixtureRow;
  reasons: string[];
};

function nextFixtureFor(player: PlayerRow, fixtures: FixtureRow[]): FixtureRow | undefined {
  return fixtures
    .filter((fixture) => !fixture.finished && (fixture.team_h === player.team || fixture.team_a === player.team))
    .sort((a, b) => new Date(a.kickoff_time || 0).getTime() - new Date(b.kickoff_time || 0).getTime())[0];
}

function fixtureDifficultyFor(player: PlayerRow, fixture?: FixtureRow): number {
  if (!fixture) return 3;
  return fixture.team_h === player.team ? fixture.team_h_difficulty : fixture.team_a_difficulty;
}

export function rankCaptainCandidates(
  players: PlayerRow[],
  fixtures: FixtureRow[],
  options: { limit?: number; positions?: PlayerRow['position'][] } = {},
): CaptainCandidate[] {
  const positions = options.positions || ['MID', 'FWD'];
  const limit = options.limit ?? 10;

  const eligible = players.filter(
    (player) => positions.includes(player.position) && player.minutes > 90 && player.status === 'a',
  );

  const candidates: CaptainCandidate[] = eligible.map((player) => {
    const nextFixture = nextFixtureFor(player, fixtures);
    const difficulty = fixtureDifficultyFor(player, nextFixture);
    const easeScore = (6 - difficulty) * 6; // difficulty 1..5 -> 30..6
    const formScore = player.form * 9;
    const pointsScore = player.points_per_game * 4;
    const ownershipScore = Math.min(player.selected_by_percent, 40) * 0.5;
    const minutesReliability = Math.min(player.minutes / (player.minutes > 0 ? player.minutes : 1), 1) * 5;

    const score = Math.round(formScore + pointsScore + easeScore + ownershipScore + minutesReliability);

    const reasons: string[] = [];
    if (player.form >= 6) reasons.push(`فورمة ممتازة (${player.form.toFixed(1)} نقطة/مباراة في آخر المباريات)`);
    else if (player.form >= 4) reasons.push(`فورمة جيدة (${player.form.toFixed(1)})`);
    if (nextFixture) {
      const opponent =
        nextFixture.team_h === player.team ? nextFixture.team_a_short : nextFixture.team_h_short;
      const venue = nextFixture.team_h === player.team ? 'داخل الديار' : 'خارج الديار';
      if (difficulty <= 2) reasons.push(`مباراة سهلة أمام ${opponent} (${venue})`);
      else if (difficulty >= 4) reasons.push(`مباراة صعبة أمام ${opponent} (${venue})`);
      else reasons.push(`يلعب أمام ${opponent} (${venue})`);
    }
    if (player.selected_by_percent >= 25) reasons.push(`خيار شائع بنسبة امتلاك ${player.selected_by_percent.toFixed(1)}%`);

    return { player, score, nextFixture, reasons };
  });

  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}

export type ComparisonMetric = {
  key: keyof PlayerRow;
  label: string;
  higherIsBetter: boolean;
  format?: (value: number) => string;
};

export const COMPARISON_METRICS: ComparisonMetric[] = [
  { key: 'now_cost', label: 'السعر', higherIsBetter: false, format: (v) => `£${(v / 10).toFixed(1)}` },
  { key: 'total_points', label: 'النقاط الكلية', higherIsBetter: true },
  { key: 'points_per_game', label: 'نقاط لكل مباراة', higherIsBetter: true },
  { key: 'form', label: 'الفورمة', higherIsBetter: true },
  { key: 'selected_by_percent', label: 'نسبة الامتلاك', higherIsBetter: true, format: (v) => `${v.toFixed(1)}%` },
  { key: 'goals_scored', label: 'الأهداف', higherIsBetter: true },
  { key: 'assists', label: 'التمريرات الحاسمة', higherIsBetter: true },
  { key: 'clean_sheets', label: 'شباك نظيفة', higherIsBetter: true },
  { key: 'bonus', label: 'نقاط البونص', higherIsBetter: true },
  { key: 'minutes', label: 'الدقائق', higherIsBetter: true },
  { key: 'ict_index', label: 'مؤشر ICT', higherIsBetter: true },
];

export function buildComparisonInsights(players: PlayerRow[]): string[] {
  if (players.length < 2) return [];
  const insights: string[] = [];

  for (const metric of COMPARISON_METRICS) {
    const values = players.map((player) => Number(player[metric.key] ?? 0));
    const best = metric.higherIsBetter ? Math.max(...values) : Math.min(...values);
    const bestIndex = values.indexOf(best);
    const spread = Math.max(...values) - Math.min(...values);
    if (spread === 0) continue;
    if (metric.key === 'total_points' || metric.key === 'form' || metric.key === 'now_cost') {
      const bestPlayer = players[bestIndex];
      const formatted = metric.format ? metric.format(best) : best.toString();
      insights.push(`يتفوق ${bestPlayer.web_name} حاليًا من ناحية ${metric.label} بقيمة ${formatted}.`);
    }
  }

  return insights.slice(0, 4);
}

export const SQUAD_RULES = {
  budget: 1000,
  totalPlayers: 15,
  positionLimits: { GK: 2, DEF: 5, MID: 5, FWD: 3 } as Record<PlayerRow['position'], number>,
  maxPerClub: 3,
};

export const VALID_FORMATIONS = [
  { key: '3-4-3', GK: 1, DEF: 3, MID: 4, FWD: 3 },
  { key: '3-5-2', GK: 1, DEF: 3, MID: 5, FWD: 2 },
  { key: '4-3-3', GK: 1, DEF: 4, MID: 3, FWD: 3 },
  { key: '4-4-2', GK: 1, DEF: 4, MID: 4, FWD: 2 },
  { key: '4-5-1', GK: 1, DEF: 4, MID: 5, FWD: 1 },
  { key: '5-3-2', GK: 1, DEF: 5, MID: 3, FWD: 2 },
  { key: '5-4-1', GK: 1, DEF: 5, MID: 4, FWD: 1 },
];

export function canAddPlayerToSquad(
  squad: PlayerRow[],
  candidate: PlayerRow,
  budgetRemaining: number,
): { allowed: boolean; reason?: string } {
  if (squad.some((player) => player.id === candidate.id)) {
    return { allowed: false, reason: 'اللاعب موجود بالفعل في التشكيلة' };
  }
  if (squad.length >= SQUAD_RULES.totalPlayers) {
    return { allowed: false, reason: 'التشكيلة مكتملة (15 لاعبًا)' };
  }
  const positionCount = squad.filter((player) => player.position === candidate.position).length;
  if (positionCount >= SQUAD_RULES.positionLimits[candidate.position]) {
    return { allowed: false, reason: `الحد الأقصى لمركز ${candidate.position} تم الوصول إليه` };
  }
  const clubCount = squad.filter((player) => player.team === candidate.team).length;
  if (clubCount >= SQUAD_RULES.maxPerClub) {
    return { allowed: false, reason: 'الحد الأقصى 3 لاعبين من نفس النادي' };
  }
  if (candidate.now_cost > budgetRemaining) {
    return { allowed: false, reason: 'الميزانية غير كافية لإضافة هذا اللاعب' };
  }
  return { allowed: true };
}
