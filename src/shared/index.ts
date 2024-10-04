export const extend = Object.assign

export function isObeject(val) {
    return val !== null && typeof val === 'object'
}

export const hasChanged = (val1, val2)=> !Object.is(val1, val2)

export const hasOwn = (val, key)=> Object.prototype.hasOwnProperty.call(val, key)

export const capitalize = (str:string)=>{
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const handlerKey = (str:string) =>{
    return str ? 'on' + str : ''
}

export const camelize = (str:string) => {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

export * from './toDisplayString'