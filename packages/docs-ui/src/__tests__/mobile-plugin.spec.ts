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

import { IConfigService, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { expect, it, onTestFinished } from 'vitest';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import { UniverDocsMobileUIPlugin } from '../mobile-plugin';

it.each([undefined, {}, { fitToWidth: { paddingX: 32 } }])('keeps mobile fit-to-width defaults when registered with %j', (config) => {
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverMobileUIPlugin);
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDocsMobileUIPlugin, config);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc-1' });
    const configService = univer.__getInjector().get(IConfigService);
    expect(configService.getConfig(DOCS_UI_PLUGIN_CONFIG_KEY)).toMatchObject({
        fitToWidth: {
            mode: 'fit-width',
            target: 'viewport',
            paddingX: config?.fitToWidth?.paddingX ?? 12,
            minScale: 0,
            maxScale: 1,
            align: 'center',
        },
    });
});
