import { CaseData, database } from "../database";
import { EM } from "../EventManager";
import { assert, escapeHTML, querySelector } from "../utils"
import { AlertBox } from "./alertbox";

const MANUAL_RESULT_FAIL = "Nope"
const MANUAL_RESULT_SUCCESS = "YES! Well done! So, do you think that was good password?"

export class Tools {
    elements: {
        manualTryForm: HTMLFormElement;
        manualTry: HTMLInputElement;

        tryCommon: HTMLButtonElement;
        explainCommon: HTMLButtonElement;
    };
    caseIndex: number;
    commonPasswords: string[]
    manualTryResult: AlertBox;

    constructor(commonPasswords: string[]) {
        this.commonPasswords = commonPasswords;

        this.elements = {
            manualTry: querySelector("#tools-manual-try"),
            manualTryForm: querySelector("#tools-manual-try-form"),

            tryCommon: querySelector("#tools-try-common"),
            explainCommon: querySelector("#tools-explain-common"),
        }
        this.caseIndex = 0;
        this.manualTryResult = new AlertBox('#tools-manual-try-result')

        EM.on("set-case", (index: number) => {
            assert(index >= 0);
            assert(index < database.length)
            this.caseIndex = index;

            this.manualTryResult.hide()
            this.elements.manualTryForm.reset()
        })

        this.elements.manualTryForm.addEventListener("submit", e => {
            e.preventDefault()
            const caseData: CaseData = database[this.caseIndex];
            this._displayManualResult(database[this.caseIndex].password === btoa(this.elements.manualTry.value))
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
            this._displayCommonPasswordsResult(found ? password : null)
        })
    }

    private _displayManualResult(correctPassword: boolean) {
        const password = escapeHTML(this.elements.manualTry.value);
        if (correctPassword) {
            this.manualTryResult.show("success", MANUAL_RESULT_SUCCESS)
        } else {
            this.manualTryResult.show("failure", `Nope, <code>${password}</code> isn't correct.`)
        }
    }

    private _displayCommonPasswordsResult(password: string | null) {
        // this.elements.commonPasswordsResult.classList.remove('hidden')
        // if (password === null) {}
    }
}