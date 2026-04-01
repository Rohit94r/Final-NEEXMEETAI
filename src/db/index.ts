import { drizzle } from 'drizzle-orm/neon-http';
import { getRequiredServerEnv } from "@/lib/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getRequiredServerEnv("DATABASE_URL"));
  }

  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
