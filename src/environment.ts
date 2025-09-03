type EnvironmentVariables = {
  CONTAINER_URLS: string[];
  KEYVAULT_URL: string;
  SECRET_NAME: string;
  PGP_PUBLIC_KEY: string;
  PGP_PRIVATE_KEY: string;
};

export const EnvVars = [
  'CONTAINER_URLS',
  'KEYVAULT_URL',
  'SECRET_NAME',
  'PGP_PUBLIC_KEY',
  'PGP_PRIVATE_KEY',
] as const;

export function read(): EnvironmentVariables {
  const env: EnvironmentVariables = {
    CONTAINER_URLS: [],
    KEYVAULT_URL: '',
    SECRET_NAME: '',
    PGP_PUBLIC_KEY: '',
    PGP_PRIVATE_KEY: '',
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
