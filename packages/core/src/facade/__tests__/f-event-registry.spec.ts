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

import { Injector, LifecycleStages } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { FEventRegistry } from '../f-event-registry';

describe('FEventRegistry', () => {
    it('should activate internal event bridges only while facade listeners are subscribed', () => {
        const registry = new Injector().createInstance(FEventRegistry);
        const disposeBridge = vi.fn();
        const initBridge = vi.fn(() => ({ dispose: disposeBridge }));
        const listenerA = vi.fn((params: { stage: LifecycleStages; cancel?: boolean }) => {
            params.cancel = true;
        });
        const listenerB = vi.fn();

        const bridgeDisposable = registry.registerEventHandler('LifeCycleChanged', initBridge);
        expect(initBridge).not.toHaveBeenCalled();

        const listenerADisposable = registry.addEvent('LifeCycleChanged', listenerA);
        expect(initBridge).toHaveBeenCalledTimes(1);

        const canceled = registry.fireEvent('LifeCycleChanged', { stage: LifecycleStages.Ready, cancel: false });
        expect(canceled).toBe(true);
        expect(listenerA).toHaveBeenCalledWith({ stage: LifecycleStages.Ready, cancel: true });

        const listenerBDisposable = registry.addEvent('LifeCycleChanged', listenerB);
        expect(initBridge).toHaveBeenCalledTimes(1);

        listenerADisposable.dispose();
        expect(disposeBridge).not.toHaveBeenCalled();

        listenerBDisposable.dispose();
        expect(disposeBridge).toHaveBeenCalledTimes(1);

        registry.addEvent('LifeCycleChanged', listenerA);
        expect(initBridge).toHaveBeenCalledTimes(2);

        bridgeDisposable.dispose();
        expect(disposeBridge).toHaveBeenCalledTimes(2);
    });
});
