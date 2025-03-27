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

import type { IDataValidationRule, IRange, Nullable, ObjectMatrix, Workbook, Worksheet } from '@univerjs/core';
import { bufferDebounceTime, DataValidationStatus, Disposable, Inject, IUniverInstanceService, LifecycleService, LifecycleStages, Range, Tools, UniverInstanceType } from '@univerjs/core';
import { bufferWhen, filter } from 'rxjs';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationCacheService } from './dv-cache.service';

export class SheetsDataValidationValidatorService extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        super();
        this._initRecalculate();
    }

    private _initRecalculate() {
        const handleDirtyRanges = (ranges: { unitId: string; subUnitId: string; ranges: IRange[] }[]) => {
            if (ranges.length === 0) {
                return;
            }

            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();

            const map: Record<string, Record<string, IRange[]>> = {};

            ranges.flat().forEach((range) => {
                if (!map[range.unitId]) {
                    map[range.unitId] = {};
                }
                if (!map[range.unitId][range.subUnitId]) {
                    map[range.unitId][range.subUnitId] = [];
                }
                const workbook = this._univerInstanceService.getUnit<Workbook>(range.unitId, UniverInstanceType.UNIVER_SHEET);
                const worksheet = workbook?.getSheetBySheetId(range.subUnitId);
                if (!worksheet) {
                    return;
                }
                map[range.unitId][range.subUnitId].push(...range.ranges.map((range) => Range.transformRange(range, worksheet)));
            });

            Object.entries(map).forEach(([unitId, subUnitMap]) => {
                Object.entries(subUnitMap).forEach(([subUnitId, ranges]) => {
                    if (workbook?.getUnitId() === unitId && worksheet?.getSheetId() === subUnitId) {
                        this.validatorRanges(unitId, subUnitId, ranges);
                    } else {
                        requestIdleCallback(() => {
                            this.validatorRanges(unitId, subUnitId, ranges);
                        });
                    }
                });
            });
        };

        this.disposeWithMe(this._dataValidationCacheService.dirtyRanges$.pipe(bufferWhen(() => this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered)))).subscribe(handleDirtyRanges));
        this.disposeWithMe(this._dataValidationCacheService.dirtyRanges$.pipe(filter(() => this._lifecycleService.stage >= LifecycleStages.Rendered), bufferDebounceTime(20)).subscribe(handleDirtyRanges));
    }

    private async _validatorByCell(workbook: Workbook, worksheet: Worksheet, row: number, col: number) {
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        if (!Tools.isDefine(row) || !Tools.isDefine(col)) {
            throw new Error(`row or col is not defined, row: ${row}, col: ${col}`);
        }

        const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
        if (!rule) {
            return DataValidationStatus.VALID;
        }

        return new Promise<DataValidationStatus>((resolve) => {
            this._sheetDataValidationModel.validator(rule, { unitId, subUnitId, row, col, worksheet, workbook }, (status) => {
                resolve(status);
            });
        });
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

        return this._validatorByCell(workbook, worksheet, row, col);
    }

    validatorRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        if (!ranges.length) {
            return Promise.resolve([]);
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new Error(`cannot find current workbook, unitId: ${unitId}`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`cannot find current worksheet, sheetId: ${subUnitId}`);
        }

        return Promise.all(ranges.map((range) => {
            const promises: Promise<DataValidationStatus>[] = [];
            Range.foreach(range, (row, col) => {
                promises.push(this._validatorByCell(workbook, worksheet, row, col));
            });
            return Promise.all(promises);
        }));
    }

    async validatorWorksheet(unitId: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new Error(`cannot find current workbook, unitId: ${unitId}`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`cannot find current worksheet, sheetId: ${subUnitId}`);
        }
        const rules = this._sheetDataValidationModel.getRules(unitId, subUnitId);
        await Promise.all(rules.map((rule) => {
            return Promise.all(rule.ranges.map((range) => {
                const promises: Promise<DataValidationStatus>[] = [];
                Range.foreach(range, (row, col) => {
                    promises.push(this._validatorByCell(workbook, worksheet, row, col));
                });
                return promises;
            }));
        }));

        return this._dataValidationCacheService.ensureCache(unitId, subUnitId);
    }

    async validatorWorkbook(unitId: string) {
        const sheetIds = this._sheetDataValidationModel.getSubUnitIds(unitId);
        const results = await Promise.all(sheetIds.map((id) => this.validatorWorksheet(unitId, id)));

        const map: Record<string, ObjectMatrix<Nullable<DataValidationStatus>>> = {};

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
