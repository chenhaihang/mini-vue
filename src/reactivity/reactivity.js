const depsMap = new WeakMap()
function reactive (target) {
    if (!Object.prototype.toString.call(target) === '[[object object]]') return
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

let effectFn = null
function effect (fn) {
    effectFn = fn
    fn()
    effectFn = null
}

function track (target, key) {
    let deps = depsMap.get(target)
    if (!deps) {
        deps = new Map()
        deps.set(key, new Set())
        depsMap.set(target, deps)
    }
    let effects = deps.get(key)
    if (typeof effectFn === 'function') {
        effects.add(effectFn)
    }

}

function trigger (target, key) {
    let deps = depsMap.get(target)
    if (deps) {
        let effects = deps.get(key)
        if (effects) {

            effects.forEach(fn => {
                fn()
            });
        }
    }
}
setTimeout(() => {
    console.log(depsMap);
}, 500)