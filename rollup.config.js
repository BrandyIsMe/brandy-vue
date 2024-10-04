import typescript from '@rollup/plugin-typescript';

// export default {
//     input: './src/index.ts',
//     output: [
//         {
//             format: 'cjs',
//             file: 'lib/brandy-vue.cjs.js'
//         },
//         {
//             format: 'es',
//             file: 'lib/brandy-vue.esm.js'
//         }
//     ],
//     plugins:[
//         typescript()
//     ]
// }


export default {
    input: './packages/vue/src/index.ts',
    output: [
        {
            format: 'cjs',
            file: 'packages/vue/dist/brandy-vue.cjs.js'
        },
        {
            format: 'es',
            file: 'packages/vue/dist/brandy-vue.esm.js'
        }
    ],
    plugins:[
        typescript()
    ]
}