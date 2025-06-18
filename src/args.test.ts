import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import * as args from './args.js';

describe('arg module', () => {
  it('parsed args', () => {
    let want: args.ParseResult = {
      action: 'encrypt',
      title: 'title',
      filepath: '/path',
    };
    const encResult = args.parse(['encrypt', 'title', '/path']);
    assert.deepEqual(encResult, want);

    want = {
      action: 'decrypt',
      title: 'title',
      filepath: '/path',
    };
    const decResult = args.parse(['decrypt', 'title', '/path']);
    assert.deepEqual(decResult, want);

    want = {
      action: 'fetch',
      title: 'title',
      filepath: '/path',
    };
    const fetchResult = args.parse(['fetch', 'title', '/path']);
    assert.deepEqual(fetchResult, want);

    want = args.VersionArgs;
    const verResult = args.parse(['version']);
    assert.deepEqual(verResult, want);
    const dashVerResult = args.parse(['--version']);
    assert.deepEqual(dashVerResult, want);

    want = args.HelpArgs;
    const helResult = args.parse(['help']);
    assert.deepEqual(helResult, want);
    const dashHelResult = args.parse(['--help']);
    assert.deepEqual(dashHelResult, want);
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

  it('validates the action is correct', () => {
    assert.throws(() => {
      args.parse(['action', 'title', '/path']);
    }, args.InvalidActionError('action'));
  });
});
