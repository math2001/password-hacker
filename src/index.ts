import "./css/index.css"
import "./css/facts.css"
import "./css/tools.css"
import "./css/pager.css"

import "./ts/database.ts"
import { Facts } from "./ts/components/facts"
import { Tools } from "./ts/components/tools"
import { EM } from "./ts/EventManager"
import { Pager } from "./ts/components/pager"

document.addEventListener("DOMContentLoaded", () => {
    const tools = new Tools()
    const facts = new Facts()
    const pager = new Pager()
    
    EM.emit("set-case", 0)
})