import { parseArgs } from 'node:util';
import pkg from '../package.json' with { type: 'json' };

/** @import {ParseArgsConfig} from 'node:util' */

/**
 * Logging utility function
 * @param {unknown[]} args
 */
export function log(...args) {
  console.error(`${pkg.name}:`, ...args);
}

/**
 * Wrapper around the node `parseArgs` utility that allows for required variables
 * @template T
 * @param {ParseArgsConfig} config
 * @param {string[]} requiredArgs
 * @returns {T}
 */
export function argParse(config, requiredArgs) {
  /** @type {{[name: string]: string | boolean | (string | boolean)[] | undefined}} */
  let values = {};
  try {
    const result = parseArgs(config);
    values = result.values;
  } catch (err) {
    if (err instanceof TypeError) {
      log(err.message);
      process.exit(1);
    }
  }

  const missingArgs = requiredArgs.filter((arg) => {
    return !values[arg]
  });

  if (missingArgs.length > 0) {
    log('missing required option(s):', missingArgs.join(', '));
    process.exit(1);
  }

  return /** @type {T} */(values);
}


/**
 * Formats a account and container into the correct url for a blob storage account
 * @param {string} account
 * @param {string} container
 * @returns {string}
 */
export function makeBlobStorageUrl(account, container) {
  return `https://${account}.blob.core.windows.net/${container}`;
};

/**
 * Formats a secret-account into the correct url for a key vault accont
 * @param {string} account
 * @returns {string}
 */
export function makeKeyVaultUrl(account) {
  return `https://${account}.vault.azure.net/`;
}

/**
 * Trys to parse the raw data as JSON. If it is JSON, the data is returned
 * as a pretty-printable JSON string. Otherwise the original is returned.
 * @param {string} raw
 * @returns {string}
 */
export function tryParseJSON(raw) {
  try {
    const contents = JSON.parse(raw);
    if (typeof contents !== 'object') {
      return raw;
    }

    return JSON.stringify(contents, null, 2);
  } catch (_) {
    return raw;
  }
}
