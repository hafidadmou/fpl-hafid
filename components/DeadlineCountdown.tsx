'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

function getCountdown(deadline?: string | null) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = new Date(deadline).getTime() - Date.now();
  const safeDiff = Math.max(diff, 0);
  return {
    days: Math.floor(safeDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDiff / (1000 * 60)) % 60),
    seconds: Math.floor((safeDiff / 1000) % 60),
  };
}

export default function DeadlineCountdown({ deadline, label = 'الجولة القادمة تبدأ خلال' }: { deadline?: string | null; label?: string }) {
  const [countdown, setCountdown] = useState(getCountdown(deadline));

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown(deadline)), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return (
    <div className="rounded-2xl border border-violet-400/20 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <Clock3 size={14} className="text-violet-300" />
      </div>
      <div className="flex items-center justify-between gap-2 text-center text-white">
        <Box value={countdown.days} label="يوم" />
        <Box value={countdown.hours} label="س" />
        <Box value={countdown.minutes} label="د" />
        <Box value={countdown.seconds} label="ث" />
      </div>
    </div>
  );
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[58px] rounded-xl border border-white/10 bg-slate-950/70 px-2 py-2 text-center">
      <div className="text-lg font-black text-white">{new Intl.NumberFormat('en-US').format(value)}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
