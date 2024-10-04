import { h, ref } from "../../lib/brandy-vue.esm.js"

export const App = {
    render() {
        return h('div',{
            ...this.props
        }, 
        [
         h('div',{}, 'count:' + this.count),
         h('button',{onClick: this.handleCilck}, '点击++'),
         h('button',{onClick: this.handleChangeProps1}, '修改props为new-foo'),
         h('button',{onClick: this.handleChangeProps2}, '修改props为undefined'),
         h('button',{onClick: this.handleChangeProps3}, '修改props为value为新对象')
        ]
    )
    },

    setup() {
        const count = ref(1)
        const props = ref({
            foo: "foo",
            bar: "bar"
        })
        const handleCilck = () => {
            count.value++
        }

        const handleChangeProps1 = () => {
            props.value.foo = 'new-foo'
        }

        const handleChangeProps2 = () => {
            props.value.foo = undefined
        }

        const handleChangeProps3 = () => {
            props.value = {
                foo: 'foo'
            }
        }
        return {
            count,
            props,
            handleCilck,
            handleChangeProps1,
            handleChangeProps2,
            handleChangeProps3,
        }
    },
}