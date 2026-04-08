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

import { FOCUSING_SHEET, ICommandService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { SetZoomRatioCommand } from '../../../commands/commands/set-zoom-ratio.command';
import { SheetsZoomRenderController } from '../zoom.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('SheetsZoomRenderController', () => {
    it('executes zoom command only when ctrl+wheels and sheet is focused', () => {
        const testBed = createRenderTestBed();
        const { context, scene, contextService } = testBed;
        contextService.setContextValue(FOCUSING_SHEET, true);

        const commandService = testBed.get(ICommandService);

        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        const controller = testBed.injector.createInstance(SheetsZoomRenderController, context as any);

        const sheet = testBed.sheet.getActiveSheet();
        expect(sheet).toBeTruthy();

        const preventDefault = vi.fn();
        scene.onMouseWheel$.emit(
            { ctrlKey: false, deltaX: 10, deltaY: -10, preventDefault },
            { stopPropagation: () => { } }
        );
        expect(executeSpy).not.toHaveBeenCalled();

        scene.onMouseWheel$.emit(
            { ctrlKey: true, deltaX: 10, deltaY: -10, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(executeSpy).toHaveBeenCalledWith(
            SetZoomRatioCommand.id,
            expect.objectContaining({
                unitId: testBed.sheet.getUnitId(),
                subUnitId: sheet!.getSheetId(),
                zoomRatio: expect.any(Number),
            })
        );

        expect(preventDefault).toHaveBeenCalled();

        controller.dispose();
    });

    it('updates active worksheet zoom in-place', () => {
        const testBed = createRenderTestBed();
        const { context, scene } = testBed;
        const scaleSpy = vi.spyOn(scene, 'scale');
        const makeDirtySpy = vi.spyOn(context.mainComponent as any, 'makeForceDirty');

        const controller = testBed.injector.createInstance(SheetsZoomRenderController, context as any);

        const sheetId = testBed.sheet.getActiveSheet()!.getSheetId();
        const ok = controller.updateZoom(sheetId, 1.5);
        expect(ok).toBe(true);
        expect(scaleSpy).toHaveBeenCalledWith(1.5, 1.5);
        expect(makeDirtySpy).toHaveBeenCalled();

        controller.dispose();
    });
});
