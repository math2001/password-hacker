import { error } from "./utils";

interface Options {
  swapcase: boolean;
}

export const PUNCTUATION_SYMBOLS = "<>?,./!@#$%^&*() _+-=~`{}[]:\";'";
export const PATTERN_SOLVER_HELP = String.raw`
features:
  - \d: replaces with digits between 0-9 inclusive
  - \sX: try with lower and upper case X
  - \p: try with punctuation symbols
  - \\: literal backslash

Punctuation symbols: ${PUNCTUATION_SYMBOLS}

Examples:
  - liam\d -> {liam0, liam1, liam2, ..., liam9}
  - \sliam -> {liam, Liam}
  - liam\p -> {liam!, liam<, liam>, ..., liam"}
`;

export class PatternSolver {
  public buf: string[];
  public buflength: number;

  private parsedPattern: string[];
  private generating: boolean;
  private opt: Options;

  constructor() {
    this.buf = new Array(4096);
    this.buflength = 0;
    this.parsedPattern = [];
    this.opt = {
      swapcase: false,
    };
    this.generating = false;
  }

  public setOption<T extends keyof Options>(name: T, value: Options[T]) {
    if (this.generating) throw new Error("finish consuming generator first");
    this.opt[name] = value;
  }

  public numberOfPermutations(partLengths?: number[]): number {
    let total: number = 1;
    for (let part of this.parsedPattern) {
      const length = this.expandPartLength(part);
      total *= length;
      if (partLengths) partLengths.push(length);
    }
    return total;
  }

  /*
   * User must consume the entire generator, or throw the generator (ie.
   * gen.throw(null))
   */
  public *generate() {
    const lengths: number[] = [];
    const total = this.numberOfPermutations(lengths);
    this.buflength = this.parsedPattern.length;
    this.generating = true;

    loop: for (let i = 0; i < total; i++) {
      // generate the ith permutation
      let consumed = 1;
      for (let j = this.parsedPattern.length - 1; j >= 0; j--) {
        this.buf[j] = this.expandPartIth(
          this.parsedPattern[j],
          Math.floor(i / consumed) % lengths[j]
        );
        consumed *= lengths[j];
      }
      const str = this.buf.slice(0, this.buflength).join("");
      try {
        yield str;
      } catch (err) {
        break loop;
      }
    }
    this.generating = false;
  }

  setPattern(pattern: string): error | null {
    if (this.generating) throw new Error("finish consuming generator first");
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

  private expandPartLength(part: string): number {
    if (part.length === 1 && isLetter(part) && this.opt.swapcase) return 2;
    if (part === "\\p") return PUNCTUATION_SYMBOLS.length;
    if (part === "\\d") return 10;
    if (part.startsWith("\\s")) return 2;
    return 1;
  }

  private expandPartIth(part: string, ith: number): string {
    if (part.length === 1 && isLetter(part) && this.opt.swapcase) {
      if (ith === 0) return part.toLowerCase();
      if (ith === 1) return part.toUpperCase();
    }
    if (part === "\\p") return PUNCTUATION_SYMBOLS[ith];
    if (part === "\\d") return String.fromCharCode(ith + "0".charCodeAt(0));
    if (part.startsWith("\\s")) {
      if (ith === 0) return part[part.length - 1].toLowerCase();
      if (ith === 1) return part[part.length - 1].toUpperCase();
    }
    return part;
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
