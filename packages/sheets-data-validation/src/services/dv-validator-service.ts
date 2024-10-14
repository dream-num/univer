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

import type { IDataValidationRule, IRange, Nullable, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IDataValidationResCache } from './dv-cache.service';
import { DataValidationStatus, Disposable, ICommandService, Inject, IUniverInstanceService, LifecycleService, LifecycleStages, ObjectMatrix, Range, Tools, UniverInstanceType } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { bufferTime, bufferWhen, filter, Subject } from 'rxjs';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationCacheService } from './dv-cache.service';

export class SheetsDataValidationValidatorService extends Disposable {
    private _dirtyRanges$ = new Subject<{ unitId: string; subUnitId: string; ranges: IRange[]; tag: string }>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        super();
        this._initDirtyRanges();
        this._initRecalculate();
    }

    private _initDirtyRanges() {
        this.disposeWithMe(this._sheetDataValidationModel.ruleChange$.subscribe((ruleChange) => {
            if (ruleChange.type === 'add' || ruleChange.type === 'update') {
                this._dirtyRanges$.next({
                    unitId: ruleChange.unitId,
                    subUnitId: ruleChange.subUnitId,
                    ranges: ruleChange.rule.ranges,
                    tag: ruleChange.type,
                });
            }
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetRangeValuesMutation.id) {
                const { cellValue, unitId, subUnitId } = commandInfo.params as ISetRangeValuesMutationParams;
                if (cellValue) {
                    const range = new ObjectMatrix(cellValue).getDataRange();
                    if (range.endRow === -1) return;

                    this._dirtyRanges$.next({
                        unitId,
                        subUnitId,
                        ranges: [range],
                        tag: 'set',
                    });
                }
            }
        }));
    }

    private _initRecalculate() {
        const handleDirtyRanges = (ranges: { unitId: string; subUnitId: string; ranges: IRange[]; tag: string }[]) => {
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

        this.disposeWithMe(this._dirtyRanges$.pipe(bufferWhen(() => this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered)))).subscribe(handleDirtyRanges));
        this.disposeWithMe(this._dirtyRanges$.pipe(filter(() => this._lifecycleService.stage >= LifecycleStages.Rendered), bufferTime(100)).subscribe(handleDirtyRanges));
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
