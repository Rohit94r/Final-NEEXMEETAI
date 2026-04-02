import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { workspaceRouter } from '@/modules/workspace/server/procedures';

import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  workspace: workspaceRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
