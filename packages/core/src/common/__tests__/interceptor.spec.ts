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

import { describe, expect, it } from 'vitest';
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
        expect(() => release()).not.toThrow();
        manager.intercept(key, handler);
        expect(() => release()).not.toThrow();
        expect(manager.fetchThroughInterceptors(key)(false, false)).toBe(true);
        expect(() => release()).not.toThrow();
    });

    it('can release an asynchronous registration after its manager is disposed', async () => {
        const key = createAsyncInterceptorKey<boolean, boolean>('late-cleanup');
        const manager = new AsyncInterceptorManager({ key });
        const handler = { handler: async () => true };
        const release = await manager.interceptAsync(key, handler);
        manager.dispose();
        expect(() => release()).not.toThrow();
        await manager.interceptAsync(key, handler);
        expect(() => release()).not.toThrow();
        expect(await manager.fetchThroughAsyncInterceptors(key)(false, false)).toBe(true);
        expect(() => release()).not.toThrow();
    });
});
