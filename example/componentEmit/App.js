import { h } from "../../lib/brandy-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
    render() {
        return h('div',{}, [
            h('div', {}, 'test'), 
            h(Foo, {
            onAdd(data){
                console.log('我收到了子组件传来的数据' + data);
            }
        })
    ])
    },

    setup() {
        
        return {}
    },
}