import { h, ref } from "../../lib/brandy-vue.esm.js"
// 1. 左侧对比
// a b c
// a b d e
// const prevChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C')]
// const nextChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "D"}, 'D'), h('div', {key: "E"}, 'E')]

// 2. 右侧对比

// const prevChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C')]
// const nextChildren = [h('div', {key: "D"}, 'D'), h('div', {key: "E"}, 'E'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C')]


// 3. 新的比老的长
// const prevChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C')]
// const nextChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C'), h('div', {key: "D"}, 'D')]


// const prevChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B')]
// const nextChildren = [h('div', {key: "D"}, 'D'), h('div', {key: "C"}, 'C'), h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B')]


// 4. 老的比新的长
// const prevChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B'), h('div', {key: "C"}, 'C')]
// const nextChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B')]


// const prevChildren = [h('div', {key: "C"}, 'C'), h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B')]
// const nextChildren = [h('div', {key: "A"}, 'A'), h('div', {key: "B"}, 'B')]

// 5.对比中间的部分
// const prevChildren = [
//     h('div', {key: "A"}, 'A'), 
//     h('div', {key: "B"}, 'B'),
//     h('div', {key: "C", id: 'c-prev'}, 'C'),
//     h('div', {key: "D"}, 'D'),
//     h('div', {key: "F"}, 'F'),
//     h('div', {key: "G"}, 'G'),
// ]
// const nextChildren = [
//     h('div', {key: "A"}, 'A'), 
//     h('div', {key: "B"}, 'B'),
//     h('div', {key: "E"}, 'E'),
//     h('div', {key: "C", id: 'c-next'}, 'C'),
//     h('div', {key: "F"}, 'F'),
//     h('div', {key: "G"}, 'G'),
// ]

// const prevChildren = [
//     h('div', {key: "A"}, 'A'), 
//     h('div', {key: "B"}, 'B'),
//     h('div', {key: "C", id: 'c-prev'}, 'C'),
//     h('div', {key: "E"}, 'E'),
//     h('div', {key: "D"}, 'D'),
//     h('div', {key: "F"}, 'F'),
//     h('div', {key: "G"}, 'G'),
// ]
// const nextChildren = [
//     h('div', {key: "A"}, 'A'), 
//     h('div', {key: "B"}, 'B'),
//     h('div', {key: "E"}, 'E'),
//     h('div', {key: "C", id: 'c-next'}, 'C'),
//     h('div', {key: "F"}, 'F'),
//     h('div', {key: "G"}, 'G'),
// ]

const prevChildren = [
    h('div', {key: "A"}, 'A'), 
    h('div', {key: "B"}, 'B'),
    h('div', {key: "C"}, 'C'),
    h('div', {key: "D"}, 'D'),
    h('div', {key: "E"}, 'E'),
    h('div', {key: "Z"}, 'Z'),
    h('div', {key: "F"}, 'F'),
    h('div', {key: "G"}, 'G'),
]
const nextChildren = [
    h('div', {key: "A"}, 'A'), 
    h('div', {key: "B"}, 'B'),
    h('div', {key: "D"}, 'D'),
    h('div', {key: "C"}, 'C'),
    h('div', {key: "Y"}, 'Y'),
    h('div', {key: "E"}, 'E'),
    h('div', {key: "F"}, 'F'),
    h('div', {key: "G"}, 'G'),
]


export default {
    setup() {
        const isChnage = ref(false)
        window.isChnage = isChnage

        return {
            isChnage
        }

    },

    render(){
        return  h('div', {id: 'parent'}, this.isChnage ? nextChildren : prevChildren)
    }
}