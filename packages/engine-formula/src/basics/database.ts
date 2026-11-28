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

import type { DateSystem } from '@univerjs/core';
import { isRealNum } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { createCriteriaValueObject, findCompareToken } from '../engine/utils/object-compare';
import { ValueObjectFactory } from '../engine/value-object/array-value-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { ErrorType } from './error-type';

type DatabaseValueType = string | number | null;

export type DatabaseCriterionEvaluator = (databaseRow: number, criteriaRow: number, criteriaColumn: number) => boolean | undefined;

function toValue(value: FunctionVariantType): BaseValueObject {
    return value.isReferenceObject() ? (value as BaseReferenceObject).toArrayValueObject() : value as BaseValueObject;
}

export function checkDatabase(input: FunctionVariantType) {
    const database = toValue(input);
    const databaseValues: DatabaseValueType[][] = [];

    if (database.isError()) {
        return {
            isError: true,
            errorObject: database as ErrorValueObject,
            databaseValues,
        };
    }

    const rowCount = database.isArray() ? (database as ArrayValueObject).getRowCount() : 1;
    const columnCount = database.isArray() ? (database as ArrayValueObject).getColumnCount() : 1;

    if (rowCount < 2) {
        return {
            isError: true,
            errorObject: ErrorValueObject.create(ErrorType.VALUE),
            databaseValues,
        };
    }

    for (let r = 0; r < rowCount; r++) {
        const row: DatabaseValueType[] = [];

        for (let c = 0; c < columnCount; c++) {
            const valueObject = (database as ArrayValueObject).get(r, c) as BaseValueObject;

            if (valueObject.isNull()) {
                row.push(null);
                continue;
            }

            let value = `${valueObject.getValue()}`;

            if (valueObject.isBoolean()) {
                value = value.toLocaleUpperCase();
            }

            if (valueObject.isNumber()) {
                row.push(+value);
                continue;
            }

            row.push(value);
        }

        databaseValues.push(row);
    }

    return {
        isError: false,
        errorObject: null,
        databaseValues,
    };
}

export function checkField(input: FunctionVariantType, database: DatabaseValueType[][], allowOmitted = false) {
    const field = toValue(input);
    if (allowOmitted && !input.isReferenceObject() && field.isNull()) {
        return { isError: false, errorObject: null, fieldIndex: -1 };
    }

    let fieldIndex: number = -1;

    if (field.isError()) {
        return {
            isError: true,
            errorObject: field as ErrorValueObject,
            fieldIndex,
        };
    }

    const rowCount = field.isArray() ? (field as ArrayValueObject).getRowCount() : 1;
    const columnCount = field.isArray() ? (field as ArrayValueObject).getColumnCount() : 1;

    if (rowCount > 1 || columnCount > 1) {
        return {
            isError: true,
            errorObject: ErrorValueObject.create(ErrorType.VALUE),
            fieldIndex,
        };
    }

    const fieldObject = field.isArray() ? (field as ArrayValueObject).get(0, 0) as BaseValueObject : field;

    let fieldValue: number | string = `${fieldObject.getValue()}`;

    if (fieldObject.isNull()) {
        fieldValue = 0;
    } else if (fieldObject.isBoolean()) {
        fieldValue = fieldObject.getValue() ? 1 : 0;
    } else if (fieldObject.isNumber()) {
        fieldValue = Math.floor(+fieldValue);
    }

    if (typeof fieldValue === 'number') {
        if (fieldValue < 1 || fieldValue > database[0].length) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
                fieldIndex,
            };
        }

        fieldIndex = fieldValue - 1;
    } else {
        fieldIndex = database[0].findIndex((value) => {
            if (value === null) {
                return false;
            }

            return `${value}`.toLocaleLowerCase() === fieldValue.toLocaleLowerCase();
        });

        if (fieldIndex === -1) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
                fieldIndex,
            };
        }
    }

    return {
        isError: false,
        errorObject: null,
        fieldIndex,
    };
}

export function checkCriteria(input: FunctionVariantType) {
    const criteria = toValue(input);
    const criteriaValues = criteria as ArrayValueObject;
    const valid = criteria.isArray() && criteriaValues.getRowCount() >= 2;
    return {
        isError: !valid,
        errorObject: valid ? null : criteria.isError() ? criteria as ErrorValueObject : ErrorValueObject.create(ErrorType.VALUE),
        criteriaValues,
    };
}

/*
 * Criteria match logic:
 * Boolean AND in row direction, then Boolean OR in column direction
 */
export function isCriteriaMatch(
    criteria: ArrayValueObject,
    database: DatabaseValueType[][],
    databaseRowIndex: number,
    dateSystem: DateSystem,
    evaluateCriterion?: DatabaseCriterionEvaluator
) {
    const rowCount = criteria.getRowCount();
    const columnCount = criteria.getColumnCount();

    const criteriaTitleIndexCache: Record<number, number> = {};

    let isMatch = false;

    for (let r = 1; r < rowCount; r++) {
        let isRowMatch = true;

        for (let c = 0; c < columnCount; c++) {
            const calculated = evaluateCriterion?.(databaseRowIndex, r, c);
            if (calculated !== undefined) {
                if (!calculated) {
                    isRowMatch = false;
                    break;
                }
                continue;
            }
            const condition = criteria.get(r, c);

            if (!condition || condition.isNull()) {
                continue;
            }

            let criteriaTitleIndex = criteriaTitleIndexCache[c];

            if (criteriaTitleIndex === undefined) {
                const header = criteria.get(0, c);
                const title = header?.getValue();
                const criteriaTitleValue = header?.isBoolean() || isRealNum(title) ? Number(title) : title;
                criteriaTitleIndex = database[0].findIndex((value) => {
                    if (value === null || criteriaTitleValue == null) {
                        return false;
                    }

                    return `${value}`.toLocaleLowerCase() === `${criteriaTitleValue}`.toLocaleLowerCase();
                });
                criteriaTitleIndexCache[c] = criteriaTitleIndex;
            }

            const criteriaValue = condition.isBoolean() ? Number(condition.getValue()) : condition.getValue();
            if (criteriaTitleIndex === -1) {
                const value = condition.isString()
                    ? createCriteriaValueObject(String(criteriaValue), dateSystem, condition.getCalculationRegion())
                    : condition;
                if ((!value.isNumber() && !value.isBoolean()) || !value.getValue()) {
                    isRowMatch = false;
                    break;
                }
            } else {
                const databaseValue = database[databaseRowIndex][criteriaTitleIndex];

                if (databaseValue === null) {
                    isRowMatch = false;
                    break;
                }

                const [compareToken, criteriaObject] = findCompareToken(String(criteriaValue), dateSystem, condition.getCalculationRegion());
                const compareObject = ValueObjectFactory.create(`${databaseValue}`, false, dateSystem).compare(criteriaObject, compareToken);
                const compareValue = compareObject.getValue();

                if (!compareValue) {
                    isRowMatch = false;
                    break;
                }
            }
        }

        if (isRowMatch) {
            isMatch = true;
            break;
        }
    }

    return isMatch;
}
