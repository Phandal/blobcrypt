export type ParseResult = {
  action: 'encrypt' | 'decrypt' | 'version';
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
  if (argv.length === 1 && (argv[0] === 'version' || argv[0] === '--version')) {
    return {
      action: 'version',
      title: '',
      filepath: '',
    };
  }

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
