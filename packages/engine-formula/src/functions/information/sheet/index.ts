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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sheet extends BaseFunction {
    override minParams = 0;

    override maxParams = 1;

    override needsReferenceObject = true;

    override needsSheetsInfo = true;

    override calculate(value?: FunctionVariantType): BaseValueObject {
        if (value?.isError()) {
            return value as ErrorValueObject;
        }

        const { sheetOrder, sheetNameMap } = this.getSheetsInfo();

        if (!value) {
            const sheetIndex = sheetOrder.findIndex((sheetId) => sheetId === this.subUnitId);

            return NumberValueObject.create(sheetIndex + 1);
        }

        if (value.isReferenceObject()) {
            const forcedSheetId = (value as BaseReferenceObject).getForcedSheetId();
            const defaultSheetId = (value as BaseReferenceObject).getDefaultSheetId();

            const sheetIndex = sheetOrder.findIndex((sheetId) => {
                if (forcedSheetId) {
                    return sheetId === forcedSheetId;
                } else {
                    return sheetId === defaultSheetId;
                }
            });

            return NumberValueObject.create(sheetIndex + 1);
        }

        if (value.isArray()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const inputValue = `${(value as BaseValueObject).getValue()}`.toLocaleLowerCase();

        const inputSheetId = Object.entries(sheetNameMap).find(([_, name]) => name.toLocaleLowerCase() === inputValue)?.[0];

        if (!inputSheetId) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const sheetIndex = sheetOrder.findIndex((sheetId) => sheetId === inputSheetId);

        return NumberValueObject.create(sheetIndex + 1);
    }
}
