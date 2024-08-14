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
import { DataValidationErrorStyle, DataValidationType, generateRandomId } from '@univerjs/core';

 /**
  * Builder for data validation rules.
  *
  *     // Set the data validation for cell A1 to require a value from B1:B10.
  *     var cell = SpreadsheetApp.getActive().getRange('A1');
  *     var range = SpreadsheetApp.getActive().getRange('B1:B10');
  *     var rule = SpreadsheetApp.newDataValidation().requireValueInRange(range).build();
  *     cell.setDataValidation(rule);
  */
interface IDataValidationBuilder {
    build(): IDataValidationRule;
    copy(): IDataValidationBuilder;
    getAllowInvalid(): boolean;
    getCriteriaType(): DataValidationType;
    getCriteriaValues(): any[];
    getHelpText(): string | undefined;
    requireCheckbox(): IDataValidationBuilder;
    requireCheckbox(checkedValue: any): IDataValidationBuilder;
    requireCheckbox(checkedValue: any, uncheckedValue: any): IDataValidationBuilder;
    // requireDate(): IDataValidationBuilder;
    requireDateAfter(date: Date): IDataValidationBuilder;
    requireDateBefore(date: Date): IDataValidationBuilder;
    requireDateBetween(start: Date, end: Date): IDataValidationBuilder;
    requireDateEqualTo(date: Date): IDataValidationBuilder;
    requireDateNotBetween(start: Date, end: Date): IDataValidationBuilder;
    requireDateOnOrAfter(date: Date): IDataValidationBuilder;
    requireDateOnOrBefore(date: Date): IDataValidationBuilder;
    requireFormulaSatisfied(formula: string): IDataValidationBuilder;
    requireNumberBetween(start: number, end: number): IDataValidationBuilder;
    requireNumberEqualTo(number: number): IDataValidationBuilder;
    requireNumberGreaterThan(number: number): IDataValidationBuilder;
    requireNumberGreaterThanOrEqualTo(number: number): IDataValidationBuilder;
    requireNumberLessThan(number: number): IDataValidationBuilder;
    requireNumberLessThanOrEqualTo(number: number): IDataValidationBuilder;
    requireNumberNotBetween(start: number, end: number): IDataValidationBuilder;
    requireNumberNotEqualTo(number: number): IDataValidationBuilder;
    requireTextContains(text: string): IDataValidationBuilder;
    requireTextDoesNotContain(text: string): IDataValidationBuilder;
    requireTextEqualTo(text: string): IDataValidationBuilder;
    requireTextIsEmail(): IDataValidationBuilder;
    requireTextIsUrl(): IDataValidationBuilder;
    requireValueInList(values: string[]): IDataValidationBuilder;
    requireValueInList(values: string[], showDropdown: boolean): IDataValidationBuilder;
    requireValueInRange(range: Range): IDataValidationBuilder;
    requireValueInRange(range: Range, showDropdown: boolean): IDataValidationBuilder;
    setAllowInvalid(allowInvalidData: boolean): IDataValidationBuilder;
    setHelpText(helpText: string): IDataValidationBuilder;
    withCriteria(criteria: DataValidationType, args: any[]): IDataValidationBuilder;
}

export class FDataValidationBuilder implements IDataValidationBuilder {
    private _rule: IDataValidationRule;

    constructor(rule?: IDataValidationRule) {
        this._rule = rule ?? {
            uid: generateRandomId(),
            ranges: undefined,
            type: DataValidationType.CUSTOM,
        };
    }

    build(): IDataValidationRule {
        return this._rule;
    }

    copy(): IDataValidationBuilder {
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
        return [this._rule.formula1, this._rule.formula2];
    }

    getHelpText(): string | undefined {
        return this._rule.error;
    }

    requireCheckbox(): IDataValidationBuilder;
    requireCheckbox(checkedValue: any): IDataValidationBuilder;
    requireCheckbox(checkedValue: any, uncheckedValue: any): IDataValidationBuilder;
    requireCheckbox(checkedValue?: string, uncheckedValue?: string): IDataValidationBuilder {
        this._rule.type = DataValidationType.CHECKBOX;
        this._rule.formula1 = checkedValue;
        this._rule.formula2 = uncheckedValue;

        return this;
    }

    // requireDate(): IDataValidationBuilder {
    //     throw new Error('Method not implemented.');
    // }

    requireDateAfter(date: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateBefore(date: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateBetween(start: Date, end: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateEqualTo(date: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateNotBetween(start: Date, end: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateOnOrAfter(date: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireDateOnOrBefore(date: Date): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireFormulaSatisfied(formula: string): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberBetween(start: number, end: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberEqualTo(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberGreaterThan(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberGreaterThanOrEqualTo(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberLessThan(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberLessThanOrEqualTo(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberNotBetween(start: number, end: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireNumberNotEqualTo(number: number): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireTextContains(text: string): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireTextDoesNotContain(text: string): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireTextEqualTo(text: string): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireTextIsEmail(): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireTextIsUrl(): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireValueInList(values: string[]): IDataValidationBuilder;
    requireValueInList(values: string[], showDropdown: boolean): IDataValidationBuilder;
    requireValueInList(values: unknown, showDropdown?: unknown): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    requireValueInRange(range: Range): IDataValidationBuilder;
    requireValueInRange(range: Range, showDropdown: boolean): IDataValidationBuilder;
    requireValueInRange(range: unknown, showDropdown?: unknown): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    setAllowInvalid(allowInvalidData: boolean): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    setHelpText(helpText: string): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }

    withCriteria(criteria: DataValidationType, args: any[]): IDataValidationBuilder {
        throw new Error('Method not implemented.');
    }
}
