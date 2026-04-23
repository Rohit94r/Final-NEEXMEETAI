import type { Metadata } from "next";

import { SeoPageShell } from "@/app/(marketing)/_components/seo-page-shell";

export const metadata: Metadata = {
  title: "AI Meeting Notes Tool",
  description:
    "NeexMeet is an AI meeting notes tool that turns live conversations into summaries, tasks, and decisions your team can act on.",
};

export default function AiMeetingNotesPage() {
  return (
    <SeoPageShell
      eyebrow="AI meeting notes tool"
      title="Capture AI meeting notes that turn into accountable work."
      description="NeexMeet records the important parts of every meeting, organizes them into clean summaries, and turns commitments into tasks and decisions your team can revisit later."
      ctaLabel="Start capturing notes"
      highlights={[
        { label: "Automated notes", value: "Meeting summaries generated instantly" },
        { label: "Decisions saved", value: "A searchable record after every call" },
        { label: "Tasks assigned", value: "Follow-ups connected to real owners" },
        { label: "Team visibility", value: "Everyone sees what changed and why" },
      ]}
      sections={[
        {
          title: "Why teams need AI meeting notes",
          body: [
            "After a meeting ends, people usually remember the headline but forget the exact decisions, owners, and next steps. That creates repeated follow-up messages and too much manual admin.",
            "NeexMeet keeps the meeting output structured from the start, so teams get a clear record without someone spending another hour writing and formatting notes.",
          ],
        },
        {
          title: "How NeexMeet works",
          body: [
            "During and after meetings, NeexMeet organizes the conversation into summaries, decisions, blockers, and tasks. The result is a meeting record that feels ready to use instead of waiting for manual cleanup.",
            "Because notes live beside tasks and collaboration context, teams can move from recap to execution without jumping across disconnected tools.",
          ],
          bullets: [
            "Generate summaries automatically after each meeting",
            "Highlight decisions and unresolved blockers",
            "Turn spoken action items into trackable work",
          ],
        },
        {
          title: "What makes the notes useful later",
          body: [
            "A good meeting note is not just a transcript. It should help someone who missed the call understand what happened, what changed, and what they need to do next.",
            "NeexMeet keeps that context attached to the people and work involved, which makes the notes much more valuable than a static document.",
          ],
        },
        {
          title: "Benefits for busy teams",
          body: [
            "Fast-moving teams need meeting outputs they can trust. When notes, decisions, and action items are captured consistently, projects move with less friction and fewer dropped handoffs.",
          ],
          bullets: [
            "Save time after every meeting",
            "Reduce forgotten action items",
            "Improve accountability across the team",
          ],
        },
      ]}
    />
  );
}
