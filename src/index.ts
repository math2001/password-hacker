import "./css/facts.css";
import "./css/index.css";
import "./css/pager.css";
import "./css/tools.css";
import { Facts } from "./ts/components/facts";
import { Pager } from "./ts/components/pager";
import { Tools } from "./ts/components/tools";
import "./ts/database.ts";
import { EM } from "./ts/EventManager";

const res = fetch("/assets/common-passwords-list.txt")
  .then((resp) => resp.text())
  .then((text) => text.split(/\n/g));

document.addEventListener("DOMContentLoaded", () => {
  res.then((commonPasswords) => {
    const tools = new Tools(commonPasswords);
    const facts = new Facts();
    const pager = new Pager();

    EM.emit("set-case", 0);
  });
});
