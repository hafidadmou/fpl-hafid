export type FplPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export type FplTeamSummary = {
  id: number;
  name: string;
  manager_name?: string;
  overall_points?: number;
  overall_rank?: number | null;
  gameweek_points?: number;
  gameweek_rank?: number | null;
  bank?: number;
  value?: number;
  transfers?: number;
  transfer_cost?: number;
  summary?: string;
};

export type FplPlayer = {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  position: FplPosition;
  team: number;
  team_name?: string;
  total_points: number;
  points_per_game: number;
  now_cost: number;
  selected_by_percent: number;
  form: number;
  goals_scored?: number;
  assists?: number;
  goals_conceded?: number;
  clean_sheets?: number;
  bonus?: number;
  minutes?: number;
  starts?: number;
  influence?: number;
  creativity?: number;
  threat?: number;
  ict_index?: number;
  news?: string;
  status?: string;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  is_on_bench?: boolean;
  is_starting?: boolean;
  fixture_difficulty?: number;
  chip?: string | null;
};

export type FplAnalysisSummary = {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    label: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type FplFixture = {
  id: number;
  event: number;
  kickoff_time: string;
  team_h: number;
  team_h_name: string;
  team_a: number;
  team_a_name: string;
  team_h_score: number | null;
  team_a_score: number | null;
  finished: boolean;
  started: boolean;
  minutes: number;
};

export type FplApiResponse = {
  team: FplTeamSummary;
  players: FplPlayer[];
  gameweek: number;
  deadline?: string;
  nextDeadline?: string;
  nextEventId?: number;
  fixtures?: FplFixture[];
  analysis: FplAnalysisSummary;
};
