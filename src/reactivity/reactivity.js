const bucket = new WeakMap()
function reactive (target) {
    if (Object.prototype.toString.call(target) !== '[object Object]') return
    return new Proxy(target, {
        get (target, key, receiver) {
            track(target, key)
            return target[key]
        },
        set (target, key, newValue, receiver) {
            target[key] = newValue
            trigger(target, key)
        }
    })
}

let activeEffect = null
const effectStack = []
function effect (fn,options) {
    const effectFn = ()=>{
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length -1]
    }
    effectFn.options = options
    effectFn.deps = []
    effectFn()
}

function cleanup(effectFn){
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

function track (target, key) {
    let depsMap = bucket.get(target)
    if (!depsMap) {
        depsMap = new Map()
        bucket.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if(!deps){
        depsMap.set(key, deps = new Set())
    }
    if (typeof activeEffect === 'function') {
        activeEffect.deps.push(deps)
        deps.add(activeEffect)
    }

}

function trigger (target, key) {
    let depsMap = bucket.get(target)
    if (depsMap) {
        let deps = depsMap.get(key)
        if (deps) {
            const effectToRun = new Set(deps)
            effectToRun.forEach(fn => {
                if(activeEffect === fn) return 
                if(fn.options.schedule){
                    fn.options.schedule(fn)
                } else {
                    fn()
                }
            });
        }
    }
}
setTimeout(() => {
    console.log(bucket);
},2000)