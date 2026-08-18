import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ARTICLES, getArticleBySlug } from '@/lib/articles';

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: 'مقال غير موجود' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { title: article.title, description: article.excerpt, type: 'article' },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Link href="/articles" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-emerald-200">
        <ArrowRight size={14} />
        العودة إلى المقالات
      </Link>

      <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-200">{article.category}</span>
        <span>{new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))}</span>
        <span>{article.readTimeMinutes} دقائق قراءة</span>
      </div>

      <h1 className="mb-6 text-3xl font-black leading-tight text-white sm:text-4xl">{article.title}</h1>

      <div className="space-y-5 text-base leading-9 text-slate-200">
        {article.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
