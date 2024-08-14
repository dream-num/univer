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

import { DataValidationErrorStyle, type IDataValidationRule } from '@univerjs/core';

export class FDataValidation {
    rule: IDataValidationRule;
    constructor(rule: IDataValidationRule) {
        this.rule = rule;
    }

    getAllowInvalid() {
        return this.rule.errorStyle !== DataValidationErrorStyle.STOP;
    };

    getCriteriaType() {
        return this.rule.type;
    };

    getCriteriaValues() {
        return [this.rule.formula1, this.rule.formula2];
    }

    getHelpText() {
        return this.rule.error;
    };
}
