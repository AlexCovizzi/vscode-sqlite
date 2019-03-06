export function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export function randomString(length: number) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

export function isRunning(pid: number|undefined|null): boolean {
    if (!pid) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch(err) {
        return false;
    }
}