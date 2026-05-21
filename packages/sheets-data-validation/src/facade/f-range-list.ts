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

import type { CellValue, Nullable } from '@univerjs/core';
import type { IAddSheetDataValidationCommandParams, IClearRangeDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import type { FRange } from '@univerjs/sheets/facade';
import type { FDataValidation } from './f-data-validation';
import type { IFRangeSheetsDataValidationMixin } from './f-range';
import { DataValidationType } from '@univerjs/core';
import { AddSheetDataValidationCommand, CHECKBOX_FORMULA_1, CHECKBOX_FORMULA_2, ClearRangeDataValidationCommand } from '@univerjs/sheets-data-validation';
import { FRangeList } from '@univerjs/sheets/facade';
import { FDataValidationBuilder } from './f-data-validation-builder';

/**
 * @ignore
 */
export interface IFRangeListSheetsDataValidationMixin {
    /**
     * Set one data validation rule to every range in the range list. Pass null to clear data validations.
     * This follows Univer's data validation builder API instead of checkbox-specific convenience overloads.
     * @param {Nullable<FDataValidation>} rule The data validation rule built by `FUniver.newDataValidation`, or null to clear.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const rule = univerAPI.newDataValidation().requireCheckbox().build();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).setDataValidation(rule);
     * ```
     */
    setDataValidation(rule: Nullable<FDataValidation>): FRangeList;

    /**
     * Inserts checkbox data validations into every range in the range list.
     * @param {string} [checkedValue] Optional checked value.
     * @param {string} [uncheckedValue] Optional unchecked value.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).insertCheckboxes('Yes', 'No');
     * ```
     */
    insertCheckboxes(checkedValue?: string, uncheckedValue?: string): FRangeList;

    /**
     * Removes checkbox data validations from every range in the range list.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).removeCheckboxes();
     * ```
     */
    removeCheckboxes(): FRangeList;

    /**
     * Sets every checkbox in the range list to its checked value.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).check();
     * ```
     */
    check(): FRangeList;

    /**
     * Sets every checkbox in the range list to its unchecked value.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).uncheck();
     * ```
     */
    uncheck(): FRangeList;

    /**
     * Clear data validation rules from every range in the range list.
     * @returns {FRangeList} The FRangeList instance for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).clearDataValidations();
     * ```
     */
    clearDataValidations(): FRangeList;
}

export class FRangeListSheetsDataValidationMixin extends FRangeList implements IFRangeListSheetsDataValidationMixin {
    override setDataValidation(rule: Nullable<FDataValidation>): FRangeList {
        if (!rule) {
            this.clearDataValidations();
            return this;
        }

        for (const [key, ranges] of this._getRangeGroups()) {
            const [unitId, subUnitId] = key.split(':');
            const params: IAddSheetDataValidationCommandParams = {
                unitId,
                subUnitId,
                rule: {
                    ...rule.rule,
                    ranges: ranges.map((range) => range.getRange()),
                },
            };

            this._commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, params);
        }
        return this;
    }

    override insertCheckboxes(checkedValue?: string, uncheckedValue?: string): FRangeList {
        const rule = new FDataValidationBuilder()
            .requireCheckbox(checkedValue, uncheckedValue)
            .build();

        return this.setDataValidation(rule);
    }

    override removeCheckboxes(): FRangeList {
        this._assertOnlyCheckboxDataValidations();
        return this.clearDataValidations();
    }

    override check(): FRangeList {
        return this._setCheckboxValue(true);
    }

    override uncheck(): FRangeList {
        return this._setCheckboxValue(false);
    }

    override clearDataValidations(): FRangeList {
        for (const [key, ranges] of this._getRangeGroups()) {
            const [unitId, subUnitId] = key.split(':');
            this._commandService.syncExecuteCommand(ClearRangeDataValidationCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
            } as IClearRangeDataValidationCommandParams);
        }
        return this;
    }

    private _setCheckboxValue(checked: boolean): FRangeList {
        for (const range of this.getRanges()) {
            range.setValue(this._getCheckboxValue(range, checked));
        }

        return this;
    }

    private _getCheckboxValue(range: FRange, checked: boolean): CellValue {
        const validations = this._getDataValidations(range);
        if (!validations.length) {
            throw new Error('Cannot set checkbox value because the range does not contain checkbox data validation');
        }

        let checkboxValue: CellValue | undefined;
        for (const validation of validations) {
            if (validation.getCriteriaType() !== DataValidationType.CHECKBOX) {
                throw new Error('Cannot set checkbox value because the range contains non-checkbox data validation');
            }

            const [, checkedValue = CHECKBOX_FORMULA_1, uncheckedValue = CHECKBOX_FORMULA_2] = validation.getCriteriaValues();
            const nextValue = checked ? checkedValue : uncheckedValue;
            if (checkboxValue !== undefined && String(checkboxValue) !== String(nextValue)) {
                throw new Error('Cannot set checkbox value because the range contains checkbox data validations with different values');
            }

            checkboxValue = nextValue;
        }

        return checkboxValue ?? (checked ? CHECKBOX_FORMULA_1 : CHECKBOX_FORMULA_2);
    }

    private _assertOnlyCheckboxDataValidations(): void {
        for (const range of this.getRanges()) {
            const validations = this._getDataValidations(range);
            if (validations.some((validation) => validation.getCriteriaType() !== DataValidationType.CHECKBOX)) {
                throw new Error('Cannot remove checkboxes because the range contains non-checkbox data validation');
            }
        }
    }

    private _getDataValidations(range: FRange): FDataValidation[] {
        return (range as FRange & IFRangeSheetsDataValidationMixin).getDataValidations();
    }
}

FRangeList.extend(FRangeListSheetsDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRangeList extends IFRangeListSheetsDataValidationMixin { }
}
