import {
  BotIcon,
  BrainCircuitIcon,
  FileTextIcon,
  MessageSquareIcon,
  MicOffIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface Props {
  aiMode: "realtime_voice" | "groq_assistant" | "disabled";
}

const modeConfig = {
  realtime_voice: {
    title: "Realtime AI agent enabled",
    description:
      "Your AI agent joins the live call as a voice participant. Transcript, summary, recording, and Ask AI are all available after the meeting.",
    badge: "Live voice",
    badgeClassName: "bg-emerald-500/15 text-emerald-700 border-emerald-700/10",
    icon: BotIcon,
    features: [
      { icon: FileTextIcon, label: "Auto transcript" },
      { icon: BrainCircuitIcon, label: "AI summary" },
      { icon: MessageSquareIcon, label: "Ask AI" },
    ],
  },
  groq_assistant: {
    title: "Groq meeting assistant enabled",
    description:
      "AI summary and Ask AI are powered by your Groq setup. Auto transcript and recording are available after the meeting.",
    badge: "Groq AI",
    badgeClassName: "bg-blue-500/15 text-blue-700 border-blue-700/10",
    icon: BrainCircuitIcon,
    features: [
      { icon: FileTextIcon, label: "Auto transcript" },
      { icon: BrainCircuitIcon, label: "AI summary" },
      { icon: MessageSquareIcon, label: "Ask AI" },
    ],
  },
  disabled: {
    title: "AI setup is incomplete",
    description:
      "Meetings still work, but AI transcript and summary features need server AI keys before they can run.",
    badge: "AI off",
    badgeClassName: "bg-amber-500/15 text-amber-700 border-amber-700/10",
    icon: MicOffIcon,
    features: [],
  },
} as const;

export const MeetingAiOverviewCard = ({ aiMode }: Props) => {
  const config = modeConfig[aiMode];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-white px-4 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-sidebar-accent/50 p-2">
            <Icon className="size-5 text-sidebar-accent-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold">{config.title}</p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={config.badgeClassName}>
          {config.badge}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {config.features.map((item) => (
          <div
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};
