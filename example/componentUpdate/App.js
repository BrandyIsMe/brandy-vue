import { h, ref } from "../../lib/brandy-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  name: 'App',
  setup() {
    const msg = ref('123')
    const count = ref(1)
    window.msg = msg

    const changeChildProps = () => {
        msg.value = '456'
    }

    const changCount = () =>{
        count.value ++
    }
    return {
        msg, count, changeChildProps, changCount
    }
  },

  render(){
    return h('div', {}, [
        h('div', {}, '您好'),
        h('button', {
            onClick: this.changeChildProps
        }, 'chang child props'),
        h(Foo, {
            msg : this.msg
        }),
        h('button', {
            onClick: this.changCount
        }, 'chang count'),
        h('p', {}, `count : ${this.count}`)
    ])
  }
}