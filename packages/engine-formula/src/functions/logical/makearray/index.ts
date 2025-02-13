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
import type { AsyncObject } from '../../../engine/reference-object/base-reference-object';
import { AsyncArrayObject } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Makearray extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(...variants: BaseValueObject[]) {
        const row = this.getIndexNumValue(variants[0]);

        if (typeof row !== 'number') {
            return row;
        }

        const column = this.getIndexNumValue(variants[1]);

        if (typeof column !== 'number') {
            return column;
        }

        if (!(variants[2].isValueObject() && (variants[2] as LambdaValueObjectObject).isLambda())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lambda = variants[2] as LambdaValueObjectObject;

        const result: Array<Array<BaseValueObject | AsyncObject>> = [];

        for (let r = 0; r < row; r++) {
            if (result[r] == null) {
                result[r] = [];
            }
            for (let c = 0; c < column; c++) {
                let value = lambda.execute(NumberValueObject.create(r + 1), NumberValueObject.create(c + 1));

                if (value.isArray()) {
                    value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                result[r][c] = value;
            }
        }

        return new AsyncArrayObject(result);
    }

    override isAsync(): boolean {
        return true;
    }
}
