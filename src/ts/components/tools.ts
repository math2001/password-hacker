import { CaseData, database } from "../database";
import { EM } from "../EventManager";
import { assert, querySelector } from "../utils"

const MANUAL_RESULT_FAIL = "Nope, that's not it."
const MANUAL_RESULT_SUCCESS = "YES! Well done! So, do you think that was good password?"

export class Tools {
    elements: {
        manualTryForm: HTMLFormElement;
        manualTry: HTMLInputElement;
        manualTryResult: HTMLElement;
        manualTryResultMessage: HTMLElement;
        manualTryResultClose: HTMLElement;
        manualTryResultSymbol: HTMLElement;
    };
    caseIndex: number;

    constructor() {
        this.elements = {
            manualTry: querySelector("#tools-manual-try"),
            manualTryForm: querySelector("#tools-manual-try-form"),
            manualTryResult: querySelector("#tools-manual-try-result"),
            manualTryResultMessage: querySelector("#tools-manual-try-result-message"),
            manualTryResultClose: querySelector("#tools-manual-try-result-close"),
            manualTryResultSymbol: querySelector("#tools-manual-try-result-symbol"),
        }
        this.caseIndex = 0;

        EM.on("set-case", (index: number) => {
            assert(index >= 0);
            assert(index < database.length)
            this.caseIndex = index;

            this.elements.manualTryResult.classList.add("hidden")
            this.elements.manualTryForm.reset()
        })

        this.elements.manualTryForm.addEventListener("submit", e => {
            e.preventDefault()
            const caseData: CaseData = database[this.caseIndex];
            this._displayManualResult(database[this.caseIndex].password === btoa(this.elements.manualTry.value))
        })

        this.elements.manualTryResultClose.addEventListener('click', e => {
            e.preventDefault()
            this.elements.manualTryResult.classList.add("hidden")
        })
    }

    _displayManualResult(correctPassword: boolean) {
        this.elements.manualTryResultMessage.textContent = correctPassword ? MANUAL_RESULT_SUCCESS : MANUAL_RESULT_FAIL;
        this.elements.manualTryResultSymbol.textContent = correctPassword ? '✓' : '✗';
        this.elements.manualTryResult.classList.remove("hidden")
        this.elements.manualTryResult.setAttribute("data-result-type", correctPassword ? 'success' : 'fail')
    }
}