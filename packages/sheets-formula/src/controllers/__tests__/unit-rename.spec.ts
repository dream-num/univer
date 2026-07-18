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

import type { IFormulaData } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { UpdateFormulaController } from '../update-formula.controller';
import { FormulaReferenceMoveType } from '../utils/ref-range-formula';

describe('UpdateFormulaController Unit rename', () => {
    it('refactors qualifiers across host workbooks and leaves ordinary strings intact', () => {
        const controller = Object.create(UpdateFormulaController.prototype) as {
            _getFormulaReferenceMoveInfo: (
                data: IFormulaData,
                sheetNames: Record<string, Record<string, string>>,
                move: object
            ) => { newFormulaData: IFormulaData };
        };
        const formulaData = {
            host: {
                sheet: {
                    0: { 0: { f: '=SUM([Sales.xlsx]Data!A1)+SUM(Sales.xlsx!T[V])' } },
                    1: { 0: { f: '=INDIRECT("[Sales.xlsx]Data!B2")&"[Sales.xlsx]Data!B2"' } },
                },
            },
        } as IFormulaData;

        const { newFormulaData } = controller._getFormulaReferenceMoveInfo(formulaData, {}, {
            type: FormulaReferenceMoveType.SetUnitName,
            unitId: 'sales-unit',
            sheetId: '',
            oldUnitName: 'Sales.xlsx',
            unitName: 'FY 2027.xlsx',
        });

        expect(newFormulaData.host?.sheet?.[0]?.[0]?.f).toBe("=SUM([FY 2027.xlsx]Data!A1)+SUM('FY 2027.xlsx'!T[V])");
        expect(newFormulaData.host?.sheet?.[1]?.[0]?.f).toBe('=INDIRECT("[FY 2027.xlsx]Data!B2")&"[Sales.xlsx]Data!B2"');
    });
});
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
