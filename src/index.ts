// brandy-vue 出口

export * from './runtime-dom'
import * as RuntimeDom from './runtime-dom'

const { registerRuntimeCompiler } = RuntimeDom

import { baseCompile } from './compiler-core/src'

function compileToFunction(template) {
    const { code } = baseCompile(template)

    const render = new Function("Vue", code)(RuntimeDom)

    return render
}

registerRuntimeCompiler(compileToFunction)