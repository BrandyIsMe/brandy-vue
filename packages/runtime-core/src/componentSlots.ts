import { ShapeFlags } from "@brandy-vue/shared";

export const initSlots = (instance, children)=>{
    const { vnode } = instance;
    if (vnode.shapFlag & ShapeFlags.slot_children) {
        const slots = {} as any
        for (const key in children) {
            const value = children[key]
            if (key) {
                slots[key]  = (props) => normalizeSlotsValue(value(props))
            }
            
        }  
        instance.slots = slots
    }
    
}

const normalizeSlotsValue = (value)=>{
   return value  =   Array.isArray(value) ? value : [value]
}