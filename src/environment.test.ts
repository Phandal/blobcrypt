import { before, after, describe, it } from 'node:test';
import assert from 'node:assert';
import * as environment from './environment.js';

describe('environment module', () => {
  before(() => {
    for (const eVar of environment.EnvVars) {
      process.env[eVar] = 'testvalue';
    }
  });

  after(() => {
    for (const eVar of environment.EnvVars) {
      process.env[eVar] = undefined;
    }
  });

  it('should return the values needed by the app, read from the environment', () => {
    const vars = environment.read();

    for (const requiredEnvParam of environment.EnvVars) {
      assert.notDeepEqual(
        vars[requiredEnvParam],
        undefined,
        `${requiredEnvParam} is undefined`,
      );
    }
  });

  it('should throw if the needed values are not present', () => {
    process.env[environment.EnvVars[0]] = '';

    assert.throws(() => {
      environment.read();
    });
  });
});
