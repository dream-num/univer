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
import type { MultiAreaReferenceObject, MultiAreaValue } from '../../../engine/reference-object/multi-area-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { FormulaDataModel } from '../../../models/formula-data.model';
import { ErrorType } from '../../../basics/error-type';
import { AggregateFunctionType, getAggregateResult, parseAggregateDataRefs } from '../../../basics/statistical';
import { createNewArray } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

interface IMultiAreaInfo {
    ref: FunctionVariantType;
    rowAreas: MultiAreaValue[]; // Each element represents a row
}

const AggregateFunctionMap: Record<number, AggregateFunctionType> = {
    1: AggregateFunctionType.AVERAGE,
    2: AggregateFunctionType.COUNT,
    3: AggregateFunctionType.COUNTA,
    4: AggregateFunctionType.MAX,
    5: AggregateFunctionType.MIN,
    6: AggregateFunctionType.PRODUCT,
    7: AggregateFunctionType.STDEV,
    8: AggregateFunctionType.STDEVP,
    9: AggregateFunctionType.SUM,
    10: AggregateFunctionType.VAR,
    11: AggregateFunctionType.VARP,
};

export class Subtotal extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsReferenceObject = true;

    override needsFilteredOutRows = true;

    override needsFormulaDataModel = true;

    override calculate(functionNum: FunctionVariantType, ...refs: FunctionVariantType[]) {
        let _functionNum: BaseValueObject;

        if (functionNum.isReferenceObject()) {
            _functionNum = (functionNum as BaseReferenceObject).toArrayValueObject();
        } else {
            _functionNum = functionNum as BaseValueObject;
        }

        const { isError, multiAreaRefs, normalRefs } = parseAggregateDataRefs(refs);

        // If there is multi-area reference, we need to expand the result by "rows".
        if (!isError && multiAreaRefs.length > 0) {
            return this._handleMultiAreaRefs(_functionNum, multiAreaRefs, refs as BaseReferenceObject[]);
        }

        // If there is no multi-area reference, keep the original logic.
        if (_functionNum.isArray()) {
            const resultArray = (_functionNum as ArrayValueObject).mapValue((valueObject) => this._handleSingleObject(valueObject, {
                isError,
                refs: normalRefs,
            }));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(_functionNum, {
            isError,
            refs: normalRefs,
        });
    }

    private _handleSingleObject(
        functionNum: BaseValueObject,
        options: {
            isError: boolean;
            refs: BaseReferenceObject[];
        }
    ): BaseValueObject {
        const { isError = false, refs } = options;

        let _functionNum = functionNum;

        if (functionNum.isString()) {
            _functionNum = functionNum.convertToNumberObjectValue();
        }

        if (_functionNum.isError()) {
            return _functionNum;
        }

        // If the refs has invalid reference, return #VALUE! error.
        if (isError) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let functionNumValue = Math.floor(+_functionNum.getValue());

        if (functionNumValue < 1 || (functionNumValue > 11 && functionNumValue < 101) || functionNumValue > 111) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let ignoreRowHidden = false;

        if (functionNumValue >= 101) {
            functionNumValue -= 100;
            ignoreRowHidden = true;
        }

        return getAggregateResult({
            type: AggregateFunctionMap[functionNumValue],
            ignoreRowHidden,
            ignoreErrorValues: false,
            ignoreNested: true,
            formulaDataModel: this._formulaDataModel as FormulaDataModel,
        }, refs);
    }

    private _handleMultiAreaRefs(functionNum: BaseValueObject, multiAreaRefs: MultiAreaReferenceObject[], refs: BaseReferenceObject[]) {
        const rowCount = functionNum.isArray() ? (functionNum as ArrayValueObject).getRowCount() : 1;
        const columnCount = functionNum.isArray() ? (functionNum as ArrayValueObject).getColumnCount() : 1;
        const { multiAreaInfoMap, maxAreasLen } = this._getMultiAreaInfo(multiAreaRefs);
        const maxLen = Math.max(rowCount, maxAreasLen);

        const results: BaseValueObject[][] = [];
        /**
         * For each row index:
         * - Take the corresponding functionNum value (use the last one if not enough)
         * - For each multi-area ref: take the representative Area for the corresponding row (use the last row if not enough)
         * - normalRefs are reused directly
         */
        for (let index = 0; index < maxLen; index++) {
            const fnRowIndex = index < rowCount ? index : rowCount - 1;
            const rowResults: BaseValueObject[] = [];

            /**
             * For each column in functionNum should produce a result.
             */
            for (let c = 0; c < columnCount; c++) {
                /**
                 * If the functionNum is multi-row and the current row index exceeds its row count, return #N/A error:
                 * For example, `=SUBTOTAL(A1:B2,OFFSET(J$16,ROW(J$16:J$107)-MIN(ROW($J$16:$J$107)),0))`.
                 *
                 * If the functionNum is only one row, all rows share the same functionNum value:
                 * For example, `=SUBTOTAL(A1:B1,OFFSET(J$16,ROW(J$16:J$107)-MIN(ROW($J$16:$J$107)),0))`.
                 */
                if (rowCount > 1 && index >= rowCount) {
                    rowResults.push(ErrorValueObject.create(ErrorType.NA));
                    continue;
                }

                const fnValueObject = functionNum.isArray() ? (functionNum as ArrayValueObject).get(fnRowIndex, c) as BaseValueObject : functionNum;
                const refsForRow: BaseReferenceObject[] = [];

                for (let refIndex = 0; refIndex < refs.length; refIndex++) {
                    const ref = refs[refIndex];
                    const info = multiAreaInfoMap.get(ref);

                    if (info) {
                        const rowIndex = index < info.rowAreas.length ? index : info.rowAreas.length - 1;
                        const area = info.rowAreas[rowIndex];

                        if (area.isError()) {
                            rowResults.push(area as ErrorValueObject);
                            break;
                        }

                        /**
                         * The area may be an ErrorValueObject or a BaseReferenceObject,
                         * both of which are valid members of FunctionVariantType and can be returned directly.
                         */
                        refsForRow.push(area as BaseReferenceObject);
                        continue;
                    }

                    // Non multi-area reference: all rows share the same one
                    refsForRow.push(ref);
                }

                const rowResult = this._handleSingleObject(fnValueObject, {
                    isError: false,
                    refs: refsForRow,
                });
                rowResults.push(rowResult);
            }

            results.push(rowResults);
        }

        // If there is only one row, return the scalar directly; for multiple rows, return an ArrayValueObject (expanded by row).
        if (results.length === 1) {
            return results[0][0];
        }

        return createNewArray(results, results.length, columnCount);
    }

    private _getMultiAreaInfo(multiAreaRefs: MultiAreaReferenceObject[]) {
        /**
         * Map the two-dimensional areas of MultiAreaReferenceObject into "representative Area by row".
         * For each row, we take the first non-error area to maintain the semantics of "table expanded by row".
         */
        const multiAreaInfoMap = new Map<BaseReferenceObject, IMultiAreaInfo>();

        // Calculate the maximum number of rows to expand.
        let maxAreasLen = 1;

        multiAreaRefs.forEach((ref) => {
            const rowAreas: MultiAreaValue[] = ref.getAreas().map((row) => {
                if (!row || row.length === 0) {
                    // If the row has no area, use the original ref itself as a placeholder.
                    return ref;
                }

                // Find the first non-error area in this row, or use the first one if none exist.
                const firstNonError = row.find((a) => !a.isError());

                return firstNonError ?? row[0];
            });

            multiAreaInfoMap.set(ref, {
                ref,
                rowAreas,
            });

            maxAreasLen = Math.max(maxAreasLen, rowAreas.length || 1);
        });

        return {
            multiAreaInfoMap,
            maxAreasLen,
        };
    }
}
