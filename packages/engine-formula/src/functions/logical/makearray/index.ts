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

import type { AsyncObject } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';
import { ErrorType } from '../../../basics/error-type';
import { AsyncArrayObject } from '../../../engine/reference-object/base-reference-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Makearray extends BaseFunction {
    protected readonly excelCompatibility: boolean = false;

    override minParams = 3;

    override maxParams = 3;

    override calculate(...variants: BaseValueObject[]) {
        const row = this._getDimension(variants[0]);

        if (typeof row !== 'number') {
            return row;
        }

        const column = this._getDimension(variants[1]);

        if (typeof column !== 'number') {
            return column;
        }

        if (!(variants[2].isValueObject() && (variants[2] as LambdaValueObjectObject).isLambda())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lambda = variants[2] as LambdaValueObjectObject;
        if (this.excelCompatibility && !lambda.acceptsArity(2)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result: Array<Array<BaseValueObject | AsyncObject>> = [];

        for (let r = 0; r < row; r++) {
            if (result[r] == null) {
                result[r] = [];
            }
            for (let c = 0; c < column; c++) {
                let value = lambda.execute(NumberValueObject.create(r + 1), NumberValueObject.create(c + 1));

                if (value.isArray()) {
                    const output = value as ArrayValueObject;
                    if (this.excelCompatibility && (output.getRowCount() > 1 || output.getColumnCount() > 1)) {
                        return ErrorValueObject.create(ErrorType.CALC);
                    }
                    value = output.get(0, 0) as BaseValueObject;
                }

                result[r][c] = value;
            }
        }

        return new AsyncArrayObject(result);
    }

    override isAsync(): boolean {
        return true;
    }

    private _getDimension(value: BaseValueObject): number | BaseValueObject {
        const scalar = value.isArray() ? (value as ArrayValueObject).getFirstCell() : value;
        if (scalar.isError()) {
            return scalar;
        }
        const dimension = this.getIndexNumValue(scalar);
        if (typeof dimension !== 'number' || !Number.isFinite(dimension) || dimension < 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (this.excelCompatibility && !Number.isInteger(dimension)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return Math.floor(dimension);
    }
}
