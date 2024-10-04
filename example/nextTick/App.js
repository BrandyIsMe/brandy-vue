import { h, ref, getCurrentInstance, nextTick } from "../../lib/brandy-vue.esm.js"

export const App = {
    render() {
        return h('div',{
            onClick: this.handleClick
        }, 'count:' + this.count)
    },

    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()

        const handleClick = async () => {
            await nextTick()
            console.log('instance', instance)
           for (let i = 1; i < 99; i++) {
             count.value++
           }
        }
        return {
            count,
            handleClick
        }
    },
}