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

import type { Injector } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import { EmbedProductMenuRegistryService } from '@univerjs/embed-ui';
import { describe, expect, it } from 'vitest';
import { registerSheetsEmbedProductMenus } from './embed-product-menu';
import { menuSchema } from './menu/schema';

describe('registerSheetsEmbedProductMenus', () => {
    it('registers the Sheets ribbon menu schema for embed product menu consumers', () => {
        const registry = new EmbedProductMenuRegistryService();
        const injector = createRegistryInjector(registry);

        const disposable = registerSheetsEmbedProductMenus(injector);
        const registered = registry.getAll(UniverInstanceType.UNIVER_SHEET, 'ribbon');

        expect(disposable).toBeDefined();
        expect(registered).toHaveLength(1);
        expect(registered[0].id).toBe('sheets-ui.ribbon');
        expect(registry.getMergedMenuSchema(UniverInstanceType.UNIVER_SHEET)).toEqual(menuSchema);

        const duplicate = registerSheetsEmbedProductMenus(injector);
        expect(duplicate).toBeUndefined();
        expect(registry.getAll(UniverInstanceType.UNIVER_SHEET, 'ribbon')).toHaveLength(1);
    });
});

function createRegistryInjector(service: EmbedProductMenuRegistryService): Pick<Injector, 'get' | 'has'> {
    return {
        has: (token: unknown) => token === EmbedProductMenuRegistryService,
        get: (token: unknown) => {
            if (token !== EmbedProductMenuRegistryService) {
                throw new Error('unexpected token');
            }

            return service;
        },
    } as Pick<Injector, 'get' | 'has'>;
}
