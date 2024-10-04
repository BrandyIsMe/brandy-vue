import { hasChanged, isObeject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any
    public dep;
    private _rawValue: any
    private __v_isRef;
    constructor(value: any) {
        this.__v_isRef = true
        this._rawValue = value
        this._value = isObeject(value) ? reactive(value) : value
        this.dep = new Set()
    }

    get value(){
        if (isTracking()) {
            trackEffects(this.dep)
        }
        return this._value
    }
    set value(newValue){
        if(!hasChanged(newValue, this._rawValue)) return
        this._rawValue = newValue
        this._value = isObeject(newValue) ? reactive(newValue) : newValue
        triggerEffects(this.dep)
    }
}


export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key){
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value){
            if (isRef(target[key]) && !isRef(value)) {
               return target[key].value = value
            }else {
                return Reflect.set(target, key, value)
            }
        }
    })
}