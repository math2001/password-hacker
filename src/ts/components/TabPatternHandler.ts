// the pattern tab in tools

import { database } from "../database";
import { EM } from "../EventManager";
import { PatternSolver, PATTERN_SOLVER_HELP } from "../PatternSolver";
import { assert, durationToString, querySelector, sleep } from "../utils";
import { AlertBox } from "./alertbox";

const TEST_DELAY_MS = 50;

export class TabPatternHandler {
  private elements: {
    form: HTMLFormElement;
    fieldset: HTMLFieldSetElement;
    pattern: HTMLInputElement;
    helpBtn: HTMLElement;
    swapcase: HTMLInputElement;
    statusBar: HTMLElement;
  };

  private alerts: {
    help: AlertBox;
    parseError: AlertBox;
    result: AlertBox;
  };

  caseIndex: number;

  private state: "running" | "errored" | "idle";

  private ps: PatternSolver;

  constructor(root: HTMLElement) {
    this.elements = {
      form: querySelector("#tools-pattern-form", root),
      fieldset: querySelector("#tools-pattern-fieldset", root),
      pattern: querySelector("#tools-pattern", root),
      helpBtn: querySelector("#tools-pattern-helpbtn", root),
      swapcase: querySelector("#tools-swap-case", root),
      statusBar: querySelector("#tools-pattern-status", root),
    };
    this.alerts = {
      help: new AlertBox(querySelector("#tools-pattern-help", root)),
      parseError: new AlertBox(
        querySelector("#tools-pattern-parseerror", root)
      ),
      result: new AlertBox(querySelector("#tools-pattern-result", root)),
    };

    this.ps = new PatternSolver();

    this.state = "idle";

    this.bindDOM();
    this.updatePattern();

    this.caseIndex = 0;
    EM.on("set-case", (index) => {
      this.caseIndex = index;
    });
  }

  private bindDOM() {
    this.elements.helpBtn.addEventListener("click", () => {
      this.alerts.help.toggle("info", `<pre>${PATTERN_SOLVER_HELP}</pre>`);
    });

    this.elements.pattern.addEventListener("input", this.updatePattern);

    this.ps.setOption("swapcase", this.elements.swapcase.checked);
    this.elements.swapcase.addEventListener("change", (e) => {
      this.ps.setOption("swapcase", this.elements.swapcase.checked);
      this.updateStatusBarForIdleAndError();
    });

    this.elements.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.state = "running";
      this.lock();
      const found = await this.runPasswordAnimation(
        atob(database[this.caseIndex].password)
      );
      this.unlock();
      this.state = "idle";
      this.updateStatusBarForIdleAndError();
    });
  }

  private lock() {
    this.elements.fieldset.disabled = true;
    EM.emit("lock", undefined);
  }
  private unlock() {
    this.elements.fieldset.disabled = false;
    EM.emit("unlock", undefined);
  }

  // return true if the true password was found
  private async runPasswordAnimation(truePassword: string): Promise<boolean> {
    let i = 1;
    const total = this.ps.numberOfPermutations();
    const generator = this.ps.generate();
    for (let password of generator) {
      this.elements.statusBar.textContent = `${i}/${total}: trying "${password}"`;
      await sleep(TEST_DELAY_MS);
      if (password === truePassword) {
        for (let _ of generator) {
        } // consume generator
        return true;
      }
      i++;
    }
    return false;
  }

  private updatePattern = () => {
    if (this.state === "running")
      throw new Error("cannot update pattern whilst running");
    const err = this.ps.setPattern(this.elements.pattern.value);
    if (err !== null) {
      this.alerts.parseError.show("failure", err);
      this.state = "errored";
    } else {
      this.alerts.parseError.hide();
      this.state = "idle";
    }
    this.updateStatusBarForIdleAndError();
  };

  private updateStatusBarForIdleAndError() {
    let content: string;
    if (this.state === "idle") {
      const total = this.ps.numberOfPermutations();
      content = `${total} permutations, takes about ${durationToString(
        total * TEST_DELAY_MS
      )}`;
    } else if (this.state === "errored") content = "check errors";
    else assert(false);
    this.elements.statusBar.textContent = content;
  }
}
