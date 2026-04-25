import { test } from 'node:test'
import assert from 'node:assert';
import { makeBlobStorageUrl, makeKeyVaultUrl, tryParseJSON } from '../src/common.js';

test('makeBlobStorageUrl', () => {
  const got = makeBlobStorageUrl('account', 'container');
  const want = 'https://account.blob.core.windows.net/container';
  assert.deepEqual(got, want);
});

test('makeKeyVaultUrl', () => {
  const got = makeKeyVaultUrl('account');
  const want = 'https://account.vault.azure.net/';
  assert.deepEqual(got, want);
});

test('tryParseJSON', () => {
  assert.deepEqual(tryParseJSON('hello'), 'hello');

  assert.deepEqual(tryParseJSON('{ "hello": "world" }'), '{\n  "hello": "world"\n}');
});
