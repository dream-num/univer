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

import type { IDefinedNameMapItem } from '@univerjs/engine-formula';
import {
    Disposable,
    IResourceManagerService,
    UniverInstanceType,
} from '@univerjs/core';
import { IDefinedNamesService } from '@univerjs/engine-formula';

const SHEET_DEFINED_NAME_PLUGIN = 'SHEET_DEFINED_NAME_PLUGIN';

export const SCOPE_WORKBOOK_VALUE_DEFINED_NAME = 'AllDefaultWorkbook';

export class DefinedNameDataController extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const map = this._definedNamesService.getDefinedNameMap(unitId);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDefinedNameMapItem => {
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
            this._resourceManagerService.registerPluginResource<IDefinedNameMapItem>({
                pluginName: SHEET_DEFINED_NAME_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._definedNamesService.removeUnitDefinedName(unitId);
                },
                onLoad: (unitId, value) => {
                    this._definedNamesService.registerDefinedNames(unitId, value);
                },
            })
        );
    }
}
