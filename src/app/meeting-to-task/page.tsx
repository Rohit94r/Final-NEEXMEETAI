import type { Metadata } from "next";

import { SeoPageShell } from "@/app/(marketing)/_components/seo-page-shell";

export const metadata: Metadata = {
  title: "Meeting to Task Automation",
  description:
    "Turn meetings into tasks automatically with NeexMeet. Capture owners, action items, and next steps without manual follow-up work.",
};

export default function MeetingToTaskPage() {
  return (
    <SeoPageShell
      eyebrow="Meeting to task automation"
      title="Move from conversation to ownership without the follow-up scramble."
      description="NeexMeet helps teams convert meetings into tasks automatically, so action items do not disappear into notes, chat threads, or someone’s memory."
      ctaLabel="Automate meeting follow-up"
      highlights={[
        { label: "Task creation", value: "Action items mapped to owners automatically" },
        { label: "Execution flow", value: "Meetings feed directly into team workflows" },
        { label: "Fewer drop-offs", value: "Important next steps stay visible" },
        { label: "Clear ownership", value: "Everyone knows what they are responsible for" },
      ]}
      sections={[
        {
          title: "Why meeting-to-task automation matters",
          body: [
            "Meetings create momentum, but that momentum often disappears once the call ends. If tasks are not captured immediately, teams lose time trying to reconstruct who promised what.",
            "NeexMeet keeps the flow intact by converting outcomes into structured work while the meeting context is still fresh.",
          ],
        },
        {
          title: "How NeexMeet turns meetings into work",
          body: [
            "The platform captures decisions, commitments, and follow-up items from the conversation, then organizes them into tasks connected to the meeting that created them.",
            "That connection matters because it gives every task a clear origin story, which helps teams move faster and ask fewer context questions later.",
          ],
          bullets: [
            "Capture owners directly from meeting outcomes",
            "Track due work without extra admin steps",
            "Keep tasks linked to the original discussion",
          ],
        },
        {
          title: "Better accountability after every call",
          body: [
            "When work is visible right after the meeting, the team does not need another thread or another sync just to clarify the next step. Everyone can see the same source of truth.",
            "This is especially valuable for cross-functional teams where execution breaks down if ownership is vague.",
          ],
        },
        {
          title: "Benefits for execution-focused teams",
          body: [
            "Teams that run many meetings need a dependable way to turn intent into progress. Meeting-to-task automation gives that process structure without adding another layer of overhead.",
          ],
          bullets: [
            "Reduce manual recap work",
            "Increase follow-through after meetings",
            "Keep projects moving with less coordination drag",
          ],
        },
      ]}
    />
  );
}
