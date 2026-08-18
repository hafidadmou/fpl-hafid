import type { FplAnalysisSummary, FplApiResponse, FplPlayer, FplTeamSummary } from '@/types/fpl';

const FPL_BASE = process.env.FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';

function formatMoney(value: number | undefined): string {
  if (typeof value !== 'number') return '0';
  return `£${(value / 10).toFixed(1)}`;
}

function toArabicNumber(value: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value)
    .split('')
    .map((char) => (Number.isInteger(Number(char)) ? digits[Number(char)] : char))
    .join('');
}

export function normalizeTeamInfo(team: any): FplTeamSummary {
  const teamValue = Number(team?.value ?? team?.team_value ?? 0);
  const bank = Number(team?.bank ?? 0);
  const transfers = Number(team?.transfers_made ?? team?.transfers ?? 0);
  const transferCost = Number(team?.transfer_cost ?? 0);

  return {
    id: Number(team?.id ?? 0),
    name: team?.name || 'اسم الفريق',
    manager_name: team?.manager_name || team?.player_name || undefined,
    overall_points: Number(team?.summary_overall_points ?? team?.overall_points ?? 0),
    overall_rank: team?.summary_overall_rank ?? team?.overall_rank ?? null,
    gameweek_points: Number(team?.summary_event_points ?? team?.event_points ?? 0),
    gameweek_rank: team?.summary_event_rank ?? team?.event_rank ?? null,
    bank: bank,
    value: teamValue,
    transfers: transfers,
    transfer_cost: transferCost,
    summary: team?.summary || '',
  };
}

export async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FPL-Hafid/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function getPlayerPositionName(position: string): string {
  const map: Record<string, string> = {
    GK: 'حارس المرمى',
    DEF: 'دفاع',
    MID: 'وسط',
    FWD: 'هجوم',
  };
  return map[position] || position;
}

