import * as fs from 'node:fs';
import type { BlobClient } from '@azure/storage-blob';
import * as pgp from 'openpgp';

/**
 * Download a `blob` from blob storage and decrypt it, storing the result in the file specified by `filepath`.
 */
export async function decrypt(
  filepath: string,
  password: string,
  blobClient: BlobClient,
): Promise<void> {
  console.error('Fetching blob contents...');
  const blobContents = (await blobClient.downloadToBuffer()).toString('utf8');
  const decryptedResult = await pgp.decrypt({
    message: await pgp.readMessage({ armoredMessage: blobContents }),
    passwords: password,
  });

  fs.writeFileSync(filepath, decryptedResult.data);
  console.error(
    `Wrote decrypted blob (${decryptedResult.data.length}) to file '${filepath}'`,
  );
}
