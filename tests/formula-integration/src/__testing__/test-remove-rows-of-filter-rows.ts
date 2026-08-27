import { IUniverInstanceService } from '@univerjs/core';
import { expect } from 'vitest';

import { createFormulaTestBed } from './univer';
import { readTestSnapshot } from './util';

export async function expectRemoveRowsOfFilterRowsResultMatchesSnapshot() {
    const testBed = createFormulaTestBed({ registerSheetsFilter: true });
    const workbook = testBed.api.createWorkbook(readTestSnapshot());
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    await testBed.api.getFormula().onCalculationResultApplied();

    // remove rows 2 to 5, where the 3 to 4 rows are filtered rows
    worksheet.deleteRows(1, 4);

    await testBed.api.getFormula().onCalculationResultApplied();

    expect(workbook.save()).toMatchObject(readTestSnapshot('-result'));

    // perform undo operation
    await testBed.api.undo();
    await testBed.api.getFormula().onCalculationResultApplied();

    // compare the result with the snapshot
    expect(workbook.save()).toMatchObject(readTestSnapshot());
}
