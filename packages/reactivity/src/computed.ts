import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
    private _getter
    private _effect
    private _dirty = true
    private _reseult = false
    constructor(getter){
        this._getter = getter
        this._effect = new ReactiveEffect(this._getter, ()=>{
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value(){
        if (this._dirty) {
            this._reseult  = this._effect.run()
            this._dirty = false
        }
        return this._reseult 
    }
}


export function computed(getter) {
    return new ComputedRefImpl(getter)
}