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

import type { Injector, IWorkbookData, IWorksheetData } from '@univerjs/core';
import type { IEmbedCapability } from '@univerjs/embed';
import { BooleanNumber, generateRandomId, LocaleType, UniverInstanceType } from '@univerjs/core';
import { registerEmbedCapabilities } from '@univerjs/embed';
import pkg from '../package.json';

const SHEETS_HOST_EMBED_CAPABILITIES: readonly IEmbedCapability[] = [
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        mode: 'float',
        renderHost: 'sheets-drawing-dom',
        layout: 'scroll-contained',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_DOC,
        entry: 'sheets-floating-object',
        mode: 'float',
        renderHost: 'sheets-drawing-dom',
        layout: 'doc-width-scale',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_SLIDE,
        entry: 'sheets-floating-object',
        mode: 'float',
        renderHost: 'sheets-drawing-dom',
        layout: 'aspect-fit',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_BASE,
        entry: 'sheets-floating-object',
        mode: 'float',
        renderHost: 'sheets-drawing-dom',
        layout: 'scroll-contained',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_BASE,
        entry: 'sheets-sheet-tab',
        mode: 'tab',
        layout: 'tab-peer',
        menuBehavior: 'host-override',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_DOC,
        entry: 'sheets-sheet-tab',
        mode: 'tab',
        layout: 'tab-peer',
        menuBehavior: 'host-override',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: UniverInstanceType.UNIVER_SLIDE,
        entry: 'sheets-sheet-tab',
        mode: 'tab',
        layout: 'tab-peer',
        menuBehavior: 'host-override',
        nestedEmbed: false,
    },
];

export function registerSheetsEmbedHostCapabilities(injector: Injector): void {
    registerEmbedCapabilities(injector, SHEETS_HOST_EMBED_CAPABILITIES);
}

export function createSheetsEmbedEmptySnapshot(config: Record<string, unknown> = {}): IWorkbookData {
    const unitId = typeof config.id === 'string' ? config.id : `embed_sheet_${generateRandomId(8)}`;
    const sheetId = typeof config.sheetId === 'string' ? config.sheetId : `${unitId}_sheet_1`;
    const sheetName = typeof config.sheetName === 'string' ? config.sheetName : 'Sheet1';

    return {
        id: unitId,
        name: typeof config.name === 'string' ? config.name : 'Embedded Sheet',
        appVersion: pkg.version,
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: [sheetId],
        sheets: {
            [sheetId]: createSheetsEmbedDefaultWorksheet(sheetId, sheetName),
        },
        resources: [],
    };
}

function createSheetsEmbedDefaultWorksheet(sheetId: string, name: string): IWorksheetData {
    return {
        id: sheetId,
        name,
        tabColor: '',
        hidden: BooleanNumber.FALSE,
        rowCount: 100,
        columnCount: 20,
        zoomRatio: 1,
        freeze: {
            startRow: -1,
            startColumn: -1,
            ySplit: 0,
            xSplit: 0,
        },
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 88,
        defaultRowHeight: 24,
        mergeData: [],
        cellData: {},
        rowData: {},
        columnData: {},
        showGridlines: BooleanNumber.TRUE,
        rowHeader: {
            width: 46,
            hidden: BooleanNumber.FALSE,
        },
        columnHeader: {
            height: 20,
            hidden: BooleanNumber.FALSE,
        },
        rightToLeft: BooleanNumber.FALSE,
    };
}
