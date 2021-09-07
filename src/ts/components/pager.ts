import { database } from "../database";
import { EM } from "../EventManager";
import { querySelector } from "../utils";

export class Pager {
  elements: {
    before: HTMLButtonElement;
    after: HTMLButtonElement;
    number: HTMLElement;
    total: HTMLElement;
  };
  index: number;

  constructor() {
    this.elements = {
      before: querySelector("#case-before"),
      after: querySelector("#case-after"),
      number: querySelector("#case-number"),
      total: querySelector("#case-total"),
    };
    this.index = 0;
    this.elements.total.textContent = database.length.toString();
    EM.on("set-case", (index: number) => {
      this.index = index;
      this.elements.before.disabled = index === 0;
      this.elements.after.disabled = index === database.length - 1;
      this.elements.number.textContent = (this.index + 1).toString();
    });

    this.elements.before.addEventListener("click", (e) => {
      EM.emit("set-case", this.index - 1);
    });
    this.elements.after.addEventListener("click", (e) => {
      EM.emit("set-case", this.index + 1);
    });
  }
}
