/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it, vi } from 'vitest';
import { AsyncInterceptorManager, createAsyncInterceptorKey, createInterceptorKey, InterceptorManager } from '../interceptor';

describe('Test interceptor', () => {
    it('should return "true" when each interceptor returns true ', async () => {
        const INTERCEPTOR_KEY = createAsyncInterceptorKey<boolean, boolean>('test');
        const interceptor = new AsyncInterceptorManager({ INTERCEPTOR_KEY });

        interceptor.interceptAsync(interceptor.getInterceptPoints().INTERCEPTOR_KEY, {
            priority: 0,
            handler: async (value, context, next) => {
                return await next(value);
            },
        });

        interceptor.interceptAsync(interceptor.getInterceptPoints().INTERCEPTOR_KEY, {
            priority: 10,
            handler: async (value, context, next) => {
                return await next(true);
            },
        });

        const interceptorRes = await interceptor.fetchThroughAsyncInterceptors(INTERCEPTOR_KEY)(false, true);
        expect(interceptorRes).toBe(true);
    });

    it('should return "false" when one of the interceptor returns false', async () => {
        const INTERCEPTOR_KEY = createAsyncInterceptorKey<boolean, boolean>('test');
        const interceptor = new AsyncInterceptorManager({ INTERCEPTOR_KEY });

        interceptor.interceptAsync(interceptor.getInterceptPoints().INTERCEPTOR_KEY, {
            priority: 0,
            handler: async (value, context, next) => {
                return await next(value);
            },
        });

        interceptor.interceptAsync(interceptor.getInterceptPoints().INTERCEPTOR_KEY, {
            priority: 10,
            handler: async (value, context, next) => {
                return await next(false);
            },
        });

        const interceptorRes = await interceptor.fetchThroughAsyncInterceptors(INTERCEPTOR_KEY)(false, true);
        expect(interceptorRes).toBe(false);
    });
});

describe('interceptor subscription cleanup', () => {
    it('can release a synchronous registration after its manager is disposed', () => {
        const key = createInterceptorKey<boolean, boolean>('late-cleanup');
        const manager = new InterceptorManager({ key });
        const handler = { handler: () => true };
        const release = manager.intercept(key, handler);
        manager.dispose();
        expect(release()).toBe(false);
        expect(release()).toBe(false);
    });

    it('can release an asynchronous registration after its manager is disposed', async () => {
        const key = createAsyncInterceptorKey<boolean, boolean>('late-cleanup');
        const manager = new AsyncInterceptorManager({ key });
        const handler = { handler: async () => true };
        const release = await manager.interceptAsync(key, handler);
        manager.dispose();
        expect(release()).toBe(false);
        expect(release()).toBe(false);
    });
});

