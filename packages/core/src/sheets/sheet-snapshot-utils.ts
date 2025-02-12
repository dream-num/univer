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

import type { IWorksheetData } from './typedef';
import { BooleanNumber } from '../types/enum/text-style';

// TODO@wzhudev: default value should not be exposed, but the keys.

export const DEFAULT_WORKSHEET_ROW_COUNT_KEY = 'DEFAULT_WORKSHEET_ROW_COUNT';
export const DEFAULT_WORKSHEET_ROW_COUNT = 1000;

export const DEFAULT_WORKSHEET_COLUMN_COUNT_KEY = 'DEFAULT_WORKSHEET_COLUMN_COUNT';
export const DEFAULT_WORKSHEET_COLUMN_COUNT = 20;

export const DEFAULT_WORKSHEET_ROW_HEIGHT_KEY = 'DEFAULT_WORKSHEET_ROW_HEIGHT';
export const DEFAULT_WORKSHEET_ROW_HEIGHT = 24;

export const DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY = 'DEFAULT_WORKSHEET_COLUMN_WIDTH';
export const DEFAULT_WORKSHEET_COLUMN_WIDTH = 88;

export const DEFAULT_WORKSHEET_ROW_TITLE_WIDTH_KEY = 'DEFAULT_WORKSHEET_ROW_TITLE_WIDTH';
export const DEFAULT_WORKSHEET_ROW_TITLE_WIDTH = 46;

export const DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT_KEY = 'DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT';
export const DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT = 20;

/**
 * This function is used to merge the user passed in snapshot with the default snapshot
 * without changing the user's snapshot's reference.
 *
 * @param snapshot user passed in snapshot
 * @returns merged snapshot
 */
export function mergeWorksheetSnapshotWithDefault(snapshot: Partial<IWorksheetData>): IWorksheetData {
    const defaultSnapshot: IWorksheetData = {
        name: 'Sheet1', // TODO: name should have i18n
        id: 'sheet-01',
        tabColor: '',
        hidden: BooleanNumber.FALSE,
        rowCount: DEFAULT_WORKSHEET_ROW_COUNT,
        columnCount: DEFAULT_WORKSHEET_COLUMN_COUNT,
        zoomRatio: 1,
        freeze: {
            xSplit: 0,
            ySplit: 0,
            startRow: -1,
            startColumn: -1,
        },
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: DEFAULT_WORKSHEET_COLUMN_WIDTH,
        defaultRowHeight: DEFAULT_WORKSHEET_ROW_HEIGHT,
        mergeData: [],
        cellData: {},
        rowData: {},
        columnData: {},
        showGridlines: BooleanNumber.TRUE,
        rowHeader: {
            width: DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
            hidden: BooleanNumber.FALSE,
        },
        columnHeader: {
            height: DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
            hidden: BooleanNumber.FALSE,
        },
        rightToLeft: BooleanNumber.FALSE,
    };

    // Merge the user's snapshot with the default snapshot.
    Object.keys(defaultSnapshot).forEach((_key) => {
        const key = _key as keyof IWorksheetData;
        if (typeof snapshot[key] === 'undefined') {
            // @ts-ignore
            snapshot[key] = defaultSnapshot[key];
        }
    });

    return snapshot as IWorksheetData;
}
