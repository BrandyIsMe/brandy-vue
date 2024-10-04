import { h } from "../../lib/brandy-vue.esm.js"

export const Foo = {
    setup(props, {emit}) {
        const add = ()=>{
            emit('add', 1)
            console.log('emit add');
        }

        return {
            add
        }
    },

    render(){
        const btn = h('button', {onClick: this.add}, '按钮')
        return h('div', {}, [
            h('p', {}, 'foo'),
            btn,
        ])
    }
}