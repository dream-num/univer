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

import type { Root } from 'react-dom/client';
import type { TestRenderManagerService } from './hyper-link-popup-test-bed';
import { CustomRangeType, LocaleService, LocaleType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ISheetsHyperLinkPopupService } from '../../services/popup.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { CellLinkEdit } from '../CellLinkEdit';
import { MobileCellLinkEdit } from '../MobileCellLinkEdit';
import { createPopupTestBed, inputText, MERGED_RANGE, selectOption, SUB_UNIT_ID, UNIT_ID } from './hyper-link-popup-test-bed';

describe('CellLinkEdit', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it.each([
        { LinkEdit: CellLinkEdit, action: 'Cancel' },
        { LinkEdit: CellLinkEdit, action: 'OK' },
        { LinkEdit: MobileCellLinkEdit, action: 'Cancel' },
        { LinkEdit: MobileCellLinkEdit, action: 'OK' },
    ])('clears the source marker and restores the merged primary after $action', async ({ LinkEdit, action }) => {
        currentTestBed = createPopupTestBed();
        const { injector, commandService, workbook } = currentTestBed;
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        const worksheet = workbook.getActiveSheet();
        const popupService = injector.get(ISheetsHyperLinkPopupService);
        const markSelectionService = injector.get(IMarkSelectionService);
        const row = MERGED_RANGE.startRow;
        const col = MERGED_RANGE.startColumn;
        commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            selections: [{ range: MERGED_RANGE, primary: worksheet.getCellInfoInMergeData(row, col) }],
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => {
            popupService.startAddEditing({ unitId: UNIT_ID, subUnitId: SUB_UNIT_ID, row, col, type: HyperLinkEditSourceType.VIEWING });
            root!.render(
                <RediContext.Provider value={{ injector }}>
                    <LinkEdit />
                </RediContext.Provider>
            );
        });
        expect(markSelectionService.getShapeMap().size).toBe(1);
        expect([...markSelectionService.getShapeMap().values()][0].selection.range).toEqual(MERGED_RANGE);
        if (action === 'OK') {
            const inputs = container.querySelectorAll('input');
            await act(async () => {
                inputText(inputs[0], 'Merged link');
                inputText(inputs[inputs.length - 1], 'https://univer.ai');
            });
        }
        commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            selections: [{
                range: { startRow: 10, endRow: 10, startColumn: 10, endColumn: 10 },
                primary: worksheet.getCellInfoInMergeData(10, 10),
            }],
        });
        const renderManagerService = injector.get(IRenderManagerService) as unknown as TestRenderManagerService;
        renderManagerService.enableScrollRender = true;
        const button = [...container.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent === action);
        expect(button).toBeDefined();
        await act(async () => {
            button!.click();
        });
        expect(popupService.currentEditing).toBeNull();
        expect(markSelectionService.getShapeMap().size).toBe(0);
        const selection = injector.get(SheetsSelectionsService).getCurrentLastSelection();
        expect(selection?.range).toEqual(expect.objectContaining(MERGED_RANGE));
        expect(selection?.primary).toEqual(expect.objectContaining({
            ...MERGED_RANGE,
            actualRow: row,
            actualColumn: col,
            isMerged: true,
            isMergedMainCell: true,
        }));
        if (action === 'OK') {
            expect(worksheet.getCellRaw(row, col)?.p?.body?.customRanges?.[0].properties?.url).toBe('https://univer.ai');
        }
    });

    it('inherits the page direction for labels and uses left-to-right direction for URLs', () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        container.dir = 'rtl';
        document.body.appendChild(container);
        root = createRoot(container);
        const popupService = currentTestBed.injector.get(ISheetsHyperLinkPopupService);

        act(() => {
            popupService.startAddEditing({
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 1,
                col: 0,
                type: HyperLinkEditSourceType.VIEWING,
            });
        });

        for (const LinkEdit of [CellLinkEdit, MobileCellLinkEdit]) {
            act(() => {
                root!.render(
                    <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                        <LinkEdit />
                    </RediContext.Provider>
                );
            });

            const inputs = Array.from(container.querySelectorAll('input'));
            expect(inputs).toHaveLength(3);
            expect(inputs[0].hasAttribute('dir')).toBe(false);
            expect(inputs[1].hasAttribute('dir')).toBe(false);
            expect(inputs[2].dir).toBe('ltr');
        }
    });

    it('adds a URL hyperlink to the current cell text and closes the popup', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const popupService = currentTestBed.injector.get(ISheetsHyperLinkPopupService);
        const renderManagerService = currentTestBed.injector.get(IRenderManagerService) as unknown as TestRenderManagerService;

        act(() => {
            popupService.startAddEditing({
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                type: HyperLinkEditSourceType.VIEWING,
            });
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CellLinkEdit />
                </RediContext.Provider>
            );
        });

        const inputs = Array.from(container.querySelectorAll('input'));
        expect(inputs).toHaveLength(2);

        await act(async () => {
            inputText(inputs[0], 'Documentation tip');
            inputText(inputs[1], 'docs.univer.ai');
            await Promise.resolve();
        });
        renderManagerService.enableScrollRender = true;

        const formButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]'));
        const okButton = formButtons[formButtons.length - 1];
        expect(okButton).toBeDefined();

        await act(async () => {
            okButton!.click();
            await Promise.resolve();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);
        const body = cell?.p?.body;
        const linkRange = body?.customRanges?.find((range) => range.rangeType === CustomRangeType.HYPERLINK);

        expect(body?.dataStream).toBe('Univer\r\n');
        expect(linkRange?.properties?.url).toBe('http://docs.univer.ai');
        expect(linkRange?.properties?.tooltip).toBe('Documentation tip');
        expect(popupService.currentEditing).toBeNull();
    });

    it('switches from URL to worksheet link and saves the selected sheet target', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const popupService = currentTestBed.injector.get(ISheetsHyperLinkPopupService);
        const renderManagerService = currentTestBed.injector.get(IRenderManagerService) as unknown as TestRenderManagerService;

        act(() => {
            popupService.startAddEditing({
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                type: HyperLinkEditSourceType.VIEWING,
            });
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CellLinkEdit />
                </RediContext.Provider>
            );
        });

        const typeSelect = container.querySelector('[data-u-comp="select"]');
        expect(typeSelect?.textContent).toContain('sheets-hyper-link-ui.form.link');

        await act(async () => {
            await selectOption(typeSelect!, 'sheets-hyper-link-ui.form.worksheet');
            await Promise.resolve();
        });

        const selects = Array.from(container.querySelectorAll('[data-u-comp="select"]'));
        expect(selects).toHaveLength(2);

        await act(async () => {
            await selectOption(selects[1], 'Sheet 1');
            await Promise.resolve();
        });
        renderManagerService.enableScrollRender = true;

        const formButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]'));
        const okButton = formButtons[formButtons.length - 1];

        await act(async () => {
            okButton!.click();
            await Promise.resolve();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);
        const body = cell?.p?.body;
        const sheetLink = body?.customRanges?.find((range) => range.properties?.url === `#${SheetHyperLinkType.SHEET}=${SUB_UNIT_ID}`);

        expect(body?.dataStream).toBe('Univer\r\n');
        expect(sheetLink?.rangeType).toBe(CustomRangeType.HYPERLINK);
        expect(popupService.currentEditing).toBeNull();
    });
});
