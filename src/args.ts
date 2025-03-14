export type ParseResult = {
  title: string;
  filepath: string;
};

export const MissingArgumentError = new Error('missing arguments');

/**
 * Parses the expected args from the command line
 */
export function parse(argv: string[]): ParseResult {
  if (argv.length !== 2) {
    throw MissingArgumentError;
  }

  const [title, filepath] = argv;

  return {
    title,
    filepath,
  };
}
