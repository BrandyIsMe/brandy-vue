import { h, ref } from "../../lib/brandy-vue.esm.js"
const nextChildren = 'next-children'
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]
export default {
    setup() {
        const isChnage = ref(false)
        window.isChnage = isChnage

        return {
            isChnage
        }

    },

    render(){
        return  h('div', {}, this.isChnage ? nextChildren : prevChildren)
    }
}