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
import { DataValidationStatus } from '@univerjs/core';
import { SheetDataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IDataValidationError {
    sheetName: string;

    /** The row of the cell that triggered the error */
    row: number;
    column: number;

    /** The ID of the rule that triggered the error */
    ruleId: string;

    /** The input value that triggered the error */
    inputValue: string | number | boolean | null;

    /** The rule content snapshot (optional, to avoid tracing back to the rule after modification) */
    rule?: IDataValidationRule;
}

/**
 * @ignore
 */
export interface IFWorkbookSheetsDataValidationMixin {
    /**
     * Get data validation validator status for current workbook.
     * @returns A promise that resolves to a matrix of validator status.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const status = await fWorkbook.getValidatorStatus();
     * console.log(status);
     * ```
     */
    getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<DataValidationStatus>>>>;

    /**
     * Get all data validation errors for current workbook.
     * @returns A promise that resolves to an array of validation errors.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const errors = await fWorkbook.getAllDataValidationError();
     * console.log(errors);
     * ```
     */
    getAllDataValidationErrorAsync(): Promise<IDataValidationError[]>;
}

/**
 * @ignore
 */
export class FWorkbookSheetsDataValidationMixin extends FWorkbook implements IFWorkbookSheetsDataValidationMixin {
    declare _dataValidationModel: SheetDataValidationModel;

    override _initialize(): void {
        Object.defineProperty(this, '_dataValidationModel', {
            get() {
                return this._injector.get(SheetDataValidationModel);
            },
        });
    }

    override getValidatorStatus(): Promise<Record<string, ObjectMatrix<Nullable<DataValidationStatus>>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorkbook(this._workbook.getUnitId());
    }

    override async getAllDataValidationErrorAsync(): Promise<IDataValidationError[]> {
        const unitId = this._workbook.getUnitId();
        const sheetIds = this._dataValidationModel.getSubUnitIds(unitId);

        const allErrors: IDataValidationError[] = [];

        for (const sheetId of sheetIds) {
            const sheetErrors = await this._collectValidationErrorsForSheet(unitId, sheetId);
            allErrors.push(...sheetErrors);
        }

        return allErrors;
    }

    private async _collectValidationErrorsForSheet(unitId: string, sheetId: string): Promise<IDataValidationError[]> {
        const rules = this._dataValidationModel.getRules(unitId, sheetId);
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
        const workbook = this._workbook;
        const worksheet = workbook.getSheetBySheetId(sheetId);

        if (!worksheet) {
            throw new Error(`Cannot find worksheet with sheetId: ${sheetId}`);
        }

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
                                const rule = this._dataValidationModel.getRuleByLocation(unitId, sheetId, row, col);
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

FWorkbook.extend(FWorkbookSheetsDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsDataValidationMixin { }
}
