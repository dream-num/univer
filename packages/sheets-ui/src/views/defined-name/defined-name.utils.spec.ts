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

import type { Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    AbsoluteRefType,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_FX_BAR_EDITOR,
} from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { KeyCode } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { getAbsoluteRefStringFromSelection, resolveDefinedNameBoxAction, restoreSheetNavigationAfterDefinedNameConfirm, validateDefinedName } from './defined-name.utils';

function createWorkbookMock(sheetNames = ['Sheet1']) {
    const sheets = new Map(sheetNames.map((name, index) => [`sheet-${index}`, { getName: () => name }]));

    return {
        getSheetOrders: () => Array.from(sheets.keys()),
        getSheetBySheetId: (sheetId: string) => sheets.get(sheetId),
        getActiveSheet: () => ({ getName: () => 'Sheet1' }),
    } as unknown as Workbook;
}

function createValidationDeps(overrides: {
    definedName?: IDefinedNamesServiceParam | null;
    hasTable?: boolean;
    hasFunction?: boolean;
} = {}) {
    return {
        unitId: 'unit-1',
        name: 'SalesTotal',
        workbook: createWorkbookMock(),
        definedNamesService: {
            getValueByName: vi.fn(() => overrides.definedName ?? null),
        } as any,
        superTableService: {
            hasTable: vi.fn(() => overrides.hasTable ?? false),
        } as any,
        functionService: {
            hasExecutor: vi.fn(() => overrides.hasFunction ?? false),
        } as any,
    };
}

describe('defined-name.utils', () => {
    it('should reject duplicate defined names during validation', () => {
        const error = validateDefinedName(createValidationDeps({
            definedName: {
                id: 'defined-name-1',
                name: 'SalesTotal',
                formulaOrRefString: 'Sheet1!$A$1',
            },
        }));

        expect(error).toBe('definedName.nameDuplicate');
    });

    it('should resolve Enter on an existing defined name to focus the name', () => {
        const existingDefinedName = {
            id: 'defined-name-1',
            name: 'SalesTotal',
            formulaOrRefString: 'Sheet1!$A$1',
        };

        const action = resolveDefinedNameBoxAction({
            ...createValidationDeps({ definedName: existingDefinedName }),
            inputValue: 'salestotal',
            rangeString: 'A1',
        });

        expect(action).toEqual({
            type: 'focusDefinedName',
            definedName: existingDefinedName,
        });
    });

    it('should resolve Enter on a typed reference to focus the selection', () => {
        const action = resolveDefinedNameBoxAction({
            ...createValidationDeps(),
            inputValue: 'B2:C4',
            rangeString: 'A1',
        });

        expect(action).toEqual({
            type: 'focusSelection',
            refString: 'B2:C4',
        });
    });

    it('should resolve Enter on a valid new name to create a defined name', () => {
        const action = resolveDefinedNameBoxAction({
            ...createValidationDeps(),
            inputValue: 'SalesTotal',
            rangeString: 'A1',
        });

        expect(action).toEqual({
            type: 'createDefinedName',
            name: 'SalesTotal',
        });
    });

    it('should reset when Enter is pressed on an invalid name', () => {
        const action = resolveDefinedNameBoxAction({
            ...createValidationDeps(),
            inputValue: 'Sheet1',
            rangeString: 'A1',
        });

        expect(action).toEqual({
            type: 'reset',
        });
    });

    it('should build the absolute reference string for a single selected cell', () => {
        const convertRefersToAbsolute = vi.fn((value: string) => `ABS(${value})`);
        const selections = [{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            createWorkbookMock(),
            selections,
            { convertRefersToAbsolute } as any
        );

        expect(absoluteRef).toBe('ABS(Sheet1!A1)');
        expect(convertRefersToAbsolute).toHaveBeenCalledWith('Sheet1!A1', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
    });

    it('should build the absolute reference string for a selected range', () => {
        const convertRefersToAbsolute = vi.fn((value: string) => `ABS(${value})`);
        const selections = [{
            range: {
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2,
            },
        }] as ISelectionWithStyle[];

        const absoluteRef = getAbsoluteRefStringFromSelection(
            createWorkbookMock(),
            selections,
            { convertRefersToAbsolute } as any
        );

        expect(absoluteRef).toBe('ABS(Sheet1!B2:C4)');
        expect(convertRefersToAbsolute).toHaveBeenCalledWith('Sheet1!B2:C4', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
    });

    it('should use the standard editor-exit operation when the sheet editor is visible', () => {
        const blur = vi.fn();
        const syncExecuteCommand = vi.fn(() => true);

        const result = restoreSheetNavigationAfterDefinedNameConfirm({
            unitId: 'unit-1',
            input: { blur },
            commandService: { syncExecuteCommand } as any,
            univerInstanceService: { focusUnit: vi.fn() } as any,
            editorService: { blur: vi.fn(), getEditor: vi.fn() } as any,
            editorBridgeService: {
                isVisible: () => ({ visible: true }),
                getEditLocation: () => ({ unitId: 'editing-unit' }),
            } as any,
            contextService: { setContextValue: vi.fn() } as any,
        });

        expect(result).toBe(true);
        expect(blur).toHaveBeenCalledTimes(1);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.ENTER,
            unitId: 'editing-unit',
        });
    });

    it('should restore normal sheet keyboard focus when the sheet editor is not visible', () => {
        const blurInput = vi.fn();
        const focusUnit = vi.fn();
        const blurEditorService = vi.fn();
        const focusNormalEditor = vi.fn();
        const setContextValue = vi.fn();

        const result = restoreSheetNavigationAfterDefinedNameConfirm({
            unitId: 'unit-1',
            input: { blur: blurInput },
            commandService: { syncExecuteCommand: vi.fn() } as any,
            univerInstanceService: { focusUnit } as any,
            editorService: {
                blur: blurEditorService,
                getEditor: vi.fn(() => ({ focus: focusNormalEditor })),
            } as any,
            editorBridgeService: {
                isVisible: () => ({ visible: false }),
                getEditLocation: () => null,
            } as any,
            contextService: { setContextValue } as any,
        });

        expect(result).toBe(true);
        expect(blurInput).toHaveBeenCalledTimes(1);
        expect(blurEditorService).toHaveBeenCalledWith(true);
        expect(focusUnit).toHaveBeenCalledWith('unit-1');
        expect(focusNormalEditor).toHaveBeenCalledTimes(1);
        expect(setContextValue).toHaveBeenCalledWith(FOCUSING_EDITOR_INPUT_FORMULA, false);
        expect(setContextValue).toHaveBeenCalledWith(EDITOR_ACTIVATED, false);
        expect(setContextValue).toHaveBeenCalledWith(FOCUSING_EDITOR_BUT_HIDDEN, false);
        expect(setContextValue).toHaveBeenCalledWith(FOCUSING_EDITOR_STANDALONE, false);
        expect(setContextValue).toHaveBeenCalledWith(FOCUSING_FX_BAR_EDITOR, false);
    });
});
