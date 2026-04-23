import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, FileTextIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read NeexMeet insights on AI meeting notes, meeting productivity, team collaboration, and turning conversation into execution.",
};

const upcomingPosts = [
  {
    title: "How AI meeting notes reduce manual follow-up work",
    description:
      "A practical guide to capturing decisions, tasks, and summaries without asking someone to rewrite the meeting afterward.",
    category: "AI meeting notes",
  },
  {
    title: "Meeting-to-task automation for fast-moving teams",
    description:
      "Why action items are often lost after meetings, and how better tooling keeps ownership visible from the start.",
    category: "Execution",
  },
  {
    title: "Choosing team collaboration software that preserves context",
    description:
      "What to look for when your team is tired of scattered notes, duplicated status updates, and unclear decisions.",
    category: "Collaboration",
  },
];

export default function BlogPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_22rem)] text-slate-950">
      <section className="border-b border-slate-200/80">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
            NeexMeet Blog
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl md:text-6xl">
            Practical ideas for better meetings and faster execution.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
            This is the start of NeexMeet’s content layer. We’re building articles around
            AI meeting notes, task automation, collaboration, and the systems teams use to
            turn conversation into progress.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Start with NeexMeet
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-6">
          {upcomingPosts.map((post) => (
            <article
              key={post.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                  <FileTextIcon className="size-4" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDaysIcon className="size-4" />
                  Coming soon
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                {post.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {post.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
