export function usage(err: unknown): void {
  if (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
  console.error('Usage:');
  console.error('\tblobcrypt [BLOB_NAME] [OUTPUT_FILE]');
  process.exit(1);
}
