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
import { UniverRenderConfigService } from '../render-config.service';

describe('UniverRenderConfigService', () => {
    it('should set/get render config and remove nullish values', () => {
        const service = new UniverRenderConfigService();

        expect(service.getRenderConfig()).toEqual({ ok: '111' });

        service.setRenderConfig('font', '12px');
        expect(service.getRenderConfig()).toEqual({ ok: '111', font: '12px' });

        service.setRenderConfig('font', null);
        expect(service.getRenderConfig()).toEqual({ ok: '111' });

        service.setRenderConfig('lineWidth', 2);
        service.setRenderConfig('lineWidth', undefined as any);
        expect(service.getRenderConfig()).toEqual({ ok: '111' });
    });

    it('should debounce update signal stream', async () => {
        vi.useFakeTimers();

        const service = new UniverRenderConfigService();
        const listener = vi.fn();
        const subscription = service.updateSignal$.subscribe(listener);

        (service as any)._updateSignal$.next();
        (service as any)._updateSignal$.next();

        expect(listener).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(4);
        expect(listener).toHaveBeenCalledTimes(1);

        subscription.unsubscribe();
        vi.useRealTimers();
    });
});
