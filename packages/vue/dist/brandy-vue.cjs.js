'use strict';

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        shapFlag: getShapFlag(type),
        el: null
    };
    if (typeof children === "string") {
        vnode.shapFlag = vnode.shapFlag | 4 /* ShapeFlags.text_children */;
    }
    else if (Array.isArray(children)) {
        vnode.shapFlag = vnode.shapFlag | 8 /* ShapeFlags.array_children */;
    }
    if (vnode.shapFlag & 2 /* ShapeFlags.stateful_component */ && typeof children === 'object') {
        vnode.shapFlag |= 16 /* ShapeFlags.slot_children */;
    }
    return vnode;
}
function getShapFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.element */ : 2 /* ShapeFlags.stateful_component */;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, slotsData) {
    let slotName = slots[name];
    if (slotName) {
        if (typeof slotName === 'function') {
            slotName = slotName(slotsData);
        }
        return createVnode(Fragment, {}, slotName);
    }
}

function toDisplayString(value) {
    return String(value);
}

const extend = Object.assign;
function isObeject(val) {
    return val !== null && typeof val === 'object';
}
const hasChanged = (val1, val2) => !Object.is(val1, val2);
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const handlerKey = (str) => {
    return str ? 'on' + str : '';
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
};

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    _fn;
    scheduler;
    deps = [];
    active = true;
    onStop;
    constructor(_fn, scheduler) {
        this._fn = _fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        let result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.deps.forEach((dep) => {
                dep.delete(this);
            });
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
function trigger(target, key, value) {
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.onStop = options.onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = creatGetter();
const set = creatSetter();
const readonlyGet = creatGetter(true);
const shallowReadonlyGet = creatGetter(true, true);
function creatGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveEffectType.IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadOnly" /* ReactiveEffectType.IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObeject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (!isReadOnly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
function creatSetter(isReadOnly = false) {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 依赖触发
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} set失败，因为${target}是readonly`);
        return true;
    }
};
const shallowReadonlyHandler = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn(`key ${key} set失败，因为${target}是readonly`);
        return true;
    }
};

function reactive(raw) {
    return createReactiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandler);
}
function isReactive(val) {
    return Boolean(val["__v_isReactive" /* ReactiveEffectType.IS_REACTIVE */]);
}
function isReadonly(val) {
    return Boolean(val["__v_isReadOnly" /* ReactiveEffectType.IS_READONLY */]);
}
function isProxy(val) {
    return isReactive(val) || isReadonly(val);
}
function createReactiveObject(target, handlers) {
    if (!isObeject(target)) {
        return console.warn(`${target} 必须是一个对象`);
    }
    return new Proxy(target, handlers);
}

class RefImpl {
    _value;
    dep;
    _rawValue;
    __v_isRef;
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = isObeject(value) ? reactive(value) : value;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = isObeject(newValue) ? reactive(newValue) : newValue;
        triggerEffects(this.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlers = props[handlerKey(capitalize(camelize(event)))];
    handlers && handlers(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
    // set(target, key, value){
    // }
};

const initSlots = (instance, children) => {
    const { vnode } = instance;
    if (vnode.shapFlag & 16 /* ShapeFlags.slot_children */) {
        const slots = {};
        for (const key in children) {
            const value = children[key];
            if (key) {
                slots[key] = (props) => normalizeSlotsValue(value(props));
            }
        }
        instance.slots = slots;
    }
};
const normalizeSlotsValue = (value) => {
    return value = Array.isArray(value) ? value : [value];
};

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState: {},
        props: {},
        parent,
        slots: {},
        providers: parent ? parent.providers : {},
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //TODO: function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler$1(_compiler) {
    compiler = _compiler;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { providers } = currentInstance;
        let parentProviders = null;
        if (currentInstance.parent) {
            parentProviders = currentInstance.parent.providers;
        }
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders);
        }
        providers[key] = value;
    }
}
function inject(key, deafaulValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else if (deafaulValue) {
            return deafaulValue;
        }
    }
}

// import { render } from "./renderer"
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

const quene = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueMicrotask(job) {
    if (!quene.includes(job)) {
        quene.push(job);
    }
    queneFlush();
}
function queneFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(() => {
        isFlushPending = false;
        let job;
        while (job = quene.shift()) {
            job && job();
        }
    });
}

function createRenderer(options) {
    const { createElement, patchProp, insert, remove: hostRemove, setElementText: hoseSetElementText } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parent, anchor) {
        const { shapFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapFlag & 1 /* ShapeFlags.element */) {
                    precessElement(n1, n2, container, parent, anchor);
                }
                else if (shapFlag & 2 /* ShapeFlags.stateful_component */) {
                    // 处理组件
                    processComponent(n1, n2, container, parent);
                }
        }
    }
    function precessElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            // 初始化element
            mountElement(n2, container, parent, anchor);
        }
        else {
            // 更新element
            // patchElement(n1, n2, container, parent, anchor)
            patchElement(n1, n2, parent, anchor);
        }
    }
    const EMPTY_OBJ = {};
    function patchElement(n1, n2, parent, anchor) {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
        patchChildren(el, n1, n2, parent, anchor);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const newProp = newProps[key];
                if (prevProp !== newProp) {
                    patchProp(el, key, prevProp, newProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        patchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function patchChildren(el, n1, n2, parent, anchor) {
        const oldChildren = n1.children;
        const newChildren = n2.children;
        if (n2.shapFlag & 4 /* ShapeFlags.text_children */) { // 新节点为 text
            if (n1.shapFlag & 8 /* ShapeFlags.array_children */) { // 老节点为array
                // 1.把老节点children清空
                unmountChildren(oldChildren);
                // 2.设置text
                hoseSetElementText(el, newChildren);
            }
            if (n1.shapFlag & 4 /* ShapeFlags.text_children */ && oldChildren !== newChildren) { // 老节点也为 text
                // 直接设置 为 新的text
                hoseSetElementText(el, newChildren);
            }
        }
        if (n2.shapFlag & 8 /* ShapeFlags.array_children */) { // 新节点为 array
            if (n1.shapFlag & 4 /* ShapeFlags.text_children */) { // 老节点为 text
                hoseSetElementText(el, '');
                mountChildren(newChildren, el, parent, anchor);
            }
            if (n1.shapFlag & 8 /* ShapeFlags.array_children */) { // 老节点也为 array
                patchKeyedChildren(oldChildren, newChildren, el, parent);
            }
        }
    }
    function patchKeyedChildren(oldChildren, newChildren, container, parent, anchor) {
        let i = 0;
        let e1 = oldChildren.length - 1;
        let e2 = newChildren.length - 1;
        const l2 = newChildren.length;
        function isSameVnode(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 1.左侧
        while (i <= e1 && i <= e2) {
            const n1 = oldChildren[i];
            const n2 = newChildren[i];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, container, parent);
            }
            else {
                break;
            }
            i++;
        }
        // 2.右侧
        while (i <= e1 && i <= e2) {
            const n1 = oldChildren[e1];
            const n2 = newChildren[e2];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, container, parent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. 新的比较老的多，创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? newChildren[nextPos].el : null;
                while (i <= e2) {
                    patch(null, newChildren[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) { // 4.老的比新的长
            while (i <= e1) {
                hostRemove(oldChildren[i].el);
                i++;
            }
        }
        else {
            // 5.中间对比
            let s1 = i;
            let s2 = i;
            let moved = false;
            let maxNewIndexSoFar = 0;
            const toBePatched = e2 - s2 + 1;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            let patched = 0;
            for (let i = s2; i <= e2; i++) {
                const nextChild = newChildren[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                let newIndex;
                const preChild = oldChildren[i];
                if (patched >= toBePatched) {
                    hostRemove(preChild.el);
                    continue;
                }
                if (preChild.key) {
                    newIndex = keyToNewIndexMap.get(preChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVnode(preChild, newChildren[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(preChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(preChild, newChildren[newIndex], container, parent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = newChildren[nextIndex];
                const anchor = nextIndex + 1 < l2 ? newChildren[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        insert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function processComponent(n1, n2, container, parent) {
        if (!n1) {
            mountComponent(n2, container, parent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function processFragment(n1, n2, container, parent, anchor) {
        mountChildren(n2.children, container, parent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    function mountComponent(componentVnode, container, parent) {
        const instance = createComponentInstance(componentVnode, parent);
        componentVnode.component = instance;
        setupComponent(instance);
        setupRenderEffect(instance, container, componentVnode);
    }
    function updateComponent(n1, n2, container, parent) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function shouldUpdateComponent(pre, next) {
        const { props: preProps } = pre;
        const { props: nextProps } = next;
        for (const key in nextProps) {
            if (nextProps[key] !== preProps[key]) {
                return true;
            }
        }
        return false;
    }
    function setupRenderEffect(instance, container, componentVnode) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance);
                componentVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                const preSubTree = instance.subTree;
                patch(preSubTree, subTree, container, instance);
                instance.subTree = subTree;
            }
        }, { scheduler() {
                queueMicrotask(instance.update);
            } });
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.props = nextVNode.props;
        instance.vnode = nextVNode;
        instance.next = null;
    }
    function mountElement(vnode, container, parent, anchor) {
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = createElement(vnode);
        const { children, props, shapFlag } = vnode;
        if (shapFlag & 4 /* ShapeFlags.text_children */) {
            el.textContent = children;
        }
        else if (shapFlag & 8 /* ShapeFlags.array_children */) {
            mountChildren(children, el, parent, anchor);
        }
        for (const key in props) {
            const val = props[key];
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     const event = key.slice(2).toLocaleLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            patchProp(el, key, null, val);
        }
        //  container.appendChild(el)
        insert(el, container, anchor);
    }
    function mountChildren(children, el, parent, anchor) {
        children.forEach((vnode) => {
            patch(null, vnode, el, parent, anchor);
        });
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    return {
        createApp: createAppAPI(render)
    };
}
function getSequence(arr) {
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
                }
                else {
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

function createElement(vnode) {
    const el = (vnode.el = document.createElement(vnode.type));
    return el;
}
function patchProp(el, key, preVal, newVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (!newVal) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newVal);
        }
    }
}
function insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null);
}
function remove(child) {
    if (child.parentNode) {
        child.parentNode.removeChild(child);
    }
}
function setElementText(container, text) {
    container.textContent = text;
}
// function setElementArray(container, children, mountChildren) {
//     setElementText(container, '')
//     mountChildren(children, container, null)
// }
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
    // setElementArray
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var RuntimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElementVNode: createVnode,
    createRenderer: createRenderer,
    createTextVnode: createTextVnode,
    effect: effect,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    isProxy: isProxy,
    isReactive: isReactive,
    isReadonly: isReadonly,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    reactive: reactive,
    readonly: readonly,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler$1,
    renderSlots: renderSlots,
    shallowReadonly: shallowReadonly,
    toDisplayString: toDisplayString
});

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
const helperMapName = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function genNode(node, context) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SIMPLE_INTERPOLATION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElment(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = 'Vue';
    const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const {${ast.helpers.map(aliasHelper).join(', ')}} = ${VueBinging}`);
    }
    push("\n");
    push("return ");
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(`)`);
}
function genExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function genElment(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);
    push(")");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(', ');
        }
    }
}
function genNullable(args) {
    return args.map((arg) => arg || 'null');
}
function genCompoundExpression(node, context) {
    const children = node.children;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function isString(value) {
    return typeof value === 'string';
}

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */
    };
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        if (context.source.startsWith('{{')) {
            node = parseInterpolation(context);
        }
        else if (context.source[0] === '<') {
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    if (context.source.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(context.source, tag)) {
                return true;
            }
        }
    }
    // if (tag && context.source.startsWith(`</${tag}>`)) {
    //     return true
    // }
    return !context.source;
}
function parseElement(context, ancestors) {
    const elment = parseTag(context, 0 /* TagType.START */);
    ancestors.push(elment);
    elment.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, elment.tag)) {
        parseTag(context, 1 /* TagType.END */);
    }
    else {
        throw new Error(`Invalid HTML syntax: unclosed tag ${elment.tag}`);
    }
    return elment;
}
function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advance(context, match[0].length);
    advance(context, 1);
    if (type === 0 /* TagType.START */) {
        return {
            type: 2 /* NodeTypes.ELEMENT */,
            tag: tag
        };
    }
}
function parseText(context) {
    let endIndex = context.source.length;
    let endTokens = ['{{', '<'];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const textContent = pareTextData(context, endIndex);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content: textContent
    };
}
function parseInterpolation(context) {
    const openDelimiter = '{{';
    const closeDelimiter = '}}';
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advance(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;
    // const rowContent = context.source.slice(0, rawContentLength)
    // advance(context, rawContentLength + closeDelimiter.length)
    const rowContent = pareTextData(context, rawContentLength);
    const content = rowContent.trim();
    advance(context, closeDelimiter.length);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_INTERPOLATION */,
            content: content
        }
    };
}
function pareTextData(context, length) {
    const content = context.source.slice(0, length);
    advance(context, length);
    return content;
}
function createParserContext(content) {
    return {
        source: content,
    };
}
function advance(context, length) {
    context.source = context.source.slice(length);
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodeGen(root);
    root.helpers = [...context.helpers.keys()];
}
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    if (nodeTransforms) {
        for (let i = 0; i < nodeTransforms.length; i++) {
            const plugin = nodeTransforms[i];
            const onExit = plugin(node, context);
            if (onExit) {
                exitFns.push(onExit);
            }
        }
        switch (node.type) {
            case 0 /* NodeTypes.INTERPOLATION */:
                context.helper(TO_DISPLAY_STRING);
                break;
            case 4 /* NodeTypes.ROOT */:
            case 2 /* NodeTypes.ELEMENT */:
                traverseChildren(node, context);
                break;
        }
        let i = exitFns.length;
        while (i--) {
            exitFns[i]();
        }
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}
function traverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}
function createRootCodeGen(root) {
    const child = root.children[0];
    if (child.type == 2 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        return root.codegenNode = root.children[0];
    }
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE);
            const vnodeTag = `'${node.tag}'`;
            let vnodeProps;
            const children = node.children;
            let vondeChildren = children[0];
            const vnodeElement = {
                type: 2 /* NodeTypes.ELEMENT */,
                tag: vnodeTag,
                props: vnodeProps,
                children: vondeChildren
            };
            node.codegenNode = vnodeElement;
        };
    }
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        const rowContent = node.content.content;
        node.content.content = "_ctx." + rowContent;
    }
}

function transformText(node) {
    function isText(node) {
        return node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
    }
    let currentContainer;
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const children = node.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(' + ');
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = null;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
}

// brandy-vue 出口
const { registerRuntimeCompiler } = RuntimeDom;
function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(RuntimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.createApp = createApp;
exports.createElementVNode = createVnode;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler$1;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
exports.toDisplayString = toDisplayString;
