export interface Matcher {
    match: (pattern: string, str: string) => boolean;
}

export class MatchMap<V> {
    private map: Map<string, V>;

    constructor(private matcher: Matcher, obj?: {[key: string]: V}) {
        this.map = new Map<string, V>();

        if (obj) {
            for(let key in obj) {
                this.set(key, obj[key]);
            }
        }
    }

    set(key: string, value: V) {
        this.map.set(key, value);
    }

    get(str: string): V[] {
        let values: V[] = [];
        this.map.forEach((value, key) => {
            if (this.matcher.match(key, str)) values.push(value);
        });
        return values;
    }

    keys() {
        return this.map.keys();
    }

    values() {
        return this.map.values();
    }

    size() {
        return this.map.size;
    }

    clear() {
        this.map.clear();
    }
}