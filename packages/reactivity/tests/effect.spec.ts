import { effect, stop } from "../src/effect";
import { reactive } from "../src/reactive";

describe('effect', () => {

    it('happy', () => {
        const user = reactive({
            age:10
        })
        let nextAge;
        
        effect(()=>{
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        // update

        user.age ++

        expect(nextAge).toBe(12)
    })

    it('should return runner', () => {
        let foo = 10

        const runner =  effect(()=>{
            foo++
            return 'foo'
        })

        expect(foo).toBe(11)

        const result = runner()

        expect(foo).toBe(12)
        expect(result).toBe('foo')
    })

    it('scheduler', ()=>{
        let dummy ;
        let run;
        const scheduler = jest.fn(()=>{
            run = runner
        })
        const obj = reactive({foo: 1})
        const runner = effect(()=>{
            dummy = obj.foo
        },
        {scheduler}
        )

        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        run()
        expect(dummy).toBe(2)
    })

    it('stop', ()=>{
        let dummy;
        const obj = reactive({prop: 1})
        const runner = effect(()=>{
            dummy = obj.prop
        })

        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        obj.prop++
        // obj.prop = 3
        expect(dummy).toBe(2)

        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', ()=>{
        const obj = reactive({
            foo: 1
        })

        const onStop = jest.fn()
        let dummy;

        const runner = effect(()=>{
            dummy = obj.foo
        },
        {onStop}
        )
        stop(runner)
        
        expect(onStop).toHaveBeenCalledTimes(1)
    })

})