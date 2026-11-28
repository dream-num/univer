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

import type { Nullable } from '@univerjs/core';
import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ERROR_TYPE_SET, ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { NodeType } from '../../engine/ast-node/node-type';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { normalizeTextForComparison } from '../../engine/utils/compare';
import { findCompareToken } from '../../engine/utils/object-compare';
import { deserializeRangeWithSheet } from '../../engine/utils/reference';
import { createSortCompare } from '../../engine/utils/sort-compare';
import { createEqualityCandidateReader, mapReferenceGridCriteria, singleCriterionNumberKey } from '../../engine/utils/value-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

type CriterionMatch = (cell: BaseValueObject) => boolean;

interface ICriterion {
    matches: CriterionMatch;
    indexedOperand?: BaseValueObject;
}

function wildcardExpression(pattern: string): RegExp {
    const escape = (text: string) => text.replace(/[.+^${}()|[\]\\*?]/g, '\\$&');
    const expression = pattern.replace(/~[~*?]|\*+|\?|[^]/g, (token) => {
        if (token.startsWith('*')) return '.*';
        if (token === '?') return '.';
        return escape(token.length > 1 && token.startsWith('~') ? token[1] : token);
    });
    return new RegExp(`^${expression}$`, 'is');
}

function matchesOperator(operator: compareToken, order: number | undefined): boolean {
    switch (operator) {
        case compareToken.EQUALS: return order === 0;
        case compareToken.NOT_EQUAL: return order !== 0;
        case compareToken.GREATER_THAN: return order !== undefined && order > 0;
        case compareToken.GREATER_THAN_OR_EQUAL: return order !== undefined && order >= 0;
        case compareToken.LESS_THAN: return order !== undefined && order < 0;
        case compareToken.LESS_THAN_OR_EQUAL: return order !== undefined && order <= 0;
        default: return false;
    }
}

function parseCriterion(raw: BaseValueObject, compareText: ReturnType<typeof createSortCompare>): ICriterion | undefined {
    let operator = compareToken.EQUALS;
    let operand = raw;
    let wildcard: RegExp | undefined;
    if (raw.isString()) {
        const text = String(raw.getValue());
        if (text.length > 255) return;
        if (text === '') {
            return { matches: (cell) => cell.isNull() || (cell.isString() && cell.getValue() === '') };
        }
        const [op, parsed] = findCompareToken(text, raw.getDateSystem(), raw.getCalculationRegion());
        operator = op;
        const body = text.startsWith(op) ? text.slice(op.length) : text;
        if (body === '') {
            return {
                matches: (cell) => (operator === compareToken.EQUALS && cell.isNull()) ||
                    (operator === compareToken.NOT_EQUAL && !cell.isNull()),
            };
        }

        const token = body.toUpperCase();
        if (token === 'TRUE' || token === 'FALSE') {
            operand = BooleanValueObject.create(token === 'TRUE');
        } else if (ERROR_TYPE_SET.has(token as ErrorType)) {
            operand = ErrorValueObject.create(token as ErrorType);
        } else {
            operand = parsed.isNumber() ? parsed : raw;
            if (!parsed.isNumber() && body !== text) {
                operand = parsed;
            }
        }
        if ((operator === compareToken.EQUALS || operator === compareToken.NOT_EQUAL) && operand.isString() && /[*?]/.test(body)) {
            wildcard = wildcardExpression(body);
        }
    } else if (raw.isNull()) {
        operand = NumberValueObject.create(0);
    }
    const equality = operator === compareToken.EQUALS;
    const exact = equality || operator === compareToken.NOT_EQUAL;
    const key = operand.isString() && exact && !wildcard ? normalizeTextForComparison(String(operand.getValue())) : undefined;
    const number = operand.isNumber() ? singleCriterionNumberKey(Number(operand.getValue())) : undefined;

    const order = (cell: BaseValueObject): number | undefined => {
        if (number !== undefined) {
            const value = equality && cell.isString() ? findCompareToken(`=${cell.getValue()}`, cell.getDateSystem(), cell.getCalculationRegion())[1] : cell;
            if (!value.isNumber()) return;
            const lhs = singleCriterionNumberKey(Number(value.getValue()));
            return lhs === number ? 0 : lhs < number ? -1 : 1;
        }
        if (operand.isBoolean() && cell.isBoolean()) return Number(cell.getValue()) - Number(operand.getValue());
        if (operand.isError() && cell.isError() && exact) return cell.getValue() === operand.getValue() ? 0 : undefined;
        if (operand.isString() && cell.isString()) {
            const text = String(cell.getValue());
            if (wildcard) return wildcard.test(text) ? 0 : undefined;
            if (key !== undefined) return normalizeTextForComparison(text) === key ? 0 : undefined;
            return compareText(text, String(operand.getValue()));
        }
    };
    return {
        matches: (cell) => matchesOperator(operator, order(cell)),
        indexedOperand: equality && (operand.isNumber() || (operand.isString() && !wildcard)) ? operand : undefined,
    };
}

