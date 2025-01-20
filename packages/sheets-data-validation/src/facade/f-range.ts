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

import type { DataValidationStatus, Nullable } from '@univerjs/core';
import type { IAddSheetDataValidationCommandParams, IClearRangeDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import { AddSheetDataValidationCommand, ClearRangeDataValidationCommand, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FRange } from '@univerjs/sheets/facade';
import { FDataValidation } from './f-data-validation';

export interface IFRangeDataValidationMixin {
    /**
     * Set a data validation rule to current range. if rule is null, clear data validation rule.
     * @param {Nullable<FDataValidation>} rule data validation rule, build by `FUniver.newDataValidation`
     * @returns current range
     * @example
     * ```ts
     * const rule = FUniver.newDataValidation().requireValueInRange(range).build();
     * cell.setDataValidation(rule);
     * ```
     */
    setDataValidation(rule: Nullable<FDataValidation>): FRange;
    /**
     * Get first data validation rule in current range.
     * @returns {Nullable<FDataValidation>} data validation rule
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const worksheet = workbook.getActiveSheet();
     * const dataValidation = worksheet.getActiveRange().getDataValidation();
     * ```
     */
    getDataValidation(): Nullable<FDataValidation>;

    /**
     * Get all data validation rules in current range.
     * @returns {FDataValidation[]} all data validation rules
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const worksheet = workbook.getActiveSheet();
     * const dataValidations = worksheet.getActiveRange().getDataValidations();
     * ```
     */
    getDataValidations(): FDataValidation[];
    /**
     * Get data validation validator status for current range.
     * @returns {Promise<DataValidationStatus[][]>} matrix of validator status
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const worksheet = workbook.getActiveSheet();
     * const validatorStatus = worksheet.getActiveRange().getValidatorStatus();
     * ```
     */
    getValidatorStatus(): Promise<DataValidationStatus[][]>;
}

export class FRangeDataValidationMixin extends FRange implements IFRangeDataValidationMixin {
    override setDataValidation(rule: Nullable<FDataValidation>): FRange {
        if (!rule) {
            this._commandService.syncExecuteCommand(ClearRangeDataValidationCommand.id, {
                unitId: this._workbook.getUnitId(),
                subUnitId: this._worksheet.getSheetId(),
                ranges: [this._range],
            } as IClearRangeDataValidationCommandParams);

            return this;
        }

        const params: IAddSheetDataValidationCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            rule: {
                ...rule.rule,
                ranges: [this._range],
            },
        };

        this._commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, params);
        return this;
    }

    override getDataValidation(): Nullable<FDataValidation> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        const rule = validatorService.getDataValidation(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        );

        if (rule) {
            return new FDataValidation(rule, this._worksheet, this._injector);
        }

        return rule;
    }

    override getDataValidations(): FDataValidation[] {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.getDataValidations(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        ).map((rule) => new FDataValidation(rule, this._worksheet, this._injector));
    }

    override async getValidatorStatus(): Promise<DataValidationStatus[][]> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorRanges(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        );
    }
}

FRange.extend(FRangeDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeDataValidationMixin { }
}
