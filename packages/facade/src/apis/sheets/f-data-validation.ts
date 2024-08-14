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
import { FDataValidationBuilder } from './f-data-validation-builder';

export class FDataValidation {
    rule: IDataValidationRule;
    constructor(rule: IDataValidationRule) {
        this.rule = rule;
    }

    /**
     * Gets whether invalid data is allowed based on the error style value.
     *
     * @return true if invalid data is allowed, false otherwise.
     */
    getAllowInvalid() {
        return this.rule.errorStyle !== DataValidationErrorStyle.STOP;
    };

    /**
     * Gets the data validation type of the rule
     *
     * @returns {DataValidationType} The data validation type
     */
    getCriteriaType() {
        return this.rule.type;
    };

    /**
     * Gets the values used for criteria evaluation
     *
     * @returns {any[]} An array containing the operator, formula1, and formula2 values
     */
    getCriteriaValues() {
        return [this.rule.operator, this.rule.formula1, this.rule.formula2];
    }

    /**
     * Gets the help text information, which is used to provide users with guidance and support
     *
     * @returns {string | undefined} Returns the help text information. If there is no error message, it returns an undefined value.
     */
    getHelpText() {
        return this.rule.error;
    };

    /**
     * Creates a new instance of FDataValidationBuilder using the current rule object.
     * This method is useful for copying an existing data validation rule configuration.
     *
     * @return A new FDataValidationBuilder instance with the same rule configuration.
     */
    copy() {
        return new FDataValidationBuilder(this.rule);
    }
}
