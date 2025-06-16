export type ParseResult = {
  action: 'encrypt' | 'decrypt' | 'version' | 'help' | 'fetch';
  title: string;
  filepath: string;
  jsonParse: boolean;
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
  jsonParse: false,
};

export const HelpArgs: ParseResult = {
  action: 'help',
  title: '',
  filepath: '',
  jsonParse: false,
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

  if (argv.length > 4) {
    throw UnexpectedArgumentError(argv.slice(4));
  }

  const [action, title, filepath, jsonParse] = argv;

  if (action !== 'encrypt' && action !== 'decrypt' && action !== 'fetch') {
    throw InvalidActionError(action);
  }

  let json = false;
  switch (jsonParse?.toLowerCase()) {
    case 'true':
      if (action === 'encrypt') {
        console.error(`[WARN]: ignoring jsonParse for 'encrypt' action.`);
        json = false;
      } else {
        json = true;
      }
      break;
    case 'false':
    case undefined:
      json = false;
      break;
    default:
      console.error(`[WARN]: ignoring invalid jsonParse value '${action}'.`);
  }

  return {
    action,
    title,
    filepath,
    jsonParse: json,
  };
}
