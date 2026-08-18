import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { getPlayers, playerSlug } from '@/lib/fpl-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const STATIC_ROUTES = ['', '/team', '/players', '/compare', '/fixtures', '/tools', '/tools/captain', '/tools/transfers', '/tools/squad-planner', '/gameweek', '/articles', '/pro'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  let playerEntries: MetadataRoute.Sitemap = [];
  try {
    const players = await getPlayers();
    playerEntries = players.slice(0, 400).map((player) => ({
      url: `${SITE_URL}/players/${playerSlug(player)}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.4,
    }));
  } catch {
    playerEntries = [];
  }

  return [...staticEntries, ...articleEntries, ...playerEntries];
}
