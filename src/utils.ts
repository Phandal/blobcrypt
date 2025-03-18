import readline from 'node:readline/promises';

export function usage(err: unknown): void {
  if (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
  console.error('Usage:');
  console.error('\tblobcrypt <ACTION> <BLOB_NAME> <OUTPUT_FILE>');
  console.error("\t\tWhere ACTION is either 'encrypt' or 'decrypt'");
  process.exit(1);
}

export async function promt(q: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(q);
  rl.close();

  return answer;
}
