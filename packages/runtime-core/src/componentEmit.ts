import { camelize, capitalize, handlerKey } from "@brandy-vue/shared";

export function emit(instance, event, ...args) {
   const { props }  = instance
   const handlers = props[handlerKey(capitalize(camelize(event)))]
   handlers && handlers(...args)
}
