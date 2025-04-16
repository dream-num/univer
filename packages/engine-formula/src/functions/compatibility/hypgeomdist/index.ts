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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { hypergeometricPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Hypgeomdist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        sampleS: BaseValueObject,
        numberSample: BaseValueObject,
        populationS: BaseValueObject,
        numberPop: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            sampleS.isArray() ? (sampleS as ArrayValueObject).getRowCount() : 1,
            numberSample.isArray() ? (numberSample as ArrayValueObject).getRowCount() : 1,
            populationS.isArray() ? (populationS as ArrayValueObject).getRowCount() : 1,
            numberPop.isArray() ? (numberPop as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            sampleS.isArray() ? (sampleS as ArrayValueObject).getColumnCount() : 1,
            numberSample.isArray() ? (numberSample as ArrayValueObject).getColumnCount() : 1,
            populationS.isArray() ? (populationS as ArrayValueObject).getColumnCount() : 1,
            numberPop.isArray() ? (numberPop as ArrayValueObject).getColumnCount() : 1
        );

        const sampleSArray = expandArrayValueObject(maxRowLength, maxColumnLength, sampleS, ErrorValueObject.create(ErrorType.NA));
        const numberSampleArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberSample, ErrorValueObject.create(ErrorType.NA));
        const populationSArray = expandArrayValueObject(maxRowLength, maxColumnLength, populationS, ErrorValueObject.create(ErrorType.NA));
        const numberPopArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberPop, ErrorValueObject.create(ErrorType.NA));

        const resultArray = sampleSArray.mapValue((sampleSObject, rowIndex, columnIndex) => {
            const numberSampleObject = numberSampleArray.get(rowIndex, columnIndex) as BaseValueObject;
            const populationSObject = populationSArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numberPopObject = numberPopArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (sampleSObject.isError()) {
                return sampleSObject;
            }

            if (numberSampleObject.isError()) {
                return numberSampleObject;
            }

            if (populationSObject.isError()) {
                return populationSObject;
            }

            if (numberPopObject.isError()) {
                return numberPopObject;
            }

            return this._handleSignleObject(sampleSObject, numberSampleObject, populationSObject, numberPopObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        sampleSObject: BaseValueObject,
        numberSampleObject: BaseValueObject,
        populationSObject: BaseValueObject,
        numberPopObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(sampleSObject, numberSampleObject, populationSObject, numberPopObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_sampleSObject, _numberSampleObject, _populationSObject, _numberPopObject] = variants as BaseValueObject[];

        const sampleSValue = Math.floor(+_sampleSObject.getValue());
        const numberSampleValue = Math.floor(+_numberSampleObject.getValue());
        const populationSValue = Math.floor(+_populationSObject.getValue());
        const numberPopValue = Math.floor(+_numberPopObject.getValue());

        if (
            sampleSValue < 0 ||
            sampleSValue > numberSampleValue ||
            sampleSValue > populationSValue ||
            sampleSValue < numberSampleValue - numberPopValue + populationSValue ||
            numberSampleValue <= 0 ||
            numberSampleValue > numberPopValue ||
            populationSValue <= 0 ||
            populationSValue > numberPopValue ||
            numberPopValue <= 0
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = hypergeometricPDF(sampleSValue, numberSampleValue, populationSValue, numberPopValue);

        if (Number.isNaN(result)) {
            result = 0;
        }

        return NumberValueObject.create(result);
    }
}
