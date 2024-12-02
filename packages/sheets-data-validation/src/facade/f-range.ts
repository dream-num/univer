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
import { FRange } from '@univerjs/sheets/facade';
import { AddSheetDataValidationCommand, ClearRangeDataValidationCommand, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FDataValidation } from './f-data-validation';

export interface IFRangeDataValidationMixin {
    /**
     * set a data validation rule to current range
     * @param rule data validation rule, build by `FUniver.newDataValidation`
     * @returns current range
     */
    setDataValidation(this: FRange, rule: Nullable<FDataValidation>): Promise<FRange>;
    /**
     * get first data validation rule in current range
     * @returns data validation rule
     */
    getDataValidation(this: FRange): Nullable<FDataValidation>;

    /**
     * get all data validation rules in current range
     * @returns all data validation rules
     */
    getDataValidations(this: FRange): FDataValidation[];
    getValidatorStatus(): Promise<Promise<DataValidationStatus>[][]>;
}

export class FRangeDataValidationMixin extends FRange implements IFRangeDataValidationMixin {
    override async setDataValidation(rule: Nullable<FDataValidation>): Promise<FRange> {
        if (!rule) {
            this._commandService.executeCommand(ClearRangeDataValidationCommand.id, {
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

        await this._commandService.executeCommand(AddSheetDataValidationCommand.id, params);
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
            return new FDataValidation(rule);
        }

        return rule;
    }

    override getDataValidations(): FDataValidation[] {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.getDataValidations(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        ).map((rule) => new FDataValidation(rule));
    }

    override async getValidatorStatus(): Promise<Promise<DataValidationStatus>[][]> {
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
