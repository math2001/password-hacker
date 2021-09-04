import "./css/index.css"
import "./css/facts.css"
import "./css/tools.css"

import "./ts/database.ts"
import { Facts } from "./ts/components/facts"
import { Tools } from "./ts/components/tools"
import { EM } from "./ts/EventManager"

document.addEventListener("DOMContentLoaded", () => {
    const tools = new Tools()
    const facts = new Facts()
    
    EM.emit("set-case", 0)
})