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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsContentSizeProvider } from './embed-content-size';

describe('createSheetsContentSizeProvider', () => {
    it('measures active worksheet size from visible row and column spans', () => {
        const provider = createSheetsContentSizeProvider();

        expect(provider.measureContentSize({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'sheet-1',
            childUnit: {
                getActiveSheet: () => ({
                    getConfig: () => ({ columnHeader: { height: 30 } }),
                    getColVisible: (column: number) => column !== 2,
                    getColumnCount: () => 4,
                    getColumnWidth: (column: number) => [80, 120, 240, 160][column] ?? 88,
                    getRowCount: () => 4,
                    getRowHeight: (row: number) => [24, 40, 100, 32][row] ?? 24,
                    getRowVisible: (row: number) => row !== 2,
                }),
            },
        })).toEqual({ height: 126, width: 406 });
    });

    it('uses worksheet data range to avoid measuring empty trailing rows and columns', () => {
        const provider = createSheetsContentSizeProvider();

        expect(provider.measureContentSize({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'sheet-1',
            childUnit: {
                getActiveSheet: () => ({
                    getCellMatrix: () => ({
                        getDataRange: () => ({
                            endColumn: 1,
                            endRow: 1,
                            startColumn: 0,
                            startRow: 0,
                        }),
                    }),
                    getConfig: () => ({ columnHeader: { height: 30 }, rowHeader: { width: 50 } }),
                    getColVisible: () => true,
                    getColumnCount: () => 100,
                    getColumnWidth: (column: number) => [80, 120][column] ?? 240,
                    getRowCount: () => 100,
                    getRowHeight: (row: number) => [24, 40][row] ?? 100,
                    getRowVisible: () => true,
                }),
            },
        })).toEqual({ height: 94, width: 250 });
    });
});
