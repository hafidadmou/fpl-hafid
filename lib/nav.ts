export type NavItem = { key: string; label: string; href: string };

export const MAIN_NAV: NavItem[] = [
  { key: 'home', label: 'الرئيسية', href: '/' },
  { key: 'team', label: 'تحليل فريقي', href: '/team' },
  { key: 'players', label: 'اللاعبون', href: '/players' },
  { key: 'compare', label: 'مقارنة اللاعبين', href: '/compare' },
  { key: 'fixtures', label: 'المباريات', href: '/fixtures' },
  { key: 'tools', label: 'أدوات FPL', href: '/tools' },
  { key: 'gameweek', label: 'الجولة', href: '/gameweek' },
  { key: 'articles', label: 'المقالات', href: '/articles' },
];

export const PRO_NAV_ITEM: NavItem = { key: 'pro', label: 'FPL Hafid PRO', href: '/pro' };

export const MOBILE_NAV: NavItem[] = [
  { key: 'home', label: 'الرئيسية', href: '/' },
  { key: 'team', label: 'فريقي', href: '/team' },
  { key: 'players', label: 'اللاعبون', href: '/players' },
  { key: 'tools', label: 'الأدوات', href: '/tools' },
  { key: 'gameweek', label: 'الجولة', href: '/gameweek' },
];
