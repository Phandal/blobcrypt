import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as args from './args.js';

describe('the arg module', () => {
  it('parsed args', () => {
    const want: args.ParseResult = {
      action: 'encrypt',
      title: 'title',
      filepath: '/path',
    };
    const encResult = args.parse(['encrypt', 'title', '/path']);
    assert.deepEqual(encResult, want);

    want.action = 'decrypt';
    const decResult = args.parse(['decrypt', 'title', '/path']);
    assert.deepEqual(decResult, want);
  });

  it('validates the number of args', () => {
    assert.throws(() => {
      args.parse(['title', '/path']);
    }, args.MissingArgumentError);

    assert.throws(
      () => {
        args.parse(['encrypt', 'title', '/path', 'extra', 'args']);
      },
      args.UnexpectedArgumentError(['extra', 'args']),
    );
  });

  it('validates the action is corrent', () => {
    assert.throws(() => {
      args.parse(['action', 'title', '/path']);
    }, args.InvalidActionError('action'));
  });
});
