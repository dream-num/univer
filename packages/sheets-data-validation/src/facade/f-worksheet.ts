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

import type { DataValidationStatus, Nullable, ObjectMatrix } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { FWorksheet } from '@univerjs/sheets/facade';
import { SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FDataValidation } from './f-data-validation';

export interface IFWorksheetDataValidationMixin {
    /**
     * get all data validation rules in current sheet
     * @returns all data validation rules
     */
    getDataValidations(): FDataValidation[];
    /**
     * get data validation validator status for current sheet
     * @returns matrix of validator status
     */
    getValidatorStatus(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>>;
}

export class FWorksheetDataValidationMixin extends FWorksheet implements IFWorksheetDataValidationMixin {
    override getDataValidations(): FDataValidation[] {
        const dataValidationModel = this._injector.get(DataValidationModel);
        return dataValidationModel.getRules(this._workbook.getUnitId(), this._worksheet.getSheetId()).map((rule) => new FDataValidation(rule));
    }

    override getValidatorStatus(): Promise<ObjectMatrix<Nullable<DataValidationStatus>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorksheet(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }
}

FWorksheet.extend(FWorksheetDataValidationMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDataValidationMixin {}
}
