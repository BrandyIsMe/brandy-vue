import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelper";

export function transform(root, options = {}){
    const context = createTransformContext(root, options)
    traverseNode(root, context)
    createRootCodeGen(root)

    root.helpers = [...context.helpers.keys()]
}

function traverseNode(node: any, context) {
    const nodeTransforms = context.nodeTransforms
    const exitFns :any = []
  if (nodeTransforms) {
    for (let i = 0; i < nodeTransforms.length; i++) {
        const plugin = nodeTransforms[i];
        const onExit = plugin(node, context)

        if (onExit) {
            exitFns.push(onExit)
        }
    }

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context)
            break;
    }


    let i = exitFns.length;

    while (i--) {
        exitFns[i]()
    }
  }
}
function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key){
            context.helpers.set(key, 1)
        }
    }

    return context
}

function traverseChildren(node, context) {
    const children = node.children
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context)
    }
}

function createRootCodeGen(root: any) {
    const child = root.children[0]
    if (child.type == NodeTypes.ELEMENT) {
        root.codegenNode = child.codegenNode
    }else {
        return root.codegenNode = root.children[0]
    }
}

