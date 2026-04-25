import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { DefaultAzureCredential } from '@azure/identity';
import { ContainerClient } from '@azure/storage-blob';
import { argParse, log, makeBlobStorageUrl, tryParseJSON } from '../common.js';

/** @import {ParseArgsConfig} from 'node:util' */

/**
 * @typedef {object} Config
 * @prop {string} account
 * @prop {string} container
 * @prop {string} name
 * @prop {string} [output]
 * @prop {boolean} [force]
 */


const REQUIREDARGS = ['account', 'container', 'name'];

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
 * Downloads a file from blob storage
 * @param {string[]} args
 * @returns {Promise<void>}
 */
export async function fetchHandler(args) {
  /** @type {Config} */
  const config = argParse({ args, options: OPTIONS }, REQUIREDARGS);
  const credentials = new DefaultAzureCredential();

  const containerClient = new ContainerClient(makeBlobStorageUrl(config.account, config.container), credentials);
  const blobClient = containerClient.getBlobClient(config.name);

  const raw = (await blobClient.downloadToBuffer()).toString('utf8');
  const contents = tryParseJSON(raw);

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
