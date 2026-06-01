import { useMemo } from 'react';

export function Sparkline({ values }) {
  const d = useMemo(() => {
    if (!values?.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 88;
    const h = 24;
    const pad = 2;
    return values
      .map((v, i) => {
        const x = pad + (i / (values.length - 1 || 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        const cmd = i === 0 ? 'M' : 'L';
        return `${cmd}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [values]);

  if (!values?.length) return <span className="tabular-nums">—</span>;

  return (
    <svg className="sparkline" viewBox="0 0 88 28" preserveAspectRatio="none" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
