import "./css/index.css"
import "./css/facts.css"
import "./css/tools.css"

import "./ts/infos.ts"

import { EM } from "./ts/em"

EM.on("foo", (data: string) => {
    console.log(data)
})
// should err
EM.on("foo", (data: number) => {
    console.log(data)
})

EM.on("bar", (data: number) => {
    console.log(data)
})

// should err
EM.on("bar", (data: string) => {
    console.log(data)
})

// should err 
EM.on("kk", (data: string) => {

})