describe('synchronous interceptor lifecycle', () => {
    it('preserves priority, context, filtering and cached chains when unregistering', () => {
        const key = createInterceptorKey<number, number>('chain');
        const manager = new InterceptorManager({ key });
        const calls: string[] = [];
        manager.intercept(key, {
            priority: 0,
            handler: (value, context, next) => {
                calls.push('last');
                return next(value! + context);
            },
        });
        const release = manager.intercept(key, {
            priority: 5,
            handler: (value, _context, next) => {
                calls.push('middle');
                return next(value! * 2);
            },
        });
        manager.intercept(key, {
            priority: 10,
            handler: (value, context, next) => {
                calls.push('first');
                return next(value! + context);
            },
        });
        const chain = manager.fetchThroughInterceptors(key);
        const filtered = manager.fetchThroughInterceptors(key, (entry) => entry.priority! >= 5);
        expect(chain(1, 2)).toBe(8);
        expect(calls).toEqual(['first', 'middle', 'last']);
        expect(filtered(1, 2)).toBe(6);
        expect(release()).toBe(true);
        expect(chain(1, 2)).toBe(5);
        expect(filtered(1, 2)).toBe(6);
    });

    it('preserves short circuiting and propagates handler errors', () => {
        const key = createInterceptorKey<boolean, null>('validation');
        const manager = new InterceptorManager({ key });
        const tail = vi.fn(() => true);
        manager.intercept(key, { priority: 0, handler: tail });
        const release = manager.intercept(key, { priority: 10, handler: () => false });
        expect(manager.fetchThroughInterceptors(key)(true, null)).toBe(false);
        expect(tail).not.toHaveBeenCalled();
        release();
        expect(manager.fetchThroughInterceptors(key)(false, null)).toBe(true);
        const error = new Error('validation failed');
        manager.intercept(key, {
            priority: 20,
            handler: () => {
                throw error;
            },
        });
        expect(() => manager.fetchThroughInterceptors(key)(true, null)).toThrow(error);
    });

    it('does not remove another registration when an old callback is called twice', () => {
        const key = createInterceptorKey<boolean, null>('repeated-release');
        const manager = new InterceptorManager({ key });
        const handler = { handler: () => true };
        const release = manager.intercept(key, handler);
        const releaseOther = manager.intercept(key, handler);
        expect(release()).toBe(true);
        expect(release()).toBe(false);
        expect(manager.fetchThroughInterceptors(key)(false, null)).toBe(true);
        expect(releaseOther()).toBe(true);
        expect(manager.fetchThroughInterceptors(key)(false, null)).toBe(false);
    });

    it('rejects registration and chain creation after terminal disposal', () => {
        const key = createInterceptorKey<boolean, null>('terminal');
        const manager = new InterceptorManager({ key });
        const handler = { handler: () => true };
        const release = manager.intercept(key, handler);
        manager.dispose();
        expect(() => manager.dispose()).not.toThrow();
        expect(() => manager.intercept(key, handler)).toThrow(/disposed/);
        expect(() => manager.fetchThroughInterceptors(key)).toThrow(/disposed/);
        const filter = vi.fn(() => true);
        expect(() => manager.fetchThroughInterceptors(key, filter)).toThrow(/disposed/);
        expect(filter).not.toHaveBeenCalled();
        expect(release()).toBe(false);
        expect(release()).toBe(false);
    });

    it('only unregisters from the requested interception point', () => {
        const first = createInterceptorKey<boolean, null>('first');
        const second = createInterceptorKey<boolean, null>('second');
        const manager = new InterceptorManager({ first, second });
        const handler = { handler: () => true };
        const release = manager.intercept(first, handler);
        manager.intercept(second, handler);
        release();
        expect(manager.fetchThroughInterceptors(first)(false, null)).toBe(false);
        expect(manager.fetchThroughInterceptors(second)(false, null)).toBe(true);
    });

    it('rejects later invocations of cached and filtered chains after disposal', () => {
        const key = createInterceptorKey<boolean, null>('cached-chain');
        const manager = new InterceptorManager({ key });
        const handler = vi.fn(() => true);
        manager.intercept(key, { handler });
        const chain = manager.fetchThroughInterceptors(key);
        const filtered = manager.fetchThroughInterceptors(key, () => true);
        manager.dispose();
        expect(() => chain(false, null)).toThrow(/disposed/);
        expect(() => filtered(false, null)).toThrow(/disposed/);
        expect(handler).not.toHaveBeenCalled();
    });

    it('remains terminal when an owned cleanup throws', () => {
        const key = createInterceptorKey<boolean, null>('cleanup-error');
        const manager = new InterceptorManager({ key });
        const release = manager.intercept(key, { handler: () => true });
        const error = new Error('cleanup failed');
        manager.disposeWithMe(() => {
            throw error;
        });
        expect(() => manager.dispose()).toThrow(error);
        expect(() => manager.intercept(key, { handler: () => true })).toThrow(/disposed/);
        expect(release()).toBe(false);
        expect(() => manager.dispose()).not.toThrow();
    });

    it('lets a running chain finish when a handler disposes the manager', () => {
        const key = createInterceptorKey<number, null>('in-flight');
        const manager = new InterceptorManager({ key });
        manager.intercept(key, {
            priority: 10,
            handler: (value, _context, next) => {
                manager.dispose();
                return next(value! + 1);
            },
        });
        manager.intercept(key, { handler: (value, _context, next) => next(value! * 2) });
        expect(manager.fetchThroughInterceptors(key)(1, null)).toBe(4);
        expect(() => manager.fetchThroughInterceptors(key)).toThrow(/disposed/);
    });
});

