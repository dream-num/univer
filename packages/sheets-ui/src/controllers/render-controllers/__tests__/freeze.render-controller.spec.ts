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

import { ICommandService } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { HeaderFreezeRenderController } from '../freeze.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderFreezeRenderController', () => {
    it('refreshes viewports when switching sheets and freeze is enabled', () => {
        const validViewportScrollInfo$ = new BehaviorSubject<any>(null);
        const scrollManagerService = {
            validViewportScrollInfo$,
            getCurrentScrollState: () => ({
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
                offsetX: 0,
                offsetY: 0,
            }),
        };

        const testBed = createRenderTestBed({
            dependencies: [
                [SheetScrollManagerService, { useValue: scrollManagerService }],
            ],
        });

        const { sheet, injector, viewportMap, sheetSkeletonManagerService, context } = testBed;

        // Ensure active worksheet has a freeze config (freeze first 2 rows).
        const worksheet = sheet.getActiveSheet();
        const config = worksheet.getConfig();
        config.freeze = { startRow: 2, startColumn: -1, ySplit: 2, xSplit: 0 };

        injector.get(ICommandService);

        injector.createInstance(HeaderFreezeRenderController, context as any);

        // Switching sheet tabs triggers currentSkeleton$ with SetWorksheetActiveOperation.id,
        // and the controller should re-apply the freeze layout.
        sheetSkeletonManagerService.emitCurrentSkeleton({
            commandId: SetWorksheetActiveOperation.id,
        });

        const viewMainTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) as any;
        const viewRowTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP) as any;
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        expect(viewMainTop.isActive).toBe(true);
        expect(viewRowTop.isActive).toBe(true);
        expect(viewMain.top).toBeGreaterThan(0);

        testBed.univer.dispose();
    });
});
