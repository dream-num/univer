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

import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';

export function resolveSingleCellArgument(value: FunctionVariantType): BaseValueObject {
    if (!value.isReferenceObject()) return value as BaseValueObject;
    const reference = value as BaseReferenceObject;
    const range = reference.getRangePosition();
    if (range.startRow !== range.endRow || range.startColumn !== range.endColumn) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    return reference.toArrayValueObject().getFirstCell();
}

export function mapFinancialScalars(
    args: BaseValueObject[],
    calculate: (args: BaseValueObject[], row: number, column: number) => BaseValueObject,
    preserveSingletonArray = false
): BaseValueObject {
    const arrays = args.filter((value): value is ArrayValueObject => value.isArray());
    if (arrays.length === 0) return calculate(args, 0, 0);
    const rows = Math.max(...arrays.map((value) => value.getRowCount()));
    const columns = Math.max(...arrays.map((value) => value.getColumnCount()));
    const expanded = args.map((value) => expandArrayValueObject(rows, columns, value, ErrorValueObject.create(ErrorType.NA)));
    const result = expanded[0].mapValue((_, row, column) => calculate(expanded.map((array) => array.get(row, column) as BaseValueObject), row, column));
    return rows === 1 && columns === 1 && !preserveSingletonArray ? result.getFirstCell() : result;
}
