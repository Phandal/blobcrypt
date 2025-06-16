type EnvironmentVariables = {
  CONTAINER_URLS: string[];
  KEYVAULT_URL: string;
  SECRET_NAME: string;
};

export const EnvVars = [
  'CONTAINER_URLS',
  'KEYVAULT_URL',
  'SECRET_NAME',
] as const;

export function read(): EnvironmentVariables {
  const env: EnvironmentVariables = {
    CONTAINER_URLS: [],
    KEYVAULT_URL: '',
    SECRET_NAME: '',
  };

  const missingVars: string[] = [];

  for (const key of EnvVars) {
    const value = process.env[key];
    if (!value) {
      missingVars.push(key);
    } else {
      if (key === 'CONTAINER_URLS') {
        for (const container of value.split(',')) {
          env.CONTAINER_URLS.push(container);
        }
      } else {
        env[key] = value;
      }
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`missing environment variables: ${missingVars.join(', ')}`);
  }

  return env;
}
