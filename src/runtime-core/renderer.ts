import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./createVnode";
import { queueMicrotask } from "./scheduler";

export function createRenderer(options) {

const {createElement, patchProp, insert, remove:hostRemove, setElementText:hoseSetElementText} = options
    
function render(vnode, container) {
    // patch
    patch(null,vnode, container, null)
}

function patch(n1, n2, container, parent, anchor?) {
    const { shapFlag, type } = n2    
    switch (type) {
        case Fragment:
            processFragment(n1, n2, container, parent, anchor)
            break;
        case Text:
            processText(n1, n2, container)
            break;
        default:
            if (shapFlag & ShapeFlags.element) {
                precessElement(n1,n2, container, parent, anchor)
                
            }else if (shapFlag & ShapeFlags.stateful_component) {
                // 处理组件
                processComponent(n1, n2, container, parent)
            }
    }
}

function precessElement(n1, n2, container, parent, anchor) {
    if (!n1) {
        // 初始化element
        mountElement(n2, container, parent, anchor)
    }else {
        // 更新element
        // patchElement(n1, n2, container, parent, anchor)
        patchElement(n1, n2, parent, anchor)
    }
}
const EMPTY_OBJ = {}

function patchElement(n1, n2, parent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
    patchChildren(el,n1, n2, parent, anchor)
}

function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
        for (const key in newProps) {
            const prevProp = oldProps[key]
            const newProp = newProps[key]
    
            if (prevProp !== newProp) {
                patchProp(el, key, prevProp, newProp)
            }
        }

        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                  patchProp(el, key, oldProps[key], null)
                }
              }
        }
    }
}

function patchChildren(el,n1, n2, parent, anchor) {

    const oldChildren = n1.children
    const newChildren = n2.children
    if (n2.shapFlag & ShapeFlags.text_children) { // 新节点为 text
        if (n1.shapFlag & ShapeFlags.array_children) { // 老节点为array
            // 1.把老节点children清空
            unmountChildren(oldChildren)

            // 2.设置text
            hoseSetElementText(el, newChildren)
        }

        if (n1.shapFlag & ShapeFlags.text_children && oldChildren !== newChildren) { // 老节点也为 text
            // 直接设置 为 新的text
            hoseSetElementText(el, newChildren)
        }
    }


    if (n2.shapFlag & ShapeFlags.array_children) { // 新节点为 array
        
        if (n1.shapFlag & ShapeFlags.text_children) { // 老节点为 text
            hoseSetElementText(el, '')
            mountChildren(newChildren, el, parent, anchor)
        }

        if (n1.shapFlag & ShapeFlags.array_children) { // 老节点也为 array
            patchKeyedChildren(oldChildren, newChildren, el, parent, anchor)
        }
    }
    
}

function patchKeyedChildren(oldChildren, newChildren, container, parent, anchor) {
    let i = 0
    let e1 = oldChildren.length - 1
    let e2 = newChildren.length - 1
    const l2 = newChildren.length

    function isSameVnode(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key
    }
    // 1.左侧
    while (i <= e1 && i <= e2) {
        const n1 = oldChildren[i]
        const n2 = newChildren[i]
        
        if (isSameVnode(n1, n2)) {
            patch(n1, n2, container, parent)
        }else {
            break;
        }
        i ++
    }
    // 2.右侧
    while (i <= e1 && i <= e2) {
        const n1 = oldChildren[e1]
        const n2 = newChildren[e2]

        if (isSameVnode(n1, n2)) {
            patch(n1, n2, container, parent)
        }else {
            break;
        }
        e1 --
        e2 --
    }

   // 3. 新的比较老的多，创建
   if (i > e1) {
     if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? newChildren[nextPos].el : null
        while(i <= e2){
            patch(null, newChildren[i], container, parent, anchor)
            i ++
        }
     }
   }else if (i > e2) { // 4.老的比新的长
    while(i <= e1) {
        hostRemove(oldChildren[i].el)
        i ++
    }
   }else {
        // 5.中间对比
        let s1 = i
        let s2 = i
        let moved = false
        let maxNewIndexSoFar = 0
        const toBePatched = e2 - s2 + 1
        const keyToNewIndexMap = new Map()
        const newIndexToOldIndexMap = new Array(toBePatched)
        for (let i = 0; i < toBePatched; i++) {
            newIndexToOldIndexMap[i] = 0
        }
        let patched = 0
        for (let i = s2; i <= e2; i++) {
            const nextChild = newChildren[i]
            keyToNewIndexMap.set(nextChild.key, i)
        }

        for (let i = s1; i <= e1; i++) {
            let newIndex
            const preChild = oldChildren[i];
            if (patched >= toBePatched) {
                hostRemove(preChild.el)
                continue
            }
            if (preChild.key) {
            newIndex = keyToNewIndexMap.get(preChild.key)
            }else {
                for (let j = s2; j <= e2; j++) {
                    if (isSameVnode(preChild, newChildren[j])) {
                        newIndex = j
                        break
                    } 
                }
            }
            if (newIndex === undefined) {
                hostRemove(preChild.el)
            } else{
                if (newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex
                }else {
                    moved = true
                }
                newIndexToOldIndexMap[newIndex - s2] = i + 1
                patch(preChild, newChildren[newIndex], container, parent,null)
                patched ++
            }
        } 
        
        const increasingNewIndexSequence = moved ?  getSequence(newIndexToOldIndexMap) : []
        let j = increasingNewIndexSequence.length - 1
        for (let i = toBePatched - 1; i >=0 ; i--) {
            const nextIndex = i + s2
            const nextChild = newChildren[nextIndex]
            const anchor =  nextIndex + 1 < l2 ? newChildren[nextIndex + 1].el : null

            if (newIndexToOldIndexMap[i] === 0) {
                patch(null, nextChild, container, parent, anchor)
            }else if (moved) {  
                if (j < 0  || i !== increasingNewIndexSequence[j]) {
                    insert(nextChild.el, container, anchor)
                }else {
                    j--
                }
            }
            
        }
   }
}

