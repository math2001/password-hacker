export interface Events {
    foo: string;
    bar: number;
}

interface keystring {
    [key: string]: any;
}

// EventManager
export class EventManager<T extends keystring> {
    events: {[name: string]: (((data: any) => void)[] | undefined)}
    constructor() {
        this.events = {}
    }

    on<K extends Extract<keyof T, string>, D extends T[K]>(event: K, cb: (data: D) => void) {
        if (!this.events[event]) this.events[event] = []
    }

    emit<K extends Extract<keyof T, string>, D extends T[K]>(event: K, data: D) {
        const cbs = this.events[event]
        if (cbs === undefined) return;
        for (let cb of cbs) {
            cb(data)
        }
    }
}

export const EM = new EventManager<Events>()