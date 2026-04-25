import { readFile } from 'node:fs/promises';
import { DefaultAzureCredential } from '@azure/identity';
import { ContainerClient } from '@azure/storage-blob';
import { argParse, log, makeBlobStorageUrl, makeKeyVaultUrl } from '../common.js';
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
 * @prop {string} [input]
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
  input: {
    type: 'string',
    short: 'i',
  }
};

/**
 * Reads all of stdin
 * @returns {Promise<Buffer>}
 */
async function readInputFromStdin() {
  let data = []
  // process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    data.push(chunk)
  }

  return Buffer.concat(data);
}

/**
 * Encrypts a file and stores it in Blob Storage
 * @param {string[]} args
 * @returns {Promise<void>}
 */
export async function encryptHandler(args) {
  /** @type {Config} */
  const config = argParse({ args, options: OPTIONS }, REQUIREDARGS);

  const input = config.input ? await readFile(config.input) : await readInputFromStdin()

  const credentials = new DefaultAzureCredential();

  const secretClient = new SecretClient(makeKeyVaultUrl(config['secret-account']), credentials);
  const secret = await secretClient.getSecret(config['secret-key']);
  if (!secret.value) {
    log(`secret key '${config['secret-key']}' is empty`);
    process.exit(1);
  }
  const publicKey = Buffer.from(secret.value, 'base64').toString('utf8');

  const encrypted = await pgp.encrypt({
    message: await pgp.createMessage({ binary: input }),
    format: 'armored',
    encryptionKeys: await pgp.readKey({ armoredKey: publicKey }),
  });

  const containerClient = new ContainerClient(makeBlobStorageUrl(config.account, config.container), credentials);
  const blobClient = containerClient.getBlockBlobClient(config.name);

  if (await blobClient.exists() && !config.force) {
    log(`blob '${config.name}' already exists. Use --force to overwrite`);
    process.exit(1);
  }

  blobClient.uploadData(Buffer.from(encrypted));
}
