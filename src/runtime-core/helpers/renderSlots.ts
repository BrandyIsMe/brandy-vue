import { Fragment, createVnode } from "../createVnode";

export function renderSlots(slots, name, slotsData?) {
    let slotName = slots[name]    
    if (slotName) {
        if (typeof slotName === 'function') {
            slotName  =  slotName(slotsData)
        }
        
        return createVnode(Fragment, {}, slotName)
    }
}