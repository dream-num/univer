const timeouts: any[] = [];
const messageName = 'zero-timeout-message';

const globalObject = typeof self !== 'undefined' ? self : window;

/**
 * Maintain the form of setTimeout, only accept a single function parameter,
 * and the delay is always 0.
 * @param fn
 */
export function setZeroTimeout(fn: any) {
    timeouts.push(fn);
    globalObject.postMessage(messageName);
}

function handleMessage(event: MessageEvent) {
    if (typeof self === 'undefined') {
        globalObject.postMessage(messageName);
    } else if (event.source === globalObject && event.data === messageName) {
        event.stopPropagation();
        if (timeouts.length > 0) {
            const fn = timeouts.shift()!;
            fn();
        }
    }
}

globalObject.addEventListener('message', handleMessage, true);