function processComponent(n1, n2, container, parent) {
   if (!n1) {
       mountComponent(n2, container, parent)
   }else {
    updateComponent(n1, n2, container, parent)
   }
}

function processFragment(n1, n2: any, container: any, parent, anchor) {
    mountChildren(n2.children, container, parent, anchor)
}

function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el =  document.createTextNode(children))
    container.appendChild(textNode)
}

function mountComponent(componentVnode: any, container: any, parent) {
  const instance =  createComponentInstance(componentVnode, parent)
  componentVnode.component = instance
  setupComponent(instance)
  setupRenderEffect(instance, container, componentVnode)
}

function updateComponent(n1: any, n2: any, container: any, parent: any) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
        instance.next = n2
        instance.update()
    }else {
        n2.el = n1.el
        instance.vnode = n2
    }
}

function shouldUpdateComponent(pre, next) {
    const { props : preProps } = pre
    const { props : nextProps } = next

    for (const key in nextProps) {
       if (nextProps[key] !== preProps[key]) {
        return true
       }
        
    }

    return false
}

function setupRenderEffect(instance, container, componentVnode) {
        instance.update =  effect(()=>{
        if (!instance.isMounted) {
            const { proxy } = instance
            const subTree = instance.render.call(proxy, proxy)
            instance.subTree = subTree
            patch(null,subTree, container, instance)
            componentVnode.el = subTree.el 
            instance.isMounted = true
        } else {
            const { next, vnode } = instance
            if (next) {
                next.el = vnode.el
                updateComponentPreRender(instance, next)
            }

            const { proxy } = instance
            const subTree = instance.render.call(proxy, proxy)
            const preSubTree = instance.subTree
            patch(preSubTree,subTree, container, instance)
            instance.subTree = subTree            
        }
    }, {scheduler(){
        queueMicrotask(instance.update)
    }})
}

function updateComponentPreRender(instance, nextVNode){
    instance.props = nextVNode.props
    instance.vnode = nextVNode
    instance.next = null
}

function mountElement(vnode: any, container: any, parent, anchor) {
    // const el = (vnode.el = document.createElement(vnode.type))
    const el =  createElement(vnode)
    const { children, props, shapFlag } = vnode

    if (shapFlag & ShapeFlags.text_children) {
        el.textContent = children        
    }else if (shapFlag & ShapeFlags.array_children) {
        mountChildren(children, el, parent, anchor)
    }

    for (const key in props) {
        const val = props[key]
        // const isOn = (key: string) => /^on[A-Z]/.test(key)
        // if (isOn(key)) {
        //     const event = key.slice(2).toLocaleLowerCase()
        //     el.addEventListener(event, val)
        // } else {
        //     el.setAttribute(key, val)
        // }
        patchProp(el, key, null, val)
     }
    //  container.appendChild(el)
    insert(el, container, anchor)
}


    function mountChildren(children, el, parent, anchor) {
        children.forEach((vnode)=>{
            patch(null, vnode, el, parent, anchor)
        })
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el)
        }
    }

    return {
        createApp : createAppAPI(render)
    }
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }

