// the pattern tab in tools

import { database } from "../database";
import { EM } from "../EventManager";
import { PatternSolver, PATTERN_SOLVER_HELP } from "../PatternSolver";
import { assert, durationToString, querySelector, sleep } from "../utils";
import { AlertBox } from "./alertbox";

export const TEST_DELAY_MS = 50;

export class TabPatternHandler {
  private elements: {
    form: HTMLFormElement;
    fieldset: HTMLFieldSetElement;
    pattern: HTMLInputElement;
    helpBtn: HTMLElement;
    swapcase: HTMLInputElement;
    statusBar: HTMLElement;
    cancelBtn: HTMLElement;
  };

  private alerts: {
    help: AlertBox;
    parseError: AlertBox;
    result: AlertBox;
  };

  private caseIndex: number;
  private state: "running" | "errored" | "idle";
  private ps: PatternSolver;
  private stopAnimation: boolean;

  constructor(root: HTMLElement) {
    this.elements = {
      form: querySelector("#tools-pattern-form", root),
      fieldset: querySelector("#tools-pattern-fieldset", root),
      pattern: querySelector("#tools-pattern", root),
      helpBtn: querySelector("#tools-pattern-helpbtn", root),
      swapcase: querySelector("#tools-swap-case", root),
      statusBar: querySelector("#tools-pattern-status", root),
      cancelBtn: querySelector("#tools-pattern-cancel"),
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
    this.stopAnimation = false;

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

    this.elements.cancelBtn.classList.add("hidden");
    this.elements.cancelBtn.addEventListener("click", () => {
      this.stopAnimation = true;
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
      this.alerts.result.hide();
      this.elements.cancelBtn.classList.remove("hidden");
      const truePassword = atob(database[this.caseIndex].password);
      const state = await this.runPasswordAnimation(truePassword);
      this.unlock();

      this.state = "idle";
      this.elements.cancelBtn.classList.add("hidden");
      this.stopAnimation = false;

      if (state === "found") {
        this.alerts.result.show("success", `Password is ${truePassword}`);
      } else if (state === "not found") {
        this.alerts.result.show("failure", "Password not found");
      } // on cancel, we do nothing

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
  private async runPasswordAnimation(
    truePassword: string
  ): Promise<"found" | "canceled" | "not found"> {
    let i = 1;
    const total = this.ps.numberOfPermutations();
    const generator = this.ps.generate();
    for (let password of generator) {
      this.elements.statusBar.textContent = `${i}/${total}: trying "${password}"`;
      if (this.stopAnimation) {
        generator.throw(null);
        this.stopAnimation = false;
        return "canceled";
      }
      await sleep(TEST_DELAY_MS);
      if (password === truePassword) {
        generator.throw(null);
        return "found";
      }
      i++;
    }
    return "not found";
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
