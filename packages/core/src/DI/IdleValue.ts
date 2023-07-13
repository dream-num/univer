import { IDisposable } from './Lifecycle';

export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): DOMHighResTimeStamp;
}

export type DisposableCallback = () => void;

/**
 * this run the callback when CPU is idle. Will fallback to setTimeout if
 * the browser doesn't support requestIdleCallback
 */
// eslint-disable-next-line import/no-mutable-exports
export let runWhenIdle: (
    callback: (idle?: IdleDeadline) => void,
    timeout?: number
) => DisposableCallback;

// declare global variables because apparently the type file doesn't have it, for now
declare function requestIdleCallback(
    callback: (args: IdleDeadline) => void,
    options?: { timeout: number }
): number;
declare function cancelIdleCallback(handle: number): void;

// use an IIFE to set up runWhenIdle
(function patch() {
    if (
        typeof requestIdleCallback !== 'undefined' &&
        typeof cancelIdleCallback !== 'undefined'
    ) {
        // use native requestIdleCallback
        runWhenIdle = (runner, timeout?) => {
            const handle: number = requestIdleCallback(
                runner,
                typeof timeout === 'number' ? { timeout } : undefined
            );
            let disposed = false;
            return () => {
                if (disposed) {
                    return;
                }
                disposed = true;
                clearTimeout(handle);
            };
        };
    } else {
        // use setTimeout as hack
        const dummyIdle: IdleDeadline = Object.freeze({
            didTimeout: true,
            timeRemaining() {
                return 15;
            },
        });

        runWhenIdle = (runner) => {
            const handle = setTimeout(() => runner(dummyIdle));
            let disposed = false;
            return () => {
                if (disposed) {
                    return;
                }
                disposed = true;
                clearTimeout(handle);
            };
        };
    }
})();

/**
 * a wrapper of a executor so it can be evaluated when it's necessary or the CPU is idle
 *
 * the type of the returned value of the executor would be T
 */
export class IdleValue<T> implements IDisposable {
    private readonly executor: () => void;

    private readonly disposeCallback: () => void;

    private didRun = false;

    private value?: T;

    private error?: Error;

    constructor(executor: () => T) {
        this.executor = () => {
            try {
                this.value = executor();
            } catch (err: any) {
                this.error = err;
            } finally {
                this.didRun = true;
            }
        };
        this.disposeCallback = runWhenIdle(() => this.executor());
    }

    hasRun(): boolean {
        return this.didRun;
    }

    dispose(): void {
        this.disposeCallback();
    }

    getValue(): T {
        if (!this.didRun) {
            this.dispose();
            this.executor();
        }
        if (this.error) {
            throw this.error;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.value!;
    }
}
