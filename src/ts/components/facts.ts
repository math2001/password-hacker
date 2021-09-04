import { EM } from "../EventManager";
import { CaseData, database } from "../database";
import { assert, querySelector } from "../utils";

export class Facts {
    elements: {
        factsList: HTMLUListElement;
    }

    constructor() {
        this.elements = {
            factsList: querySelector("#facts-list"),
        }

        EM.on("set-case", (index: number) => {
            console.log('foo')
            assert(index >= 0)
            assert(index < database.length)
            const data = database[index];

            this._displayData(data)
        })
    }

    _displayData(data: CaseData) {
        this.elements.factsList.innerHTML = ''
        for (let itemText of data.facts) {
            const item = document.createElement('li')
            item.textContent = itemText
            this.elements.factsList.appendChild(item)
        }
    }
}