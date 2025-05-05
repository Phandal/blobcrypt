import assert from 'node:assert';
import { describe, it } from 'node:test';
import { RestError } from '@azure/storage-blob';
import * as utils from './utils.js';

describe('util module', () => {
  it('formats the error', () => {
    const err = new RestError('test message', { statusCode: 400 });

    const got = utils.fmtRestError(err);
    const want = '400 | RestError | UNKNOWN';
    assert.deepEqual(got, want);
  });
});
