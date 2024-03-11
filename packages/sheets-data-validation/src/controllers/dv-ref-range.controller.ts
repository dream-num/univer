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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core';
import { Disposable, DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import type { IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { DataValidationModel, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { removeDataValidationUndoFactory } from '@univerjs/data-validation/commands/commands/data-validation.command.js';
import { isRangesEqual } from '../utils/isRangesEqual';

@OnLifecycle(LifecycleStages.Rendered, DataValidationRefRangeController)
export class DataValidationRefRangeController extends Disposable {
    constructor(
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(RefRangeService) private _refRangeService: RefRangeService) {
        super();
        this._initRefRange();
    }

    private _initRefRange() {
        const disposableMap: Map<string, () => void> = new Map();
        const getIdWithUnitId = (unitID: string, subUnitId: string, ruleId: string) => `${unitID}_${subUnitId}_${ruleId}`;
        const register = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
            const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
                const oldRanges = [...rule.ranges];
                const resultRanges = oldRanges.map((range) => {
                    return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange;
                }).filter((range) => !!range);
                const isEqual = isRangesEqual(resultRanges, oldRanges);
                if (isEqual) {
                    return { redos: [], undos: [] };
                }
                if (resultRanges.length) {
                    const redoParams: IUpdateDataValidationMutationParams = {
                        unitId,
                        subUnitId,
                        ruleId: rule.uid,
                        payload: {
                            type: UpdateRuleType.RANGE,
                            payload: resultRanges,
                        },
                    };
                    // in ref-range case, there won't be any overlap about rule ranges
                    const redos = [{ id: UpdateDataValidationMutation.id, params: redoParams }];
                    const undos = [{
                        id: UpdateDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: rule.uid,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: oldRanges,
                            },
                        },
                    }];
                    return { redos, undos };
                } else {
                    const redoParams: IRemoveDataValidationMutationParams = { unitId, subUnitId, ruleId: rule.uid };
                    const redos = [{ id: RemoveDataValidationMutation.id, params: redoParams }];
                    const undos = removeDataValidationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                }
            };
            const disposeList: (() => void)[] = [];
            rule.ranges.forEach((range) => {
                const disposable = this._refRangeService.registerRefRange(range, handleRangeChange);
                disposeList.push(() => disposable.dispose());
            });
            disposableMap.set(getIdWithUnitId(unitId, subUnitId, rule.uid), () => disposeList.forEach((dispose) => dispose()));
        };

        this.disposeWithMe(
            merge(
                this._sheetSkeletonManagerService.currentSkeleton$.pipe(
                    map((skeleton) => skeleton?.sheetId),
                    distinctUntilChanged()
                )
            )
                .pipe(
                    switchMap(
                        () =>
                            new Observable<DisposableCollection>((subscribe) => {
                                const disposableCollection = new DisposableCollection();
                                subscribe.next(disposableCollection);
                                return () => {
                                    disposableCollection.dispose();
                                };
                            })
                    )
                ).subscribe((disposableCollection) => {
                    disposableCollection.add(
                        toDisposable(
                            this._dataValidationModel.ruleChange$.subscribe((option) => {
                                const { unitId, subUnitId, rule } = option;
                                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                                const worksheet = workbook.getActiveSheet();
                                if (option.unitId !== workbook.getUnitId() || option.subUnitId !== worksheet.getSheetId()) {
                                    return;
                                }
                                switch (option.type) {
                                    case 'add':{
                                        register(option.unitId, option.subUnitId, option.rule!);
                                        break;
                                    }
                                    case 'remove':{
                                        const dispose = disposableMap.get(getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        dispose && dispose();
                                        break;
                                    }
                                    case 'update':{
                                        const dispose = disposableMap.get(getIdWithUnitId(unitId, subUnitId, rule!.uid));
                                        dispose && dispose();
                                        register(option.unitId, option.subUnitId, option.rule!);
                                    }
                                }
                            })));
                }));

        this.disposeWithMe(toDisposable(() => {
            disposableMap.forEach((item) => {
                item();
            });
            disposableMap.clear();
        }));
    }
}
