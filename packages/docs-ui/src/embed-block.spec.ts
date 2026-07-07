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

import { IConfigService, UniverInstanceType } from '@univerjs/core';
import { mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { createDocsEmbedBlockContribution, createDocsEmbedChildViewContribution } from './embed-block';

vi.mock('@univerjs/embed-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/embed-ui')>();
    return {
        ...actual,
        mountEmbedRenderChildUnit: vi.fn(() => ({ dispose: vi.fn() })),
    };
});

describe('docs embed block contribution', () => {
    beforeEach(() => {
        vi.mocked(mountEmbedRenderChildUnit).mockClear();
    });

    it('uses a ribbon block contribution for docs child units', () => {
        expect(createDocsEmbedBlockContribution()).toMatchObject({
            childType: UniverInstanceType.UNIVER_DOC,
            productName: 'Docs',
        });
    });

    it('passes fit-to-width config through a scoped render injector for floating docs blocks', () => {
        const childView = createDocsEmbedChildViewContribution();
        const configService = {
            getConfig: vi.fn((id: string | symbol) => id === DOCS_UI_PLUGIN_CONFIG_KEY
                ? { fitToWidth: { align: 'center', paddingX: '10%' } }
                : { id }),
        };
        const injector = createInjector(configService);

        childView.mount?.({
            renderScope: { mode: 'float' },
            runtimeScope: { injector },
        } as never);

        const mountOptions = vi.mocked(mountEmbedRenderChildUnit).mock.calls[0][3];
        const scopedInjector = mountOptions?.scopedInjector;
        expect(scopedInjector).toBeDefined();
        expect(scopedInjector).not.toBe(injector);
        expect(injector.add).not.toHaveBeenCalled();

        const replacement = scopedInjector!.get(IConfigService);
        expect(replacement.getConfig(DOCS_UI_PLUGIN_CONFIG_KEY)).toMatchObject({
            fitToWidth: {
                align: 'start',
                minScale: 0,
                mode: 'fit-width',
                paddingX: 0,
                target: 'container',
            },
        });
        expect(replacement.getConfig('other')).toEqual({ id: 'other' });

        const tabInjector = createInjector(configService);
        childView.mount?.({
            renderScope: { mode: 'tab' },
            runtimeScope: { injector: tabInjector },
        } as never);
        expect(tabInjector.add).not.toHaveBeenCalled();
        expect(vi.mocked(mountEmbedRenderChildUnit).mock.calls[1][3]?.scopedInjector).toBeUndefined();
    });

    it('skips config injection when config service is unavailable', () => {
        const childView = createDocsEmbedChildViewContribution();
        const injector = {
            add: vi.fn(),
            has: vi.fn(() => false),
        };

        childView.mount?.({
            renderScope: { mode: 'float' },
            runtimeScope: { injector },
        } as never);

        expect(injector.add).not.toHaveBeenCalled();
    });
});

function createInjector(configService: unknown) {
    return {
        add: vi.fn(),
        get: vi.fn((token: unknown) => token === IConfigService ? configService : undefined),
        has: vi.fn((token: unknown) => token === IConfigService),
    };
}
