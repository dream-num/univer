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
import { Disposable, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { Inject, Injector } from '@wendellhu/redi';
import { DATA_VALIDATION_PLUGIN_NAME } from '../common/const';
import { SheetDataValidationManager } from '../models/sheet-data-validation-manager';

type DataValidationJSON = Record<string, ISheetDataValidationRule[]>;

@OnLifecycle(LifecycleStages.Ready, DataValidationResourceController)
export class DataValidationResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initDataValidationDataSource();
        this._initSnapshot();
    }

    private _createSheetDataValidationManager(unitId: string, subUnitId: string) {
        return new SheetDataValidationManager(
            unitId,
            subUnitId,
            [],
            this._injector
        );
    }

    private _initDataValidationDataSource() {
        this._dataValidationModel.setManagerCreator(this._createSheetDataValidationManager.bind(this));
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
                        Object.keys(value).forEach((subunitId) => {
                            const ruleList = value[subunitId];
                            ruleList.forEach((rule) => {
                                this._dataValidationModel.addRule(unitID, subunitId, rule);
                            });
                        });
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
