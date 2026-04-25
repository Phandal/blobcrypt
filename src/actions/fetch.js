import { writeFile } from 'node:fs/promises';
import { AggregateAuthenticationError, DefaultAzureCredential } from '@azure/identity';
import { ContainerClient, RestError } from '@azure/storage-blob';
import { argParse, log, makeBlobStorageUrl, tryParseJSON } from '../common.js';

/** @import {ParseArgsConfig} from 'node:util' */

/**
 * @typedef {object} Config
 * @prop {string} account
 * @prop {string} container
 * @prop {string} name
 * @prop {string} [output]
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
  try {
    /** @type {Config} */
    const config = argParse({ args, options: OPTIONS }, REQUIREDARGS);
    const credentials = new DefaultAzureCredential();

    const containerClient = new ContainerClient(makeBlobStorageUrl(config.account, config.container), credentials);
    const blobClient = containerClient.getBlobClient(config.name);

    const raw = (await blobClient.downloadToBuffer()).toString('utf8');
    const contents = tryParseJSON(raw);

    if (config.output) {
      await writeFile(config.output, contents);
    } else {
      console.log(contents);
    }
  } catch (err) {
    if (err instanceof RestError) {
      const msg = /** @type {any} */(err?.details)?.errorCode || err.message || 'unknown rest error';
      log('rest error:', msg);
      process.exit(1);
    }

    if (err instanceof AggregateAuthenticationError) {
      log(`credentials unavailable. Did you 'az login'?`);
      process.exit(1);
    }

    throw err;
  }
}
