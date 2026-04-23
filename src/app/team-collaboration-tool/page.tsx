import type { Metadata } from "next";

import { SeoPageShell } from "@/app/(marketing)/_components/seo-page-shell";

export const metadata: Metadata = {
  title: "Team Collaboration Software",
  description:
    "NeexMeet gives teams one collaboration workspace for meetings, decisions, tasks, and follow-through so work stays aligned.",
};

export default function TeamCollaborationToolPage() {
  return (
    <SeoPageShell
      eyebrow="Team collaboration software"
      title="Keep meetings, decisions, and follow-through in one collaboration workspace."
      description="NeexMeet is built for teams that need more than chat and notes. It connects meetings, context, ownership, and execution in one place so collaboration stays organized."
      ctaLabel="Try the workspace"
      highlights={[
        { label: "Shared context", value: "Meeting history and work connected together" },
        { label: "Cross-team clarity", value: "Decisions stay visible across functions" },
        { label: "Less busywork", value: "Fewer tools and fewer recap loops" },
        { label: "Reliable execution", value: "Work moves forward with full context" },
      ]}
      sections={[
        {
          title: "Why collaboration tools often fall short",
          body: [
            "Many teams use one tool for calls, another for notes, another for tasks, and chat to glue everything together. That setup creates fragmented context and repeated manual updates.",
            "NeexMeet brings those pieces closer together so the team can work from one connected flow instead of patching together a process after every meeting.",
          ],
        },
        {
          title: "How NeexMeet supports better collaboration",
          body: [
            "The workspace ties together meetings, notes, decisions, tasks, and rooms so teams can see the full picture. That makes collaboration feel less reactive and more intentional.",
            "Instead of searching for scattered updates, teammates can understand what happened, why it mattered, and what comes next from one place.",
          ],
          bullets: [
            "Keep meeting context attached to execution",
            "Make decisions easy to review later",
            "Give every team member a clearer picture of progress",
          ],
        },
        {
          title: "Useful for product, ops, and client teams",
          body: [
            "Teams that coordinate across many conversations benefit most when collaboration tools reduce ambiguity instead of adding another surface to check.",
            "NeexMeet helps by making the output of collaboration just as clear as the conversation itself.",
          ],
        },
        {
          title: "Benefits for growing organizations",
          body: [
            "As teams grow, coordination costs grow too. A stronger collaboration layer helps preserve speed, context, and accountability without depending on individual memory.",
          ],
          bullets: [
            "Improve alignment across teams",
            "Reduce duplicated follow-up effort",
            "Make meetings produce more durable outcomes",
          ],
        },
      ]}
    />
  );
}
