import { getCurrentInstance } from "./component";

export function provide(key, value) {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
        let { providers } = currentInstance
        let parentProviders = null

        if (currentInstance.parent) {
            parentProviders = currentInstance.parent.providers
        }
        
        
        if (providers === parentProviders) {
            providers = currentInstance.providers =   Object.create(parentProviders)
        }
        providers[key] = value;
    }
}



export function inject(key, deafaulValue) {
    const currentInstance = getCurrentInstance()

    if (currentInstance) {
        const parentProviders  = currentInstance.parent.providers
        if (key in parentProviders) { 
            return parentProviders[key] 
        }else if (deafaulValue) {
            return deafaulValue
        }
    } 
}