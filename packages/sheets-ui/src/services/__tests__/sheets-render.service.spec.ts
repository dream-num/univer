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

import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { SheetsRenderService } from '../sheets-render.service';

function createService(): SheetsRenderService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ThemeService]);
    injector.add([SheetsRenderService]);
    return injector.get(SheetsRenderService);
}

describe('SheetsRenderService', () => {
    it('tracks mutations that require rebuilding the sheet skeleton and unregisters them by disposable', () => {
        const service = createService();
        const disposable = service.registerSkeletonChangingMutations('sheet.mutation.resize-row');

        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.resize-row')).toBe(true);
        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.set-value')).toBe(false);

        disposable.dispose();
        expect(service.checkMutationShouldTriggerRerender('sheet.mutation.resize-row')).toBe(false);
    });
});
