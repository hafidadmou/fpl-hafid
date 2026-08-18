import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';
import type { ArticleCategory } from '@/types/platform';

export const metadata: Metadata = {
  title: 'المقالات',
  description: 'مقالات أصلية بالعربية حول استراتيجيات Fantasy Premier League: تحليل، نصائح، انتقالات، كابتن، مباريات، وإحصائيات.',
  alternates: { canonical: '/articles' },
};

const CATEGORIES: ArticleCategory[] = ['تحليل', 'نصائح', 'انتقالات', 'كابتن', 'مباريات', 'إحصائيات', 'أخبار FPL'];

export default function ArticlesPage({ searchParams }: { searchParams: { category?: string } }) {
  const activeCategory = searchParams?.category as ArticleCategory | undefined;
  const articles = activeCategory ? ARTICLES.filter((article) => article.category === activeCategory) : ARTICLES;
  const sorted = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-500/10 text-lime-200">
          <Newspaper size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">المقالات</h1>
          <p className="text-sm text-slate-400">محتوى FPL أصلي بالعربية</p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${!activeCategory ? 'bg-emerald-500/15 text-emerald-200' : 'border border-white/10 text-slate-400 hover:text-white'}`}
        >
          الكل
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/articles?category=${encodeURIComponent(category)}`}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeCategory === category ? 'bg-emerald-500/15 text-emerald-200' : 'border border-white/10 text-slate-400 hover:text-white'}`}
          >
            {category}
          </Link>
        ))}
      </div>

      {sorted.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:border-emerald-400/30">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-200">{article.category}</span>
                <span>{article.readTimeMinutes} دقائق قراءة</span>
              </div>
              <h2 className="mb-2 text-lg font-black text-white">{article.title}</h2>
              <p className="text-sm leading-7 text-slate-300">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">لا توجد مقالات في هذا التصنيف حاليًا.</div>
      )}
    </div>
  );
}
