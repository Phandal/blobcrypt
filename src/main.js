#! /usr/bin/env node

import pkg from '../package.json' with { type: 'json' };
import { log } from './common.js';
import { fetchHandler } from './actions/fetch.js';

/**
 * Shows the usage message
 */
function usage() {
  console.log(`usage:
    ${pkg.name} <action> [options]

  ACTIONS
    help         Print this message
    version      Print version information
    encrypt      Encrypt a file into blob storage
    decrypt      Decrypt a file from blob storage
    fetch        Fetch a file from blob storage

  OPTIONS
    todo`
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
