import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'

describe('parse', () => {
    it('simple interpolation', () => {
      const ast =  baseParse('{{message}}')
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_INTERPOLATION,
            content: 'message'
        }
      })
    })

    it('element div', () => {
        const ast =  baseParse('<div></div>')
      expect(ast.children[0]).toStrictEqual({
          type: NodeTypes.ELEMENT,
          tag: 'div',
          children: []
      })
    })

    it('simple text', () => {
        const ast =  baseParse('some text')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.TEXT,
            content: 'some text'
        })
    })

    it('union interpolation', () => {
        const ast =  baseParse('<div>hi, {{message}}</div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                 type: NodeTypes.TEXT,
                 content: 'hi, '
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_INTERPOLATION,
                        content:'message'
                    }
 
                }
            ]
        })
    })

    it('nested element', () => {
        const ast =  baseParse('<div><p>hi,</p>{{message}}</div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                 type: NodeTypes.ELEMENT,
                 tag: 'p',
                 children: [
                    {
                        type: NodeTypes.TEXT,
                        content: 'hi,'
                    }
                 ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_INTERPOLATION,
                        content:'message'
                    }
 
                }
            ]
        })
    })

    it('should throw error when lack end tag', () => {
        expect(()=>{
            baseParse('<div><span></div>')
        }).toThrow()
    })
})