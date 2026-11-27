import { describe, expect, it } from 'vitest';
import { createFormulaTestBed } from '../__testing__/univer';

describe('ISO.CEILING', () => {
    it('evaluates the formula instead of returning #NAME?', async () => {
        const testBed = createFormulaTestBed();

        try {
            const workbook = testBed.api.createWorkbook({
                id: 'iso-ceiling',
                name: 'ISO.CEILING',
                sheetOrder: ['sheet1'],
                sheets: {
                    sheet1: {
                        id: 'sheet1',
                        name: 'Sheet1',
                        rowCount: 10,
                        columnCount: 2,
                        cellData: {
                            0: { 0: { f: '=ISO.CEILING(4.3)' } },
                            1: { 0: { f: '=ISO.CEILING(-4.3)' } },
                            2: { 0: { f: '=ISO.CEILING(4.3,2)' } },
                            3: { 0: { f: '=ISO.CEILING(4.3,-2)' } },
                            4: { 0: { f: '=ISO.CEILING(-4.3,2)' } },
                            5: { 0: { f: '=ISO.CEILING(-4.3,-2)' } },
                            6: { 0: { f: '=ISO.CEILING(0,2)' }, 1: { f: '=ISO.CEILING(4.3,0)' } },
                        },
                    },
                },
            });

            const formula = testBed.api.getFormula();

            await formula.onCalculationResultApplied();

            const sheet = workbook.getActiveSheet();

            // Microsoft's example table for ISO.CEILING, plus ISO.CEILING(0, 2) and ISO.CEILING(4.3, 0) which are 0.
            expect(sheet.getRange('A1:A6').getValues()).toStrictEqual([[5], [-4], [6], [6], [-4], [-4]]);
            expect(sheet.getRange('A7:B7').getValues()).toStrictEqual([[0, 0]]);
        } finally {
            testBed.univer.dispose();
        }
    });
});
