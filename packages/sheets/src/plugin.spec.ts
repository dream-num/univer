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
import { registerSheetsEmbedGuestContribution, registerSheetsEmbedHostCapabilities } from './embed-guest';
import { UniverSheetsPlugin } from './plugin';

vi.mock('./embed-guest', () => ({
    registerSheetsEmbedGuestContribution: vi.fn(),
    registerSheetsEmbedHostCapabilities: vi.fn(),
}));

describe('UniverSheetsPlugin embed boundary', () => {
    it('registers product embed capabilities from the model plugin', () => {
        const injector = createInjector();
        const plugin = new UniverSheetsPlugin(
            {},
            injector,
            createConfigService()
        );

        plugin.onStarting();

        expect(registerSheetsEmbedHostCapabilities).toHaveBeenCalledWith(injector);
        expect(registerSheetsEmbedGuestContribution).toHaveBeenCalledWith(injector);
    });
});

function createInjector() {
    return {
        add: vi.fn(),
        has: vi.fn(() => false),
        get: vi.fn(() => ({
            registerCommand: vi.fn(),
        })),
    } as never;
}

function createConfigService() {
    return {
        setConfig: vi.fn(),
    } as never;
}
