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

import type { Nullable, ObjectMatrix } from '@univerjs/core';
import type { IDataValidationResCache } from '@univerjs/sheets-data-validation';
import type { IFICanvasFloatDom } from './f-workbook';
import { FWorksheet } from '@univerjs/sheets/facade';
import { DataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { FDataValidation } from '@univerjs/sheets-data-validation/facade';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ComponentManager } from '@univerjs/ui';
import { FThreadComment } from './f-thread-comment';
import { transformComponentKey } from './utils';

export interface IFWorksheetLegacy {
    /**
     * get all data validation rules in current sheet
     * @returns all data validation rules
     */
    getDataValidations(): FDataValidation[];
    /**
     * get data validation validator status for current sheet
     * @returns matrix of validator status
     */
    getValidatorStatus(): Promise<ObjectMatrix<Nullable<IDataValidationResCache>>>;
    /**
     * Get all comments in the current sheet
     * @returns all comments in the current sheet
     */
    getComments(): FThreadComment[];
    /**
     * add a float dom to position
     * @param layer float dom config
     * @param id float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;
}

class FWorksheetLegacy extends FWorksheet implements IFWorksheetLegacy {
    override getDataValidations(): FDataValidation[] {
        const dataValidationModel = this._injector.get(DataValidationModel);
        return dataValidationModel.getRules(this._workbook.getUnitId(), this._worksheet.getSheetId()).map((rule) => new FDataValidation(rule));
    }

    override getValidatorStatus(): Promise<ObjectMatrix<Nullable<IDataValidationResCache>>> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorWorksheet(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }

    override getComments(): FThreadComment[] {
        const sheetsTheadCommentModel = this._injector.get(SheetsThreadCommentModel);
        const comments = sheetsTheadCommentModel.getSubUnitAll(this._workbook.getUnitId(), this._worksheet.getSheetId());
        return comments.map((comment) => this._injector.createInstance(FThreadComment, comment));
    }

    override addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const res = floatDomService.addFloatDomToPosition({ ...layer, componentKey: key, unitId, subUnitId }, id);

        if (res) {
            disposableCollection.add(res.dispose);
            return {
                id: res.id,
                dispose: (): void => {
                    disposableCollection.dispose();
                    res.dispose();
                },
            };
        }

        disposableCollection.dispose();
        return null;
    }
}

FWorksheet.extend(FWorksheetLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetLegacy {}
}
