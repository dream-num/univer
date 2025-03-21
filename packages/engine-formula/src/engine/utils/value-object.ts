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

import type { ICellData, Nullable } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { CellValueType } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { CellReferenceObject } from '../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../reference-object/column-reference-object';
import { RowReferenceObject } from '../reference-object/row-reference-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../value-object/primitive-object';
import { expandArrayValueObject } from './array-object';
import { booleanObjectIntersection, findCompareToken, valueObjectCompare } from './object-compare';

export function convertTonNumber(valueObject: BaseValueObject) {
    const currentValue = valueObject.getValue();
    let result = 0;
    if (currentValue) {
        result = 1;
    }
    return NumberValueObject.create(result);
}

export function isSingleValueObject(valueObject: FunctionVariantType) {
    if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
        return true;
    }

    if (valueObject.isReferenceObject()) {
        if ((valueObject as BaseReferenceObject).isCell()) {
            return true;
        }

        if ((valueObject as BaseReferenceObject).getRowCount() === 1 && (valueObject as BaseReferenceObject).getColumnCount() === 1) {
            return true;
        }

        return false;
    }

    valueObject = valueObject as BaseValueObject;

    if (valueObject.isString() || valueObject.isNumber() || valueObject.isBoolean() || valueObject.isError() || valueObject.isNull()) {
        return true;
    }

    return false;
}

/**
 * Covert BaseValueObject to cell value
 * @param objectValue
 * @returns
 */
