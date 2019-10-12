const __ = {
    poolDic: Symbol('poolDic')
}

/**
 * 简易对象池实现
 * 用于对象的存储和重复使用
 * 可以有效减少对象创建开销和避免频繁的垃圾回收
 * 提高游戏性能
 */
export default class Pool {
    constructor() {
        this[__.poolDic] = {}
    }

    /**
     * 根据对象标识符
     * 获取对应的对象池
     */
    getPoolBySign(name) {
        return this[__.poolDic][name] || (this[__.poolDic][name] = [])
    }

    /**
     * 根据传入的对象标识符，查询对象池
     * 对象池为空，创建新的类，否则从对象池中获取
     */
    getItemByClass(name, className) {
        let pool = this.getPoolBySign(name)

        let result = pool.length ? pool.shift() : new className();

        return result;
    }

    /**
     * 将对象回收到对象池，方便后继继续使用
     */
    recycle(name, instance) {
        this.getPoolBySign(name).push(instance);
    }
}