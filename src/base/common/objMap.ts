export class ObjMap<T extends Object, V> {
    private map: {[key: string]: V};

    constructor() {
        this.map = {};
    }

    set(key: T, value: V) {
        this.map[JSON.stringify(key)] = value;
    }

    get(key: T): V {
        return this.map[JSON.stringify(key)];
    }
}