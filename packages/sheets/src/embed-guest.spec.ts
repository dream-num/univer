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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsEmbedEmptySnapshot, registerSheetsEmbedHostCapabilities } from './embed-guest';

describe('sheets embed guest compatibility', () => {
    it('creates default workbook snapshots with one visible worksheet', () => {
        const snapshot = createSheetsEmbedEmptySnapshot({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetId: 'sheet-child-grid',
            sheetName: 'Budget',
        });

        expect(snapshot).toMatchObject({
            id: 'sheet-child',
            name: 'Embedded Budget',
            sheetOrder: ['sheet-child-grid'],
            sheets: {
                'sheet-child-grid': {
                    columnCount: 20,
                    columnHeader: { hidden: BooleanNumber.FALSE },
                    id: 'sheet-child-grid',
                    name: 'Budget',
                    rowCount: 100,
                    rowHeader: { hidden: BooleanNumber.FALSE },
                    showGridlines: BooleanNumber.TRUE,
                },
            },
        });
    });

    it('keeps the old capability registration API as a no-op', () => {
        expect(() => registerSheetsEmbedHostCapabilities({} as never)).not.toThrow();
    });
});
