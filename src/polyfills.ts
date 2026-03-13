import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
    (window as any).global = window;
    (window as any).process = {
        env: { NODE_DEBUG: undefined },
        version: '',
        nextTick: (cb: any) => setTimeout(cb, 0),
    };
}
