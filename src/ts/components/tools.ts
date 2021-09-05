import { CaseData, database } from "../database";
import { EM } from "../EventManager";
import { assert, escapeHTML, querySelector } from "../utils"
import { AlertBox } from "./alertbox";


export class Tools {
    elements: {
        manualTryForm: HTMLFormElement;
        manualTry: HTMLInputElement;

        tryCommon: HTMLButtonElement;
        explainCommon: HTMLButtonElement;
    };
    caseIndex: number;
    commonPasswords: string[]
    alerts: {
        manualTry: AlertBox;
        commonPasswords: AlertBox
    }

    constructor(commonPasswords: string[]) {
        this.commonPasswords = commonPasswords;

        this.elements = {
            manualTry: querySelector("#tools-manual-try"),
            manualTryForm: querySelector("#tools-manual-try-form"),

            tryCommon: querySelector("#tools-try-common"),
            explainCommon: querySelector("#tools-explain-common"),
        }
        this.caseIndex = 0;
        this.alerts = {
            manualTry: new AlertBox('#tools-manual-try-alert'),
            commonPasswords: new AlertBox("#tools-common-passwords-alert"),
        } 

        EM.on("set-case", (index: number) => {
            assert(index >= 0);
            assert(index < database.length)
            this.caseIndex = index;

            this.alerts.manualTry.hide()
            this.alerts.commonPasswords.hide()
            this.elements.manualTryForm.reset()
        })

        this.elements.manualTryForm.addEventListener("submit", e => {
            e.preventDefault()
            const password = escapeHTML(this.elements.manualTry.value);
            if (database[this.caseIndex].password === btoa(this.elements.manualTry.value)) {
                this.alerts.manualTry.show("success", "Yep, that's the password!")
            } else {
                this.alerts.manualTry.show("failure", `Nope, <i>${password}</i> isn't correct.`)
            }
        })

        this.elements.tryCommon.addEventListener('click', e => {
            // don't binary search, we simulate brute force testing
            const password = atob(database[this.caseIndex].password)
            let found = false;
            for (let cp of commonPasswords) {
                if (cp === password) {
                    found = true;
                    break
                }
            }
            if (found) {
                this.alerts.commonPasswords.show("success", `Found the password! It's <i>${password}</i>`)
            } else {
                this.alerts.commonPasswords.show("failure", `Nah, couldn't find the password`)
            }
        })
    }

}