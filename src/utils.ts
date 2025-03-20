import readline from 'node:readline/promises';

export function usage(err?: unknown): void {
  if (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
  console.error('Usage:');
  console.error('\tblobcrypt <ACTION> <BLOB_NAME> <OUTPUT_FILE>');
  console.error("\t\tWhere ACTION is either 'encrypt' or 'decrypt'");
  console.error('');
  console.error('\t--version');
  console.error('\t--help');
  process.exit(1);
}

export async function prompt(q: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(q);
  rl.close();

  return answer;
}
