import { h, renderSlots, getCurrentInstance } from "../../lib/brandy-vue.esm.js"

export const Foo = {
    name: 'Foo',
    setup() {
        const instance = getCurrentInstance()
        console.log('instance', instance);
        return {}
    },

    render(){
        const age = 8
        const foo = h('p', {}, 'foo')
        // const hello = h('div', {}, [this.$slots])
        return h('div', {}, [renderSlots(this.$slots, 'header', {age}), foo, renderSlots(this.$slots, 'footer')])
    }
}