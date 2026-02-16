import * as fs from 'node:fs';
import type { BlobClient } from '@azure/storage-blob';
import * as pgp from 'openpgp';

/**
 * Download a `blob` from blob storage and decrypt it, storing the result in the file specified by `filepath`.
 */
export async function decrypt(
  jsonParse: boolean,
  password: string,
  privateKey: string,
  blobClient: BlobClient,
  filePath?: string,
): Promise<void> {
  console.error('Fetching blob contents...');
  const blobContents = (await blobClient.downloadToBuffer()).toString('utf8');

  console.error('Decrypting blob contents...');
  let decryptedResult = undefined;
  const format: pgp.DecryptOptions['format'] = jsonParse ? 'utf8' : 'binary';

  try {
    console.error('Attempting asymmetric decryption...');
    decryptedResult = await pgp.decrypt({
      message: await pgp.readMessage({ armoredMessage: blobContents }),
      format,
      decryptionKeys: await pgp.readPrivateKey({ armoredKey: privateKey }),
    });
  } catch (err) {
    console.error(
      `Failed asymmetric decryption. Error: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
    console.error('Attempting symmetric decryption...');
    decryptedResult = await pgp.decrypt({
      message: await pgp.readMessage({ armoredMessage: blobContents }),
      format,
      passwords: password,
    });
  }

  const contents = Buffer.from(decryptedResult.data).toString('utf8');

  if (filePath && jsonParse) {
    console.error('Writing decrypted prettified contents to file...');
    fs.writeFileSync(filePath, JSON.stringify(JSON.parse(contents), null, 2));
    console.error(
      `Wrote decrypted prettified blob (${contents.length} characters) to file '${filePath}'`,
    );
  } else if (filePath && !jsonParse) {
    console.error('Writing decrypted contents to file...');
    fs.writeFileSync(filePath, contents);
    console.error(
      `Wrote decrypted blob (${contents.length} characters) to file '${filePath}'`,
    );
  } else if (!filePath && jsonParse) {
    console.log(JSON.stringify(JSON.parse(contents), null, 2));
  } else {
    console.log(contents);
  }
}

/**
 * Encrypt a file specified by 'filepath', uploading the result to a `blob` in blob storage.
 */
export async function encrypt(
  publicKey: string,
  blobClient: BlobClient,
  filepath: string,
): Promise<void> {
  console.error('Loading file contents...');
  const input = fs.readFileSync(filepath);

  console.error('Encrypting file contents...');
  const encryptedResult = await pgp.encrypt({
    message: await pgp.createMessage({ binary: input }),
    encryptionKeys: await pgp.readKey({ armoredKey: publicKey }),
    format: 'armored',
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
  jsonParse: boolean,
  blobClient: BlobClient,
  filePath?: string,
): Promise<void> {
  console.error('Fetching blob contents...');
  const blobContents = (await blobClient.downloadToBuffer()).toString('utf8');

  if (filePath && jsonParse) {
    console.error('Writing prettified contents to file...');
    fs.writeFileSync(
      filePath,
      JSON.stringify(JSON.parse(blobContents), null, 2),
    );
    console.error(
      `Wrote fetched prettified blob (${blobContents.length} characters) to file '${filePath}'`,
    );
  } else if (filePath && !jsonParse) {
    console.error('Writing contents to file...');
    fs.writeFileSync(filePath, blobContents);
    console.error(
      `Wrote fetched blob (${blobContents.length} characters) to file '${filePath}'`,
    );
  } else if (!filePath && jsonParse) {
    console.log(JSON.stringify(JSON.parse(blobContents), null, 2));
  } else {
    console.log(blobContents);
  }
}
