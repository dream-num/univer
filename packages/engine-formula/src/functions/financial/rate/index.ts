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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';

export class Rate extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    override calculate(nper: BaseValueObject, pmt: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject, guess?: BaseValueObject): BaseValueObject {
        const _fv = fv ?? NumberValueObject.create(0);
        const _type = type ?? NumberValueObject.create(0);
        const _guess = guess ?? NumberValueObject.create(0.1);

        const maxRowLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getRowCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getRowCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getRowCount() : 1,
            _guess.isArray() ? (_guess as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getColumnCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getColumnCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getColumnCount() : 1,
            _guess.isArray() ? (_guess as ArrayValueObject).getColumnCount() : 1
        );

        const nperArray = expandArrayValueObject(maxRowLength, maxColumnLength, nper, ErrorValueObject.create(ErrorType.NA));
        const pmtArray = expandArrayValueObject(maxRowLength, maxColumnLength, pmt, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, _fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _type, ErrorValueObject.create(ErrorType.NA));
        const guessArray = expandArrayValueObject(maxRowLength, maxColumnLength, _guess, ErrorValueObject.create(ErrorType.NA));

        const resultArray = nperArray.map((nperObject, rowIndex, columnIndex) => {
            const pmtObject = pmtArray.get(rowIndex, columnIndex) as BaseValueObject;
            const pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const guessObject = guessArray.get(rowIndex, columnIndex) as BaseValueObject;

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(nperObject, pmtObject, pvObject, fvObject, typeObject, guessObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_nperObject, _pmtObject, _pvObject, _fvObject, _typeObject, _guessObject] = variants as BaseValueObject[];

            const nperValue = +_nperObject.getValue();
            const pmtValue = +_pmtObject.getValue();
            const pvValue = +_pvObject.getValue();
            const fvValue = +_fvObject.getValue();
            let typeValue = +_typeObject.getValue();
            const guessValue = +_guessObject.getValue();

            typeValue = typeValue ? 1 : 0;

            if (nperValue <= 0 || pmtValue >= 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            return this._getResult(nperValue, pmtValue, pvValue, fvValue, typeValue, guessValue, rowIndex, columnIndex);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(
        nperValue: number,
        pmtValue: number,
        pvValue: number,
        fvValue: number,
        typeValue: number,
        guessValue: number,
        rowIndex: number,
        columnIndex: number
    ): BaseValueObject {
        const epsMax = 1e-10;
        const iterMax = 20;

        let result = guessValue;

        for (let i = 0; i < iterMax; i++) {
            if (result <= -1) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            let y, f;

            if (Math.abs(result) < epsMax) {
                y = pvValue * (1 + nperValue * result) + pmtValue * (1 + result * typeValue) * nperValue + fvValue;
            } else {
                f = (1 + result) ** nperValue;
                y = pvValue * f + pmtValue * (1 / result + typeValue) * (f - 1) + fvValue;
            }

            if (Math.abs(y) < epsMax) {
                break;
            }

            let dy;

            if (Math.abs(result) < epsMax) {
                dy = pvValue * nperValue + pmtValue * typeValue * nperValue;
            } else {
                f = (1 + result) ** nperValue;
                const df = nperValue * (1 + result) ** (nperValue - 1);
                dy = pvValue * df + pmtValue * (1 / result + typeValue) * df + pmtValue * (-1 / (result * result)) * (f - 1);
            }

            result -= y / dy;
        }

        if (rowIndex === 0 && columnIndex === 0) {
            return NumberValueObject.create(result, '0%');
        } else {
            return NumberValueObject.create(result);
        }
    }
}
