import { describe, expect, it } from 'vitest';
import { createFormulaTestBed } from '../__testing__/univer';
import { expectCalculationResultMatchesSnapshot } from '../__testing__/util';

describe('Test formula correctness', () => {
    it('basic sum', async () => {
        await expectCalculationResultMatchesSnapshot();
    });

    it('preserves shared range values for aggregates calculated after SORT', async () => {
        const testBed = createFormulaTestBed();

        try {
            const workbook = testBed.api.createWorkbook({
                id: 'sort-shared-range',
                name: 'Sort shared range',
                sheetOrder: ['sheet1'],
                sheets: {
                    sheet1: {
                        id: 'sheet1',
                        name: 'Sheet1',
                        rowCount: 20,
                        columnCount: 10,
                        cellData: {
                            0: {
                                0: { v: 3 },
                                1: { v: 'c' },
                                3: { f: '=SORT(A1:A5)' },
                                4: { f: '=SUMIFS(A1:A5,B1:B5,"c")' },
                                5: { f: '=SUM(SORT(A1:A5))*0+SUMIFS(A1:A5,B1:B5,"c")' },
                            },
                            1: {
                                0: { v: 1 },
                                1: { v: 'a' },
                                4: { f: '=SUMPRODUCT((B1:B5="c")*A1:A5)' },
                            },
                            2: { 0: { v: 2 }, 1: { v: 'b' } },
                            3: { 0: { v: 3 }, 1: { v: 'c' } },
                            4: { 0: { v: 5 }, 1: { v: 'e' } },
                        },
                    },
                },
            });
            const formula = testBed.api.getFormula();
            await formula.onCalculationResultApplied();
            const sheet = workbook.getActiveSheet();

            expect(sheet.getRange('D1:D5').getValues()).toStrictEqual([[1], [2], [3], [3], [5]]);
            expect(sheet.getRange('E1:E2').getValues()).toStrictEqual([[6], [6]]);
            expect(sheet.getRange('F1').getRawValue()).toBe(6);

            formula.executeCalculation();
            await formula.onCalculationResultApplied();

            expect(sheet.getRange('E1:E2').getValues()).toStrictEqual([[6], [6]]);
            expect(sheet.getRange('F1').getRawValue()).toBe(6);
            expect(sheet.getRange('A1:B5').getValues()).toStrictEqual([
                [3, 'c'],
                [1, 'a'],
                [2, 'b'],
                [3, 'c'],
                [5, 'e'],
            ]);
        } finally {
            testBed.univer.dispose();
        }
    });
});
