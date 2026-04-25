import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { DefaultAzureCredential } from '@azure/identity';
import { ContainerClient } from '@azure/storage-blob';
import { argParse, log, makeBlobStorageUrl, makeKeyVaultUrl, tryParseJSON } from '../common.js';
import * as pgp from 'openpgp';
import { SecretClient } from '@azure/keyvault-secrets';

/** @import {ParseArgsConfig} from 'node:util' */

/**
 * @typedef {object} Config
 * @prop {string} account
 * @prop {string} container
 * @prop {string} name
 * @prop {string} secret-account
 * @prop {string} secret-key
 * @prop {string} [output]
 * @prop {boolean} [force]
 */

/** @type {(keyof Config)[]} */
const REQUIREDARGS = ['account', 'container', 'name', 'secret-account', 'secret-key'];

/** @type {ParseArgsConfig['options']} */
const OPTIONS = {
  account: {
    type: 'string',
    short: 'a',
  },
  container: {
    type: 'string',
    short: 'c',
  },
  name: {
    type: 'string',
    short: 'n',
  },
  'secret-account': {
    type: 'string',
    short: 's',
  },
  'secret-key': {
    type: 'string',
    short: 'k',
  },
  force: {
    type: 'boolean',
    short: 'f',
  },
  output: {
    type: 'string',
    short: 'o',
  }
};


/**
 * Downloads a file from blob storage and decrypts it
 * @param {string[]} args
 * @returns {Promise<void>}
 */
export async function decryptHandler(args) {
  /** @type {Config} */
  const config = argParse({ args, options: OPTIONS }, REQUIREDARGS);
  const credentials = new DefaultAzureCredential();

  const secretClient = new SecretClient(makeKeyVaultUrl(config['secret-account']), credentials);
  const secret = await secretClient.getSecret(config['secret-key']);
  if (!secret.value) {
    log(`secret key '${config['secret-key']}' is empty`);
    process.exit(1);
  }
  const privateKey = Buffer.from(secret.value, 'base64').toString('utf8');

  const containerClient = new ContainerClient(makeBlobStorageUrl(config.account, config.container), credentials);
  const blobClient = containerClient.getBlobClient(config.name);

  const raw = (await blobClient.downloadToBuffer()).toString('utf8');

  const decrypted = await pgp.decrypt({
    message: await pgp.readMessage({ armoredMessage: raw }),
    format: 'binary',
    decryptionKeys: await pgp.readPrivateKey({ armoredKey: privateKey }),
  });

  const contents = tryParseJSON(Buffer.from(decrypted.data).toString('utf8'));

  if (config.output) {
    if (existsSync(config.output) && !config.force) {
      log(`file '${config.output}' already exitss. Use --force to overwrite`);
      process.exit(1);
    }

    await writeFile(config.output, contents);
  } else {
    console.log(contents);
  }
}
