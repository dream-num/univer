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

import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_CUBE } from './function-names';

export const functionCube = [];

class UnavailableCubeFunction extends BaseFunction {
    override needsReferenceObject = true;

    override calculate() {
        return ErrorValueObject.create(ErrorType.NA);
    }
}

// Register the unavailable-connection result without listing OLAP queries as implemented.
export const offlineCubeFunctions: Array<[typeof UnavailableCubeFunction, FUNCTION_NAMES_CUBE]> =
    Object.values(FUNCTION_NAMES_CUBE).map((name) => [UnavailableCubeFunction, name]);
