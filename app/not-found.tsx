import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
        <Compass size={28} />
      </div>
      <h1 className="mb-2 text-3xl font-black text-white">الصفحة غير موجودة</h1>
      <p className="mb-6 text-sm leading-7 text-slate-400">الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله.</p>
      <Link href="/" className="rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3 text-sm font-black text-slate-900">
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
