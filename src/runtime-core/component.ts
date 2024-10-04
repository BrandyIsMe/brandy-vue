import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstanace"
import { initSlots } from "./componentSlots"
import { proxyRefs } from "../reactivity"
let currentInstance = null as any
export function createComponentInstance(vnode:any, parent) {
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState:{},
        props: {},
        parent,
        slots: {},
        providers: parent ? parent.providers : {},
        isMounted: false,
        subTree: {},
        emit: ()=>{}
    }

    component.emit = emit.bind(null, component) as any
    return component
}

export function setupComponent(instance) {
   initProps(instance, instance.vnode.props)
   initSlots(instance, instance.vnode.children)

   setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type
    instance.proxy = new Proxy({_ : instance}, PublicInstanceProxyHandlers)

    const { setup } = Component

    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
        handleSetupResult(instance,setupResult)
    }
}
function handleSetupResult(instance,setupResult: any) {
    //TODO: function

    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult) 
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template)
        }
    }
    instance.render = Component.render
}

export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance
}

let compiler

export function registerRuntimeCompiler(_compiler) {
    compiler = _compiler
}