export function getClubName(player: FplPlayer, teamMap: Record<number, string>): string {
  return teamMap[player.team] || 'غير معروف';
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function buildAnalysis(players: FplPlayer[], team: FplTeamSummary): FplAnalysisSummary {
  const starters = players.filter((player) => player.is_starting);
  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');
  const bench = players.filter((p) => p.is_on_bench);

  const avg = (arr: FplPlayer[], key: keyof FplPlayer) => {
    if (!arr.length) return 0;
    return arr.reduce((sum, p) => sum + Number(p[key] ?? 0), 0) / arr.length;
  };

  const gkScore = clamp(55 + (gk.length ? avg(gk, 'total_points') * 1.6 : 0) + (gk.length ? avg(gk, 'clean_sheets') * 17 : 0));
  const defScore = clamp(52 + (def.length ? avg(def, 'total_points') * 1.35 : 0) + (def.length ? avg(def, 'clean_sheets') * 8 : 0));
  const midScore = clamp(48 + (mid.length ? avg(mid, 'total_points') * 1.55 : 0) + (mid.length ? avg(mid, 'assists') * 10 : 0));
  const fwdScore = clamp(50 + (fwd.length ? avg(fwd, 'total_points') * 1.7 : 0) + (fwd.length ? avg(fwd, 'goals_scored') * 12 : 0));

  const captain = players.find((p) => p.is_captain);
  const viceCaptain = players.find((p) => p.is_vice_captain);
  const captainScore = clamp((captain?.total_points ?? 0) * 1.3 + (viceCaptain?.total_points ?? 0) * 0.8 + 35);
  const benchScore = clamp(40 + bench.reduce((sum, p) => sum + p.total_points, 0) * 0.6);
  const valueScore = clamp(50 + (Number(team.value ?? 0) > 0 ? 35 : 0) - Math.max(0, (Number(team.value ?? 0) / 10 - 95) * 0.4));

  const overallScore = clamp(
    (gkScore + defScore + midScore + fwdScore + captainScore + benchScore + valueScore) / 7,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (mid.length >= 3 && avg(mid, 'total_points') > 35) {
    strengths.push('قوة خط الوسط واضحة بسبب إنتاجية اللاعبين في التمريرات والإسهامات');
  }
  if (fwd.length >= 2 && avg(fwd, 'goals_scored') > 0.4) {
    strengths.push('هناك هجومان قويان مع إمكانية تسجيل الأهداف ومضاعفة النقاط');
  }
  if (captain) {
    strengths.push(`القائد ${captain.web_name} يقدم قيمة مميزة وقد يكون الخيار الأفضل للـ GW الحالي`);
  }
  if (bench.length && bench.reduce((sum, p) => sum + p.total_points, 0) > 50) {
    strengths.push('توجد دكة بدلاء ذات قيمة جيدة ويمكن أن تساهم في حالات التبديل أو الإصابات');
  }

  if (bench.length && bench.every((p) => p.total_points < 25)) {
    weaknesses.push('الدكة الحالية لا تقدم دعمًا كافيًا إذا احتاجت التشكيلة إلى تغييرات');
  }
  if (def.length < 3 || avg(def, 'clean_sheets') < 0.6) {
    weaknesses.push('الخلفية تحتاج إلى مزيد من الاستقرار لتقليل الفرص المستقبلة');
  }
  if (!captain || captain.total_points < 25) {
    weaknesses.push('اختيار القائد الحالي لا يبدو مثاليًا مقارنةً بخيارات بديلة محتملة');
  }
  if (team.bank < 0.5) {
    weaknesses.push('لا توجد أموال كافية في البنك للحصول على إضافة قوية قبل التمرير التالي');
  }

  if (mid.length >= 2 && avg(mid, 'total_points') > 32) {
    recommendations.push('قد يكون من الأفضل التفكير في إبقاء خط الوسط الحالي ومراقبة الخيارات ذات العائد العالي في المباريات القادمة');
  }
  if (bench.length && bench.some((p) => p.total_points < 15)) {
    recommendations.push('يستحق النظر في تبديل بعض لاعبي الدكة إذا وجدت خيارات أفضل بديلًا عنها');
  }

  if (captain && captain.total_points > 12) {
    recommendations.push('اختيار القائد الحالي يبدو منطقيًا، لكن راقب البدائل إذا كان هناك مباراة أسهل لكبّار الفريق');
  }

  const categories = [
    { name: 'حراسة المرمى', score: clamp(gkScore), label: 'حراسة' },
    { name: 'الدفاع', score: clamp(defScore), label: 'دفاع' },
    { name: 'الوسط', score: clamp(midScore), label: 'وسط' },
    { name: 'الهجوم', score: clamp(fwdScore), label: 'هجوم' },
    { name: 'القائد', score: clamp(captainScore), label: 'قائد' },
    { name: 'دكة البدلاء', score: clamp(benchScore), label: 'دكة' },
    { name: 'القيمة مقابل السعر', score: clamp(valueScore), label: 'قيمة' },
  ];

  return {
    overallScore: Math.round(overallScore),
    categories,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    recommendations: recommendations.slice(0, 4),
  };
}

export function transformFplData(raw: any): FplApiResponse {
  const team = normalizeTeamInfo(raw?.team || raw?.entry || raw?.user || {});
  const teamMap: Record<number, string> = {};

  if (Array.isArray(raw?.teams)) {
    for (const item of raw.teams) {
      teamMap[item.id] = item.name;
    }
  }

  const players = (raw?.squad || []).map((item: any) => ({
    id: Number(item.id),
    first_name: item.first_name || '',
    second_name: item.second_name || '',
    web_name: item.web_name || item.first_name || 'لاعب',
    position: item.element_type === 1 ? 'GK' : item.element_type === 2 ? 'DEF' : item.element_type === 3 ? 'MID' : 'FWD',
    team: Number(item.team || item.club_id || 0),
    team_name: getClubName(
      {
        id: Number(item.id),
        first_name: item.first_name || '',
        second_name: item.second_name || '',
        web_name: item.web_name || item.first_name || 'لاعب',
        total_points: Number(item.total_points ?? 0),
        points_per_game: Number(item.points_per_game ?? 0),
        now_cost: Number(item.now_cost ?? 0),
        selected_by_percent: Number(item.selected_by_percent ?? 0),
        form: Number(item.form ?? 0),
        goals_scored: Number(item.goals_scored ?? 0),
        assists: Number(item.assists ?? 0),
        goals_conceded: Number(item.goals_conceded ?? 0),
        clean_sheets: Number(item.clean_sheets ?? 0),
        bonus: Number(item.bonus ?? 0),
        minutes: Number(item.minutes ?? 0),
        starts: Number(item.starts ?? 0),
        influence: Number(item.influence ?? 0),
        creativity: Number(item.creativity ?? 0),
        threat: Number(item.threat ?? 0),
        ict_index: Number(item.ict_index ?? 0),
        status: item.news || '',
        is_captain: Boolean(item.is_captain),
        is_vice_captain: Boolean(item.is_vice_captain),
        is_on_bench: Boolean(item.squad_role === 'bench' || item.is_bench),
        is_starting: Boolean(item.squad_role === 'starter' || !item.is_bench),
        fixture_difficulty: Number(item.fixture_difficulty ?? 0),
        chip: item.chip || null,
        position: item.element_type === 1 ? 'GK' : item.element_type === 2 ? 'DEF' : item.element_type === 3 ? 'MID' : 'FWD',
        team: Number(item.team || item.club_id || 0),
      } as FplPlayer,
      teamMap,
    ),
    total_points: Number(item.total_points ?? 0),
    points_per_game: Number(item.points_per_game ?? 0),
    now_cost: Number(item.now_cost ?? 0),
    selected_by_percent: Number(item.selected_by_percent ?? 0),
    form: Number(item.form ?? 0),
    goals_scored: Number(item.goals_scored ?? 0),
    assists: Number(item.assists ?? 0),
    goals_conceded: Number(item.goals_conceded ?? 0),
    clean_sheets: Number(item.clean_sheets ?? 0),
    bonus: Number(item.bonus ?? 0),
    minutes: Number(item.minutes ?? 0),
    starts: Number(item.starts ?? 0),
    influence: Number(item.influence ?? 0),
    creativity: Number(item.creativity ?? 0),
    threat: Number(item.threat ?? 0),
    ict_index: Number(item.ict_index ?? 0),
    news: item.news || '',
    status: item.status || '',
    is_captain: Boolean(item.is_captain),
    is_vice_captain: Boolean(item.is_vice_captain),
    is_on_bench: Boolean(item.squad_role === 'bench' || item.is_bench),
    is_starting: Boolean(item.squad_role === 'starter' || !item.is_bench),
    fixture_difficulty: Number(item.fixture_difficulty ?? 0),
    chip: item.chip || null,
  } as FplPlayer));

  // add captain/vice captain if available in raw metadata
  const captainId = Number(raw?.captain ?? raw?.team?.captain ?? raw?.entry?.active_chip ?? 0);
  const viceCaptainId = Number(raw?.vice_captain ?? raw?.team?.vice_captain ?? 0);

  for (const player of players) {
    if (captainId && player.id === captainId) player.is_captain = true;
    if (viceCaptainId && player.id === viceCaptainId) player.is_vice_captain = true;
  }

  const gameweek = Number(raw?.current_event ?? raw?.gameweek ?? raw?.event ?? 1);

  const analysis = buildAnalysis(players, team);

  return {
    team,
    players,
    gameweek,
    deadline: raw?.deadline_time || raw?.next_deadline || undefined,
    analysis,
  };
}

export function getFriendlyApiError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown';

  if (message.includes('timeout') || message.includes('AbortError')) {
    return 'استغرق الطلب وقتًا أطول من المتوقع. حاول مرة أخرى بعد قليل.';
  }

  if (message.includes('rate limit') || message.includes('429')) {
    return 'تجاوزت الطلبات الحد المسموح به الآن. حاول مرة أخرى بعد قليل.';
  }

  if (message.includes('fetch') || message.includes('Failed to fetch')) {
    return 'تعذر الوصول إلى خادم FPL في الوقت الحالي. حاول مرة أخرى لاحقًا.';
  }

  return 'تعذر جلب بيانات الفريق. تأكد من أن معرّف الفريق صحيح وحاول مرة أخرى.';
}

export function getBudget(value: number | undefined): string {
  return formatMoney(value);
}

export function formatArabic(value: number): string {
  return toArabicNumber(value);
}

export async function fetchFplTeam(teamId: string): Promise<FplApiResponse> {
  const id = Number(teamId);
  if (!id || Number.isNaN(id) || id <= 0) {
    throw new Error('Invalid Team ID');
  }

  const entryUrl = `${FPL_BASE}/entry/${id}/`;
  const bootstrapUrl = `${FPL_BASE}/bootstrap-static/`;

  try {
    const [entry, bootstrap] = await Promise.all([
      fetchJson<any>(entryUrl),
      fetchJson<any>(bootstrapUrl),
    ]);

    const teamSummary = entry?.summary || entry?.entry || {};
    const team = normalizeTeamInfo({
      ...teamSummary,
      id,
      name: entry?.name || teamSummary?.name || `فريق ${id}`,
      manager_name: entry?.player_first_name || entry?.player_last_name || teamSummary?.manager_name,
      overall_points: entry?.summary_overall_points ?? teamSummary?.overall_points,
      overall_rank: entry?.summary_overall_rank ?? teamSummary?.overall_rank,
      gameweek_points: entry?.summary_event_points ?? teamSummary?.event_points,
      gameweek_rank: entry?.summary_event_rank ?? teamSummary?.event_rank,
      bank: entry?.last_deadline_bank ?? teamSummary?.bank ?? 0,
      value: entry?.last_deadline_value ?? teamSummary?.value ?? 0,
      transfers: entry?.transfers_made ?? teamSummary?.transfers,
      transfer_cost: entry?.transfer_cost ?? teamSummary?.transfer_cost,
    });

    const elementMap = new Map<number, any>();
    for (const item of bootstrap?.elements || []) {
      elementMap.set(item.id, item);
    }

    const squad = await fetchJson<any>(`${entryUrl}event/50/picks/`).catch(() => null);
    const picks = Array.isArray(squad?.picks) ? squad.picks : [];

    const playerIds = picks.map((pick: any) => Number(pick.element));
    const activePlayers = bootstrap?.elements?.filter((element: any) => playerIds.includes(Number(element.id))) || [];

    const normalizedPlayers = activePlayers.map((element: any) => {
      const pick = picks.find((p: any) => Number(p.element) === Number(element.id));
      const clubName = bootstrap?.teams?.find((teamData: any) => Number(teamData.id) === Number(element.team))?.name || 'غير معروف';

      return {
        id: Number(element.id),
        first_name: element.first_name || '',
        second_name: element.second_name || '',
        web_name: element.web_name || element.first_name || 'لاعب',
        position: element.element_type === 1 ? 'GK' : element.element_type === 2 ? 'DEF' : element.element_type === 3 ? 'MID' : 'FWD',
        team: Number(element.team),
        team_name: clubName,
        total_points: Number(element.total_points ?? 0),
        points_per_game: Number(element.points_per_game ?? 0),
        now_cost: Number(element.now_cost ?? 0),
        selected_by_percent: Number(element.selected_by_percent ?? 0),
        form: Number(element.form ?? 0),
        goals_scored: Number(element.goals_scored ?? 0),
        assists: Number(element.assists ?? 0),
        goals_conceded: Number(element.goals_conceded ?? 0),
        clean_sheets: Number(element.clean_sheets ?? 0),
        bonus: Number(element.bonus ?? 0),
        minutes: Number(element.minutes ?? 0),
        starts: Number(element.starts ?? 0),
        influence: Number(element.influence ?? 0),
        creativity: Number(element.creativity ?? 0),
        threat: Number(element.threat ?? 0),
        ict_index: Number(element.ict_index ?? 0),
        news: element.news || '',
        status: element.status || '',
        is_captain: Number(pick?.is_captain ?? 0) === 1,
        is_vice_captain: Number(pick?.is_vice_captain ?? 0) === 1,
        is_on_bench: Number(pick?.position ?? 0) > 11,
        is_starting: Number(pick?.position ?? 0) <= 11,
        fixture_difficulty: Number(element.fixture_difficulty ?? 0),
        chip: null,
      } as FplPlayer;
    });

    const fallback = teamSummary?.picks || [];
    if (!normalizedPlayers.length && fallback.length) {
      const fallbackPlayers = fallback.map((pick: any) => {
        const element = elementMap.get(Number(pick.element));
        if (!element) return null;
        return {
          id: Number(element.id),
          first_name: element.first_name || '',
          second_name: element.second_name || '',
          web_name: element.web_name || element.first_name || 'لاعب',
          position: element.element_type === 1 ? 'GK' : element.element_type === 2 ? 'DEF' : element.element_type === 3 ? 'MID' : 'FWD',
          team: Number(element.team),
          team_name: bootstrap?.teams?.find((teamData: any) => Number(teamData.id) === Number(element.team))?.name || 'غير معروف',
          total_points: Number(element.total_points ?? 0),
          points_per_game: Number(element.points_per_game ?? 0),
          now_cost: Number(element.now_cost ?? 0),
          selected_by_percent: Number(element.selected_by_percent ?? 0),
          form: Number(element.form ?? 0),
          goals_scored: Number(element.goals_scored ?? 0),
          assists: Number(element.assists ?? 0),
          goals_conceded: Number(element.goals_conceded ?? 0),
          clean_sheets: Number(element.clean_sheets ?? 0),
          bonus: Number(element.bonus ?? 0),
          minutes: Number(element.minutes ?? 0),
          starts: Number(element.starts ?? 0),
          influence: Number(element.influence ?? 0),
          creativity: Number(element.creativity ?? 0),
          threat: Number(element.threat ?? 0),
          ict_index: Number(element.ict_index ?? 0),
          news: element.news || '',
          status: element.status || '',
          is_captain: Boolean(pick?.is_captain),
          is_vice_captain: Boolean(pick?.is_vice_captain),
          is_on_bench: Boolean(pick?.position > 11),
          is_starting: Boolean(pick?.position <= 11),
          fixture_difficulty: Number(element.fixture_difficulty ?? 0),
          chip: null,
        } as FplPlayer;
      }).filter(Boolean) as FplPlayer[];

      if (fallbackPlayers.length) {
        return {
          team,
          players: fallbackPlayers,
          gameweek: Number(entry?.current_event ?? 1),
          deadline: entry?.deadline_time || undefined,
          analysis: buildAnalysis(fallbackPlayers, team),
        };
      }
    }

    if (!normalizedPlayers.length) {
      throw new Error('Empty squad');
    }

    return {
      team,
      players: normalizedPlayers,
      gameweek: Number(entry?.current_event ?? 1),
      deadline: entry?.deadline_time || undefined,
      analysis: buildAnalysis(normalizedPlayers, team),
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchTeamFromApi(teamId: string): Promise<FplApiResponse> {
  return fetchFplTeam(teamId);
}
