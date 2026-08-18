export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export type Club = {
  id: number;
  name: string;
  short_name: string;
  strength: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
};

export type GameweekEvent = {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  average_entry_score: number;
  highest_score: number | null;
};

export type PlayerRow = {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  position: PlayerPosition;
  team: number;
  team_name: string;
  team_short: string;
  now_cost: number;
  total_points: number;
  points_per_game: number;
  form: number;
  selected_by_percent: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  bonus: number;
  bps: number;
  influence: number;
  creativity: number;
  threat: number;
  ict_index: number;
  expected_goals?: number;
  expected_assists?: number;
  expected_goal_involvements?: number;
  status: string;
  news: string;
  chance_of_playing_next_round: number | null;
  photo_code: number;
};

export type FixtureRow = {
  id: number;
  event: number | null;
  kickoff_time: string;
  team_h: number;
  team_h_name: string;
  team_h_short: string;
  team_a: number;
  team_a_name: string;
  team_a_short: string;
  team_h_score: number | null;
  team_a_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  finished: boolean;
  started: boolean;
};

export type ArticleCategory = 'تحليل' | 'نصائح' | 'انتقالات' | 'كابتن' | 'مباريات' | 'إحصائيات' | 'أخبار FPL';

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  content: string[];
  publishedAt: string;
  readTimeMinutes: number;
};
