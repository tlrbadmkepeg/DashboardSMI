import type { ReactNode } from "react";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-teal"><span className="h-[3px] w-6 rounded-full bg-gold" />{eyebrow}</div>}
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-navy [text-wrap:balance] sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-[15px] leading-7 text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
