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
import { UniverSheetsPlugin } from '@univerjs/sheets';
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

export async function expectTestInvertedIndexCalculationTime() {
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

    const formulaEngine = testBed.api.getFormula();

    const startTime = performance.now();
    formulaEngine.executeCalculation();
    await formulaEngine.onCalculationEnd();
    const endTime = performance.now();

    const calculationTime = endTime - startTime;
    expect(calculationTime).toBeLessThan(5000);
}
