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

import type { IWorkbookData, UnitModel } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SheetHyperLinkType, UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '@univerjs/sheets/facade';
import '../index';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Workbook',
        sheetOrder: ['sheet1'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
        },
    };
}

describe('FRangeSheetsHyperlinkMixin', () => {
    let univer: Univer;
    let univerAPI: FUniver;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverSheetsHyperLinkPlugin);

        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);

        const workbook = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);
        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should set, read, update and cancel hyperlinks through the real facade API', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const a1 = worksheet.getRange('A1');
        const b2 = worksheet.getRange('B2');
        const events: string[] = [];
        const addDisposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkAdd, (event) => {
            events.push(`add:${event.row}:${event.col}:${event.link.payload}`);
        });
        const updateDisposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkUpdate, (event) => {
            events.push(`update:${event.row}:${event.column}:${event.payload.payload}`);
        });
        const cancelDisposable = univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkCancel, (event) => {
            events.push(`cancel:${event.row}:${event.column}`);
        });

        await expect(a1.setHyperLink('https://univer.ai', 'Univer')).resolves.toBe(true);
        await expect(b2.setHyperLink('https://docs.univer.ai', 'Docs')).resolves.toBe(true);

        expect(worksheet.getRange('A1:B2').getHyperLinks()).toEqual([
            {
                id: expect.any(String),
                row: 0,
                column: 0,
                url: 'https://univer.ai',
                label: 'Univer',
            },
            {
                id: expect.any(String),
                row: 1,
                column: 1,
                url: 'https://docs.univer.ai',
                label: 'Docs',
            },
        ]);

        await expect(a1.updateHyperLink('https://univer.ai/docs', 'Univer Docs')).resolves.toBe(true);
        expect(a1.getHyperLinks()).toEqual([{
            id: expect.any(String),
            row: 0,
            column: 0,
            url: 'https://univer.ai/docs',
            label: 'Univer Docs',
        }]);

        expect(worksheet.getRange('A1:B2').cancelHyperLink()).toBe(true);
        expect(worksheet.getRange('A1:B2').getHyperLinks()).toEqual([]);
        expect(events).toEqual([
            'add:0:0:https://univer.ai',
            'add:1:1:https://docs.univer.ai',
            'update:0:0:https://univer.ai/docs',
            'cancel:0:0',
            'cancel:1:1',
        ]);

        addDisposable.dispose();
        updateDisposable.dispose();
        cancelDisposable.dispose();
    });

    it('should create hyperlink urls from sheet ranges', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();

        expect(worksheet.getUrl()).toBe('#gid=sheet1');
        expect(worksheet.getRange('A1:B2').getUrl()).toBe('#gid=sheet1&range=A1:B2');

        univer.__getInjector().get(IDefinedNamesService).registerDefinedName(workbook.getId(), {
            id: 'range-1',
            name: 'Total',
            formulaOrRefString: 'Sheet1!A1:B2',
        });
        expect(workbook.getUrlOfDefineName('Total')).toBe('#rangeid=range-1');
        expect(workbook.parseSheetHyperlink('https://univer.ai')).toEqual({
            type: SheetHyperLinkType.URL,
            name: 'https://univer.ai',
            url: 'https://univer.ai',
            searchObj: null,
        });
    });
});
