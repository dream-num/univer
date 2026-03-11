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

import type { ISelectionWithStyle, SheetsSelectionsService } from '@univerjs/sheets';
import type { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import type { IDropdownParam, IEditorBridgeService } from '@univerjs/sheets-ui';
import { DataValidationRenderMode } from '@univerjs/core';
import { DataValidatorDropdownType } from '@univerjs/data-validation';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { serializeListOptions } from '@univerjs/sheets-data-validation';
import { SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { OpenValidationPanelOperation } from '../../commands/operations/data-validation.operation';
import { SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { DataValidationDropdownManagerService } from '../dropdown-manager.service';

describe('DataValidationDropdownManagerService', () => {
    it('shows a list dropdown, saves the selection, opens the editor, and reacts to hide triggers', async () => {
        const zenVisible$ = new Subject<boolean>();
        const selectionMoveEnd$ = new Subject<ISelectionWithStyle[]>();
        const popupDispose = vi.fn();
        let dropdownParam: IDropdownParam | undefined;
        const onHide = vi.fn();

        const worksheet = {
            getSheetId: () => 'sheet-1',
            getCellRaw: () => ({ v: 'Open' }),
        };
        const workbook = {
            getUnitId: () => 'book-1',
            getSheetBySheetId: () => worksheet,
        };
        const rule = {
            uid: 'rule-1',
            type: 'list',
            renderMode: DataValidationRenderMode.CUSTOM,
        };

        const service = new DataValidationDropdownManagerService(
            {
                getUnit: () => workbook,
            } as never,
            {
                getValidatorItem: vi.fn(() => ({
                    dropdownType: DataValidatorDropdownType.LIST,
                    getListWithColor: vi.fn(() => [
                        { label: 'Open', color: '#0f0' },
                        { label: 'Closed', color: '#f00' },
                    ]),
                })),
            } as never,
            {
                visible$: zenVisible$,
            } as never,
            {
                getRuleByLocation: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                    if (unitId === 'book-1' && subUnitId === 'sheet-1' && row === 1 && col === 2) {
                        return rule;
                    }

                    return null;
                }),
            } as never,
            {
                selectionMoveEnd$,
            } as unknown as SheetsSelectionsService,
            {
                showDropdown: vi.fn((param: IDropdownParam) => {
                    dropdownParam = param;

                    return {
                        dispose: popupDispose,
                    };
                }),
            } as never,
            {
                getRuleByLocation: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                    if (unitId === 'book-1' && subUnitId === 'sheet-1' && row === 1 && col === 2) {
                        return rule;
                    }

                    return null;
                }),
            } as unknown as SheetDataValidationModel,
            {
                executeCommand: vi.fn(() => Promise.resolve(true)),
            } as never,
            {
                isVisible: () => ({ visible: true }),
            } as IEditorBridgeService,
            {
                has: () => false,
            } as never,
            {
                getConfig: vi.fn((key: string) => key === SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY
                    ? { showEditOnDropdown: true, showSearchOnDropdown: false }
                    : undefined),
            } as never
        );

        service.showDataValidationDropdown('book-1', 'sheet-1', 1, 2, onHide);

        expect(dropdownParam).toEqual(expect.objectContaining({
            type: 'list',
            location: expect.objectContaining({
                row: 1,
                col: 2,
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                workbook,
                worksheet,
            }),
            props: expect.objectContaining({
                defaultValue: 'Open',
                multiple: false,
                showEdit: true,
                showSearch: false,
                options: [
                    { label: 'Open', value: 'Open', color: '#0f0' },
                    { label: 'Closed', value: 'Closed', color: '#f00' },
                ],
            }),
        }));
        expect(service.activeDropdown).toEqual(expect.objectContaining({ location: expect.objectContaining({ row: 1, col: 2 }) }));

        const listProps = dropdownParam?.props as {
            onChange?: (value: string[]) => Promise<boolean>;
            onEdit?: () => void;
        } | undefined;

        await listProps?.onChange?.(['Closed']);

        const commandService = (service as unknown as { _commandService: { executeCommand: ReturnType<typeof vi.fn> } })._commandService;
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(1, SetRangeValuesCommand.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            range: {
                startColumn: 2,
                endColumn: 2,
                startRow: 1,
                endRow: 1,
            },
            value: {
                v: serializeListOptions(['Closed']),
                p: null,
                f: null,
                si: null,
            },
        });
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, SetCellEditVisibleOperation.id, expect.objectContaining({
            visible: false,
            unitId: 'book-1',
        }));

        listProps?.onEdit?.();
        expect(commandService.executeCommand).toHaveBeenCalledWith(OpenValidationPanelOperation.id, { ruleId: 'rule-1' });
        expect(popupDispose).toHaveBeenCalledTimes(1);

        selectionMoveEnd$.next([
            {
                primary: {
                    unitId: 'book-1',
                    sheetId: 'sheet-1',
                    actualRow: 9,
                    actualColumn: 9,
                },
            },
        ] as never);
        expect(service.activeDropdown).toBeNull();

        service.showDataValidationDropdown('book-1', 'sheet-1', 1, 2, onHide);
        zenVisible$.next(true);
        expect(service.activeDropdown).toBeNull();

        service.showDataValidationDropdown('book-1', 'sheet-1', 1, 2, onHide);
        service.hideDropdown();
        expect(onHide).toHaveBeenCalledTimes(2);
    });
});
