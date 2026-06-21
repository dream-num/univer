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
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceService,
    UniverInstanceType,
    Workbook,
} from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ISheetSelectionRenderService } from '../selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

class TestSheetSkeletonService {
    static skeleton: any;
    static param: any;
    static scene: unknown;
    buildSkeleton$ = new Subject<any>();

    setScene(_unitId: string, scene: unknown) {
        TestSheetSkeletonService.scene = scene;
    }

    getSkeletonsByUnitId() {
        return [TestSheetSkeletonService.skeleton];
    }

    getSkeleton() {
        return TestSheetSkeletonService.skeleton;
    }

    getSkeletonParam() {
        return TestSheetSkeletonService.param;
    }

    ensureSkeleton() {
        return TestSheetSkeletonService.skeleton;
    }
}

describe('SheetSkeletonManagerService', () => {
    it('sets the current worksheet skeleton and marks it dirty for recalculation', () => {
        const injector = new Injector();
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([LocaleService]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([SheetSkeletonService]);
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        const workbook = injector.createInstance(Workbook, {
            id: 'unit-1',
            sheets: { 'sheet-1': { id: 'sheet-1' } },
            sheetOrder: ['sheet-1'],
        });
        injector.get(SheetSkeletonService);
        univerInstanceService.__addUnit(workbook);

        const service = injector.createInstance(SheetSkeletonManagerService, {
            unit: workbook,
            unitId: 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
            scene: {
                onTransformChange$: {
                    subscribeEvent: () => ({ dispose: () => {} }),
                },
            },
        } as never);

        service.setCurrent({ sheetId: 'sheet-1' });
        service.makeDirty({ sheetId: 'sheet-1' });

        expect(service.getCurrentParam()).toMatchObject({ unitId: 'unit-1', sheetId: 'sheet-1', dirty: true });
        expect(service.ensureSkeleton('sheet-1')).toBe(service.getCurrentSkeleton());
    });

    it('updates sheet header sizes, viewport bounds and selection render state', () => {
        const registeredSkeletons: string[] = [];
        const skeleton = {
            columnHeaderHeight: 20,
            rowHeaderWidth: 46,
            registerGetCellHeight: () => registeredSkeletons.push('registered'),
        };
        const param = { unitId: 'unit-1', sheetId: 'sheet-1', skeleton, dirty: false };
        TestSheetSkeletonService.skeleton = skeleton;
        TestSheetSkeletonService.param = param;

        const injector = new Injector();
        injector.add([SheetSkeletonService, { useClass: TestSheetSkeletonService as never }]);
        const workbook = {
            getSheetBySheetId: () => ({ getSheetId: () => 'sheet-1' }),
            getStyles: () => ({}),
        };
        const service = injector.createInstance(SheetSkeletonManagerService, {
            unit: workbook,
            unitId: 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
            scene: {},
        } as never);

        const viewportState = new Map<string, any>([
            [SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, { left: 100, setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_ROW_TOP, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP, { width: 46, setViewportSize(params: object) { Object.assign(this, params); } }],
        ]);
        const mainViewport = { top: 0, left: 46 };
        const selections = [{ range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }];
        const resetSelections: unknown[] = [];
        const render = {
            unitId: 'unit-1',
            scene: {
                getViewports: () => [mainViewport],
                getViewport: (key: string) => viewportState.get(key),
            },
            with: (token: unknown) => {
                if (token === SheetsSelectionsService) {
                    return { getCurrentSelections: () => selections };
                }
                if (token === ISheetSelectionRenderService) {
                    return { resetSelectionsByModelData: (value: unknown) => resetSelections.push(value) };
                }
                return null;
            },
        };

        service.setColumnHeaderSize(render as never, 'sheet-1', 32);
        service.setRowHeaderSize(render as never, 'sheet-1', 60);

        expect(registeredSkeletons).toEqual(['registered']);
        expect(skeleton.columnHeaderHeight).toBe(32);
        expect(skeleton.rowHeaderWidth).toBe(60);
        expect(mainViewport).toEqual({ top: 32, left: 60 });
        expect(viewportState.get(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)).toMatchObject({ height: 32, left: 114 });
        expect(viewportState.get(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)).toMatchObject({ height: 32, width: 60 });
        expect(resetSelections).toEqual([selections, selections]);
        expect((param as { commandId?: string }).commandId).toBe('sheet.command.set-row-header-width');
    });

    it('keeps header size updates safe when selection services are unavailable', () => {
        const skeleton = {
            columnHeaderHeight: 20,
            rowHeaderWidth: 46,
            registerGetCellHeight: () => {},
        };
        const param = { unitId: 'unit-1', sheetId: 'sheet-1', skeleton, dirty: false };
        TestSheetSkeletonService.skeleton = skeleton;
        TestSheetSkeletonService.param = param;

        const injector = new Injector();
        injector.add([SheetSkeletonService, { useClass: TestSheetSkeletonService as never }]);
        const service = injector.createInstance(SheetSkeletonManagerService, {
            unit: {},
            unitId: 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
            scene: {},
        } as never);

        const viewportState = new Map<string, any>([
            [SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, { left: 100, setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_ROW_TOP, { setViewportSize(params: object) { Object.assign(this, params); } }],
            [SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP, { width: 46, setViewportSize(params: object) { Object.assign(this, params); } }],
        ]);
        const mainViewport = { top: 0, left: 46 };
        const render = {
            unitId: 'unit-1',
            scene: {
                getViewports: () => [mainViewport],
                getViewport: (key: string) => viewportState.get(key),
            },
            with: () => {
                throw new Error('[redi]: Cannot find "SheetsSelectionsService" registered by any injector.');
            },
        };

        expect(() => service.setColumnHeaderSize(render as never, 'sheet-1', 32)).not.toThrow();
        expect(() => service.setRowHeaderSize(render as never, 'sheet-1', 60)).not.toThrow();

        expect(skeleton.columnHeaderHeight).toBe(32);
        expect(skeleton.rowHeaderWidth).toBe(60);
        expect(mainViewport).toEqual({ top: 32, left: 60 });
        expect((param as { commandId?: string }).commandId).toBe('sheet.command.set-row-header-width');
    });
});
