#! /usr/bin/env node

import assert from 'node:assert';
import * as fs from 'node:fs';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { BlobClient, RestError } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import packageJSON from '../package.json' with { type: 'json' };
import * as actions from './actions.js';
import * as args from './args.js';
import * as environment from './environment.js';
import * as utils from './utils.js';

dotenv.config();
process.removeAllListeners('warning');

async function main(): Promise<void> {
  let result: args.ParseResult;
  try {
    result = args.parse(process.argv.slice(2));
  } catch (err) {
    utils.usage(err);
    return;
  }
  const { action, blobPath, filePath } = result;

  if (action === 'version') {
    console.error(`blobcrypt ${packageJSON.version}`);
    return;
  }

  if (action === 'help') {
    utils.usage();
    return;
  }

  const vars = environment.read();
  const index = await utils.promptOptions(
    'Please choose a container: ',
    vars.CONTAINER_URLS,
  );
  const containerIndex = Number(index);

  if (
    Number.isNaN(containerIndex) ||
    containerIndex > vars.CONTAINER_URLS.length ||
    containerIndex < 0
  ) {
    console.error(`invalid container options: ${index}`);
    process.exit(1);
  }

  const credentials = new DefaultAzureCredential();

  const containerURL = vars.CONTAINER_URLS[containerIndex];
  const blobURL = utils.getBlobURL(containerURL, blobPath);
  const blobClient = new BlobClient(blobURL, credentials);

  const secretClient = new SecretClient(vars.KEYVAULT_URL, credentials);
  const secretResult = await secretClient.getSecret(vars.SECRET_NAME);
  if (!secretResult.value) {
    console.error(`secret '${vars.SECRET_NAME}' does not exist`);
    process.exit(1);
  }

  const publicKey = await secretClient.getSecret(vars.PGP_PUBLIC_KEY);
  if (!publicKey.value) {
    console.error(`pgp public key '${vars.SECRET_NAME}' does not exist`);
    process.exit(1);
  }
  publicKey.value = Buffer.from(publicKey.value, 'base64').toString('utf8');

  const privateKey = await secretClient.getSecret(vars.PGP_PRIVATE_KEY);
  if (!privateKey.value) {
    console.error(`pgp private key '${vars.SECRET_NAME}' does not exist`);
    process.exit(1);
  }
  privateKey.value = Buffer.from(privateKey.value, 'base64').toString('utf8');

  switch (action) {
    case 'fetch': {
      let jsonParse = false;
      if (filePath && fs.existsSync(filePath)) {
        const response = await utils.prompt(
          `file '${filePath}' already exists. Overwrite [y/N]: `,
        );
        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      const response = await utils.prompt('JSON Pretty Print results [y/N]: ');
      if (response.toLowerCase().startsWith('y')) {
        jsonParse = true;
      }

      if (!(await blobClient.exists())) {
        console.error(`blob '${blobClient.url}' does not exist`);
        process.exit(1);
      }

      await actions.fetch(jsonParse, blobClient, filePath);
      break;
    }
    case 'encrypt': {
      assert(filePath, 'filepath is undefined in ecrypt');
      if (!fs.existsSync(filePath)) {
        console.error(`file '${filePath}' does not exist`);
        process.exit(1);
      }

      if (await blobClient.exists()) {
        const response = await utils.prompt(
          `blob '${blobPath}' already exists. Overwrite [y/N]: `,
        );

        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      await actions.encrypt(publicKey.value, blobClient, filePath);
      break;
    }
    case 'decrypt': {
      let jsonParse = false;
      if (filePath && fs.existsSync(filePath)) {
        const response = await utils.prompt(
          `file '${filePath}' already exists. Overwrite [y/N]: `,
        );
        if (!response.toLowerCase().startsWith('y')) {
          break;
        }
      }

      const response = await utils.prompt('JSON Pretty Print results [y/N]: ');
      if (response.toLowerCase().startsWith('y')) {
        jsonParse = true;
      }

      if (!(await blobClient.exists())) {
        console.error(`blob '${blobClient.url}' does not exist`);
        process.exit(1);
      }

      await actions.decrypt(
        jsonParse,
        secretResult.value,
        privateKey.value,
        blobClient,
        filePath,
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
