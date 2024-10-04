import { ShapeFlags } from "@brandy-vue/shared"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export {
    createVnode as createElementVNode
}

export function createVnode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        shapFlag: getShapFlag(type),
        el:null
    }
    if (typeof children === "string") {
        vnode.shapFlag = vnode.shapFlag | ShapeFlags.text_children
    }else if (Array.isArray(children)){
        vnode.shapFlag = vnode.shapFlag | ShapeFlags.array_children
    }

    if (vnode.shapFlag & ShapeFlags.stateful_component && typeof children === 'object') {
        vnode.shapFlag |= ShapeFlags.slot_children
    }
    return vnode
}

function getShapFlag(type) {
    return typeof type === 'string' ? ShapeFlags.element : ShapeFlags.stateful_component
}

export function createTextVnode(text:string) {
    return createVnode(Text, {}, text)
}