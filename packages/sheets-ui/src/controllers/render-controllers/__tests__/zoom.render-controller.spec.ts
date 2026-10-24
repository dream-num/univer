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

import { BooleanNumber, FOCUSING_SHEET, ICommandService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { SetZoomRatioFromToolbarCommand } from '../../../commands/commands/set-zoom-ratio-from-toolbar.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../../../commands/commands/set-zoom-ratio.command';
import { SetZoomRatioOperation } from '../../../commands/operations/set-zoom-ratio.operation';
import { SheetsZoomRenderController } from '../zoom.render-controller';
import { createChartRenderTestBed } from './chart-render-test-bed';
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

describe('Chart Sheet zoom command policies with real providers', () => {
    it('retains legacy manual operation semantics, exits fit at the same ratio and leaves GRID metadata unchanged', async () => {
        const bed = createChartRenderTestBed([[SheetsZoomRenderController]], true, {}, { zoomToFit: BooleanNumber.TRUE });
        const { commands, workbook, render } = bed;
        [SetZoomRatioOperation, SetZoomRatioCommand, ChangeZoomRatioCommand, SetZoomRatioFromToolbarCommand].forEach((command) => commands.registerCommand(command));
        const chart = workbook.getSheetBySheetId('chart')!;
        const params = { unitId: workbook.getUnitId(), subUnitId: 'chart', zoomRatio: 0.75 };
        expect(await commands.executeCommand(SetZoomRatioCommand.id, params)).toBe(true);
        expect(chart.getConfig().zoomToFit).toBe(BooleanNumber.FALSE);
        expect(render.scene.scaleX).toBe(0.75);
        expect(await commands.executeCommand(SetZoomRatioCommand.id, { ...params, zoomToFit: BooleanNumber.TRUE })).toBe(true);
        expect(chart.getConfig().zoomToFit).toBe(BooleanNumber.TRUE);
        expect(await commands.executeCommand(SetZoomRatioFromToolbarCommand.id, { value: 75 })).toBe(true);
        expect(chart.getConfig().zoomToFit).toBe(BooleanNumber.FALSE);
        await commands.executeCommand(SetZoomRatioCommand.id, { ...params, zoomToFit: BooleanNumber.TRUE });
        await commands.executeCommand(ChangeZoomRatioCommand.id, { delta: 0.1 });
        expect(chart.getConfig().zoomToFit).toBe(BooleanNumber.FALSE);
        expect(render.scene.scaleX).toBe(0.85);
        await commands.executeCommand(SetZoomRatioOperation.id, { ...params, zoomToFit: BooleanNumber.TRUE });
        await commands.executeCommand(SetZoomRatioOperation.id, params);
        expect(chart.getConfig().zoomToFit).toBe(BooleanNumber.FALSE);
        bed.activate('grid');
        await commands.executeCommand(SetZoomRatioOperation.id, { ...params, subUnitId: 'grid', zoomRatio: 1.5 });
        expect(render.scene.scaleX).toBe(1.5);
        expect(workbook.getActiveSheet()!.getConfig()).not.toHaveProperty('zoomToFit');
        expect(await commands.executeCommand(SetZoomRatioOperation.id, { ...params, unitId: 'missing' })).toBe(false);
    });

    it('limits computed fit at the established sheet zoom bounds while preserving its mode', async () => {
        const bed = createChartRenderTestBed([[SheetsZoomRenderController]], true);
        bed.commands.registerCommand(SetZoomRatioOperation);
        const params = { unitId: bed.workbook.getUnitId(), subUnitId: 'chart', zoomToFit: BooleanNumber.TRUE };
        await bed.commands.executeCommand(SetZoomRatioOperation.id, { ...params, zoomRatio: 0.001 });
        expect(bed.render.scene.scaleX).toBe(0.1);
        await bed.commands.executeCommand(SetZoomRatioOperation.id, { ...params, zoomRatio: 20 });
        expect(bed.render.scene.scaleX).toBe(4);
        expect(bed.workbook.getActiveSheet()!.getConfig().zoomToFit).toBe(BooleanNumber.TRUE);
    });
});
