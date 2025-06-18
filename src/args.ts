export type ParseResult = {
  action: 'encrypt' | 'decrypt' | 'version' | 'help' | 'fetch';
  title: string;
  filepath: string;
};

export const MissingArgumentError = new Error('missing arguments');

export const InvalidActionError = (action: string) =>
  new Error(`invalid action '${action}'`);

export const UnexpectedArgumentError = (args: string[]) =>
  new Error(`unexpected arguments '${args.join(', ')}'`);

export const VersionArgs: ParseResult = {
  action: 'version',
  title: '',
  filepath: '',
};

export const HelpArgs: ParseResult = {
  action: 'help',
  title: '',
  filepath: '',
};

/**
 * Parses the expected args from the command line
 */
export function parse(argv: string[]): ParseResult {
  if (argv.length === 1) {
    const action = argv[0];

    if (action === 'version' || action === '--version') {
      return VersionArgs;
    }

    if (action === 'help' || action === '--help') {
      return HelpArgs;
    }
  }

  if (argv.length < 3) {
    throw MissingArgumentError;
  }

  if (argv.length > 3) {
    throw UnexpectedArgumentError(argv.slice(3));
  }

  const [action, title, filepath] = argv;

  if (action !== 'encrypt' && action !== 'decrypt' && action !== 'fetch') {
    throw InvalidActionError(action);
  }

  return {
    action,
    title,
    filepath,
  };
}
