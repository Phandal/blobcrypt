import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as args from './args.js';

describe('the arg module', () => {
  it('parsed args', () => {
    const want: args.ParseResult = {
      title: 'title',
      filepath: '/path',
    };

    const encResult = args.parse(['title', '/path']);
    assert.deepEqual(encResult, want);
  });

  it('validates the number of args', () => {
    assert.throws(() => {
      args.parse(['title']);
    }, args.MissingArgumentError);
  });
});
