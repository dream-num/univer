import { IUniverInstanceService } from '@univerjs/core';
import { MoveRangeCommand } from '@univerjs/sheets';
import { CalculationMode } from '@univerjs/sheets-formula';
import { expect } from 'vitest';

import { createFormulaTestBed } from './univer';
import { readTestSnapshot } from './util';

export async function expectMoveFormulaRowsResultMatchesSnapshot() {
    const testBed = createFormulaTestBed({ initialFormulaComputing: CalculationMode.FORCED });
    const workbook = testBed.api.createWorkbook(readTestSnapshot());
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    await testBed.api.getFormula().onCalculationResultApplied();

    // move row 3 to before row 5
    const rowSpec = worksheet.getRange('3:3');
    worksheet.moveRows(rowSpec, 4);

    await testBed.api.getFormula().onCalculationResultApplied();

    expect(workbook.save()).toMatchObject(readTestSnapshot('-result'));

    // perform undo operation
    await testBed.api.undo();
    await testBed.api.getFormula().onCalculationResultApplied();

    // compare the result with the snapshot
    expect(workbook.save()).toMatchObject(readTestSnapshot());
}

export async function expectMoveFormulaSiRowsResultMatchesSnapshot() {
    const testBed = createFormulaTestBed({ initialFormulaComputing: CalculationMode.FORCED });
    const workbook = testBed.api.createWorkbook(readTestSnapshot());
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    await testBed.api.getFormula().onCalculationResultApplied();

    // move row 3 to before row 5
    const rowSpec = worksheet.getRange('3:3');
    worksheet.moveRows(rowSpec, 4);

    await testBed.api.getFormula().onCalculationResultApplied();

    expect(workbook.save()).toMatchObject(readTestSnapshot('-result'));

    // perform undo operation
    await testBed.api.undo();
    await testBed.api.getFormula().onCalculationResultApplied();

    // compare the result with the snapshot
    expect(workbook.save()).toMatchObject(readTestSnapshot());
}

export async function expectMoveFormulaCellResultMatchesSnapshot() {
    const testBed = createFormulaTestBed({ initialFormulaComputing: CalculationMode.FORCED });
    const workbook = testBed.api.createWorkbook(readTestSnapshot());
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    await testBed.api.getFormula().onCalculationResultApplied();

    // move D4:D5 to G13:G14
    const fromRange = worksheet.getRange('D4:D5').getRange();
    const toRange = worksheet.getRange('G13:G14').getRange();
    await testBed.api.executeCommand(MoveRangeCommand.id, {
        fromRange,
        toRange,
    });

    await testBed.api.getFormula().onCalculationResultApplied();

    expect(workbook.save()).toMatchObject(readTestSnapshot('-result'));

    // perform undo operation
    await testBed.api.undo();
    await testBed.api.getFormula().onCalculationResultApplied();

    // compare the result with the snapshot
    expect(workbook.save()).toMatchObject(readTestSnapshot());
}
