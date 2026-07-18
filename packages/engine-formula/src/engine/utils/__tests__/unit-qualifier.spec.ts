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

import { describe, expect, it } from 'vitest';
import { refactorFormulaUnitQualifier } from '../unit-qualifier';

describe('refactorFormulaUnitQualifier', () => {
    it('updates A1 and Table qualifiers without touching similar names', () => {
        expect(refactorFormulaUnitQualifier(
            "=SUM([Sales.xlsx]Data!A1,'[Sales.xlsx]Q 1'!B2,Sales.xlsx!SalesTable[Amount],Sales.xlsx.bak!T[V])",
            'Sales.xlsx',
            'FY 2027.xlsx'
        )).toBe("=SUM([FY 2027.xlsx]Data!A1,'[FY 2027.xlsx]Q 1'!B2,'FY 2027.xlsx'!SalesTable[Amount],Sales.xlsx.bak!T[V])");
    });

    it('updates INDIRECT reference literals but leaves ordinary string literals unchanged', () => {
        expect(refactorFormulaUnitQualifier(
            '=INDIRECT("[Sales.xlsx]Data!A1")&"[Sales.xlsx]Data!A1"',
            'Sales.xlsx',
            'Costs.xlsx'
        )).toBe('=INDIRECT("[Costs.xlsx]Data!A1")&"[Sales.xlsx]Data!A1"');
    });

    it('preserves bracketed and quoted structured-reference styles', () => {
        expect(refactorFormulaUnitQualifier(
            "=SUM([Sales.xlsx]!T[A])+SUM('Sales.xlsx'!T[B])",
            'sales.XLSX',
            "Director's Plan"
        )).toBe("=SUM([Director's Plan]!T[A])+SUM('Director''s Plan'!T[B])");
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
