import { h, ref } from "../../lib/brandy-vue.esm.js"
const nextChildren = [h('div', {}, 'A'), h('div', {}, 'B')] 
const prevChildren = 'pre-children'
export default {
    setup() {
        const isChnage = ref(false)
        window.isChnage = isChnage

        return {
            isChnage
        }

    },

    render(){
        // return this.isChnage ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
        return  h('div', {}, this.isChnage ? nextChildren : prevChildren)
    }
}