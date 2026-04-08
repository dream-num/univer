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

import { ILogService, RANGE_TYPE } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CellAlertManagerService, CellAlertType, IMarkSelectionService, ISheetCellDropdownManagerService, ISheetClipboardService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { FRange } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { transformComponentKey } from '../f-range';

function createFakeRange() {
    const tokens = new Map<unknown, unknown>();

    const range: any = {
        _range: {
            startRow: 1,
            startColumn: 2,
            endRow: 3,
            endColumn: 4,
        },
        _workbook: {
            getUnitId: () => 'unit-1',
        },
        _worksheet: {
            getSheetId: () => 'sheet-1',
        },
        getUnitId: () => 'unit-1',
    };

    range._injector = {
        get(token: unknown) {
            if (!tokens.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return tokens.get(token);
        },
    };

    // Methods call each other through `this`, so we bind prototype methods manually.
    range.getCell = (FRange.prototype as any).getCell;

    return { range, tokens };
}

describe('FRange UI mixin', () => {
    it('transforms component key for string and external component', () => {
        const registerDisposable = { dispose: vi.fn() };
        const componentManager = {
            register: vi.fn(() => registerDisposable),
        };

        const stringResult = transformComponentKey({ componentKey: 'built-in-key' }, componentManager as any);
        expect(stringResult.key).toBe('built-in-key');
        stringResult.disposableCollection.dispose();
        expect(componentManager.register).not.toHaveBeenCalled();

        const componentResult = transformComponentKey(
            { componentKey: () => null, isVue3: true },
            componentManager as any
        );
        expect(componentResult.key.startsWith('External_')).toBe(true);
        expect(componentManager.register).toHaveBeenCalledWith(
            componentResult.key,
            expect.any(Function),
            { framework: 'vue3' }
        );
        componentResult.disposableCollection.dispose();
        expect(registerDisposable.dispose).toHaveBeenCalled();
    });

    it('gets cell/cellRect and throws when skeleton is unavailable', () => {
        const { range, tokens } = createFakeRange();
        const cellWithCoord = {
            startRow: 1,
            startColumn: 2,
            endRow: 1,
            endColumn: 2,
            startX: 8,
            startY: 12,
            endX: 28,
            endY: 42,
            actualRow: 1,
            actualColumn: 2,
        };

        const skeleton = {
            getCellWithCoordByIndex: vi.fn(() => cellWithCoord),
        };
        const logService = { error: vi.fn() };
        const render = {
            with: vi.fn(() => ({
                getSkeletonParam: vi.fn(() => ({ skeleton })),
            })),
        };
        const renderManager: any = {
            getRenderById: vi.fn(() => render),
        };

        tokens.set(IRenderManagerService, renderManager);
        tokens.set(ILogService, logService);

        const getCell = (FRange.prototype as any).getCell;
        const getCellRect = (FRange.prototype as any).getCellRect;

        expect(getCell.call(range)).toEqual(cellWithCoord);
        const rect = getCellRect.call(range);
        expect(rect).toMatchObject({
            x: 8,
            y: 12,
            width: 20,
            height: 30,
            top: 12,
            left: 8,
            bottom: 42,
            right: 28,
        });
        expect(typeof rect.toJSON).toBe('function');

        renderManager.getRenderById = vi.fn(() => ({
            with: vi.fn(() => ({
                getSkeletonParam: vi.fn(() => null),
            })),
        }));
        expect(() => getCell.call(range)).toThrowError('`FRange.getCell` can only be called in current worksheet');
        expect(logService.error).toHaveBeenCalled();
    });

    it('generates html and manages popup/alert/highlight/dropdown lifecycle', () => {
        const { range, tokens } = createFakeRange();

        const clipboardService = {
            generateCopyContent: vi
                .fn()
                .mockReturnValueOnce({ html: '<b>copied</b>' })
                .mockReturnValueOnce(undefined),
        };
        tokens.set(ISheetClipboardService, clipboardService);

        const popupDisposable = { dispose: vi.fn() };
        const registerDisposable = { dispose: vi.fn() };
        const componentManager = {
            register: vi.fn(() => registerDisposable),
        };
        const canvasPopupService = {
            attachPopupToCell: vi
                .fn()
                .mockReturnValueOnce(popupDisposable)
                .mockReturnValueOnce(null),
            attachRangePopup: vi.fn().mockReturnValueOnce(popupDisposable),
        };
        tokens.set(ComponentManager, componentManager);
        tokens.set(SheetCanvasPopManagerService, canvasPopupService);

        const cellAlertService = {
            showAlert: vi.fn(),
            removeAlert: vi.fn(),
        };
        tokens.set(CellAlertManagerService, cellAlertService);

        const markSelectionService = {
            addShape: vi.fn().mockReturnValueOnce('shape-1').mockReturnValueOnce(null),
            removeShape: vi.fn(),
        };
        tokens.set(IMarkSelectionService, markSelectionService);

        const dropdownDisposable = { dispose: vi.fn() };
        const dropdownService = {
            showDropdown: vi.fn(() => dropdownDisposable),
        };
        tokens.set(ISheetCellDropdownManagerService, dropdownService);

        const generateHTML = (FRange.prototype as any).generateHTML;
        expect(generateHTML.call(range)).toBe('<b>copied</b>');
        expect(generateHTML.call(range)).toBe('');
        expect(clipboardService.generateCopyContent).toHaveBeenCalledWith('unit-1', 'sheet-1', range._range);

        const attachPopup = (FRange.prototype as any).attachPopup;
        const popupCollection = attachPopup.call(range, { componentKey: () => null });
        expect(canvasPopupService.attachPopupToCell).toHaveBeenCalledWith(
            1,
            2,
            expect.objectContaining({
                direction: 'horizontal',
                offset: [0, 0],
                componentKey: expect.stringMatching(/^External_/),
                extraProps: {},
            }),
            'unit-1',
            'sheet-1'
        );
        expect(popupCollection).toBeTruthy();
        popupCollection.dispose();
        expect(popupDisposable.dispose).toHaveBeenCalled();
        expect(registerDisposable.dispose).toHaveBeenCalled();

        const popupNull = attachPopup.call(range, { componentKey: () => null });
        expect(popupNull).toBeNull();

        const attachRangePopup = (FRange.prototype as any).attachRangePopup;
        const rangePopup = attachRangePopup.call(range, { componentKey: 'popup-key' });
        expect(canvasPopupService.attachRangePopup).toHaveBeenCalledWith(
            range._range,
            expect.objectContaining({
                direction: 'top-center',
                offset: [0, 0],
                componentKey: 'popup-key',
            }),
            'unit-1',
            'sheet-1'
        );
        rangePopup.dispose();

        const attachAlertPopup = (FRange.prototype as any).attachAlertPopup;
        const alertDisposable = attachAlertPopup.call(range, {
            key: 'alert-1',
            title: 'Title',
            message: 'Message',
            type: CellAlertType.WARNING,
            width: 120,
            height: 60,
        });
        expect(cellAlertService.showAlert).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'alert-1',
                location: expect.objectContaining({
                    row: 1,
                    col: 2,
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                }),
            })
        );
        alertDisposable.dispose();
        expect(cellAlertService.removeAlert).toHaveBeenCalledWith('alert-1');

        const highlight = (FRange.prototype as any).highlight;
        const highlightDisposable = highlight.call(
            range,
            { stroke: '#f00' },
            {
                startRow: 1,
                startColumn: 2,
                endRow: 1,
                endColumn: 2,
                actualRow: 1,
                actualColumn: 2,
                isMerged: false,
                isMergedMainCell: true,
                startX: 8,
                startY: 12,
                endX: 28,
                endY: 42,
                rangeType: RANGE_TYPE.NORMAL,
            }
        );
        expect(markSelectionService.addShape).toHaveBeenCalledWith(
            expect.objectContaining({
                range: range._range,
            })
        );
        highlightDisposable.dispose();
        expect(markSelectionService.removeShape).toHaveBeenCalledWith('shape-1');
        expect(() => highlight.call(range)).toThrowError('Failed to highlight current range');

        const showDropdown = (FRange.prototype as any).showDropdown;
        const dd = showDropdown.call(range, { type: 'list', props: { options: [] } });
        expect(dropdownService.showDropdown).toHaveBeenCalledWith({ type: 'list', props: { options: [] } });
        dd.dispose();
        expect(dropdownDisposable.dispose).toHaveBeenCalled();
    });
});
