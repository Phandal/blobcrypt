import readline from 'node:readline/promises';
import type { RestError } from '@azure/storage-blob';

export function usage(err?: unknown): void {
  if (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
  console.error('Usage:');
  console.error('\tblobcrypt <ACTION> <BLOB_NAME> <OUTPUT_FILE> [JSON_PARSE]');
  console.error("\t\tWhere ACTION is either 'encrypt', 'decrypt', or 'fetch'");
  console.error("\t\tand JSON_PARSE is either 'true' or 'false'");
  console.error('');
  console.error('\t--version');
  console.error('\t--help');
  process.exit(1);
}

function createRLInterface(
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
): readline.Interface {
  return readline.createInterface({
    input,
    output,
  });
}

export async function promptOptions(
  q: string,
  options: string[],
): Promise<string> {
  const rl = createRLInterface();

  options.forEach((option, index) => {
    console.log(`${index}. ${option}`);
  });

  const answer = await rl.question(q);
  rl.close();

  return answer;
}

export async function prompt(q: string): Promise<string> {
  const rl = createRLInterface();

  const answer = await rl.question(q);
  rl.close();

  return answer;
}

export function fmtRestError(err: RestError): string {
  return `${err.statusCode ?? 'UNKNOWN'} | ${err.name} | ${err.details ?? 'UNKNOWN'}`;
}
