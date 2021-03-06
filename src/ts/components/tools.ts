import "../../css/tools.css";
import { database } from "../database";
import { EM } from "../EventManager";
import { assert, escapeHTML, querySelector, sleep } from "../utils";
import { AlertBox } from "./alertbox";
import { TabPatternHandler, TEST_DELAY_MS } from "./TabPatternHandler";
import { Tabs } from "./tabs";

export class Tools {
  private elements: {
    manualTryForm: HTMLFormElement;
    manualTry: HTMLInputElement;

    tryCommon: HTMLButtonElement;
    explainCommon: HTMLButtonElement;
    cancelCommon: HTMLButtonElement;

    commonStatusBar: {
      bar: HTMLElement;
      index: HTMLElement;
      total: HTMLElement;
      current: HTMLElement;
    };
  };

  private caseIndex: number;
  private commonPasswords: string[];
  private stopAnimation: boolean;

  private alerts: {
    manualTry: AlertBox;
    commonPasswords: AlertBox;
    commonPasswordsHelp: AlertBox;
  };

  constructor(commonPasswords: string[]) {
    this.commonPasswords = commonPasswords;
    this.stopAnimation = false;

    this.elements = {
      manualTry: querySelector("#tools-manual-try"),
      manualTryForm: querySelector("#tools-manual-try-form"),

      tryCommon: querySelector("#tools-try-common"),
      explainCommon: querySelector("#tools-explain-common"),
      cancelCommon: querySelector("#tools-common-cancel"),

      commonStatusBar: {
        bar: querySelector("#tools-try-common-status"),
        index: querySelector("#tools-try-common-index"),
        total: querySelector("#tools-try-common-total"),
        current: querySelector("#tools-try-common-current"),
      },
    };

    new TabPatternHandler(querySelector("[data-tab-id='strategy-pattern']"));

    this.caseIndex = 0;
    this.alerts = {
      manualTry: new AlertBox(querySelector("#tools-manual-try-alert")),
      commonPasswords: new AlertBox(
        querySelector("#tools-common-passwords-result")
      ),
      commonPasswordsHelp: new AlertBox(
        querySelector("#tools-common-passwords-help")
      ),
    };

    this.elements.commonStatusBar.total.textContent =
      commonPasswords.length.toString();

    new Tabs(querySelector(".tab-section", querySelector("#tools")));
    this.alerts.commonPasswordsHelp.show("info", COMMON_PASSWORDS_HELP);

    EM.on("set-case", (index: number) => {
      assert(index >= 0);
      assert(index < database.length);
      this.caseIndex = index;

      this.alerts.manualTry.hide();
      this.alerts.commonPasswords.hide();
      // this.alerts.commonPasswordsHelp.hide()
      this.elements.manualTryForm.reset();
    });

    this.elements.manualTryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const password = escapeHTML(this.elements.manualTry.value);
      if (
        database[this.caseIndex].password ===
        btoa(this.elements.manualTry.value)
      ) {
        this.alerts.manualTry.show("success", "Yep, that's the password!");
      } else {
        this.alerts.manualTry.show(
          "failure",
          `Nope, <i>${password}</i> isn't correct.`
        );
      }
    });

    EM.on("alert-close", (alertbox: AlertBox) => {
      if (alertbox === this.alerts.commonPasswords) {
        this.elements.commonStatusBar.bar.classList.add("hidden");
      }
    });

    this.elements.tryCommon.addEventListener("click", async (e) => {
      this.elements.cancelCommon.classList.remove("hidden");
      this.alerts.commonPasswords.hide();
      this.elements.commonStatusBar.bar.classList.remove("hidden");
      this.elements.tryCommon.disabled = true;
      EM.emit("lock", undefined);
      // don't binary search, we simulate brute force testing
      const password = atob(database[this.caseIndex].password);
      const state = await this.runCommonPasswordsAnimation(password);
      if (state === "found") {
        this.alerts.commonPasswords.show(
          "success",
          `Found the password! It's <i>${password}</i>`
        );
      } else if (state === "not found") {
        this.alerts.commonPasswords.show(
          "failure",
          `Nah, couldn't find the password`
        );
      }
      this.elements.tryCommon.disabled = false;
      EM.emit("unlock", undefined);
      this.elements.cancelCommon.classList.add("hidden");
    });

    this.elements.cancelCommon.addEventListener("click", (e) => {
      e.preventDefault();
      this.stopAnimation = true;
    });

    this.elements.explainCommon.addEventListener("click", (e) => {
      e.preventDefault();
      this.alerts.commonPasswordsHelp.toggle("info", COMMON_PASSWORDS_HELP);
    });
  }

  private async runCommonPasswordsAnimation(
    truePassword: string
  ): Promise<"found" | "not found" | "canceled"> {
    let i = 1;
    for (let cp of this.commonPasswords) {
      this.elements.commonStatusBar.index.textContent = i.toString();
      this.elements.commonStatusBar.current.textContent = cp;
      if (this.stopAnimation) {
        this.stopAnimation = false;
        return "canceled";
      }
      await sleep(TEST_DELAY_MS);
      if (cp === truePassword) {
        return "found";
      }
      i++;
    }
    return "not found";
  }
}

const COMMON_PASSWORDS_HELP = `<p>Some passwords are used a lot, like
<i>123456</i>, <i>superman</i> or <i>qwerty</i>. So hackers have made lists of
the most common passwords, and then test them all when trying to break into your
account.</p>

<p>
<a href="https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt">Some</a>
<a href="https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt">lists</a>
<a href="https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt">are</a>
<a href="https://raw.githubusercontent.com/DavidWittman/wpxmlrpcbrute/master/wordlists/1000-most-common-passwords.txt">publicly</a>
available.
</p>

<p>
This button tests every single password in <a href="assets/common-passwords-list.txt">this list</a>.
</p>
`;
