import "../../css/tabs.css";
import { assert } from "../utils";

export class Tabs {
  root: HTMLElement;
  selectedID: string;
  tabs: {
    [tabID: string]: {
      handle: HTMLElement;
      content: HTMLElement;
    };
  };

  constructor(root: HTMLElement) {
    this.root = root;
    this.tabs = {};
    this.selectedID = this.queryTabsFromHTML();
    this.bindDOM();
  }

  activate(tabID: string) {
    if (!(tabID in this.tabs)) {
      throw new Error(`unknown tabID ${tabID}`);
    }
    this.tabs[this.selectedID].handle.classList.remove("tab-selected");
    this.tabs[this.selectedID].content.classList.remove("tab-selected");
    this.selectedID = tabID;
    this.tabs[this.selectedID].handle.classList.add("tab-selected");
    this.tabs[this.selectedID].content.classList.add("tab-selected");
  }

  private bindDOM() {
    for (let tabID of Object.keys(this.tabs)) {
      this.tabs[tabID].handle.addEventListener("click", (e) => {
        e.preventDefault();
        this.activate(tabID);
      });
    }
  }

  private queryTabsFromHTML(): string {
    const tabs: {
      [tabID: string]: {
        handle?: HTMLElement;
        content?: HTMLElement;
      };
    } = {};
    this.root
      .querySelectorAll<HTMLElement>("[data-open-tab]")
      .forEach((handle) => {
        const tabID = handle.getAttribute("data-open-tab");
        assert(tabID !== null);
        if (tabID in tabs) {
          throw new Error(`duplicate tabID ${tabID}`);
        }
        handle.classList.remove("tab-selected");

        tabs[tabID] = {
          handle,
        };
      });

    this.root
      .querySelectorAll<HTMLElement>("[data-tab-id]")
      .forEach((content) => {
        const tabID = content.getAttribute("data-tab-id");
        assert(tabID !== null);
        if (!(tabID in tabs)) {
          throw new Error(`No tab handle for ${tabID}`);
        }
        content.classList.remove("tab-selected");

        tabs[tabID].content = content;
      });

    for (let tabID of Object.keys(tabs)) {
      const content = tabs[tabID].content;
      const handle = tabs[tabID].handle;
      if (handle === undefined || content === undefined) {
        throw new Error(`incomplete handle/content tab pair for ${tabID}`);
      }
      this.tabs[tabID] = {
        content,
        handle,
      };
    }

    const initialTabID = this.root.getAttribute("data-tab-initial");
    if (initialTabID === null)
      throw new Error(
        "no default tab selected. Set the data-tab-initial " +
          "attribute on the root element"
      );

    if (!(initialTabID in this.tabs))
      throw new Error(`initial tab ${initialTabID} doesn't exists`);

    this.tabs[initialTabID].handle.classList.add("tab-selected");
    this.tabs[initialTabID].content.classList.add("tab-selected");

    return initialTabID;
  }
}
