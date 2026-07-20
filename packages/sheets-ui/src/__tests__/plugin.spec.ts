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

import { IConfigService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { UniverSheetsUIPlugin } from '../plugin';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

describe('UniverSheetsUIPlugin', () => {
    it('registers basic render modules during Starting', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ComponentManager]);
        injector.add([IconManager]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);

        const renderManagerService = injector.get(IRenderManagerService);
        const registerRenderModule = vi.spyOn(renderManagerService, 'registerRenderModule');
        const plugin = new UniverSheetsUIPlugin(
            undefined,
            injector,
            renderManagerService,
            injector.get(IConfigService),
            injector.get(IUniverInstanceService)
        );

        plugin.onStarting();

        expect(registerRenderModule).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_SHEET,
            [SheetSkeletonManagerService]
        );

        univer.dispose();
    });
});
