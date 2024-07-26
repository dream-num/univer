/**
 * Copyright 2023-present DreamNum Inc.
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

export class Rate extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    override calculate(nper: BaseValueObject, pmt: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject, guess?: BaseValueObject) {
        fv = fv ?? NumberValueObject.create(0);
        type = type ?? NumberValueObject.create(0);
        guess = guess ?? NumberValueObject.create(0.1);

        const maxRowLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getRowCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getRowCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getRowCount() : 1,
            guess.isArray() ? (guess as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getColumnCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getColumnCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getColumnCount() : 1,
            guess.isArray() ? (guess as ArrayValueObject).getColumnCount() : 1
        );

        const nperArray = expandArrayValueObject(maxRowLength, maxColumnLength, nper, ErrorValueObject.create(ErrorType.NA));
        const pmtArray = expandArrayValueObject(maxRowLength, maxColumnLength, pmt, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, type, ErrorValueObject.create(ErrorType.NA));
        const guessArray = expandArrayValueObject(maxRowLength, maxColumnLength, guess, ErrorValueObject.create(ErrorType.NA));

        const resultArray = nperArray.map((nperObject, rowIndex, columnIndex) => {
            let pmtObject = pmtArray.get(rowIndex, columnIndex) as BaseValueObject;
            let pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;
            let guessObject = guessArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (nperObject.isString()) {
                nperObject = nperObject.convertToNumberObjectValue();
            }

            if (nperObject.isError()) {
                return nperObject;
            }

            if (pmtObject.isString()) {
                pmtObject = pmtObject.convertToNumberObjectValue();
            }

            if (pmtObject.isError()) {
                return pmtObject;
            }

            if (pvObject.isString()) {
                pvObject = pvObject.convertToNumberObjectValue();
            }

            if (pvObject.isError()) {
                return pvObject;
            }

            if (fvObject.isString()) {
                fvObject = fvObject.convertToNumberObjectValue();
            }

            if (fvObject.isError()) {
                return fvObject;
            }

            if (typeObject.isString()) {
                typeObject = typeObject.convertToNumberObjectValue();
            }

            if (typeObject.isError()) {
                return typeObject;
            }

            if (guessObject.isString()) {
                guessObject = guessObject.convertToNumberObjectValue();
            }

            if (guessObject.isError()) {
                return guessObject;
            }

            const nperValue = +nperObject.getValue();
            const pmtValue = +pmtObject.getValue();
            const pvValue = +pvObject.getValue();
            const fvValue = +fvObject.getValue();
            let typeValue = +typeObject.getValue();
            const guessValue = +guessObject.getValue();

            typeValue = typeValue ? 1 : 0;

            if (pmtValue >= 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

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
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
