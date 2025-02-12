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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Switch extends BaseFunction {
    override minParams = 3;

    override calculate(expression: BaseValueObject, ...args: BaseValueObject[]) {
        if (expression.isError()) {
            return expression;
        }

        const hasDefault = args.length % 2 !== 0;
        const defaultValue = hasDefault ? args[args.length - 1] : NullValueObject.create();

        if (!expression.isArray() && !args.some((arg) => arg.isArray())) {
            return this._handleNonArrayInputs(expression, args, defaultValue, hasDefault);
        }

        return this._handleArrayInputs(expression, args, defaultValue, hasDefault);
    }

    private _handleNonArrayInputs(expression: BaseValueObject, args: BaseValueObject[], defaultValue: BaseValueObject, hasDefault: boolean) {
        for (let i = 0; i < args.length - (hasDefault ? 1 : 0); i += 2) {
            const switchValue = args[i];
            const resultValue = args[i + 1];

            if (switchValue.isNull()) {
                continue;
            }

            if (switchValue.isError()) {
                return switchValue;
            }

            if (`${expression.getValue()}`.toLocaleLowerCase() === `${switchValue.getValue()}`.toLocaleLowerCase()) {
                return resultValue.isNull() ? ErrorValueObject.create(ErrorType.NA) : resultValue;
            }
        }

        return defaultValue.isNull() ? ErrorValueObject.create(ErrorType.NA) : defaultValue;
    }

    private _handleArrayInputs(expression: BaseValueObject, args: BaseValueObject[], defaultValue: BaseValueObject, hasDefault: boolean) {
        const maxRowLength = Math.max(
            expression.isArray() ? (expression as ArrayValueObject).getRowCount() : 1,
            ...args.map((arg) => (arg.isArray() ? (arg as ArrayValueObject).getRowCount() : 1)),
            defaultValue.isArray() ? (defaultValue as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            expression.isArray() ? (expression as ArrayValueObject).getColumnCount() : 1,
            ...args.map((arg) => (arg.isArray() ? (arg as ArrayValueObject).getColumnCount() : 1)),
            defaultValue.isArray() ? (defaultValue as ArrayValueObject).getColumnCount() : 1
        );

        const expandedExpression = expandArrayValueObject(maxRowLength, maxColumnLength, expression);
        const expandedArgs = args.map((arg) =>
            expandArrayValueObject(maxRowLength, maxColumnLength, arg, ErrorValueObject.create(ErrorType.NA))
        );
        const expandedDefault = expandArrayValueObject(maxRowLength, maxColumnLength, defaultValue, ErrorValueObject.create(ErrorType.NA));

        return expandedExpression.map((expValue, rowIndex, columnIndex) => {
            for (let i = 0; i < expandedArgs.length - (hasDefault ? 1 : 0); i += 2) {
                const switchValue = expandedArgs[i].get(rowIndex, columnIndex) || NullValueObject.create();
                const resultValue = expandedArgs[i + 1].get(rowIndex, columnIndex) || NullValueObject.create();

                if (switchValue.isNull()) {
                    continue;
                }

                if (switchValue.isError() || expValue.isError()) {
                    return switchValue.isError() ? switchValue : expValue;
                }

                if (`${expValue.getValue()}`.toLocaleLowerCase() === `${switchValue.getValue()}`.toLocaleLowerCase()) {
                    return resultValue.isNull() ? ErrorValueObject.create(ErrorType.NA) : resultValue;
                }
            }

            const defaultCellValue = expandedDefault.get(rowIndex, columnIndex) || NullValueObject.create();
            return defaultCellValue.isNull() ? ErrorValueObject.create(ErrorType.NA) : defaultCellValue;
        });
    }
}
