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

import { CellValueType, Injector } from '@univerjs/core';
import { FormulaResultStatus, RegisterOtherFormulaService } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingFormulaService } from '../conditional-formatting-formula.service';

describe('ConditionalFormattingFormulaService', () => {
    let service: ConditionalFormattingFormulaService;
    let registerFormulaWithRange: ReturnType<typeof vi.fn>;
    let formulaResults: Map<string, unknown>;

    beforeEach(() => {
        formulaResults = new Map();
        registerFormulaWithRange = vi.fn(() => 'formula-1');
        const injector = new Injector();
        injector.add([RegisterOtherFormulaService, { useValue: {
            formulaResult$: new Subject(),
            registerFormulaWithRange,
            getFormulaValueSync: (_unitId: string, _subUnitId: string, formulaId: string) => formulaResults.get(formulaId),
            deleteFormula: vi.fn(),
        } as unknown as RegisterOtherFormulaService }]);
        injector.add([ConditionalFormattingRuleModel, { useValue: { $ruleChange: new Subject() } as unknown as ConditionalFormattingRuleModel }]);
        injector.add([ConditionalFormattingFormulaService]);
        service = injector.get(ConditionalFormattingFormulaService);
    });

    it('registers conditional-formatting formulas with a stable top-left anchor range', () => {
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1>0', [
            { startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 },
            { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
        ]);

        expect(registerFormulaWithRange).toHaveBeenCalledWith(
            'book-1',
            'sheet-1',
            '=A1>0',
            [
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
                { startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 },
            ],
            undefined,
            expect.any(String),
            'cf-1'
        );
    });

    it('returns boolean formula results as business booleans for conditional checks', () => {
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1>0');
        formulaResults.set('formula-1', {
            status: FormulaResultStatus.SUCCESS,
            result: { 0: { 0: [[{ t: CellValueType.BOOLEAN, v: 1 }]] } },
        });

        expect(service.getFormulaResultWithCoords('book-1', 'sheet-1', 'cf-1', '=A1>0')).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: true,
        });
    });
});
