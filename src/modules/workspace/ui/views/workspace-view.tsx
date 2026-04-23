"use client";

import { CheckSquareIcon, LightbulbIcon, FileTextIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksPanel } from "../components/tasks-panel";
import { DecisionsPanel } from "../components/decisions-panel";
import { DocumentsPanel } from "../components/documents-panel";

export const WorkspaceView = () => {
  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">Your Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tasks, decisions, and documents linked to every meeting
        </p>
      </div>

      <Tabs defaultValue="tasks">
        <div className="bg-white rounded-lg border px-3">
          <TabsList className="p-0 bg-background justify-start rounded-none h-13">
            <TabsTrigger
              value="tasks"
              className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
            >
              <CheckSquareIcon className="size-4" />
              Your Tasks
            </TabsTrigger>
            <TabsTrigger
              value="decisions"
              className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
            >
              <LightbulbIcon className="size-4" />
              Decisions
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
            >
              <FileTextIcon className="size-4" />
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tasks" className="mt-4">
          <TasksPanel />
        </TabsContent>
        <TabsContent value="decisions" className="mt-4">
          <DecisionsPanel />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
