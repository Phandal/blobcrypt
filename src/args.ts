export type ParseResult = {
  action: 'encrypt' | 'decrypt';
  title: string;
  filepath: string;
};

export const MissingArgumentError = new Error('missing arguments');

export const InvalidActionError = (action: string) =>
  new Error(`invalid action '${action}'`);

export const UnexpectedArgumentError = (args: string[]) =>
  new Error(`unexpected arguments '${args.join(', ')}'`);

/**
 * Parses the expected args from the command line
 */
export function parse(argv: string[]): ParseResult {
  if (argv.length < 3) {
    throw MissingArgumentError;
  }

  if (argv.length > 3) {
    throw UnexpectedArgumentError(argv.slice(3));
  }

  const [action, title, filepath] = argv;

  if (action !== 'encrypt' && action !== 'decrypt') {
    throw InvalidActionError(action);
  }

  return {
    action,
    title,
    filepath,
  };
}
