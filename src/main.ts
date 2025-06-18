#! /usr/bin/env node

import * as fs from 'node:fs';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { ContainerClient, RestError } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import packageJSON from '../package.json' with { type: 'json' };
import * as actions from './actions.js';
import * as args from './args.js';
import * as environment from './environment.js';
import * as utils from './utils.js';

dotenv.config();
process.removeAllListeners('warning');

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
  const containerIndex = Number(
    await utils.promptOptions(
      'Please choose a container: ',
      vars.CONTAINER_URLS,
    ),
  );

  if (
    Number.isNaN(containerIndex) ||
    containerIndex > vars.CONTAINER_URLS.length ||
    containerIndex < 0
  ) {
    console.error(`invalid container options: ${containerIndex}`);
    process.exit(1);
  }

  const containerURL = vars.CONTAINER_URLS[containerIndex];

  const containerClient = new ContainerClient(containerURL, credentials);
  const blobClient = containerClient.getBlobClient(title);
  const secretClient = new SecretClient(vars.KEYVAULT_URL, credentials);
  const secretResult = await secretClient.getSecret(vars.SECRET_NAME);
  if (!secretResult.value) {
    console.error(`secret '${vars.SECRET_NAME}' does not exist`);
    process.exit(1);
  }

  switch (action) {
    case 'fetch': {
      let jsonParse = false;
      if (fs.existsSync(filepath)) {
        const response = await utils.prompt(
          `file '${filepath}' already exists. Overwrite [y/N]: `,
        );
        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      const response = await utils.prompt('JSON Pretty Print results [Y/n]: ');
      if (response.toLowerCase().startsWith('y')) {
        jsonParse = true;
      }

      if (!(await blobClient.exists())) {
        console.error(`blob '${blobClient.url}' does not exist`);
        process.exit(1);
      }

      await actions.fetch(filepath, jsonParse, blobClient);
      break;
    }
    case 'encrypt': {
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
    }
    case 'decrypt': {
      let jsonParse = false;
      if (fs.existsSync(filepath)) {
        const response = await utils.prompt(
          `file '${filepath}' already exists. Overwrite [y/N]: `,
        );
        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      const response = await utils.prompt('JSON Pretty Print results [Y/n]: ');
      if (response.toLowerCase().startsWith('y')) {
        jsonParse = true;
      }

      if (!(await blobClient.exists())) {
        console.error(`blob '${blobClient.url}' does not exist`);
        process.exit(1);
      }

      await actions.decrypt(
        filepath,
        jsonParse,
        secretResult.value,
        blobClient,
      );
      break;
    }
  }
}

main().catch((err) => {
  const message =
    err instanceof RestError
      ? `Rest Error ${utils.fmtRestError(err)}`
      : err instanceof Error
        ? err.message
        : 'unexpected fatal error';

  console.error(`Unknown Error: ${message}`);
});
