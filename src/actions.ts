import * as fs from 'node:fs';
import type { BlobClient } from '@azure/storage-blob';
import * as pgp from 'openpgp';

/**
 * Download a `blob` from blob storage and decrypt it, storing the result in the file specified by `filepath`.
 */
export async function decrypt(
  filepath: string,
  jsonParse: boolean,
  password: string,
  privateKey: string,
  blobClient: BlobClient,
): Promise<void> {
  console.error('Fetching blob contents...');
  const blobContents = (await blobClient.downloadToBuffer()).toString('utf8');

  console.error('Decrypting blob contents...');
  let decryptedResult = undefined;
  try {
    console.error('Attempting asymmetric decryption...');
    decryptedResult = await pgp.decrypt({
      message: await pgp.readMessage({ armoredMessage: blobContents }),
      decryptionKeys: await pgp.readPrivateKey({ armoredKey: privateKey }),
    });
  } catch (err) {
    console.error(
      `Failed asymmetric decryption. Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
    console.error('Attempting symmetric decryption...');
    decryptedResult = await pgp.decrypt({
      message: await pgp.readMessage({ armoredMessage: blobContents }),
      passwords: password,
    });
  }

  console.error('Writing decrypted contents to file...');
  if (jsonParse) {
    fs.writeFileSync(
      filepath,
      JSON.stringify(JSON.parse(decryptedResult.data), null, 2),
    );
  } else {
    fs.writeFileSync(filepath, decryptedResult.data);
  }
  console.error(
    `Wrote decrypted blob (${decryptedResult.data.length} characters) to file '${filepath}'`,
  );
}

/**
 * Encrypt a file specified by 'filepath', uploading the result to a `blob` in blob storage.
 */
export async function encrypt(
  filepath: string,
  publicKey: string,
  blobClient: BlobClient,
): Promise<void> {
  console.error('Loading file contents...');
  const input = fs.readFileSync(filepath).toString('utf8');

  console.error('Encrypting file contents...');
  const encryptedResult = await pgp.encrypt({
    message: await pgp.createMessage({ text: input }),
    encryptionKeys: await pgp.readKey({ armoredKey: publicKey }),
  });

  console.error('Writing encrypted contents to blob...');
  const blockClient = blobClient.getBlockBlobClient();
  await blockClient.uploadData(Buffer.from(encryptedResult));
  console.error(
    `Wrote encrypted file (${input.length} characters) to blob '${blobClient.url}'`,
  );
}

/**
 * Download a `blob` from blob storage, storing the result in the file specified by `filepath`.
 */
export async function fetch(
  filepath: string,
  jsonParse: boolean,
  blobClient: BlobClient,
): Promise<void> {
  console.error('Fetching blob contents...');
  const blobContents = (await blobClient.downloadToBuffer()).toString('utf8');

  console.error('Writing contents to file...');
  if (jsonParse) {
    fs.writeFileSync(
      filepath,
      JSON.stringify(JSON.parse(blobContents), null, 2),
    );
  } else {
    fs.writeFileSync(filepath, blobContents);
  }
  console.error(
    `Wrote fetched blob (${blobContents.length} characters) to file '${filepath}'`,
  );
}
