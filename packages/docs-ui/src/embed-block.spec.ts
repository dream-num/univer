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

import type { IConfigService as IConfigServiceType } from '@univerjs/core';
import type { IEmbedChildContainerContext } from '@univerjs/embed-ui';
import { IConfigService, UniverInstanceType } from '@univerjs/core';
import { mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { createDocsEmbedChildViewContribution } from './embed-block';

vi.mock('@univerjs/embed-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/embed-ui')>();

    return {
        ...actual,
        mountEmbedRenderChildUnit: vi.fn(() => ({ dispose: vi.fn() })),
    };
});

describe('createDocsEmbedChildViewContribution', () => {
    beforeEach(() => {
        vi.mocked(mountEmbedRenderChildUnit).mockClear();
    });

    it('fits embedded floating doc blocks to the container without horizontal overflow', () => {
        const { context, getConfigService } = createContext({
            footer: true,
            fitToWidth: {
                mode: 'none',
                target: 'viewport',
                paddingX: 20,
                minScale: 1,
                align: 'start',
            },
        });

        createDocsEmbedChildViewContribution().mount?.(context);

        expect(mountEmbedRenderChildUnit).toHaveBeenCalledWith(context, IRenderManagerService);
        expect(getConfigService().getConfig(DOCS_UI_PLUGIN_CONFIG_KEY)).toMatchObject({
            footer: true,
            fitToWidth: {
                mode: 'fit-width',
                target: 'container',
                paddingX: 0,
                minScale: 0,
                align: 'start',
            },
        });
    });

    it('does not override fit-to-width config for embedded doc tabs', () => {
        const docsConfig = {
            fitToWidth: {
                mode: 'none',
                target: 'viewport',
                paddingX: 20,
                minScale: 1,
                align: 'start',
            },
        };
        const { context, getConfigService } = createContext(docsConfig, 'tab');

        createDocsEmbedChildViewContribution().mount?.(context);

        expect(mountEmbedRenderChildUnit).toHaveBeenCalledWith(context, IRenderManagerService);
        expect(getConfigService().getConfig(DOCS_UI_PLUGIN_CONFIG_KEY)).toBe(docsConfig);
    });
});

function createContext(docsConfig: unknown, mode: 'float' | 'tab' = 'float') {
    let configService: IConfigServiceType = {
        getConfig: <T>(id: string | symbol) => (id === DOCS_UI_PLUGIN_CONFIG_KEY ? docsConfig : undefined) as T,
        setConfig: vi.fn(),
        deleteConfig: vi.fn(),
        subscribeConfigValue$: vi.fn(),
    };

    const injector = {
        has: vi.fn((identifier: unknown) => identifier === IConfigService),
        get: vi.fn((identifier: unknown) => {
            if (identifier === IConfigService) {
                return configService;
            }

            throw new Error('unexpected dependency');
        }),
        add: vi.fn((dependency: unknown) => {
            const [identifier, options] = dependency as [unknown, { useValue: IConfigServiceType }];
            if (identifier === IConfigService) {
                configService = options.useValue;
            }
        }),
    };

    return {
        context: {
            childType: UniverInstanceType.UNIVER_DOC,
            renderScope: {
                mode,
            },
            runtimeScope: {
                injector,
            },
        } as unknown as IEmbedChildContainerContext,
        getConfigService: () => configService,
    };
}
