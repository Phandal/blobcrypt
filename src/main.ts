#! /usr/bin/env node

// import { ContainerClient } from '@azure/storage-blob';

import * as args from './args.js';
import * as actions from './actions.js';
import * as environment from './environment.js';
import * as utils from './utils.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import { ContainerClient } from '@azure/storage-blob';
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

  const vars = environment.read();

  const containerClient = new ContainerClient(vars.CONTAINER_URL, credentials);
  const blobClient = containerClient.getBlobClient(title);
  const secretClient = new SecretClient(vars.KEYVAULT_URL, credentials);
  const secretResult = await secretClient.getSecret(vars.SECRET_NAME);
  if (!secretResult.value) {
    throw new Error(`secret '${vars.SECRET_NAME}' does not exist`);
  }

  switch (action) {
    case 'encrypt':
      if (!fs.existsSync(filepath)) {
        throw new Error(`file '${filepath}' does not exist`);
      }

      if (await blobClient.exists()) {
        const response = await utils.promt(
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
        throw new Error(`file '${filepath}' already exists`);
      }

      if (!blobClient.exists) {
        throw new Error(`blob '${blobClient.url}' does not exist`);
      }

      await actions.decrypt(filepath, secretResult.value, blobClient);
      break;
  }
}

main().catch((err) => {
  console.error(`Unknown Error: ${err.message}`);
});
