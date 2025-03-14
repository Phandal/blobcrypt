export const EnvVars = [
  'CONTAINER_URL',
  'KEYVAULT_URL',
  'SECRET_NAME',
] as const;

export function read(): Record<(typeof EnvVars)[number], string> {
  const env = {
    CONTAINER_URL: '',
    KEYVAULT_URL: '',
    SECRET_NAME: '',
  };

  const missingVars: string[] = [];

  for (const key of EnvVars) {
    const value = process.env[key];
    if (!value) {
      missingVars.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`missing environment variables: ${missingVars.join(', ')}`);
  }

  return env;
}
