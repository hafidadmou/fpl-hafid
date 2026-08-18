import type { Metadata } from 'next';
import TeamAnalyzer from '@/components/TeamAnalyzer';

export const metadata: Metadata = {
  title: 'تحليل فريقي',
  description: 'أدخل معرّف فريقك في Fantasy Premier League واحصل على تحليل شامل: التشكيلة، القائد، التقييم، ونقاط القوة والضعف.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  return <TeamAnalyzer />;
}
