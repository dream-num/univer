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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetArrayFormulaDataMutationParams } from '@univerjs/engine-formula';
import type { IRenderContext } from '@univerjs/engine-render';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    SheetTypes,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SetArrayFormulaDataMutation } from '@univerjs/engine-formula';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, UniverRenderEnginePlugin, Viewport } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SheetsRenderService } from '../../../services/sheets-render.service';
import { HeaderFreezeRenderController } from '../freeze.render-controller';
import { getArrayFormulaSheetIds, getLeftTopPlaceholderSize, SheetRenderController } from '../sheet.render-controller';
import { SheetSkeletonRenderController } from '../skeleton.render-controller';
import { SheetsZoomRenderController } from '../zoom.render-controller';
import { createChartRenderTestBed } from './chart-render-test-bed';

const EMPTY_ARRAY_RESULT: ISetArrayFormulaDataMutationParams = {
    arrayFormulaCellData: {},
    arrayFormulaRange: {},
    arrayFormulaEmbedded: {},
};

function createCommandFixture() {
    // Canvas drawing is unavailable in happy-dom; the renderer stays inactive throughout these command tests.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return {
            canvas: this,
            setTransform: vi.fn(),
            clearRect: vi.fn(),
            measureText: () => ({ width: 0 }),
        } as unknown as CanvasRenderingContext2D;
    });
    const univer = new Univer({ locale: LocaleType.EN_US });
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    const injector = univer.__getInjector();
    const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'book',
        name: 'Workbook',
        sheetOrder: ['active', 'other'],
        sheets: {
            active: { id: 'active', name: 'Active', rowCount: 20, columnCount: 10 },
            other: { id: 'other', name: 'Other', rowCount: 20, columnCount: 10 },
        },
    }, { skipAutoRender: true });
    injector.add([SheetsRenderService]);
    const render = injector.get(IRenderManagerService).createRender(workbook.getUnitId(), { makeCurrent: false });
    const context = render.getRenderContext!() as IRenderContext<Workbook>;
    const renderInjector = render.getInjector!();
    renderInjector.add([SheetSkeletonManagerService, {
        useFactory: () => renderInjector.createInstance(SheetSkeletonManagerService, context),
    }]);
    renderInjector.add([SheetRenderController, {
        useFactory: () => renderInjector.createInstance(SheetRenderController, context),
    }]);
    renderInjector.get(SheetRenderController);
    const commands = injector.get(ICommandService);
    if (!commands.hasCommand(SetArrayFormulaDataMutation.id)) {
        commands.registerCommand(SetArrayFormulaDataMutation);
    }
    const cells = vi.spyOn(render.mainComponent!, 'makeDirty');
    const scene = vi.spyOn(render.scene, 'makeDirty');
    const execute = (params: ISetArrayFormulaDataMutationParams) => {
        cells.mockClear();
        scene.mockClear();
        expect(commands.syncExecuteCommand(SetArrayFormulaDataMutation.id, params)).toBe(true);
    };
    return { cells, commands, execute, scene, univer };
}

afterEach(() => vi.restoreAllMocks());

