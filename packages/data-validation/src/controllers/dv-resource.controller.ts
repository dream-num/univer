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

import type { ISheetDataValidationRule } from '@univerjs/core';
import { Disposable, Inject, IResourceManagerService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel } from '../models/data-validation-model';

type DataValidationJSON = Record<string, ISheetDataValidationRule[]>;

const DATA_VALIDATION_PLUGIN_NAME = 'SHEET_DATA_VALIDATION_PLUGIN';

export class DataValidationResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
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
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<DataValidationJSON>({
                pluginName: DATA_VALIDATION_PLUGIN_NAME,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._dataValidationModel.deleteUnitRules(unitID);
                },
                onLoad: (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const ruleList = value[subunitId];
                        ruleList.forEach((rule) => {
                            this._dataValidationModel.addRule(unitID, subunitId, rule, 'patched');
                        });
                    });
                },
            })
        );
    }
}
