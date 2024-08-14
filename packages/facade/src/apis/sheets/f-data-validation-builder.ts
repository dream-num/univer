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

import type { IDataValidationRule } from '@univerjs/core';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType, generateRandomId } from '@univerjs/core';
import { serializeRangeToRefString } from '@univerjs/engine-formula';
import type { FRange } from './f-range';
import { FDataValidation } from './f-data-validation';

 /**
  * Builder for data validation rules.
  *
  *     Set the data validation for cell A1 to require a value from B1:B10.
  *     var rule = FUniver.newDataValidation().requireValueInRange(range).build();
  *     cell.setDataValidation(rule);
  */
export class FDataValidationBuilder {
    private _rule: IDataValidationRule;

    constructor(rule?: IDataValidationRule) {
        this._rule = rule ?? {
            uid: generateRandomId(),
            ranges: undefined,
            type: DataValidationType.CUSTOM,
        };
    }

    build(): FDataValidation {
        return new FDataValidation(this._rule);
    }

    copy(): FDataValidationBuilder {
        return new FDataValidationBuilder({
            ...this._rule,
            uid: generateRandomId(),
        });
    }

    getAllowInvalid(): boolean {
        return this._rule.errorStyle !== DataValidationErrorStyle.STOP;
    }

    getCriteriaType(): DataValidationType {
        return this._rule.type;
    }

    getCriteriaValues(): any[] {
        return [this._rule.operator, this._rule.formula1, this._rule.formula2];
    }

    getHelpText(): string | undefined {
        return this._rule.error;
    }

    requireCheckbox(checkedValue?: string, uncheckedValue?: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CHECKBOX;
        this._rule.formula1 = checkedValue;
        this._rule.formula2 = uncheckedValue;

        return this;
    }

    requireDateAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.operator = DataValidationOperator.GREATER_THAN;

        return this;
    }

    requireDateBefore(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN;

        return this;
    }

    requireDateBetween(start: Date, end: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = start.toLocaleDateString();
        this._rule.formula2 = end.toLocaleDateString();
        this._rule.operator = DataValidationOperator.BETWEEN;

        return this;
    }

    requireDateEqualTo(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.EQUAL;

        return this;
    }

    requireDateNotBetween(start: Date, end: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = start.toLocaleDateString();
        this._rule.formula2 = end.toLocaleDateString();
        this._rule.operator = DataValidationOperator.NOT_BETWEEN;

        return this;
    }

    requireDateOnOrAfter(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN_OR_EQUAL;

        return this;
    }

    requireDateOnOrBefore(date: Date): FDataValidationBuilder {
        this._rule.type = DataValidationType.DATE;
        this._rule.formula1 = date.toLocaleDateString();
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN_OR_EQUAL;

        return this;
    }

    requireFormulaSatisfied(formula: string): FDataValidationBuilder {
        this._rule.type = DataValidationType.CUSTOM;
        this._rule.formula1 = formula;
        this._rule.formula2 = undefined;
        return this;
    }

    requireNumberBetween(start: number, end: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${start}`;
        this._rule.formula2 = `${end}`;
        this._rule.operator = DataValidationOperator.BETWEEN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;

        return this;
    }

    requireNumberEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireNumberGreaterThan(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireNumberGreaterThanOrEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.GREATER_THAN_OR_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireNumberLessThan(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireNumberLessThanOrEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.LESS_THAN_OR_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireNumberNotBetween(start: number, end: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${start}`;
        this._rule.formula2 = `${end}`;
        this._rule.operator = DataValidationOperator.NOT_BETWEEN;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;

        return this;
    }

    requireNumberNotEqualTo(num: number, isInteger?: boolean): FDataValidationBuilder {
        this._rule.formula1 = `${num}`;
        this._rule.formula2 = undefined;
        this._rule.operator = DataValidationOperator.NOT_EQUAL;
        this._rule.type = isInteger ? DataValidationType.WHOLE : DataValidationType.DECIMAL;
        return this;
    }

    requireValueInList(values: string[], multiple?: boolean, showDropdown?: boolean): FDataValidationBuilder {
        this._rule.type = multiple ? DataValidationType.LIST_MULTIPLE : DataValidationType.LIST;
        this._rule.formula1 = values.join(',');
        this._rule.formula2 = undefined;
        this._rule.showDropDown = showDropdown ?? true;

        return this;
    }

    requireValueInRange(range: FRange, multiple?: boolean, showDropdown?: boolean): FDataValidationBuilder {
        this._rule.type = multiple ? DataValidationType.LIST_MULTIPLE : DataValidationType.LIST;
        this._rule.formula1 = `=${serializeRangeToRefString({
            unitId: range.getUnitId(),
            sheetName: range.getSheetName(),
            range: range.getRange(),
        })}`;
        this._rule.formula2 = undefined;
        this._rule.showDropDown = showDropdown ?? true;

        return this;
    }

    setAllowInvalid(allowInvalidData: boolean): FDataValidationBuilder {
        this._rule.errorStyle = !allowInvalidData ? DataValidationErrorStyle.STOP : DataValidationErrorStyle.WARNING;
        return this;
    }

    setHelpText(helpText: string): FDataValidationBuilder {
        this._rule.error = helpText;
        this._rule.showErrorMessage = true;
        return this;
    }

    withCriteriaValues(type: DataValidationType, values: [DataValidationOperator, string, string]) {
        this._rule.type = type;
        this._rule.operator = values[0];
        this._rule.formula1 = values[1];
        this._rule.formula2 = values[2];
        return this;
    }
}
