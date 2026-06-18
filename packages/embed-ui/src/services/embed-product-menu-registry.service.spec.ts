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
import type { IEmbedProductMenuContribution } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedProductMenuRegistryService, registerEmbedProductMenuContribution } from './embed-product-menu-registry.service';

describe('EmbedProductMenuRegistryService', () => {
    it('merges ribbon menu schemas by order', () => {
        const service = new EmbedProductMenuRegistryService();

        service.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            order: 20,
            menuSchema: {
                tabs: {
                    data: { title: 'Data' },
                },
            },
        });
        service.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            order: 10,
            menuSchema: {
                tabs: {
                    start: { title: 'Start' },
                    data: { items: ['filter'] },
                },
            },
        });

        expect(service.getMergedMenuSchema(UniverInstanceType.UNIVER_SHEET)).toEqual({
            tabs: {
                start: { title: 'Start' },
                data: { title: 'Data', items: ['filter'] },
            },
        });
    });

    it('keeps menu surfaces isolated', () => {
        const service = new EmbedProductMenuRegistryService();

        service.register({
            childType: UniverInstanceType.UNIVER_BASE,
            menuSchema: { ribbon: true },
        });
        service.register({
            childType: UniverInstanceType.UNIVER_BASE,
            surface: 'float-toolbar',
            menuSchema: { floatToolbar: true },
        });

        expect(service.getMergedMenuSchema(UniverInstanceType.UNIVER_BASE, 'ribbon')).toEqual({ ribbon: true });
        expect(service.getMergedMenuSchema(UniverInstanceType.UNIVER_BASE, 'float-toolbar')).toEqual({ floatToolbar: true });
        expect(service.getAll(UniverInstanceType.UNIVER_BASE)).toHaveLength(2);
        expect(service.getAll(UniverInstanceType.UNIVER_BASE, 'ribbon')).toHaveLength(1);
        expect(service.getAll(UniverInstanceType.UNIVER_BASE, 'float-toolbar')).toHaveLength(1);
    });

    it('deduplicates product menu contributions by id through the helper', () => {
        const service = new EmbedProductMenuRegistryService();
        const contribution: IEmbedProductMenuContribution = {
            id: 'sheet-ribbon',
            childType: UniverInstanceType.UNIVER_SHEET,
            menuSchema: { tabs: { start: true } },
        };
        const injector = createRegistryInjector(service);

        const first = registerEmbedProductMenuContribution(injector, contribution);
        const second = registerEmbedProductMenuContribution(injector, {
            ...contribution,
            menuSchema: { tabs: { data: true } },
        });

        expect(first).toBeDefined();
        expect(second).toBeUndefined();
        expect(service.getAll(UniverInstanceType.UNIVER_SHEET)).toHaveLength(1);
        expect(service.getMergedMenuSchema(UniverInstanceType.UNIVER_SHEET)).toEqual({ tabs: { start: true } });

        first?.dispose();
        expect(service.getAll(UniverInstanceType.UNIVER_SHEET)).toHaveLength(0);
    });

    it('mounts every custom menu contribution for the requested surface', () => {
        const service = new EmbedProductMenuRegistryService();
        const firstDispose = vi.fn();
        const secondDispose = vi.fn();
        const container = {} as HTMLElement;

        service.register({
            childType: UniverInstanceType.UNIVER_DOC,
            menuSchema: { first: true },
            mountMenu: vi.fn(() => ({ dispose: firstDispose })),
        });
        service.register({
            childType: UniverInstanceType.UNIVER_DOC,
            menuSchema: { second: true },
            mountMenu: vi.fn(() => ({ dispose: secondDispose })),
        });

        const disposable = service.mountMenu({
            childType: UniverInstanceType.UNIVER_DOC,
            container,
            injector: {},
        });

        expect(disposable).toBeDefined();
        disposable?.dispose();
        expect(firstDispose).toHaveBeenCalledTimes(1);
        expect(secondDispose).toHaveBeenCalledTimes(1);
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
