import "server-only";

const SERVER_ENV_HINT =
  "Add the missing value to .env.local or .env, using .env.example as your template.";

export function getRequiredServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. ${SERVER_ENV_HINT}`);
  }

  return value;
}

export function getOptionalServerEnv(name: string): string | undefined {
  const value = process.env[name];

  return value || undefined;
}

export function hasServerEnv(name: string): boolean {
  return Boolean(process.env[name]);
}

export function getMissingServerEnv(names: string[]): string[] {
  return names.filter((name) => !process.env[name]);
}
