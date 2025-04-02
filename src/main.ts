#! /usr/bin/env node

import packageJSON from '../package.json' with { type: 'json' };
import * as args from './args.js';
import * as actions from './actions.js';
import * as environment from './environment.js';
import * as utils from './utils.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import { ContainerClient, RestError } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

dotenv.config();

async function main(): Promise<void> {
  const credentials = new DefaultAzureCredential();

  let result: args.ParseResult;
  try {
    result = args.parse(process.argv.slice(2));
  } catch (err) {
    utils.usage(err);
    return;
  }
  const { action, title, filepath } = result;

  if (action === 'version') {
    console.error(`blobcrypt ${packageJSON.version}`);
    return;
  }

  if (action === 'help') {
    utils.usage();
    return;
  }

  const vars = environment.read();

  const containerClient = new ContainerClient(vars.CONTAINER_URL, credentials);
  const blobClient = containerClient.getBlobClient(title);
  const secretClient = new SecretClient(vars.KEYVAULT_URL, credentials);
  const secretResult = await secretClient.getSecret(vars.SECRET_NAME);
  if (!secretResult.value) {
    console.error(`secret '${vars.SECRET_NAME}' does not exist`);
    process.exit(1);
  }

  switch (action) {
    case 'encrypt':
      if (!fs.existsSync(filepath)) {
        console.error(`file '${filepath}' does not exist`);
        process.exit(1);
      }

      if (await blobClient.exists()) {
        const response = await utils.prompt(
          `blob '${title}' already exists. Overwrite [y/N]: `,
        );

        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      await actions.encrypt(filepath, secretResult.value, blobClient);
      break;
    case 'decrypt':
      if (fs.existsSync(filepath)) {
        const response = await utils.prompt(
          `file '${filepath}' already exists. Overwrite [y/N]: `,
        );

        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      if (!(await blobClient.exists())) {
        console.error(`blob '${blobClient.url}' does not exist`);
        process.exit(1);
      }

      await actions.decrypt(filepath, secretResult.value, blobClient);
      break;
  }
}

main().catch((err) => {
  const message =
    err instanceof RestError
      ? `Rest Error '${err.code}'`
      : err instanceof Error
        ? err.message
        : 'unexpected fatal error';

  console.error(`Unknown Error: ${err.message}`);
});
