import { isRef, ref, unRef, proxyRefs } from "../ref";
import { effect } from "../effect";

describe('ref', () => {

    it('happy path', () => {
      const a = ref(1)
      expect(a.value).toBe(1)
    })

    it('should be reactive', () => {
        const a =ref(1)
        let dummy
        let calls =0 
        effect(()=>{
            dummy = a.value
            calls ++
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        a.value = 2
        expect(dummy).toBe(2)
        expect(calls).toBe(2)
        // same value should not trigger
        a.value = 2
        expect(dummy).toBe(2)
        expect(calls).toBe(2)
    })

    it('should make nested properties reactive', () => {
        const a = ref({foo: 1})
        let dummy
        effect(()=>{
            dummy = a.value.foo
        })
        expect(dummy).toBe(1)
        a.value.foo = 2
        expect(dummy).toBe(2)
    })

    it('isRef', () => {
        const a = ref(1)
        expect(isRef(a)).toBe(true)
        const b = 1
        expect(isRef(b)).toBe(false)
    })

    it('unRef', () => {
        const a = ref(1)
        expect(unRef(a)).toBe(1)
        const b = 1
        expect(unRef(b)).toBe(1)
    })

    it('proxyRefs', () => {
        const user = {
            age: ref(10),
            name: 'John',
        }

        const proxyUser = proxyRefs(user)
        expect(user.age.value).toBe(10)
        expect(proxyUser.age).toBe(10)
        expect(proxyUser.name).toBe('John')

        proxyUser.age = 20
        expect(proxyUser.age).toBe(20)
        expect(user.age.value).toBe(20)

        proxyUser.age = ref(15)
        expect(proxyUser.age).toBe(15)
        expect(user.age.value).toBe(15)
    })

})