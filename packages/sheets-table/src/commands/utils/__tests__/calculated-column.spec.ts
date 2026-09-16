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

import { BooleanNumber, FormulaType, Injector } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { Table } from '../../../models/table';
import { getCalculatedColumnFillMutation } from '../calculated-column';

describe('getCalculatedColumnFillMutation', () => {
    it('fills relative references and marks imported arrays using formal formula metadata', () => {
        const injector = new Injector([[LexerTreeBuilder]]);
        try {
            const table = new Table('table', 'Orders', { startRow: 0, endRow: 9, startColumn: 4, endColumn: 6 }, ['Name', 'Amount', 'Array']);
            table.getTableColumnByIndex(1)!.formula = 'A2*2';
            table.getTableColumnByIndex(2)!.formula = '=$A2';
            table.getTableColumnByIndex(2)!.formulaIsArray = true;
            const mutation = getCalculatedColumnFillMutation(table, 'unit', 'sheet', 7, 8, () => injector.get(LexerTreeBuilder));
            expect(mutation?.params).toMatchObject({
                cellValue: {
                    7: { 5: { f: '=A8*2', ft: null, v: null }, 6: { f: '=$A8', ref: 'G8', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE } },
                    8: { 5: { f: '=A9*2' }, 6: { f: '=$A9', ref: 'G9', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE } },
                },
            });
            const stopped = getCalculatedColumnFillMutation(table, 'unit', 'sheet', 7, 8, () => injector.get(LexerTreeBuilder), {
                columnId: table.getTableColumnByIndex(1)!.id,
                formula: '',
            });
            expect(stopped).toBeUndefined();
        } finally {
            injector.dispose();
        }
    });
});
