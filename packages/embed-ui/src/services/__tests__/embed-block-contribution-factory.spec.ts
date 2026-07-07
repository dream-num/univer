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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { EmbedHostChromeMode } from '../../types/embed-ui';
import {
    createEmbedNoHeaderBlockContribution,
    createEmbedRibbonBlockContribution,
    resolveEmbedProductRibbonMenuSchema,
} from '../embed-block-contribution-factory';
import { EmbedProductMenuRegistryService } from '../embed-product-menu-registry.service';

describe('createEmbedNoHeaderBlockContribution', () => {
    it('creates no-header contributions with hidden tab ribbon by default', () => {
        const contribution = createEmbedNoHeaderBlockContribution({
            childType: UniverInstanceType.UNIVER_BASE,
            productName: 'Bases',
        });

        expect(contribution).toMatchObject({
            childType: UniverInstanceType.UNIVER_BASE,
            hostChromeMode: EmbedHostChromeMode.NONE,
            hostHeaderMode: 'none',
            productName: 'Bases',
        });
        expect(contribution.layoutPolicy?.tab?.ribbon).toBe('hidden');
        expect(contribution.createRibbonOverride).toBeUndefined();
    });

    it('creates a title-only host chrome override without an empty ribbon toolbar', () => {
        const contribution = createEmbedNoHeaderBlockContribution({
            childType: UniverInstanceType.UNIVER_BASE,
            productName: 'Bases',
            hostHeaderMode: 'placeholder',
        });

        const override = contribution.createRibbonOverride?.({
            childType: UniverInstanceType.UNIVER_BASE,
            childUnitId: 'base-child',
            injector: {},
            embedId: 'embed-1',
            hostUnitId: 'sheet-host',
            entry: 'sheets-sheet-tab',
        });

        expect(contribution.hostChromeMode).toBe(EmbedHostChromeMode.TITLE_ONLY);
        expect(override?.mode).toBe(EmbedHostChromeMode.TITLE_ONLY);
        expect(override?.placeholderTitle).toBe('Bases');
        expect(override?.hideToolbar).toBe(true);
        expect(override?.ribbonService.fakeToolbarVisible$).toBeDefined();
        override?.ribbonService.setActivatedTab('start');
        override?.ribbonService.showContextualTab('ctx');
        override?.ribbonService.hideContextualTab('ctx');
        override?.ribbonService.hideAllContextualTabs();
        override?.ribbonService.setCollapsedIds(['ctx']);
        override?.ribbonService.setFakeToolbarVisible(true);
    });
});

describe('createEmbedRibbonBlockContribution', () => {
    it('creates ribbon block contributions with default layout policies', () => {
        const contribution = createEmbedRibbonBlockContribution({
            childType: UniverInstanceType.UNIVER_SHEET,
            menuSchema: { ribbon: true },
            productName: 'Sheets',
        });

        expect(contribution).toMatchObject({
            childType: UniverInstanceType.UNIVER_SHEET,
            hostChromeMode: EmbedHostChromeMode.RIBBON,
            productName: 'Sheets',
        });
        expect(contribution.layoutPolicy?.tab).toBeDefined();
        expect(contribution.layoutPolicy?.float).toBeDefined();
        expect(contribution.layoutPolicy?.float?.ribbon).toBe('hidden');
        expect(contribution.layoutPolicy?.docFlow).toBeDefined();
        expect(contribution.createRibbonOverride).toBeDefined();
    });
});

describe('resolveEmbedProductRibbonMenuSchema', () => {
    it('prefers registered product ribbon menu schemas over block fallback schemas', () => {
        const registeredMenuSchema = { ribbon: { registered: true } };
        const fallbackMenuSchema = { ribbon: { fallback: true } };
        const registry = {
            getMergedMenuSchema: () => registeredMenuSchema,
        };
        const injector = {
            has: (token: unknown) => token === EmbedProductMenuRegistryService,
            get: (token: unknown) => {
                if (token !== EmbedProductMenuRegistryService) {
                    throw new Error('unexpected token');
                }
                return registry;
            },
        };

        expect(resolveEmbedProductRibbonMenuSchema(
            injector as never,
            UniverInstanceType.UNIVER_SHEET,
            fallbackMenuSchema
        )).toBe(registeredMenuSchema);
    });

    it('falls back to the block menu schema when no product ribbon menu is registered', () => {
        const fallbackMenuSchema = { ribbon: { fallback: true } };
        const registry = {
            getMergedMenuSchema: () => undefined,
        };
        const injector = {
            has: (token: unknown) => token === EmbedProductMenuRegistryService,
            get: (token: unknown) => {
                if (token !== EmbedProductMenuRegistryService) {
                    throw new Error('unexpected token');
                }
                return registry;
            },
        };

        expect(resolveEmbedProductRibbonMenuSchema(
            injector as never,
            UniverInstanceType.UNIVER_SHEET,
            fallbackMenuSchema
        )).toBe(fallbackMenuSchema);
    });

    it('falls back when the injector shape cannot provide product menu schemas', () => {
        const fallbackMenuSchema = { ribbon: { fallback: true } };

        expect(resolveEmbedProductRibbonMenuSchema(
            {},
            UniverInstanceType.UNIVER_SHEET,
            fallbackMenuSchema
        )).toBe(fallbackMenuSchema);
    });
});
