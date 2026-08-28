import type { IWorkbookData } from '@univerjs/core';
import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';

import { createFormulaTestBed } from './univer';

export function getTestName(): string {
    const testName = expect.getState().currentTestName;
    if (!testName) {
        throw new Error('Cannot get test name. Maybe you call the method outside a test case?');
    }

    return testName;
}

export function getTestFilePath() {
    const name = getTestName();
    return name.replace(/[ >]/g, '-').toLowerCase();
}

export function readTestSnapshot(suffix = ''): IWorkbookData {
    const snapshotPath = path.resolve(import.meta.dirname, '../__snapshots__', `${getTestFilePath()}${suffix}.json`);
    if (!fs.existsSync(snapshotPath)) {
        throw new Error(`Cannot find snapshot file for test "${getTestName()}".`);
    }

    return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8')) as IWorkbookData;
}

export async function expectCalculationResultMatchesSnapshot() {
    const testBed = createFormulaTestBed();
    const workbook = testBed.api.createWorkbook(readTestSnapshot());

    await testBed.api.getFormula().onCalculationResultApplied();

    const resultSnapshot = workbook.save();
    const expectedSnapshot = readTestSnapshot('-result');

    for (const sheetId of expectedSnapshot.sheetOrder) {
        expect(resultSnapshot.sheets[sheetId]?.cellData).toMatchObject(expectedSnapshot.sheets[sheetId].cellData ?? {});
    }
}
