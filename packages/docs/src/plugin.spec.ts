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
import { registerDocsEmbedGuestContribution, registerDocsEmbedHostCapabilities } from './embed-guest';
import { UniverDocsPlugin } from './plugin';

vi.mock('./embed-guest', () => ({
    registerDocsEmbedGuestContribution: vi.fn(),
    registerDocsEmbedHostCapabilities: vi.fn(),
}));

describe('UniverDocsPlugin embed boundary', () => {
    it('does not auto-register embed contributions from product plugin config', () => {
        new UniverDocsPlugin(
            { embed: { host: true, guest: true } } as never,
            createInjector(),
            createConfigService()
        );

        expect(registerDocsEmbedHostCapabilities).not.toHaveBeenCalled();
        expect(registerDocsEmbedGuestContribution).not.toHaveBeenCalled();
    });
});

function createInjector() {
    return {
        add: vi.fn(),
        get: vi.fn(),
    } as never;
}

function createConfigService() {
    return {
        setConfig: vi.fn(),
    } as never;
}
