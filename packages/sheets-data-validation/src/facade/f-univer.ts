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

import type { Injector } from '@univerjs/core';
import { FUniver } from '@univerjs/core';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { FDataValidation } from './f-data-validation';
import { FDataValidationBuilder } from './f-data-validation-builder';

export class FUnvierDataValidationMixin extends FUniver {
    /**
    /**
     * @deparecated use `univerAPI.newDataValidation()` as instead.
     */
    static override newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    override _initialize(injector: Injector): void {
        const sheetDataValidationModel = injector.get(SheetDataValidationModel);

        this.disposeWithMe(sheetDataValidationModel.ruleChange$.subscribe((ruleChange) => {
            const { unitId, subUnitId, rule, oldRule, type } = ruleChange;
            const target = this.getSheetTarget(unitId, subUnitId);
            if (!target) {
                return;
            }
            const { workbook, worksheet } = target;

            const fRule = new FDataValidation(rule, worksheet.getSheet(), this._injector);
            this.fireEvent(this.Event.SheetDataValidationChanged, {
                origin: ruleChange,
                worksheet,
                workbook,
                changeType: type,
                oldRule,
                rule: fRule,
            });
        }));

        this.disposeWithMe(sheetDataValidationModel.validStatusChange$.subscribe((statusChange) => {
            const { unitId, subUnitId, ruleId, status, row, col } = statusChange;
            const target = this.getSheetTarget(unitId, subUnitId);
            if (!target) {
                return;
            }
            const { workbook, worksheet } = target;
            const rule = worksheet.getDataValidation(ruleId);
            if (!rule) {
                return;
            }
            this.fireEvent(this.Event.SheetDataValidatorStatusChanged, {
                workbook,
                worksheet,
                row,
                column: col,
                rule,
                status,
            });
        }));
    }
}

FUniver.extend(FUnvierDataValidationMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/no-namespace
    namespace FUniver {
        function newDataValidation(): FDataValidationBuilder;
    }
}
