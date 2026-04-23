import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

type SeoPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: {
    title: string;
    body: string[];
    bullets?: string[];
  }[];
  highlights: {
    label: string;
    value: string;
  }[];
  ctaLabel: string;
};

function HighlightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

export function SeoPageShell({
  eyebrow,
  title,
  description,
  sections,
  highlights,
  ctaLabel,
}: SeoPageShellProps) {
  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_22rem)] text-slate-950">
      <section className="border-b border-slate-200/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 md:py-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                {ctaLabel}
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <HighlightCard
                key={highlight.label}
                icon={CheckCircle2Icon}
                label={highlight.label}
                value={highlight.value}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-5 space-y-3 text-base text-slate-700">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
