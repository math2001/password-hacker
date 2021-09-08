// the pattern tab in tools

import { PatternSolver, PATTERN_SOLVER_HELP } from "../PatternSolver";
import { querySelector } from "../utils";
import { AlertBox } from "./alertbox";

export class TabPatternHandler {
  private elements: {
    form: HTMLFormElement;
    pattern: HTMLInputElement;
    helpBtn: HTMLElement;
    swapcase: HTMLInputElement;
    statusBar: HTMLElement;
  };

  private alerts: {
    help: AlertBox;
    parseError: AlertBox;
  };

  private patternSolver: PatternSolver;

  constructor(root: HTMLElement) {
    this.elements = {
      form: querySelector("#tools-pattern-form", root),
      pattern: querySelector("#tools-pattern", root),
      helpBtn: querySelector("#tools-pattern-help", root),
      swapcase: querySelector("#tools-swap-case", root),
      statusBar: querySelector("#tools-pattern-status", root),
    };
    this.alerts = {
      help: new AlertBox(querySelector("#tools-pattern-alert", root)),
      parseError: new AlertBox(
        querySelector("#tools-pattern-parseerror", root)
      ),
    };

    this.patternSolver = new PatternSolver();

    this.bindDOM();
    this.updatePattern();
  }

  private bindDOM() {
    this.elements.helpBtn.addEventListener("click", () => {
      this.alerts.help.toggle("info", `<pre>${PATTERN_SOLVER_HELP}</pre>`);
    });

    this.elements.pattern.addEventListener("input", this.updatePattern);

    this.patternSolver.setOption("swapcase", this.elements.swapcase.checked);
    this.elements.swapcase.addEventListener("change", (e) => {
      this.patternSolver.setOption("swapcase", this.elements.swapcase.checked);
      this.updateStatusBar();
    });
  }

  private updatePattern = () => {
    const err = this.patternSolver.setPattern(this.elements.pattern.value);
    if (err !== null) this.alerts.parseError.show("failure", err);
    else this.alerts.parseError.hide();
    this.updateStatusBar();
  };

  private updateStatusBar() {
    const content = `number of permutations to check: ${this.patternSolver.numberOfPermutations()}`;
    this.elements.statusBar.textContent = content;
  }
}
