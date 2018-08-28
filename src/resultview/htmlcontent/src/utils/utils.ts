
export function range(from: number, to: number): number[] {
    let arr = [];
    for (let i = from; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}

export function randId(): string {
    return (Math.random()+1).toString(36).substr(2, 8);
}