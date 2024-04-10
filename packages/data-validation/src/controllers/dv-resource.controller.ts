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

import type { ISheetDataValidationRule, Workbook } from '@univerjs/core';
import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { filter } from 'rxjs';
import { DataValidationModel } from '../models/data-validation-model';

type DataValidationJSON = Record<string, ISheetDataValidationRule[]>;

const DATA_VALIDATION_PLUGIN_NAME = 'SHEET_DATA_VALIDATION';

@OnLifecycle(LifecycleStages.Ready, DataValidationResourceController)
export class DataValidationResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService
    ) {
        super();
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._dataValidationModel.getUnitRules(unitID);
            const resultMap: DataValidationJSON = {};
            if (map) {
                map.forEach(([key, v]) => {
                    resultMap[key] = v;
                });
                return JSON.stringify(resultMap);
            }
            return '';
        };
        const parseJson = (json: string): DataValidationJSON => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        const handleWorkbookAdd = (workbook: Workbook) => {
            const unitID = workbook.getUnitId();
            this.disposeWithMe(
                this._resourceManagerService.registerPluginResource<DataValidationJSON>(unitID, DATA_VALIDATION_PLUGIN_NAME, {
                    toJson: (unitID) => toJson(unitID),
                    parseJson: (json) => parseJson(json),
                    onChange: (unitID, value) => {
                        const addRules = () => {
                            Object.keys(value).forEach((subunitId) => {
                                const ruleList = value[subunitId];
                                ruleList.forEach((rule) => {
                                    this._dataValidationModel.addRule(unitID, subunitId, rule);
                                });
                            });
                        };

                        if (typeof window !== 'undefined') {
                            this.disposeWithMe(
                                this._lifecycleService.lifecycle$.pipe(
                                    filter((stage) => stage === LifecycleStages.Rendered)
                                ).subscribe(addRules)
                            );
                        } else {
                            addRules();
                        }
                    },
                })
            );
        };
        this.disposeWithMe(toDisposable(this._univerInstanceService.sheetAdded$.subscribe(handleWorkbookAdd)));
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetDisposed$.subscribe((workbook) => {
                    const unitID = workbook.getUnitId();
                    this._resourceManagerService.disposePluginResource(unitID, DATA_VALIDATION_PLUGIN_NAME);
                })
            )
        );
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        handleWorkbookAdd(workbook);
    }
}
