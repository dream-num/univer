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

import type { IDataValidationRule } from '../types/interfaces';

export class DataValidationManager<T extends IDataValidationRule> {
    private _dataValidations: T[];

    constructor(dataValidations: T[]) {
        this._dataValidations = dataValidations;
    }

    addRule(rule: T) {
        this._dataValidations.push(rule);
    }

    removeRule(ruleId: string) {
        const index = this._dataValidations.findIndex((item) => item.uid === ruleId);
        this._dataValidations.splice(index, 1);
    }

    removeAll() {
        this._dataValidations.splice(0, this._dataValidations.length);
    }

    toJSON() {
        return this._dataValidations;
    }
}
