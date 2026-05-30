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
import { Injector } from '../../../common/di';
import { ConfigService } from '../config.service';

function cloneSnapshot<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

describe('ConfigService', () => {
    it('should set, merge, subscribe and delete config values via DI', () => {
        const injector = new Injector([[ConfigService]]);
        const service = injector.get(ConfigService);
        const updates: Array<Record<string, unknown>> = [];

        service.configChanged$.subscribe((config) => updates.push(cloneSnapshot(config)));

        const subscribedValues: Array<Record<string, unknown>> = [];
        const sub = service.subscribeConfigValue$<Record<string, unknown>>('feature').subscribe((value) => {
            subscribedValues.push(cloneSnapshot(value));
        });

        service.setConfig('feature', { enabled: true });
        service.setConfig('feature', { retries: 2 }, { merge: true });

        expect(service.getConfig<Record<string, unknown>>('feature')).toEqual({ enabled: true, retries: 2 });
        expect(updates).toEqual([
            { feature: { enabled: true } },
            { feature: { enabled: true, retries: 2 } },
        ]);
        expect(subscribedValues).toEqual([
            { enabled: true },
            { enabled: true, retries: 2 },
        ]);

        expect(service.deleteConfig('feature')).toBe(true);
        expect(service.getConfig('feature')).toBeUndefined();

        sub.unsubscribe();
        injector.dispose();
    });
});
