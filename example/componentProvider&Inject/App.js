import { h , provide, inject} from "../../lib/brandy-vue.esm.js"

export const App = {
    name: 'App',
    render() {
        return h('div',{}, [
            h('p',{}, 'Provider'),
            h(Consumer)
        ]
    )
    },

    setup() {
        provide('bar', '我是provide数据bar')
        provide('foo', '我是provide数据foo')
        return {
            message: 'mini-vue'
        }
    },
}


 const Consumer = {
    name: 'Consumer',
    render() {
        return h('div',{}, [
            h('p',{}, `Consumer - ${this.bar}`),
            h(Consumer1)
        ])
    },

    setup() {
        const bar = inject('bar')
        provide('foo', '我是Consumer数据foo')
        return {
            bar
        }
    },
}

const Consumer1 = {
    name: 'Consumer1',
    render() {
        return h('div',{}, `Consumer - ${this.foo}`)
    },

    setup() {
        const foo = inject('foo')

        return {
            foo
        }
    },
}