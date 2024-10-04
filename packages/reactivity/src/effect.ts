import { extend } from "@brandy-vue/shared";
let activeEffect:any;
let shouldTrack:boolean = false;

export class ReactiveEffect {
    private _fn 
    public scheduler
    public deps = []
    active = true
    onStop?: () => void
    constructor(_fn, scheduler?){
        this._fn = _fn;
        this.scheduler = scheduler
    }

    run (){
       if (!this.active) {
           return this._fn()
       }
       activeEffect = this
       shouldTrack = true
       let result = this._fn()
       shouldTrack = false
       return result
    }

    stop(){
        if (this.active) {
            this.deps.forEach((dep:any)=>{
                dep.delete(this)
            })
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }

    }
}

const targetMap = new Map()

export function track(target, key){
    if (!isTracking()) return
    let depsMap  = targetMap.get(target)
    if(!depsMap){
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep) {
        if (dep.has(activeEffect)) return
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
}

export function isTracking(){
   return activeEffect !==undefined && shouldTrack
}

export function trigger(target, key, value){
    let depsMap = targetMap.get(target)
    let deps = depsMap.get(key)
    triggerEffects(deps)
}

export function triggerEffects(deps){
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler()   
        }else {
            effect.run()
        } 
    }
}
export function effect(fn, options:any ={}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options)
    _effect.onStop = options.onStop
    _effect.run()
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect;
    return runner
}

export function stop(runner){
    runner.effect.stop()
    // activeEffect.stop()
}