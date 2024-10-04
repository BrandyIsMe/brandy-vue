import { isObeject } from "@brandy-vue/shared";
import { track, trigger } from "./effect";
import { ReactiveEffectType, reactive, readonly } from "./reactive";

const get =  creatGetter()
const set = creatSetter()
const readonlyGet = creatGetter(true)
const shallowReadonlyGet = creatGetter(true, true)

function creatGetter(isReadOnly: boolean = false, shallow: boolean = false) {
    
    return function get(target, key) {
        if (key === ReactiveEffectType.IS_REACTIVE) {
           return !isReadOnly 
        }else if (key === ReactiveEffectType.IS_READONLY){
            return isReadOnly
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res
        }
        if (isObeject(res)) {
            return isReadOnly? readonly(res) : reactive(res)
        }
        if (!isReadOnly) {
        // 依赖收集
            track(target, key);
        }
        return res 
    }
}

function creatSetter(isReadOnly: boolean = false) {
    
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 依赖触发
        trigger(target, key, value);
        return res 
    }
}


export const mutableHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,

    set(target, key, value){
        console.warn(`key ${key} set失败，因为${target}是readonly`)
        return true
    }
}
export const shallowReadonlyHandler = {
    get: shallowReadonlyGet,

    set(target, key, value){
        console.warn(`key ${key} set失败，因为${target}是readonly`)
        return true
    }
}