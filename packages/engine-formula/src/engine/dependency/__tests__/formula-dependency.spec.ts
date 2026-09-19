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

import type { LexerNode } from '../../analysis/lexer-node';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import { describe, expect, it } from 'vitest';
import { If } from '../../../functions/logical/if';
import { Index } from '../../../functions/lookup/index/index';
import { Sum } from '../../../functions/math/sum';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { createCommandTestBed } from '../../analysis/__tests__/create-command-test-bed';
import { Lexer } from '../../analysis/lexer';
import { AstTreeBuilder } from '../../analysis/parser';
import { FormulaDependencyGenerator } from '../formula-dependency';

class TestFormulaDependencyGenerator extends FormulaDependencyGenerator {
    collectRanges(node: BaseAstNode) {
        return this._getRangeListByNode({ node, refOffsetX: 0, refOffsetY: 0 });
    }
}

describe('Implicit intersection dependencies', () => {
    it.each([
        ['=@SUM(A1:A3)', [0, 2]],
        ['=@IF(A1,INDEX({"Su";"M"},A2),"")', [0, 1]],
        ['=@SUM(@SUM(A1:A3))', [0, 2]],
        ['=@A1:A3', [1, 1]],
        ['=@INDEX(A1:A3,2)', [1, 1]],
    ] as const)('collects scalar inputs but preserves reference intersections: %s', async (formula, expectedRows) => {
        const bed = createCommandTestBed(undefined, [
            [TestFormulaDependencyGenerator],
        ]);
        try {
            bed.get(IFunctionService).registerExecutors(new Sum('SUM'), new If('IF'), new Index('INDEX'));
            bed.get(IFormulaCurrentConfigService).load({
                formulaData: { [bed.unitId]: { [bed.sheetId]: { 1: { 5: { f: formula } } } } },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: true,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                excludedCell: {},
                allUnitData: { [bed.unitId]: bed.sheetData },
            });
            const sheet = bed.sheetData[bed.sheetId];
            bed.get(IFormulaRuntimeService).setCurrent(1, 5, sheet.rowCount, sheet.columnCount, bed.sheetId, bed.unitId);
            const lexerNode = bed.get(Lexer).treeBuilder(formula) as LexerNode;
            const node = bed.get(AstTreeBuilder).parse(lexerNode) as BaseAstNode;
            const generator = bed.get(TestFormulaDependencyGenerator);
            const ranges = (await generator.collectRanges(node)).map((item) => item.range);
            expect(Math.min(...ranges.map((range) => range.startRow))).toBe(expectedRows[0]);
            expect(Math.max(...ranges.map((range) => range.endRow))).toBe(expectedRows[1]);
            expect(ranges.every((range) => range.startColumn === 0 && range.endColumn === 0)).toBe(true);
        } finally {
            bed.univer.dispose();
        }
    });
});
