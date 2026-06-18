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
import { CFRuleType, CFSubRuleType, CFValueType } from '../../base/const';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingFormulaService } from '../conditional-formatting-formula.service';

describe('ConditionalFormattingFormulaService', () => {
    let service: ConditionalFormattingFormulaService;
    let registerFormulaWithRange: ReturnType<typeof vi.fn>;
    let deleteFormula: ReturnType<typeof vi.fn>;
    let formulaResults: Map<string, unknown>;
    let formulaResult$: Subject<Record<string, Record<string, unknown[]>>>;
    let ruleChange$: Subject<any>;

    class TestRegisterOtherFormulaService {
        formulaResult$ = formulaResult$;
        registerFormulaWithRange = registerFormulaWithRange;
        getFormulaValueSync = (_unitId: string, _subUnitId: string, formulaId: string) => formulaResults.get(formulaId);
        deleteFormula = deleteFormula;
    }

    class TestConditionalFormattingRuleModel {
        $ruleChange = ruleChange$;
    }

    beforeEach(() => {
        formulaResults = new Map();
        registerFormulaWithRange = vi.fn(() => 'formula-1');
        deleteFormula = vi.fn();
        formulaResult$ = new Subject();
        ruleChange$ = new Subject();
        const injector = new Injector();
        injector.add([RegisterOtherFormulaService, { useClass: TestRegisterOtherFormulaService as never }]);
        injector.add([ConditionalFormattingRuleModel, { useClass: TestConditionalFormattingRuleModel as never }]);
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

    it('returns not-register and pending statuses when formula results are unavailable', () => {
        expect(service.getFormulaResultWithCoords('book-1', 'sheet-1', 'cf-1', '=A1>0')).toEqual({
            status: FormulaResultStatus.NOT_REGISTER,
        });

        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1>0');
        expect(service.getFormulaResultWithCoords('book-1', 'sheet-1', 'cf-1', '=A1>0')).toEqual({
            status: FormulaResultStatus.NOT_REGISTER,
        });

        formulaResults.set('formula-1', { status: FormulaResultStatus.WAIT });
        expect(service.getFormulaResultWithCoords('book-1', 'sheet-1', 'cf-1', '=A1>0')).toEqual({
            status: FormulaResultStatus.WAIT,
        });
    });

    it('returns formula matrices with extracted scalar cell values', () => {
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1:B2');
        formulaResults.set('formula-1', {
            status: FormulaResultStatus.SUCCESS,
            result: {
                0: {
                    0: [[{ t: CellValueType.BOOLEAN, v: 0 }]],
                    1: [[{ v: 12 }]],
                },
                1: {
                    0: [[null]],
                    1: [[{ v: 'done' }]],
                },
            },
        });

        const matrix = service.getFormulaMatrix('book-1', 'sheet-1', 'cf-1', '=A1:B2');

        expect(matrix.status).toBe(FormulaResultStatus.SUCCESS);
        expect(matrix.result?.getValue(0, 0)).toBe(false);
        expect(matrix.result?.getValue(0, 1)).toBe(12);
        expect(matrix.result?.getValue(1, 0)).toBe(false);
        expect(matrix.result?.getValue(1, 1)).toBe('done');
    });

    it('registers and removes formulas in response to rule changes', () => {
        ruleChange$.next({
            type: 'add',
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: {
                cfId: 'cf-1',
                ranges: [{ startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 }],
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.formula,
                    value: '=A1>0',
                },
            },
        });
        ruleChange$.next({
            type: 'delete',
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: { cfId: 'cf-1' },
        });

        expect(registerFormulaWithRange).toHaveBeenCalledWith(
            'book-1',
            'sheet-1',
            '=A1>0',
            [{ startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 }],
            undefined,
            expect.any(String),
            'cf-1'
        );
        expect(deleteFormula).toHaveBeenCalledWith('book-1', 'sheet-1', ['formula-1']);
    });

    it('removes formula caches when formula-backed scale rules are replaced', () => {
        registerFormulaWithRange.mockReturnValueOnce('formula-1').mockReturnValueOnce('formula-2');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=MIN(A:A)');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=MAX(A:A)');

        ruleChange$.next({
            type: 'set',
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: {
                cfId: 'cf-1',
                rule: {
                    type: CFRuleType.colorScale,
                    config: [{ value: { type: CFValueType.formula } }],
                },
            },
        });

        expect(deleteFormula).toHaveBeenCalledWith('book-1', 'sheet-1', ['formula-1', 'formula-2']);
        expect(service.getSubUnitFormulaMap('book-1', 'sheet-1')?.getValues()).toEqual([]);
    });

    it('publishes result changes and reports whether every formula for the rule finished', () => {
        registerFormulaWithRange.mockReturnValueOnce('formula-1').mockReturnValueOnce('formula-2');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1>0');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=B1>0');
        const results: unknown[] = [];
        service.result$.subscribe((result) => results.push(result));

        formulaResults.set('formula-1', { status: FormulaResultStatus.SUCCESS, result: {} });
        formulaResults.set('formula-2', { status: FormulaResultStatus.WAIT });
        formulaResult$.next({ 'book-1': { 'sheet-1': [{ formulaId: 'formula-1' }] } });

        formulaResults.set('formula-2', { status: FormulaResultStatus.SUCCESS, result: {} });
        formulaResult$.next({ 'book-1': { 'sheet-1': [{ formulaId: 'formula-2' }, { formulaId: 'unknown' }] } });

        expect(results).toEqual([
            expect.objectContaining({ formulaId: 'formula-1', isAllFinished: false }),
            expect.objectContaining({ formulaId: 'formula-2', isAllFinished: true }),
        ]);
    });

    it('deletes one formula cache by text without unregistering other cached formulas', () => {
        registerFormulaWithRange.mockReturnValueOnce('formula-1').mockReturnValueOnce('formula-2');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=A1>0');
        service.registerFormulaWithRange('book-1', 'sheet-1', 'cf-1', '=B1>0');

        expect(service.deleteCache('book-1', 'sheet-1', 'cf-1', '=A1>0')).toEqual([]);
        expect(service.getSubUnitFormulaMap('book-1', 'sheet-1')?.getValue('cf-1_=A1>0', ['id'])).toBeNull();
        expect(service.getSubUnitFormulaMap('book-1', 'sheet-1')?.getValue('cf-1_=B1>0', ['id'])).toMatchObject({
            formulaId: 'formula-2',
        });
        expect(service.createCFormulaId('cf-1', '=B1>0')).toBe('cf-1_=B1>0');
    });
});
