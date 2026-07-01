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
import type { IEmbedResourceRefProviderRegistration } from '../embed-resource-ref-provider-registry.service';
import { EmbedResourceRefProviderRegistryService } from '../embed-resource-ref-provider-registry.service';

describe('EmbedResourceRefProviderRegistryService', () => {
    it('matches unit string refs through ParsedResourceRef unit output', () => {
        const registry = new EmbedResourceRefProviderRegistryService();
        const registration: IEmbedResourceRefProviderRegistration = {
            registrationId: 'collaboration',
            match: {
                uriReference: true,
                unitTypes: ['sheet'],
            },
            provider: {
                ensure: vi.fn(),
            },
        };

        registry.register(registration);

        expect(registry.get('remote-sheet', 'sheet')).toBe(registration);
        expect(registry.get('#unit=remote-sheet', 'sheet')).toBe(registration);
        expect(registry.get('remote-sheet', 'doc')).toBeUndefined();
        expect(registry.get({
            file: { kind: 'uri', uri: 'univer://unit/remote-sheet' },
            unit: { selector: 'remote-sheet', type: 'sheet' },
        }, 'sheet')).toBeUndefined();
    });
});
