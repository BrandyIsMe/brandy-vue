import { createRenderer } from "@brandy-vue/runtime-core"

function createElement(vnode) {
     const el = (vnode.el = document.createElement(vnode.type))
     return el
}


function patchProp(el, key, preVal, newVal) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase()
        el.addEventListener(event, newVal)
    } else {
        if (!newVal) {
            el.removeAttribute(key)
        }else {
            el.setAttribute(key, newVal)
        }
    }  
}

function insert(el, parent, anchor?) {
    parent.insertBefore(el, anchor || null)
}

function remove(child) {
    if (child.parentNode) {
        child.parentNode.removeChild(child)
    }
}

function setElementText(container, text) {
    container.textContent = text
}

// function setElementArray(container, children, mountChildren) {
//     setElementText(container, '')
//     mountChildren(children, container, null)
// }

const renderer:any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
    // setElementArray
})

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '@brandy-vue/runtime-core'