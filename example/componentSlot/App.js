import { h, createTextVnode, getCurrentInstance } from "../../lib/brandy-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
    name: "App",
    render() {
        return h('div',{}, 
        [
         h('div', {},'Test'),
         h(Foo, {}, {
            header : ({age})=> [h('p', {}, '123' + age), createTextVnode('hello world')],
            footer :  ()=> h('p', {}, '456')
         })
        ]
    )
    },

    setup() {
        const instance = getCurrentInstance()
        console.log('instance', instance);
        return {}
    },
}