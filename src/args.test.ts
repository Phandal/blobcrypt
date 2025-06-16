import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import * as args from './args.js';

describe('arg module', () => {
  it('parsed args', () => {
    let want: args.ParseResult = {
      action: 'encrypt',
      title: 'title',
      filepath: '/path',
      jsonParse: false,
    };
    const encResult = args.parse(['encrypt', 'title', '/path']);
    assert.deepEqual(encResult, want);

    want = {
      action: 'decrypt',
      title: 'title',
      filepath: '/path',
      jsonParse: false,
    };
    const decResult = args.parse(['decrypt', 'title', '/path']);
    assert.deepEqual(decResult, want);

    want = {
      action: 'fetch',
      title: 'title',
      filepath: '/path',
      jsonParse: false,
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

  it('ignores jsonParse when encrypting', () => {
    const result = args.parse(['encrypt', 'id', 'path', 'true']);
    const want = {
      action: 'encrypt',
      title: 'id',
      filepath: 'path',
      jsonParse: false,
    };
    assert.deepEqual(result, want);
  });

  it('defaults the jsonparse to false if invalid', () => {
    const trueResult = args.parse(['decrypt', 'id', 'path', 'true']);
    let want = {
      action: 'decrypt',
      title: 'id',
      filepath: 'path',
      jsonParse: true,
    };
    assert.deepEqual(trueResult, want);

    const falseResult = args.parse(['decrypt', 'id', 'path', 'false']);
    want = {
      action: 'decrypt',
      title: 'id',
      filepath: 'path',
      jsonParse: false,
    };
    assert.deepEqual(falseResult, want);

    const ignoreResult = args.parse(['decrypt', 'id', 'path', 'nothing']);
    want = {
      action: 'decrypt',
      title: 'id',
      filepath: 'path',
      jsonParse: false,
    };
    assert.deepEqual(ignoreResult, want);
  });

  it('validates the number of args', () => {
    assert.throws(() => {
      args.parse(['title', '/path']);
    }, args.MissingArgumentError);

    assert.throws(
      () => {
        args.parse(['encrypt', 'title', '/path', 'false', 'extra', 'args']);
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
