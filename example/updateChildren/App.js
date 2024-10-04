import { h } from "../../lib/brandy-vue.esm.js"
import ArrayToText from "./ArrayToText.js"
import TextToText from "./TextToText.js"
import TextToArray from "./TextToArray.js"
import ArrayToArray from "./ArrayToArray.js"

export const App = {
    render() {
        return h('div',{}, 
        [
         h('p', {}, '主页'),
         // 旧节点是 array， 新节点是 text
        //  h(ArrayToText),

        // 旧节点是text 新节点也是 text
        // h(TextToText),

        // 旧节点是text，新节点是 array
        // h(TextToArray),

        // 旧节点是array，新节点也是array
        h(ArrayToArray),
        
        ]
    )
    },

    setup() {
        return {

        }
    },
}