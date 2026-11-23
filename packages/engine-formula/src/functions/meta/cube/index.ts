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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { MultiAreaArrayMode, MultiAreaReferenceObject } from '../../../engine/reference-object/multi-area-reference-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { CubeValueObject } from '../../../engine/value-object/cube-value-object';
import { BaseFunction } from '../../base-function';

export class Cube extends BaseFunction {
    override needsReferenceObject = true;
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: FunctionVariantType[]) {
        if (variants.some((variant) => variant instanceof MultiAreaReferenceObject && variant.isSheetSpan)) {
            return ErrorValueObject.create(ErrorType.NAME);
        }

        if (variants.every((variant) => variant.isReferenceObject())) {
            const areas = (variants as BaseReferenceObject[]).flatMap((reference) =>
                reference instanceof MultiAreaReferenceObject && !reference.isArrayOfReferences()
                    ? reference.getAreas().flat()
                    : [reference]
            );
            return new MultiAreaReferenceObject('', [areas], MultiAreaArrayMode.STACK_AREAS);
        }
        const values: ArrayValueObject[] = [];

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i].isReferenceObject()
                ? (variants[i] as BaseReferenceObject).toArrayValueObject()
                : variants[i] as BaseValueObject;

            if (variant.isError()) {
                return variant;
            }

            if (!variant.isArray()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            values.push(variant as ArrayValueObject);
        }

        return CubeValueObject.create(values);
    }
}
