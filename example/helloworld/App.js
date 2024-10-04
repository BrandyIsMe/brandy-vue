import { h, ref } from "../../lib/brandy-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
    render() {
        return h('div',{
            id: 'test',
            class: ['test', 'hard'],
            onClick(){
                console.log('click')
            }
        }, 
        // 'hi' + this.message
        [
         h('div', {}, 'hi----' + this.message),
        //  h(Foo, {count: 1})
        ]
        // [
        //     h('p', {class: 'red'} ,'Welcome to Brandy-Vue'),
        //     h('p', {class: 'blue'}, 'Welcome to Brandy-Vue'),
        // ]
    )
    },

    setup() {
        const message = ref('mini-vue')
        window.message = message
        return {
            message
        }
    },
}