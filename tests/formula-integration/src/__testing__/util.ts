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

import type { IWorkbookData } from '@univerjs/core';
import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';
import { createFormulaTestBed } from './univer';

function getTestName(): string {
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

export async function expectCalculationResultMatchesSnapshot() {
    const testBed = createFormulaTestBed();
    const snapshotRootDir = path.join(import.meta.dirname, '../__snapshots__');

    const testSnapshotPath = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (!fs.existsSync(testSnapshotPath)) {
        throw new Error(`Cannot find snapshot file for test "${getTestName()}".`);
    }

    const testSnapshotRaw = fs.readFileSync(testSnapshotPath, 'utf-8');
    const testSnapshot = JSON.parse(testSnapshotRaw) as IWorkbookData;

    const workbook = testBed.api.createWorkbook(testSnapshot);
    const formula = testBed.api.getFormula();
    await formula.onCalculationEnd();

    const resultSnapshot = workbook.save();
    const snapshotFilePath = path.resolve(snapshotRootDir, `${getTestFilePath()}-result.json`);
    if (fs.existsSync(snapshotFilePath)) {
        const resultSnapshotFileString = fs.readFileSync(snapshotFilePath, 'utf-8');
        expect(resultSnapshot).toMatchObject(JSON.parse(resultSnapshotFileString));
    } else {
        fs.writeFileSync(snapshotFilePath, JSON.stringify(resultSnapshot, null, 4));

        // eslint-disable-next-line no-console
        console.log(`Snapshot file created at: ${snapshotFilePath}`);
    }
}
