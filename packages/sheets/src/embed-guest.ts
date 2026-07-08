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
import { BooleanNumber, generateRandomId, LocaleType } from '@univerjs/core';
import pkg from '../package.json';

export function registerSheetsEmbedHostCapabilities(injector: Injector): void {
    void injector;
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
