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

import type { IResourceHook, IResourceManagerService } from '@univerjs/core';
import type { EmbedResource } from '../types/embed';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EMBED_RESOURCE_PLUGIN_NAME } from '../common/const';
import { EmbedModelService } from '../services/embed-model.service';
import { EmbedResourceController } from './embed-resource.controller';

describe('EmbedResourceController', () => {
    it('registers one canonical embed resource for all supported host products', () => {
        let registered: IResourceHook<EmbedResource> | undefined;
        const disposable = { dispose: vi.fn() };
        const resourceManager = {
            registerPluginResource: vi.fn((hook: IResourceHook<EmbedResource>) => {
                registered = hook;
                return disposable;
            }),
        } as unknown as IResourceManagerService;
        const model = new EmbedModelService();

        const controller = new EmbedResourceController(resourceManager, model);

        expect(resourceManager.registerPluginResource).toHaveBeenCalledTimes(1);
        expect(registered).toMatchObject({
            pluginName: EMBED_RESOURCE_PLUGIN_NAME,
            businesses: [
                UniverInstanceType.UNIVER_DOC,
                UniverInstanceType.UNIVER_SHEET,
                UniverInstanceType.UNIVER_BASE,
                UniverInstanceType.UNIVER_SLIDE,
            ],
        });
        expect(registered?.parseJson?.('')).toEqual({ version: 1, embeds: {} });

        registered?.onLoad?.('host-1', {
            version: 1,
            embeds: {},
        });
        expect(registered?.toJson?.('host-1')).toBe(JSON.stringify({ version: 1, embeds: {} }));
        registered?.onUnLoad?.('host-1');

        controller.dispose();
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });
});
