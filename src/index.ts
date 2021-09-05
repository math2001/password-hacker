import "./css/index.css"
import "./css/facts.css"
import "./css/tools.css"
import "./css/pager.css"
import "./css/alertbox.css"

import "./ts/database.ts"
import { Facts } from "./ts/components/facts"
import { Tools } from "./ts/components/tools"
import { EM } from "./ts/EventManager"
import { Pager } from "./ts/components/pager"

const res = fetch('https://raw.githubusercontent.com/DavidWittman/wpxmlrpcbrute/master/wordlists/1000-most-common-passwords.txt')
    .then(resp => resp.text())
    .then(text => text.split(/\n/g))

document.addEventListener("DOMContentLoaded", () => {
    res.then((commonPasswords) => {
        const tools = new Tools(commonPasswords)
        const facts = new Facts()
        const pager = new Pager()
    
        EM.emit("set-case", 0)
    })
})