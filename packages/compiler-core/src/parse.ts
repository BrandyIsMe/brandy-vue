import { NodeTypes } from "./ast"
const enum TagType {
    START,
    END
}
export function baseParse(content: string){
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}

function createRoot(children){
    return {
        children,
        type: NodeTypes.ROOT
    }
}

function parseChildren(context, ancestors) {
    const nodes: any[] = []
    while (!isEnd(context, ancestors)) {
        let node
        if (context.source.startsWith('{{')) {
            node = parseInterpolation(context)
        }else if(context.source[0] === '<') {
            if (/[a-z]/i.test(context.source[1])) {
                node =  parseElement(context, ancestors)
            }
        }else {
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}

function isEnd(context, ancestors) {
    if (context.source.startsWith('</')) {
        for (let i = ancestors.length - 1; i>=0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(context.source, tag)) {
                return true
            }
        }
    }
    // if (tag && context.source.startsWith(`</${tag}>`)) {
    //     return true
    // }
    return !context.source
}

function parseElement(context, ancestors) {
    const elment: any =  parseTag(context, TagType.START)
    ancestors.push(elment)
    elment.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (startsWithEndTagOpen(context.source, elment.tag)) {
        parseTag(context, TagType.END)
    }else {
        throw new Error(`Invalid HTML syntax: unclosed tag ${elment.tag}`)
    }

    return elment
}

function startsWithEndTagOpen(source, tag){
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context, type){
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]

    advance(context, match[0].length)
    advance(context, 1)
    if (type === TagType.START) {
        return {
          type: NodeTypes.ELEMENT,
          tag: tag  
        }
    }
}

function parseText(context){
    let endIndex = context.source.length
    let endTokens = ['{{', '<']
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if ( index!== -1 && endIndex > index) {
            endIndex = index
        }
        
    }
    const textContent = pareTextData(context, endIndex)
    return  {
        type: NodeTypes.TEXT,
        content: textContent
    }
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
    advance(context, openDelimiter.length)
    const rawContentLength = closeIndex - openDelimiter.length
    // const rowContent = context.source.slice(0, rawContentLength)
    // advance(context, rawContentLength + closeDelimiter.length)
    const rowContent = pareTextData(context, rawContentLength)
    const content = rowContent.trim()
    advance(context, closeDelimiter.length)
    return  {
        type: NodeTypes.INTERPOLATION,
        content: {
            type:  NodeTypes.SIMPLE_INTERPOLATION,
            content: content
        }
    }
}
function pareTextData(context: any, length: number) {
    const content = context.source.slice(0, length)
    advance(context, length)

    return content
}

function createParserContext(content: string) {
    return {
        source : content,
    }
}

function advance(context: any, length: number) {
    context.source = context.source.slice(length)
}
