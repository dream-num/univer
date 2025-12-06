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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { AsyncObject } from '../../../engine/reference-object/base-reference-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class CryptoPrice extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override isAsync(): boolean {
        return true;
    }

    override calculate(variant: BaseValueObject) {
        return new AsyncObject(asyncObjectFunction(variant, this.unitId, this.subUnitId, this.row, this.column));
    }
}

function extractSymbols(variant: BaseValueObject): string[] {
    const symbols: string[] = [];
    if (variant.isArray()) {
        const arrayValue = (variant as ArrayValueObject).getArrayValue();
        for (const row of arrayValue) {
            for (const cell of row) {
                if (cell && cell.isString()) {
                    symbols.push(cell.getValue() as string);
                } else if (cell && !cell.isNull()) {
                    symbols.push('');
                }
            }
        }
    } else if (variant.isString()) {
        symbols.push(variant.getValue() as string);
    }
    return symbols;
}

function createResult(variant: BaseValueObject, data: any, unitId: Nullable<string>, subUnitId: Nullable<string>, row: number, column: number): BaseValueObject {
    if (variant.isArray()) {
        const resultArray: BaseValueObject[][] = [];
        const arrayValue = (variant as ArrayValueObject).getArrayValue();
        for (const row of arrayValue) {
            const resultRow: BaseValueObject[] = [];
            for (const cell of row) {
                if (cell && cell.isString()) {
                    const symbol = cell.getValue() as string;
                    const price = data[symbol]?.usd;
                    resultRow.push(price !== undefined ? NumberValueObject.create(price) : ErrorValueObject.create(ErrorType.NA));
                } else {
                    resultRow.push(ErrorValueObject.create(ErrorType.VALUE));
                }
            }
            resultArray.push(resultRow);
        }
        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: resultArray[0]?.length || 0,
            unitId: unitId ?? '',
            sheetId: subUnitId ?? '',
            row,
            column,
        });
    } else {
        const symbol = (variant as any).getValue() as string;
        const price = data[symbol]?.usd;
        return price !== undefined ? NumberValueObject.create(price) : ErrorValueObject.create(ErrorType.NA);
    }
}

async function asyncObjectFunction(variant: BaseValueObject, unitId: Nullable<string>, subUnitId: Nullable<string>, row: number, column: number): Promise<BaseValueObject> {
    if (variant.isError()) {
        return variant;
    }

    const symbols = extractSymbols(variant);
    if (symbols.length === 0) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    try {
        const data = await getPrice(symbols.filter((s) => s).join(','));
        return createResult(variant, data, unitId, subUnitId, row, column);
    } catch (error) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

async function getPrice(symbol: string) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('API request failed');
    }
    return response.json();
}
