'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-200">
        <AlertTriangle size={28} />
      </div>
      <h1 className="mb-2 text-3xl font-black text-white">حدث خطأ غير متوقع</h1>
      <p className="mb-6 text-sm leading-7 text-slate-400">نعمل على حل المشكلة. حاول مرة أخرى بعد قليل.</p>
      <button type="button" onClick={reset} className="rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3 text-sm font-black text-slate-900">
        إعادة المحاولة
      </button>
    </div>
  );
}
