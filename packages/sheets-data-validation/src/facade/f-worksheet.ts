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

import type { IDataValidationRule, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import type { IDataValidationError } from './f-workbook';
import { DataValidationStatus } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { SheetDataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FWorksheet } from '@univerjs/sheets/facade';
import { FDataValidation } from './f-data-validation';

/**
 * @ignore
 */
export interface IFWorksheetDataValidationMixin {
    /**
     * Get all data validation rules in current sheet.
     * @returns {FDataValidation[]} All data validation rules
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * console.log(rules);
     * ```
     */
    getDataValidations(): FDataValidation[];

    /**
     * @deprecated use `getValidatorStatusAsync` instead
     */
    getValidatorStatus(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>>;

    /**
     * Get data validation validator status for current sheet.
     * @returns {Promise<ObjectMatrix<Nullable<DataValidationStatus>>>} matrix of validator status
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const status = await fWorksheet.getValidatorStatusAsync();
     * console.log(status);
     * ```
     */
    getValidatorStatusAsync(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>>;

    /**
     * get data validation rule by rule id
     * @param ruleId - the rule id
     * @returns {Nullable<FDataValidation>} data validation rule
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getDataValidations();
     * console.log(fWorksheet.getDataValidation(rules[0]?.rule.uid));
     * ```
     */
    getDataValidation(ruleId: string): Nullable<FDataValidation>;

    /**
     * Get all data validation errors for current worksheet.
     * @returns A promise that resolves to an array of validation errors.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const errors = await fWorksheet.getAllDataValidationError();
     * console.log(errors);
     * ```
     */
    getAllDataValidationErrorAsync(): Promise<IDataValidationError[]>;
}

/**
 * @ignore
 */
export class FWorksheetDataValidationMixin extends FWorksheet implements IFWorksheetDataValidationMixin {
    override getDataValidations(): FDataValidation[] {
        const dataValidationModel = this._injector.get(DataValidationModel);
        return dataValidationModel.getRules(this._workbook.getUnitId(), this._worksheet.getSheetId()).map((rule) => new FDataValidation(rule, this._worksheet, this._injector));
    }

    override getValidatorStatus(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorksheet(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }

    override getValidatorStatusAsync(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>> {
        return this.getValidatorStatus();
    }

    override getDataValidation(ruleId: string): Nullable<FDataValidation> {
        const dataValidationModel = this._injector.get(DataValidationModel);
        const rule = dataValidationModel.getRuleById(this._workbook.getUnitId(), this._worksheet.getSheetId(), ruleId);
        if (rule) {
            return new FDataValidation(rule, this._worksheet, this._injector);
        }
        return null;
    }

    override async getAllDataValidationErrorAsync(): Promise<IDataValidationError[]> {
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();

        return this._collectValidationErrorsForSheet(unitId, sheetId);
    }

    private async _collectValidationErrorsForSheet(unitId: string, sheetId: string): Promise<IDataValidationError[]> {
        const dataValidationModel = this._injector.get(DataValidationModel);
        const rules = dataValidationModel.getRules(unitId, sheetId);
        if (!rules.length) {
            return [];
        }

        const allRanges = rules.flatMap((rule) => rule.ranges);
        return this._collectValidationErrorsForRange(unitId, sheetId, allRanges);
    }

    private async _collectValidationErrorsForRange(unitId: string, sheetId: string, ranges: IRange[]): Promise<IDataValidationError[]> {
        if (!ranges.length) {
            return [];
        }

        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        const worksheet = this._worksheet;
        const sheetName = worksheet.getName();
        const errors: IDataValidationError[] = [];

        for (const range of ranges) {
            const promises: Promise<void>[] = [];

            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    promises.push((async (): Promise<void> => {
                        try {
                            const status = await validatorService.validatorCell(unitId, sheetId, row, col);

                            // Only collect errors (non-VALID status)
                            if (status !== DataValidationStatus.VALID) {
                                const dataValidationModel = this._injector.get(SheetDataValidationModel);
                                const rule = dataValidationModel.getRuleByLocation(unitId, sheetId, row, col);
                                if (rule) {
                                    const cellValue = worksheet.getCell(row, col)?.v || null;
                                    const error = this._createDataValidationError(
                                        sheetName,
                                        row,
                                        col,
                                        rule,
                                        cellValue
                                    );
                                    errors.push(error);
                                }
                            }
                        } catch (e) {
                            // Skip cells that can't be validated
                            console.warn(`Failed to validate cell [${row}, ${col}]:`, e);
                        }
                    })());
                }
            }

            await Promise.all(promises);
        }

        return errors;
    }

    private _createDataValidationError(
        sheetName: string,
        row: number,
        column: number,
        rule: IDataValidationRule,
        inputValue: string | number | boolean | null
    ): IDataValidationError {
        return {
            sheetName,
            row,
            column,
            ruleId: rule.uid,
            inputValue,
            rule,
        };
    }
}

FWorksheet.extend(FWorksheetDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDataValidationMixin {}
}
