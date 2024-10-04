// brandy-vue 出口

export * from '@brandy-vue/runtime-dom'
import * as RuntimeDom from '@brandy-vue/runtime-dom'

const { registerRuntimeCompiler } = RuntimeDom

import { baseCompile } from '@brandy-vue/compiler-core'

function compileToFunction(template) {
    const { code } = baseCompile(template)

    const render = new Function("Vue", code)(RuntimeDom)

    return render
}

registerRuntimeCompiler(compileToFunction)