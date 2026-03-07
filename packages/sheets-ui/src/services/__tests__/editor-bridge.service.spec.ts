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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EditorBridgeService } from '../editor-bridge.service';

function createService(options?: { hasFocusEditor?: boolean }) {
    const unitDisposed$ = new Subject<any>();
    const workbook = {
        getUnitId: () => 'unit-1',
    };

    const mocks = {
        unitDisposed$,
        sheetInterceptorService: {
            writeCellInterceptor: {
                fetchThroughInterceptors: vi.fn(() => (cell: unknown) => cell),
            },
        },
        renderManagerService: {
            getRenderUnitById: vi.fn(() => null),
        },
        themeService: {
            getColorFromTheme: vi.fn(() => '#d0d0d0'),
        },
        univerInstanceService: {
            getTypeOfUnitDisposed$: vi.fn(() => unitDisposed$.asObservable()),
            getCurrentUnitForType: vi.fn(() => workbook),
        },
        editorService: {
            getFocusEditor: vi.fn(() => (options?.hasFocusEditor ? { id: 'existing' } : null)),
            focus: vi.fn(),
        },
        contextService: {
            setContextValue: vi.fn(),
        },
    };

    const service = new EditorBridgeService(
        mocks.sheetInterceptorService as any,
        mocks.renderManagerService as any,
        mocks.themeService as any,
        mocks.univerInstanceService as any,
        mocks.editorService as any,
        mocks.contextService as any
    );

    return { service, mocks };
}

function createLatestState() {
    return {
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        row: 1,
        column: 2,
        documentLayoutObject: { id: 'doc-layout' },
        editorUnitId: 'doc-editor',
        position: {
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        },
        canvasOffset: {
            left: 0,
            top: 0,
        },
        scaleX: 1,
        scaleY: 1,
    };
}

function createEditCellParam() {
    return {
        scene: {},
        engine: {},
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        primary: {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            actualRow: 1,
            actualColumn: 2,
            isMerged: false,
            isMergedMainCell: true,
        },
    } as any;
}

describe('EditorBridgeService', () => {
    it('syncs edit state/layout from latest state and reacts to disposed unit', () => {
        const { service, mocks } = createService();
        const latest = createLatestState();
        const currentEditCombined: any[] = [];
        service.currentEditCell$.subscribe((value) => currentEditCombined.push(value));

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState');
        getLatestSpy.mockReturnValue(latest as any);
        service.setEditCell(createEditCellParam());

        expect(mocks.editorService.focus).toHaveBeenCalled();
        expect(mocks.contextService.setContextValue).toHaveBeenCalledTimes(2);
        expect(service.getEditCellState()).toEqual(latest);
        expect(service.getEditCellLayout()).toEqual({
            position: latest.position,
            canvasOffset: latest.canvasOffset,
            scaleX: 1,
            scaleY: 1,
        });
        expect(service.getEditLocation()).toEqual(
            expect.objectContaining({
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 1,
                column: 2,
            })
        );
        expect(currentEditCombined.at(-1)).toEqual(expect.objectContaining({ row: 1, column: 2 }));

        service.updateEditLocation(8, 9);
        expect(service.getEditLocation()).toEqual(expect.objectContaining({ row: 8, column: 9 }));

        getLatestSpy.mockReturnValue(null as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toBeNull();

        getLatestSpy.mockReturnValue(latest as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toEqual(latest);

        mocks.unitDisposed$.next({
            getUnitId: () => 'unit-1',
        });
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
    });

    it('manages visible/dirty/force-keep states and null-latest branches', () => {
        const { service, mocks } = createService({ hasFocusEditor: true });
        const visibleValues: any[] = [];
        const afterVisibleValues: any[] = [];
        const forceValues: boolean[] = [];
        service.visible$.subscribe((value) => visibleValues.push(value));
        service.afterVisible$.subscribe((value) => afterVisibleValues.push(value));
        service.forceKeepVisible$.subscribe((value) => forceValues.push(value));

        expect(service.getCurrentEditorId()).toBe(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
        expect(service.getEditLocation()).toBeNull();
        expect(service.getEditorDirty()).toBe(false);

        service.changeEditorDirty(true);
        expect(service.getEditorDirty()).toBe(true);

        service.changeVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.isVisible()).toEqual({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.getEditorDirty()).toBe(false);
        expect(visibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));
        expect(afterVisibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));

        service.enableForceKeepVisible();
        service.disableForceKeepVisible();
        expect(service.isForceKeepVisible()).toBe(false);
        expect(forceValues.slice(-2)).toEqual([true, false]);

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(undefined);
        service.setEditCell(createEditCellParam());
        expect(service.getEditCellState()).toBeNull();

        service.refreshEditCellState();
        service.refreshEditCellPosition();
        expect(getLatestSpy).toHaveBeenCalled();
        expect(mocks.editorService.focus).not.toHaveBeenCalled();
    });
});
