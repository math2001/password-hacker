import { error } from "./utils";

interface Options {
  swapcase: boolean;
}

export const PUNCTUATION_SYMBOLS = "<>?,./!@#$%^&*()_+-=~`{}[]:\";'";
export const PATTERN_SOLVER_HELP = String.raw`
features:
  - \d: replaces with digits between 0-9 inclusive
  - \sX: try with lower and upper X
  - \p: replaces with punctuation symbols
  - \\: literal backslash

Punctuation symbols: ${PUNCTUATION_SYMBOLS}

Examples:
  - liam\d -> {liam0, liam1, liam2, ..., liam9}
  - \sliam -> {liam, Liam}
  - liam\p -> {liam!, liam<, liam>, ..., liam"}
`;

export class PatternSolver {
  private buf: string[];
  private length: number;
  private parsedPattern: string[];
  private opt: Options;

  constructor() {
    this.buf = new Array(4096);
    this.length = 0;
    this.parsedPattern = [];
    this.opt = {
      swapcase: false,
    };
  }

  setOption<T extends keyof Options>(name: T, value: Options[T]) {
    this.opt[name] = value;
  }

  numberOfPermutations(): number {
    let total: number = 1;
    for (let part of this.parsedPattern) {
      if (part.length === 1 && isLetter(part) && this.opt.swapcase) {
        total *= 2;
      } else if (part === "\\p") {
        total *= PUNCTUATION_SYMBOLS.length;
      } else if (part === "d") {
        total *= 10;
      } else if (part.startsWith("\\s")) {
        total *= 2;
      }
      // otherwise, we the part is static (ie. always the same) and thus the
      // total number of permutations doesn't change
    }
    return total;
  }

  *generate() {
    yield "foo";
    yield "bar";
  }

  setPattern(pattern: string): error | null {
    try {
      this.parse(pattern);
    } catch (err) {
      if (err instanceof ParseError) {
        return err.message;
      }
      throw err;
    }
    return null;
  }

  private parse(patternString: string) {
    const pattern = patternString.split("");
    const peek = () => pattern[pattern.length - 1];
    const consume = (): string => {
      if (eof()) throw new ParseError("Unexpected end of pattern");
      return pattern.shift() as string;
    };
    const eof = () => pattern.length === 0;

    this.parsedPattern.length = 0;

    while (!eof()) {
      const char = consume();
      if (char === "\\") {
        const next = consume();
        // escaped backslash
        if (next === "\\") this.parsedPattern.push("\\");
        else if (next === "d" || next === "p")
          this.parsedPattern.push(`\\${next}`);
        else if (next === "s") {
          const letter = consume();
          if (!isLetter(letter))
            throw new ParseError(`\\sX, X should be a letter, got '${letter}'`);
          this.parsedPattern.push(`\\s${letter}`);
        } else {
          throw new ParseError(`Unknown command '\\${next}'`);
        }
      } else {
        this.parsedPattern.push(char);
      }
    }
  }
}

export class ParseError extends Error {}

function isLetter(char: string) {
  const code = char.charCodeAt(0);
  return (
    ("a".charCodeAt(0) <= code && code <= "z".charCodeAt(0)) ||
    ("A".charCodeAt(0) <= code && code <= "Z".charCodeAt(0))
  );
}