describe('asynchronous interceptor lifecycle', () => {
    it('preserves priority, context, filtering and cached chains when unregistering', async () => {
        const key = createAsyncInterceptorKey<number, number>('chain');
        const manager = new AsyncInterceptorManager({ key });
        const calls: string[] = [];
        await manager.interceptAsync(key, {
            priority: 0,
            handler: async (value, context, next) => {
                calls.push('last');
                return next(value! + context);
            },
        });
        const release = await manager.interceptAsync(key, {
            priority: 5,
            handler: async (value, _context, next) => {
                calls.push('middle');
                return next(value! * 2);
            },
        });
        await manager.interceptAsync(key, {
            priority: 10,
            handler: async (value, context, next) => {
                calls.push('first');
                return next(value! + context);
            },
        });
        const chain = manager.fetchThroughAsyncInterceptors(key);
        const filtered = manager.fetchThroughAsyncInterceptors(key, (entry) => entry.priority! >= 5);
        expect(await chain(1, 2)).toBe(8);
        expect(calls).toEqual(['first', 'middle', 'last']);
        expect(await filtered(1, 2)).toBe(6);
        expect(release()).toBe(true);
        expect(await chain(1, 2)).toBe(5);
        expect(await filtered(1, 2)).toBe(6);
    });

    it('preserves short circuiting and propagates handler errors', async () => {
        const key = createAsyncInterceptorKey<boolean, null>('validation');
        const manager = new AsyncInterceptorManager({ key });
        const tail = vi.fn(async () => true);
        await manager.interceptAsync(key, { priority: 0, handler: tail });
        const release = await manager.interceptAsync(key, { priority: 10, handler: async () => false });
        expect(await manager.fetchThroughAsyncInterceptors(key)(true, null)).toBe(false);
        expect(tail).not.toHaveBeenCalled();
        release();
        expect(await manager.fetchThroughAsyncInterceptors(key)(false, null)).toBe(true);
        const error = new Error('validation failed');
        await manager.interceptAsync(key, {
            priority: 20,
            handler: async () => {
                throw error;
            },
        });
        await expect(manager.fetchThroughAsyncInterceptors(key)(true, null)).rejects.toThrow(error);
    });

    it('does not remove another registration when an old callback is called twice', async () => {
        const key = createAsyncInterceptorKey<boolean, null>('repeated-release');
        const manager = new AsyncInterceptorManager({ key });
        const handler = { handler: async () => true };
        const release = await manager.interceptAsync(key, handler);
        const releaseOther = await manager.interceptAsync(key, handler);
        expect(release()).toBe(true);
        expect(release()).toBe(false);
        expect(await manager.fetchThroughAsyncInterceptors(key)(false, null)).toBe(true);
        expect(releaseOther()).toBe(true);
        expect(await manager.fetchThroughAsyncInterceptors(key)(false, null)).toBe(false);
    });

    it('rejects registration and chain creation after terminal disposal', async () => {
        const key = createAsyncInterceptorKey<boolean, null>('terminal');
        const manager = new AsyncInterceptorManager({ key });
        const handler = { handler: async () => true };
        const release = await manager.interceptAsync(key, handler);
        manager.dispose();
        expect(() => manager.dispose()).not.toThrow();
        await expect(manager.interceptAsync(key, handler)).rejects.toThrow(/disposed/);
        expect(() => manager.fetchThroughAsyncInterceptors(key)).toThrow(/disposed/);
        const filter = vi.fn(() => true);
        expect(() => manager.fetchThroughAsyncInterceptors(key, filter)).toThrow(/disposed/);
        expect(filter).not.toHaveBeenCalled();
        expect(release()).toBe(false);
        expect(release()).toBe(false);
    });

    it('only unregisters from the requested interception point', async () => {
        const first = createAsyncInterceptorKey<boolean, null>('first');
        const second = createAsyncInterceptorKey<boolean, null>('second');
        const manager = new AsyncInterceptorManager({ first, second });
        const handler = { handler: async () => true };
        const release = await manager.interceptAsync(first, handler);
        await manager.interceptAsync(second, handler);
        release();
        expect(await manager.fetchThroughAsyncInterceptors(first)(false, null)).toBe(false);
        expect(await manager.fetchThroughAsyncInterceptors(second)(false, null)).toBe(true);
    });

    it('rejects later invocations of cached and filtered chains after disposal', async () => {
        const key = createAsyncInterceptorKey<boolean, null>('cached-chain');
        const manager = new AsyncInterceptorManager({ key });
        const handler = vi.fn(async () => true);
        await manager.interceptAsync(key, { handler });
        const chain = manager.fetchThroughAsyncInterceptors(key);
        const filtered = manager.fetchThroughAsyncInterceptors(key, () => true);
        manager.dispose();
        await expect(chain(false, null)).rejects.toThrow(/disposed/);
        await expect(filtered(false, null)).rejects.toThrow(/disposed/);
        expect(handler).not.toHaveBeenCalled();
    });

    it('remains terminal when an owned cleanup throws', async () => {
        const key = createAsyncInterceptorKey<boolean, null>('cleanup-error');
        const manager = new AsyncInterceptorManager({ key });
        const release = await manager.interceptAsync(key, { handler: async () => true });
        const error = new Error('cleanup failed');
        manager.disposeWithMe(() => {
            throw error;
        });
        expect(() => manager.dispose()).toThrow(error);
        await expect(manager.interceptAsync(key, { handler: async () => true })).rejects.toThrow(/disposed/);
        expect(release()).toBe(false);
        expect(() => manager.dispose()).not.toThrow();
    });

    it('lets an in-flight chain complete after terminal disposal', async () => {
        const key = createAsyncInterceptorKey<number, null>('in-flight');
        const manager = new AsyncInterceptorManager({ key });
        let resume = () => {};
        const pending = new Promise<void>((resolve) => {
            resume = resolve;
        });
        await manager.interceptAsync(key, {
            priority: 10,
            handler: async (value, _context, next) => {
                await pending;
                return next(value! + 1);
            },
        });
        await manager.interceptAsync(key, { handler: async (value, _context, next) => next(value! * 2) });
        const result = manager.fetchThroughAsyncInterceptors(key)(1, null);
        manager.dispose();
        await expect(manager.interceptAsync(key, { handler: async () => 100 })).rejects.toThrow(/disposed/);
        resume();
        expect(await result).toBe(4);
        expect(() => manager.fetchThroughAsyncInterceptors(key)).toThrow(/disposed/);
    });
});