type Operation = 'count' | 'sum' | 'average';

function invalidReference(value: FunctionVariantType): boolean {
    return !value.isReferenceObject() || (value instanceof MultiAreaReferenceObject && !value.isArrayOfReferences());
}

function calculateResult(
    operation: Operation,
    source: ArrayValueObject,
    target: ArrayValueObject,
    criterion: ICriterion,
    candidates: ReturnType<typeof createEqualityCandidateReader> | undefined
): BaseValueObject {
    let sum = 0;
    let count = 0;
    let error: BaseValueObject | undefined;
    const visit = (cell: Nullable<BaseValueObject>, row: number, column: number) => {
        if (!cell || !criterion.matches(cell)) return true;
        if (operation === 'count') {
            count++;
        } else {
            const value = target.get(row, column);
            if (value?.isError()) {
                error = value;
                return false;
            }
            if (value?.isNumber()) {
                sum += Number(value.getValue());
                count++;
            }
        }
        return true;
    };
    const selected = criterion.indexedOperand && candidates?.(source, criterion.indexedOperand);
    if (selected) {
        for (const [row, column] of selected) {
            if (!visit(source.get(row, column), row, column)) break;
        }
    } else {
        source.iterator(visit);
    }
    if (error) return error;
    if (!Number.isFinite(sum)) return ErrorValueObject.create(ErrorType.NUM);
    if (operation === 'average') return count === 0 ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO) : NumberValueObject.create(sum / count);
    return NumberValueObject.create(operation === 'count' ? count : sum);
}

abstract class ExcelSingleCriterion extends BaseFunction {
    override minParams = 2;
    override maxParams = 3;
    override needsReferenceObject = true;
    override lazyIfReferenceArrayArgumentIndexes = [0, 2];
    protected abstract readonly _operation: Operation;
    private _addressReferences: BaseReferenceObject[] | undefined;

    override needsAddressDependencies = (args: readonly BaseAstNode[]): boolean => {
        if (args.length < 3) return false;
        const shape = (node: BaseAstNode) => {
            const token = node.getToken();
            if (node.nodeType !== NodeType.REFERENCE || !/^\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?$/i.test(token)) return;
            const { range } = deserializeRangeWithSheet(token);
            if (range.startAbsoluteRefType !== range.endAbsoluteRefType) return;
            return [range.endRow - range.startRow, range.endColumn - range.startColumn];
        };
        const source = shape(args[0]);
        const target = shape(args[2]);
        return !source || !target || source[0] !== target[0] || source[1] !== target[1];
    };

    override takeAddressDependencyReferences(): readonly BaseReferenceObject[] | undefined {
        const references = this._addressReferences;
        this._addressReferences = undefined;
        return references;
    }

