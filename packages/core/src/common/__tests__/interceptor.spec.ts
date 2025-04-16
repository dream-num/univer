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
import { AsyncInterceptorManager, createAsyncInterceptorKey } from '../interceptor';

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