export function objectValueToCellValue(objectValue: Nullable<BaseValueObject>): ICellData | undefined {
    const pattern = objectValue?.getPattern();
    let cellWithStyle: ICellData = {};
    let cellWithCustomData: ICellData = {};

    if (pattern) {
        cellWithStyle = {
            s: {
                n: {
                    pattern,
                },
            },
        };
    }

    if (objectValue?.getCustomData()) {
        cellWithCustomData = {
            custom: objectValue.getCustomData(),
        };
    }

    if (objectValue == null) {
        return {
            v: null,
            ...cellWithStyle,
        };
    }
    if (objectValue.isError()) {
        return {
            v: (objectValue as ErrorValueObject).getErrorType() as string,
            t: CellValueType.STRING,
            ...cellWithStyle,
            ...cellWithCustomData,
        };
    }
    if (objectValue.isValueObject()) {
        const vo = objectValue as BaseValueObject;
        const v = vo.getValue();
        if (vo.isNumber()) {
            return {
                v,
                t: CellValueType.NUMBER,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }
        if (vo.isBoolean()) {
            return {
                v: v ? 1 : 0,
                t: CellValueType.BOOLEAN,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }
        // String "00"
        // =IF(1,"0") evaluates to "0", which should be a normal string (regardless of whether it is a number or not). Forced strings only appear when preceded by single quotes
        if (vo.isString()) {
            return {
                v,
                t: CellValueType.STRING,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }

        if (vo.isNull()) {
            return {
                v: null,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }

        return {
            v,
            t: CellValueType.STRING,
            ...cellWithStyle,
            ...cellWithCustomData,
        };
    }
}

/**
 * The size of the extended range is determined by the maximum width and height of the criteria range.
 * @param variants
 * @returns
 */
export function calculateMaxDimensions(variants: BaseValueObject[]) {
    let maxRowLength = 0;
    let maxColumnLength = 0;

    variants.forEach((variant, i) => {
        if (i % 2 === 1) {
            if (variant.isArray()) {
                const arrayValue = variant as ArrayValueObject;
                maxRowLength = Math.max(maxRowLength, arrayValue.getRowCount());
                maxColumnLength = Math.max(maxColumnLength, arrayValue.getColumnCount());
            } else {
                maxRowLength = Math.max(maxRowLength, 1);
                maxColumnLength = Math.max(maxColumnLength, 1);
            }
        }
    });

    return { maxRowLength, maxColumnLength };
}

export function getErrorArray(variants: BaseValueObject[], sumRange: BaseValueObject, maxRowLength: number, maxColumnLength: number) {
    const sumRowLength = (sumRange as ArrayValueObject).getRowCount();
    const sumColumnLength = (sumRange as ArrayValueObject).getColumnCount();

    for (let i = 0; i < variants.length; i++) {
        if (i % 2 === 1) continue;

        const range = variants[i];

        const rangeRowLength = (range as ArrayValueObject).getRowCount();
        const rangeColumnLength = (range as ArrayValueObject).getColumnCount();
        if (rangeRowLength !== sumRowLength || rangeColumnLength !== sumColumnLength) {
            return expandArrayValueObject(maxRowLength, maxColumnLength, ErrorValueObject.create(ErrorType.VALUE));
        }
    }

    return null;
}

export function getBooleanResults(variants: BaseValueObject[], maxRowLength: number, maxColumnLength: number, isNumberSensitive: boolean = false) {
    const booleanResults: BaseValueObject[][] = [];

    for (let i = 0; i < variants.length; i++) {
        if (i % 2 === 1) continue;

        const range = variants[i];
        const criteria = variants[i + 1];
        const criteriaArray = expandArrayValueObject(maxRowLength, maxColumnLength, criteria, ErrorValueObject.create(ErrorType.NA));

        criteriaArray.iterator((criteriaValueObject, rowIndex, columnIndex) => {
            if (!criteriaValueObject) {
                return;
            }

            // range must be an ArrayValueObject, criteria must be a BaseValueObject
            let resultArrayObject = valueObjectCompare(range, criteriaValueObject);

            // When comparing non-numbers and numbers, countifs does not take the result
            if (isNumberSensitive) {
                resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, range as ArrayValueObject, criteriaValueObject);
            }

            if (booleanResults[rowIndex] === undefined) {
                booleanResults[rowIndex] = [];
            }

            if (booleanResults[rowIndex][columnIndex] === undefined) {
                booleanResults[rowIndex][columnIndex] = resultArrayObject;
                return;
            }

            booleanResults[rowIndex][columnIndex] = booleanObjectIntersection(booleanResults[rowIndex][columnIndex], resultArrayObject);
        });
    }

    return booleanResults;
}

/**
 * Two valueObjects of the same type can be compared
 * @param array
 * @param range
 * @param criteria
 * @returns
 */
export function filterSameValueObjectResult(array: ArrayValueObject, range: ArrayValueObject, criteria: BaseValueObject) {
    const [operator, criteriaObject] = findCompareToken(`${criteria.getValue()}`);

    return array.mapValue((valueObject, r, c) => {
        const rangeValueObject = range.get(r, c);

        if (rangeValueObject && isSameValueObjectType(rangeValueObject, criteriaObject)) {
            return valueObject;
        } else if (rangeValueObject?.isNumber()) {
            if (criteriaObject.isString()) {
                const criteriaNumber = criteriaObject.convertToNumberObjectValue();

                if (criteriaNumber.isNumber()) {
                    return rangeValueObject.compare(criteriaNumber, operator);
                }
            }

            return BooleanValueObject.create(false);
        } else if (criteriaObject.isNumber()) {
            if (rangeValueObject?.isString()) {
                const rangeNumber = rangeValueObject.convertToNumberObjectValue();

                if (rangeNumber.isNumber()) {
                    return rangeNumber.compare(criteriaObject, operator);
                }
            }

            return BooleanValueObject.create(false);
        } else if (rangeValueObject?.isError() && criteriaObject.isError() && rangeValueObject.getValue() === criteriaObject.getValue()) {
            return BooleanValueObject.create(true);
        } else {
            return BooleanValueObject.create(false);
        }
    });
}

/**
 * Check if the two valueObjects are of the same type
 * @param left
 * @param right
 * @returns
 */
export function isSameValueObjectType(left: BaseValueObject, right: BaseValueObject) {
    if (left.isNumber() && right.isNumber()) {
        return true;
    }

    if (left.isBoolean() && right.isBoolean()) {
        return true;
    }

    // blank string is same as a blank cell
    const isLeftBlank = left.isString() && left.getValue() === '';
    const isRightBlank = right.isString() && right.getValue() === '';

    if ((isLeftBlank || left.isNull()) && (isRightBlank || right.isNull())) {
        return true;
    }

    if (left.isString() && !isLeftBlank && right.isString() && !isRightBlank) {
        return true;
    }

    return false;
}

export enum ReferenceObjectType {
    CELL,
    COLUMN,
    ROW,
}

export function getReferenceObjectFromCache(trimToken: string, type: ReferenceObjectType) {
    let referenceObject: BaseReferenceObject;
    switch (type) {
        case ReferenceObjectType.CELL:
            referenceObject = new CellReferenceObject(trimToken);
            break;
        case ReferenceObjectType.COLUMN:
            referenceObject = new ColumnReferenceObject(trimToken);
            break;
        case ReferenceObjectType.ROW:
            referenceObject = new RowReferenceObject(trimToken);
            break;
        default:
            throw new Error('Unknown reference object type');
    }

    return referenceObject;
}

export function getRangeReferenceObjectFromCache(variant1: BaseReferenceObject, variant2: BaseReferenceObject) {
    let referenceObject: FunctionVariantType;
    if (variant1.isCell() && variant2.isCell()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else if (variant1.isRow() && variant2.isRow()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else if (variant1.isColumn() && variant2.isColumn()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else {
        referenceObject = ErrorValueObject.create(ErrorType.NAME);
    }
    return referenceObject;
}
