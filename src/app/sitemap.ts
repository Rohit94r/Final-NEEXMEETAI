import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://neexmeet.com", priority: 1 },
    { url: "https://neexmeet.com/ai-meeting-notes", priority: 0.8 },
    { url: "https://neexmeet.com/meeting-to-task", priority: 0.8 },
    { url: "https://neexmeet.com/team-collaboration-tool", priority: 0.8 },
    { url: "https://neexmeet.com/blog", priority: 0.7 },
  ];
}
