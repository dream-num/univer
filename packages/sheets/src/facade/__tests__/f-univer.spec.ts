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

import { IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FUniver sheets facade', () => {
    it('rejects createWorkbook snapshots whose sheet map keys do not match sheet ids', () => {
        const { get, univer, univerAPI } = createFacadeTestBed();
        try {
            expect(() =>
                univerAPI.createWorkbook({
                    id: 'workbook-demo',
                    name: 'Demo Workbook',
                    sheetOrder: ['Sheet1'],
                    sheets: {
                        Sheet1: {
                            id: 'sheet-demo-1',
                            name: 'Sheet1',
                            rowCount: 10,
                            columnCount: 10,
                            cellData: { 0: { 0: { v: 'bad-key-visible-data', t: 1 } } },
                        },
                    },
                })
            ).toThrow('createWorkbook snapshot is invalid: sheets["Sheet1"].id must equal "Sheet1", got "sheet-demo-1". Use sheet ids for sheetOrder and sheets map keys.');

            expect(get(IUniverInstanceService).getUnit('workbook-demo')).toBeUndefined();
        } finally {
            univer.dispose();
        }
    });
});
