import { camelize, capitalize, handlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
   const { props }  = instance
   const handlers = props[handlerKey(capitalize(camelize(event)))]
   handlers && handlers(...args)
}
