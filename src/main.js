#! /usr/bin/env node

import pkg from '../package.json' with { type: 'json' };
import { log } from './common.js';
import { fetchHandler } from './actions/fetch.js';
import { decryptHandler } from './actions/decrypt.js';

/**
 * Shows the usage message
 */
function usage() {
  console.log(`usage:
  ${pkg.name} <action> [options]

ACTIONS
  help               Print this message
  version            Print version information
  fetch              Fetch a file from blob storage
  decrypt            Decrypt a file from blob storage
  encrypt            Encrypt a file into blob storage

GLOBAL OPTIONS
  --account          The storage account name
  --container        The storage container name
  --name             The blob name

FETCH OPTIONS
  --output           Write any output to the following path. (Default: stdout)

DECRYPT OPTIONS
  --output           Write any output to the following path. (Default: stdout)
  --secret-account   The keyvault account name
  --secret-key       The name of the key to use as the pgp private key

ENCRYPT OPTIONS
  --input            Read file from the following path. (Default: stdin)
  --secret-account   The keyvault account name
  --secret-key       The name of the key to use as the pgp public key
`
  );
}

/**
 * Shows version information
 */
function version() {
  console.log(pkg.name, pkg.version);
}

/**
  * @returns {Promise<void>}
 */
async function main() {
  if (process.argv.length < 3) {
    usage();
    process.exit(1);
  }

  const action = process.argv[2];
  switch (action) {
    case 'help':
    case '-h':
    case '--help':
      usage();
      break;
    case 'version':
    case '-v':
    case '--version':
      version();
      break;
    case 'fetch':
      await fetchHandler(process.argv.slice(3));
      break;
    case 'decrypt':
      await decryptHandler(process.argv.slice(3));
      break;
    default:
      log(`unknown action '${action}'`);
      process.exit(1);
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : undefined;
  log('an unknown error occurred:', msg);
  process.exit(1);
})
