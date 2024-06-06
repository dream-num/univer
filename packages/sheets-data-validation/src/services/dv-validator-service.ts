/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Nullable, ObjectMatrix, Workbook } from '@univerjs/core';
import { DataValidationStatus, IUniverInstanceService, Range, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { Inject } from '@wendellhu/redi';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import type { IDataValidationResCache } from './dv-cache.service';
import { DataValidationCacheService } from './dv-cache.service';

export class SheetsDataValidationValidatorService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService
    ) {

    }

    async validatorCell(unitId: string, subUnitId: string, row: number, col: number) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new Error(`cannot find current workbook, unitId: ${unitId}`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`cannot find current worksheet, sheetId: ${subUnitId}`);
        }

        const cellRaw = worksheet.getCellRaw(row, col);
        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
        const rule = manager.getRuleByLocation(row, col);
        if (!rule) {
            return DataValidationStatus.VALID;
        }

        return new Promise<DataValidationStatus>((resolve) => {
            manager.validator(getCellValueOrigin(cellRaw), rule, { unitId, subUnitId, row, col }, resolve);
        });
    }

    async validatorWorksheet(unitId: string, subUnitId: string) {
        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
        const rules = manager.getDataValidations();
        await Promise.all(rules.map((rule) => {
            return Promise.all(rule.ranges.map((range) => {
                const promises: Promise<DataValidationStatus>[] = [];
                Range.foreach(range, (row, col) => {
                    promises.push(this.validatorCell(unitId, subUnitId, row, col));
                });
                return promises;
            }));
        }));

        return this._dataValidationCacheService.ensureCache(unitId, subUnitId);
    }

    async validatorWorkbook(unitId: string) {
        const sheetIds = this._dataValidationModel.getSubUnitIds(unitId);
        const results = await Promise.all(sheetIds.map((id) => this.validatorWorksheet(unitId, id)));

        const map: Record<string, ObjectMatrix<Nullable<IDataValidationResCache>>> = {};

        results.forEach((result, i) => {
            map[sheetIds[i]] = result;
        });

        return map;
    }
}
