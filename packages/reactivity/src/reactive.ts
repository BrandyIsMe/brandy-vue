import { isObeject } from "@brandy-vue/shared"
import { mutableHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandler"

export const enum ReactiveEffectType {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadOnly",
}
export function reactive(raw) {
    return createReactiveObject(raw, mutableHandler)
}

export function readonly(raw) {
    return createReactiveObject(raw, readonlyHandler)
}
export function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandler)
}

export function isReactive(val){
   return Boolean(val[ReactiveEffectType.IS_REACTIVE])
}

export function isReadonly(val){
   return Boolean(val[ReactiveEffectType.IS_READONLY])
}
export function isProxy(val){
   return isReactive(val) || isReadonly(val)
}

function createReactiveObject(target, handlers) {
    if (!isObeject(target)) {
      return console.warn(`${target} 必须是一个对象`)
    }

    return new Proxy(target, handlers)
}