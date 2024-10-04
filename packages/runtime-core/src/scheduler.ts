const quene = [] as any[];
let isFlushPending = false;
const p = Promise.resolve()
export function nextTick(fn){
    return fn ? p.then(fn) : p
}

export function queueMicrotask(job){
    if (!quene.includes(job)) {
        quene.push(job)
    }
    queneFlush()
}

function queneFlush() {
    if (isFlushPending) return
    isFlushPending = true

    nextTick(() => {
        isFlushPending = false
        let job

        while(job = quene.shift()){
            job && job()
        }
    })
}