    override resolveAddressDependencyReferences = async (
        argument: (index: number) => Promise<BaseReferenceObject | null>
    ): Promise<readonly BaseReferenceObject[]> => {
        const source = await argument(0);
        const target = await argument(2);
        if (!source || !target || invalidReference(source) || invalidReference(target)) return [];
        const references = [source, target];
        const placeholder = NumberValueObject.create(0);
        mapReferenceGridCriteria(source, placeholder, target, (area, _, destination) => {
            if (destination) {
                const expanded = this._expandReference(destination, area.getRowCount(), area.getColumnCount());
                if (expanded !== destination && !(expanded instanceof ErrorValueObject)) references.push(expanded);
            }
            return placeholder;
        });
        return references;
    };

    override calculate(range: FunctionVariantType, condition: FunctionVariantType, target?: FunctionVariantType): BaseValueObject {
        this._addressReferences = undefined;
        if (range.isError()) return range as BaseValueObject;
        if (target?.isError()) return target as BaseValueObject;
        if (invalidReference(range) || (target && invalidReference(target))) return ErrorValueObject.create(ErrorType.VALUE);
        const source = range as BaseReferenceObject;
        const destination = target as BaseReferenceObject | undefined;
        const criteria = (condition.isReferenceObject()
            ? (condition as BaseReferenceObject).toArrayValueObject()
            : condition) as BaseValueObject;
        const compare = createSortCompare();
        const multipleCriteria = criteria.isArray() && (criteria as ArrayValueObject).getRowCount() * (criteria as ArrayValueObject).getColumnCount() > 1;
        const candidates = multipleCriteria ? createEqualityCandidateReader() : undefined;
        const repeated = multipleCriteria && !source.isMultiArea() && !destination?.isMultiArea() ? new Map<string, BaseValueObject>() : undefined;
        return mapReferenceGridCriteria(source, criteria, destination, (area, raw, resultArea) => {
            const key = repeated ? JSON.stringify([raw.isError(), raw.isNull(), raw.getValue()]) : undefined;
            const cached = key === undefined ? undefined : repeated?.get(key);
            if (cached) return cached;
            const criterion = parseCriterion(raw, compare);
            if (!criterion) return ErrorValueObject.create(ErrorType.VALUE);
            const input = area.toArrayValueObject();
            const output = resultArea ? this._resultArray(resultArea, input) : input;
            if (output.isError()) return output;
            const result = calculateResult(this._operation, input, output as ArrayValueObject, criterion, candidates);
            if (key !== undefined && repeated!.size < 4096) repeated!.set(key, result);
            return result;
        });
    }

    private _resultArray(reference: BaseReferenceObject, source: ArrayValueObject): ArrayValueObject | ErrorValueObject {
        const expanded = this._expandReference(reference, source.getRowCount(), source.getColumnCount());
        if (expanded instanceof ErrorValueObject) return expanded;
        if (expanded !== reference) (this._addressReferences ??= []).push(expanded);
        return expanded.toArrayValueObject();
    }

    private _expandReference(reference: BaseReferenceObject, rows: number, columns: number): BaseReferenceObject | ErrorValueObject {
        if (rows === reference.getRowCount() && columns === reference.getColumnCount()) return reference;

        const range = reference.getRangePosition();
        const expanded = this.createReferenceObject(reference, {
            ...range,
            endRow: range.startRow + rows - 1,
            endColumn: range.startColumn + columns - 1,
        });
        if (expanded instanceof ErrorValueObject) return expanded;
        expanded.withDateSystem(reference.getDateSystem());
        return expanded;
    }
}

class ExcelCountif extends ExcelSingleCriterion {
    override maxParams = 2;
    protected readonly _operation = 'count';
}

class ExcelSumif extends ExcelSingleCriterion {
    protected readonly _operation = 'sum';
}

class ExcelAverageif extends ExcelSingleCriterion {
    protected readonly _operation = 'average';
}

export const excelSingleCriterionFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelCountif, FUNCTION_NAMES_STATISTICAL.COUNTIF],
    [ExcelSumif, FUNCTION_NAMES_MATH.SUMIF],
    [ExcelAverageif, FUNCTION_NAMES_STATISTICAL.AVERAGEIF],
];
