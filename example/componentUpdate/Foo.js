import { h, ref } from "../../lib/brandy-vue.esm.js"

export const Foo = {
    setup(props) {
        
    },
    render(){
        return h('div', {}, 'foo' + this.$props.msg)
    }
}