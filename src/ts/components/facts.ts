import "../../css/facts.css";
import { CaseData, database } from "../database";
import { EM } from "../EventManager";
import { assert, querySelector } from "../utils";

export class Facts {
  elements: {
    factsList: HTMLUListElement;
    imagesList: HTMLUListElement;
  };

  constructor() {
    this.elements = {
      factsList: querySelector("#facts-list"),
      imagesList: querySelector("#images-list"),
    };

    EM.on("set-case", (index: number) => {
      assert(index >= 0);
      assert(index < database.length);
      const data = database[index];

      this._displayData(data);
    });
  }

  _displayData(data: CaseData) {
    this.elements.factsList.innerHTML = "";
    this.elements.imagesList.innerHTML = "";

    if (data.images)
      for (let imageLink of data.images) {
        const item = document.createElement("li");
        const image = document.createElement("img");
        image.src = imageLink;
        item.appendChild(image);
        this.elements.imagesList.appendChild(item);
      }

    for (let itemText of data.facts) {
      const item = document.createElement("li");
      item.textContent = itemText;
      this.elements.factsList.appendChild(item);
    }
  }
}