describe('SheetRenderController', () => {
    it('tracks local spill data and ranges independently of foreign and empty sheets', () => {
        const params = {
            arrayFormulaCellData: { book: { active: { 2: { 3: { v: 42 } } }, empty: {} }, foreign: { other: { 0: { 0: { v: 1 } } } } },
            arrayFormulaRange: { book: { rangeOnly: { 0: { 0: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 } } } } },
        };
        const previous = getArrayFormulaSheetIds('book', params);
        expect([...previous]).toEqual(['active', 'rangeOnly']);
        const cleared = getArrayFormulaSheetIds('book', { arrayFormulaCellData: {}, arrayFormulaRange: {} });
        expect(cleared.size).toBe(0);
        expect(previous.has('active')).toBe(true);
        expect(getArrayFormulaSheetIds('missing', params).size).toBe(0);
    });

    it('sizes the select-all placeholder from header margins', () => {
        expect(getLeftTopPlaceholderSize({
            rowHeaderWidth: 46,
            columnHeaderHeight: 20,
            rowHeaderWidthAndMarginLeft: 86,
            columnHeaderHeightAndMarginTop: 60,
        })).toEqual({
            width: 86,
            height: 60,
        });
    });

    it('keeps the first notification conservative, then refreshes only the scene for unrelated array results', () => {
        const fixture = createCommandFixture();
        try {
            fixture.execute(EMPTY_ARRAY_RESULT);
            expect(fixture.cells).toHaveBeenCalledOnce();
            expect(fixture.scene).toHaveBeenCalledOnce();

            for (const params of [
                EMPTY_ARRAY_RESULT,
                { ...EMPTY_ARRAY_RESULT, arrayFormulaCellData: { foreign: { active: { 0: { 0: { v: 1 } } } } } },
                { ...EMPTY_ARRAY_RESULT, arrayFormulaCellData: { book: { other: { 0: { 0: { v: 2 } } } } } },
            ]) {
                fixture.execute(params);
                expect(fixture.cells).not.toHaveBeenCalled();
                expect(fixture.scene).toHaveBeenCalledOnce();
            }
        } finally {
            fixture.univer.dispose();
        }
    });

    it('repaints active spill values and ranges and the notification that clears them', () => {
        const fixture = createCommandFixture();
        try {
            fixture.execute(EMPTY_ARRAY_RESULT);
            for (const params of [
                { ...EMPTY_ARRAY_RESULT, arrayFormulaCellData: { book: { active: { 0: { 0: { v: 1 } } } } } },
                { ...EMPTY_ARRAY_RESULT, arrayFormulaCellData: { book: { active: { 0: { 0: { v: 2 } } } } } },
                {
                    ...EMPTY_ARRAY_RESULT,
                    arrayFormulaRange: { book: { active: { 0: { 0: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 } } } } },
                },
                EMPTY_ARRAY_RESULT,
            ]) {
                fixture.execute(params);
                expect(fixture.cells).toHaveBeenCalledOnce();
                expect(fixture.scene).toHaveBeenCalledOnce();
            }
            fixture.execute(EMPTY_ARRAY_RESULT);
            expect(fixture.cells).not.toHaveBeenCalled();
            expect(fixture.scene).toHaveBeenCalledOnce();
        } finally {
            fixture.univer.dispose();
        }
    });

    it('preserves full repaint for embedded array results, their removal, and unknown mutations', () => {
        const fixture = createCommandFixture();
        try {
            fixture.execute(EMPTY_ARRAY_RESULT);
            const embedded: ISetArrayFormulaDataMutationParams = {
                ...EMPTY_ARRAY_RESULT,
                arrayFormulaEmbedded: { foreign: { child: { 0: { 0: true } } } },
            };
            for (const params of [embedded, embedded, EMPTY_ARRAY_RESULT]) {
                fixture.execute(params);
                expect(fixture.cells).toHaveBeenCalledOnce();
                expect(fixture.scene).toHaveBeenCalledOnce();
            }
            fixture.execute(EMPTY_ARRAY_RESULT);
            expect(fixture.cells).not.toHaveBeenCalled();
            expect(fixture.scene).toHaveBeenCalledOnce();

            const unknownId = 'sheet.mutation.unknown-render-notification';
            fixture.commands.registerCommand({ id: unknownId, type: CommandType.MUTATION, handler: () => true });
            fixture.cells.mockClear();
            fixture.scene.mockClear();
            expect(fixture.commands.syncExecuteCommand(unknownId)).toBe(true);
            expect(fixture.cells).toHaveBeenCalledOnce();
            expect(fixture.scene).toHaveBeenCalledOnce();
        } finally {
            fixture.univer.dispose();
        }
    });

    it('skips dirty bounds once the removed sheet has no skeleton param left', () => {
        const { render, workbook, activate } = createChartRenderTestBed();
        activate('grid');

        const controller = render.with(SheetRenderController) as unknown as {
            _rangeToBounds: (ranges: { startRow: number; endRow: number; startColumn: number; endColumn: number }[]) => unknown;
        };
        const range = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

        expect(controller._rangeToBounds([range])).toHaveLength(1);
        expect(workbook.removeSheet('grid')).toBe(true);
        expect(controller._rangeToBounds([range])).toEqual([]);
    });
});

