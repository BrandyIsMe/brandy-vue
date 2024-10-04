import { shallowReadonly, isReadonly } from "../src/reactive";

describe('readonly', () => {

    it('should not make non-reactive properties reactive ', () => {
        const props = shallowReadonly({n: {foo:1}})
        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })

})