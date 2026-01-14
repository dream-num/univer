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
import { IUniverInstanceService, LocaleType, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { MoveRangeCommand, UniverSheetsPlugin } from '@univerjs/sheets';
import { CalculationMode, UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { expect } from 'vitest';
import { getTestFilePath, getTestName } from './util';

function createTestBed() {
    const univer = new Univer({
        locale: LocaleType.ZH_CN,
        locales: {
            [LocaleType.ZH_CN]: zhCN,
        },
    });

    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin, {
        initialFormulaComputing: CalculationMode.FORCED,
    });

    const injector = univer.__getInjector();

    return {
        univer,
        get: injector.get.bind(injector),
        api: FUniver.newAPI(univer),
    };
}

export async function expectMoveFormulaRowsResultMatchesSnapshot() {
    const testBed = createTestBed();
    const snapshotRootDir = path.join(import.meta.dirname, '../__snapshots__');

    const testSnapshotPath = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (!fs.existsSync(testSnapshotPath)) {
        throw new Error(`Cannot find snapshot file for test "${getTestName()}".`);
    }

    const testSnapshotRaw = fs.readFileSync(testSnapshotPath, 'utf-8');
    const testSnapshot = JSON.parse(testSnapshotRaw) as IWorkbookData;

    const workbook = testBed.api.createWorkbook(testSnapshot);
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    // move row 3 to before row 5
    const rowSpec = worksheet.getRange('3:3');
    worksheet.moveRows(rowSpec, 4);

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

    // perform undo operation
    await testBed.api.undo();

    // compare the result with the snapshot
    const resultSnapshot_undo = workbook.save();
    const snapshotFilePath_undo = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (fs.existsSync(snapshotFilePath_undo)) {
        const resultSnapshotFileString = fs.readFileSync(snapshotFilePath_undo, 'utf-8');
        expect(resultSnapshot_undo).toMatchObject(JSON.parse(resultSnapshotFileString));
    } else {
        fs.writeFileSync(snapshotFilePath_undo, JSON.stringify(resultSnapshot_undo, null, 4));

        // eslint-disable-next-line no-console
        console.log(`Snapshot file created at: ${snapshotFilePath_undo}`);
    }
}

export async function expectMoveFormulaSiRowsResultMatchesSnapshot() {
    const testBed = createTestBed();
    const snapshotRootDir = path.join(import.meta.dirname, '../__snapshots__');

    const testSnapshotPath = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (!fs.existsSync(testSnapshotPath)) {
        throw new Error(`Cannot find snapshot file for test "${getTestName()}".`);
    }

    const testSnapshotRaw = fs.readFileSync(testSnapshotPath, 'utf-8');
    const testSnapshot = JSON.parse(testSnapshotRaw) as IWorkbookData;

    const workbook = testBed.api.createWorkbook(testSnapshot);
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    // move row 3 to before row 5
    const rowSpec = worksheet.getRange('3:3');
    worksheet.moveRows(rowSpec, 4);

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

    // perform undo operation
    await testBed.api.undo();

    // compare the result with the snapshot
    const resultSnapshot_undo = workbook.save();
    const snapshotFilePath_undo = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (fs.existsSync(snapshotFilePath_undo)) {
        const resultSnapshotFileString = fs.readFileSync(snapshotFilePath_undo, 'utf-8');
        expect(resultSnapshot_undo).toMatchObject(JSON.parse(resultSnapshotFileString));
    } else {
        fs.writeFileSync(snapshotFilePath_undo, JSON.stringify(resultSnapshot_undo, null, 4));

        // eslint-disable-next-line no-console
        console.log(`Snapshot file created at: ${snapshotFilePath_undo}`);
    }
}

export async function expectMoveFormulaCellResultMatchesSnapshot() {
    const testBed = createTestBed();
    const snapshotRootDir = path.join(import.meta.dirname, '../__snapshots__');

    const testSnapshotPath = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (!fs.existsSync(testSnapshotPath)) {
        throw new Error(`Cannot find snapshot file for test "${getTestName()}".`);
    }

    const testSnapshotRaw = fs.readFileSync(testSnapshotPath, 'utf-8');
    const testSnapshot = JSON.parse(testSnapshotRaw) as IWorkbookData;

    const workbook = testBed.api.createWorkbook(testSnapshot);
    const univerInstanceService = testBed.get(IUniverInstanceService);
    univerInstanceService.focusUnit(workbook.getId());
    const worksheet = workbook.getActiveSheet();

    // move D4:D5 to G13:G14
    const fromRange = worksheet.getRange('D4:D5').getRange();
    const toRange = worksheet.getRange('G13:G14').getRange();
    await testBed.api.executeCommand(MoveRangeCommand.id, {
        fromRange,
        toRange,
    });

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

    // perform undo operation
    await testBed.api.undo();

    // compare the result with the snapshot
    const resultSnapshot_undo = workbook.save();
    const snapshotFilePath_undo = path.resolve(snapshotRootDir, `${getTestFilePath()}.json`);
    if (fs.existsSync(snapshotFilePath_undo)) {
        const resultSnapshotFileString = fs.readFileSync(snapshotFilePath_undo, 'utf-8');
        expect(resultSnapshot_undo).toMatchObject(JSON.parse(resultSnapshotFileString));
    } else {
        fs.writeFileSync(snapshotFilePath_undo, JSON.stringify(resultSnapshot_undo, null, 4));

        // eslint-disable-next-line no-console
        console.log(`Snapshot file created at: ${snapshotFilePath_undo}`);
    }
}
