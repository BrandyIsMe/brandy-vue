import { hasOwn } from "@brandy-vue/shared"

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
}

export const PublicInstanceProxyHandlers = {
    get({_: instance}, key){
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        }else if (hasOwn(props, key)){
            return props[key]
        }
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    },
    // set(target, key, value){

    // }
}