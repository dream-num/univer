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

import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { collectUnitQualifierFormulaPatches } from '../unit-qualifier-rename.controller';

describe('UnitQualifierRenameController', () => {
    it('builds persisted Sheet cell patches for a renamed Base Unit', () => {
        const workbook = {
            getUnitId: () => 'host',
            getSheets: () => [{
                getSheetId: () => 'sheet',
                getCellMatrix: () => new ObjectMatrix({
                    0: { 0: { f: '=SUM(BaseData!Tasks[Amount])' } },
                    1: { 0: { f: '=INDIRECT("[BaseData]Data!A1")&"BaseData!Tasks[Amount]"' } },
                }),
            }],
        } as never;

        expect(collectUnitQualifierFormulaPatches(workbook, 'BaseData', 'FY Base')).toEqual([{
            unitId: 'host',
            subUnitId: 'sheet',
            cellValue: {
                0: { 0: { f: "=SUM('FY Base'!Tasks[Amount])" } },
                1: { 0: { f: '=INDIRECT("[FY Base]Data!A1")&"BaseData!Tasks[Amount]"' } },
            },
        }]);
    });
});
