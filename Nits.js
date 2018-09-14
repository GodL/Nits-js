class _Node {
    constructor(value) {
        this.prev = this.next = null;
        this.value = value;
    }

    // set prev(prev) {
    //     this.prev = prev
    // }

    // set next(next) {
    //     this.next = next
    // }

    // get value() {
    //     return this.value
    // }
}

class _CacheObject {
    constructor(key,value,cost) {
        this.key = key
        this.value = value
        this.cost = cost
    }

    // get key() {
    //     return this.key
    // }

    // get value() {
    //     return this.value
    // }

    // get cost() {
    //     return this.cost
    // }
}

class _LRU {

    constructor(name,limitCost,limitCount) {
        this.name = name;
        if (limitCost == 0 || limitCost == null || limitCost == undefined) limitCost = Number.MAX_VALUE
        if (limitCount == 0 || limitCount == null || limitCount == undefined) limitCount = Number.MAX_VALUE
        this.limitCost = limitCost;
        this.limitCount = limitCount
        this.cost = this.count = 0;
        this.header = this.tail = null;
        this.cacheHash = new Map()
    }
    
    contains(key) {
        return this.cacheHash.has(key)
    }

    set(key,value,cost) {
        if (key == null || key == undefined) return
        if (cost == null || cost == undefined) cost = 0;
        var node;
        var cache_object;
        if (this.contains(key)) {
            node = this.cacheHash.get(key)
            cache_object = node.value
            cache_object.value = value
            this.cost -= cache_object.cost
        }else {
            cache_object = new _CacheObject(key,value,0)
            this.cacheHash.set(key,cache_object)
            node = new _Node(cache_object)
            this.count ++ 
            if (this.count > this.limitCount) this._removeTail()
        }
        cache_object.cost = cost
        this.cost += cost
        while (this.cost > this.limitCost) this._removeTail()
        this._bringToHeader(node)
    }

    get(key) {
        if (key == null || key == undefined) return
        var node = this.cacheHash.get(key)
        return (node == null || node == undefined)  ? null : node.value.value
    }

    trimToCount(count) {
        if (this.count <= count) return
        var index = 0;
        var node = this.header
        var new_tail = null
        while (node != null) {
            if (index < count) {
                if (index == count - 1) new_tail = node
            }else {
                this.cacheHash.delete(node.value.key)
                this.cost -= node.value.cost
            }
            node = node.next
            index ++ 
        }
        new_tail.next = null
        this.tail = new_tail
        this.count = count
        if (count == 0) this.header = this.tail
    }

    trimToCost(cost) {
        if (this.cost <= cost) return
        if (cost == 0) {
            this.removeAll()
            return
        }
        while (1) {
            if (this.cost > cost) this._removeTail()
            else break
        }
    }

    remove(key) {
        if (key == null) this.removeAll()
        else {
            this._removeNode(this.cacheHash.get(key))
        }
    }

    removeAll() {
        this.cost = this.count = 0
        this.cacheHash = new Map()
        this.header = this.tail = null
    }
    
    /*
        private
    */

    _bringToHeader(node) {
        if (this.header == null) {
            this.header = this.tail = node
            return
        }
        if (this.header == node) return
        if (this.tail == node) this.tail = node.prev
        if (node.prev) node.prev.next = node.next
        if (node.next) node.next.prev = node.prev
        this.header.prev = node
        node.prev = null
        node.next = this.header
        this.header = node
    }

    _removeTail() {
        if (this.count <= 1) return
        this._removeNode(this.tail)
    }

    _removeNode(node) {
        if (node == null || node == undefined) return
        this.cacheHash.delete(node.value.key)
        if (node.prev) node.prev.next = node.next
        if (node.next) node.next.prev = node.prev
        if (this.header == node) this.header = node.next
        if (this.tail == node) this.tail = node.prev
        this.cost -= node.value.cost
        this.count --
    }

    toString() {
        var node = this.header
        var string = this.name != null ? this.name : "no_name"
        while (node != null && node != undefined) {
            string = string + ' key ' + node.value.key + ' value ' + node.value.value + ' cost ' + node.value.cost + ' '
            node = node.next
        }
        return string + ' countTotal ' + this.count + ' costTotal ' + this.cost
    }
}

class Nits {
    constructor(name,limitCost,limitCount) {
        this.lru = new _LRU(name,limitCost,limitCount)
    }

    get name() {
        return this.lru.name
    }

    get cost() {
        return this.lru.cost
    }

    get count() {
        return this.lru.count
    }

    contains(key) {
        return this.lru.contains(key)
    }

    set(key,value,cost) {
        this.lru.set(key,value,cost)
    }

    get(key) {
        return this.lru.get(key)
    }

    trimToCount(count) {
        this.lru.trimToCount(count)
    }

    trimToCost(cost) {
        this.lru.trimToCost(cost)
    }

    remove(key) {
        this.lru.remove(key)
    }

    removeAll() {
        this.lru.removeAll()
    }

    toString() {
        return this.lru.toString()
    }
}

/*
    Test Nits for limitCount limitCost no limit
*/

var no_limit = new Nits('nolimit')
var count_limit = new Nits('countlimit',0,20)
var cost_limit = new Nits('costlimit',100,0)

for (let index = 0; index < 30; index++) {
    let key = index.toString()
    no_limit.set(key,key,key.length)
    count_limit.set(key,key,key.length)
    cost_limit.set(key,key,key.length * key)
}

console.log(no_limit.toString())
console.log(count_limit.toString())
console.log(cost_limit.toString())