describe('Chart host render lifecycle', () => {
    it('preserves plugin viewport visibility across Chart Sheet transitions', () => {
        const { render, activate, injector } = createChartRenderTestBed();
        const enabled = injector.createInstance(Viewport, 'plugin-enabled', render.scene, {});
        const disabled = injector.createInstance(Viewport, 'plugin-disabled', render.scene, {});
        disabled.disable();
        activate('chart');
        expect(enabled.isActive).toBe(true);
        expect(disabled.isActive).toBe(false);
        activate('grid');
        expect(enabled.isActive).toBe(true);
        expect(disabled.isActive).toBe(false);
    });

    it.each([false, true])('retains the shared renderer and restores frozen Grid after Chart with initialChart=%s', (initialChart) => {
        const { render, manager, activate, workbook, injector } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [SheetSkeletonRenderController],
            [HeaderFreezeRenderController],
            [SheetsZoomRenderController],
        ], initialChart);
        const spreadsheet = render.mainComponent!;
        if (!initialChart) {
            expect(spreadsheet.visible).toBe(true);
            expect(render.scene.getMainViewport().top).toBeGreaterThan(0);
            activate('chart');
        }
        expect(manager.getCurrentSkeleton()).toBeUndefined();
        expect(render.mainComponent).toBe(spreadsheet);
        for (const component of render.components.values()) {
            expect(component.visible).toBe(false);
        }
        const main = render.scene.getMainViewport();
        expect([main.left, main.top]).toEqual([0, 0]);
        expect(main.transScroll2ViewportScrollValue(0, 0)).toEqual({ x: 0, y: 0 });
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(false);
        expect(render.scene.scaleX).toBe(0.75);
        render.scene.transformByState({ width: 1200, height: 900 });
        manager.setCurrent({ sheetId: 'grid' });
        const theme = injector.get(ThemeService);
        theme.setTheme({ ...theme.getCurrentTheme() });
        render.engine.resizeBySize(1000, 700);
        expect([render.scene.width, render.scene.height]).toEqual([1200, 900]);
        expect([main.left, main.top]).toEqual([0, 0]);
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(false);
        activate('grid');
        expect(workbook.getActiveSheet().getFreeze()).toEqual({ startRow: 4, startColumn: 4, xSplit: 2, ySplit: 2 });
        expect(manager.getCurrentSkeleton()?.worksheet).toBe(workbook.getActiveSheet());
        expect(render.mainComponent).toBe(spreadsheet);
        expect(spreadsheet.visible).toBe(true);
        expect(render.components.get(SHEET_VIEW_KEY.ROW)!.visible).toBe(true);
        for (const key of [SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP]) {
            expect(render.scene.getViewport(key)!.isActive).toBe(true);
        }
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(true);
        expect(main.top).toBeGreaterThan(0);
        expect(render.scene.scaleX).toBe(1.25);
    });
});

describe('Historical non-Chart renderer ownership', () => {
    it.each([SheetTypes.KANBAN, SheetTypes.GANTT, 99 as SheetTypes])('preserves existing render visibility without a Chart transition for sheet type %s', (type) => {
        const { render, workbook } = createChartRenderTestBed([], false, { type });
        render.mainComponent!.hide();
        render.scene.getMainViewport().disable();
        workbook.setActiveSheet(workbook.getActiveSheet());
        expect(render.mainComponent!.visible).toBe(false);
        expect(render.scene.getMainViewport().isActive).toBe(false);
    });
});
