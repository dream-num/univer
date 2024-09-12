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

import { DataValidationStatus, Inject, IUniverInstanceService, Range, Tools, UniverInstanceType } from '@univerjs/core';
import type { IDataValidationRule, IRange, Nullable, ObjectMatrix, Workbook } from '@univerjs/core';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationCacheService } from './dv-cache.service';
import type { IDataValidationResCache } from './dv-cache.service';

export class SheetsDataValidationValidatorService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
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

        if (!Tools.isDefine(row) || !Tools.isDefine(col)) {
            throw new Error(`row or col is not defined, row: ${row}, col: ${col}`);
        }

        const cell = worksheet.getCell(row, col);
        const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
        if (!rule) {
            return DataValidationStatus.VALID;
        }

        return new Promise<DataValidationStatus>((resolve) => {
            this._sheetDataValidationModel.validator(cell, rule, { unitId, subUnitId, row, col, worksheet, workbook }, resolve);
        });
    }

    validatorRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        return Promise.all(ranges.map((range) => {
            const promises: Promise<DataValidationStatus>[] = [];
            Range.foreach(range, (row, col) => {
                promises.push(this.validatorCell(unitId, subUnitId, row, col));
            });
            return promises;
        }));
    }

    async validatorWorksheet(unitId: string, subUnitId: string) {
        const rules = this._sheetDataValidationModel.getRules(unitId, subUnitId);
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
        const sheetIds = this._sheetDataValidationModel.getSubUnitIds(unitId);
        const results = await Promise.all(sheetIds.map((id) => this.validatorWorksheet(unitId, id)));

        const map: Record<string, ObjectMatrix<Nullable<IDataValidationResCache>>> = {};

        results.forEach((result, i) => {
            map[sheetIds[i]] = result;
        });

        return map;
    }

    getDataValidations(unitId: string, subUnitId: string, ranges: IRange[]): IDataValidationRule[] {
        const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId);
        const ruleIdSet = new Set<string>();
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const ruleId = ruleMatrix.getValue(row, col);
                if (ruleId) {
                    ruleIdSet.add(ruleId);
                }
            });
        });

        const rules = Array.from(ruleIdSet).map((id) => this._sheetDataValidationModel.getRuleById(unitId, subUnitId, id)).filter(Boolean) as IDataValidationRule[];
        return rules;
    }

    getDataValidation(unitId: string, subUnitId: string, ranges: IRange[]): Nullable<IDataValidationRule> {
        return this.getDataValidations(unitId, subUnitId, ranges)[0];
    }
}
