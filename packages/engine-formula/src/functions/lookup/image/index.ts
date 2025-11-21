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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ImageFunction extends BaseFunction {
    override minParams = 1;

    override maxParams = 5;

    override isAsync() {
        return true;
    }

    // eslint-disable-next-line complexity
    override calculate(source: BaseValueObject, altText?: BaseValueObject, sizing?: BaseValueObject, height?: BaseValueObject, width?: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            source.isArray() ? (source as ArrayValueObject).getRowCount() : 1,
            altText?.isArray() ? (altText as ArrayValueObject).getRowCount() : 1,
            sizing?.isArray() ? (sizing as ArrayValueObject).getRowCount() : 1,
            height?.isArray() ? (height as ArrayValueObject).getRowCount() : 1,
            width?.isArray() ? (width as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            source.isArray() ? (source as ArrayValueObject).getColumnCount() : 1,
            altText?.isArray() ? (altText as ArrayValueObject).getColumnCount() : 1,
            sizing?.isArray() ? (sizing as ArrayValueObject).getColumnCount() : 1,
            height?.isArray() ? (height as ArrayValueObject).getColumnCount() : 1,
            width?.isArray() ? (width as ArrayValueObject).getColumnCount() : 1
        );

        const sourceArray = expandArrayValueObject(maxRowLength, maxColumnLength, source, ErrorValueObject.create(ErrorType.NA));
        const altTextArray = altText ? expandArrayValueObject(maxRowLength, maxColumnLength, altText, ErrorValueObject.create(ErrorType.NA)) : undefined;
        const sizingArray = sizing ? expandArrayValueObject(maxRowLength, maxColumnLength, sizing, ErrorValueObject.create(ErrorType.NA)) : undefined;
        const heightArray = height ? expandArrayValueObject(maxRowLength, maxColumnLength, height, ErrorValueObject.create(ErrorType.NA)) : undefined;
        const widthArray = width ? expandArrayValueObject(maxRowLength, maxColumnLength, width, ErrorValueObject.create(ErrorType.NA)) : undefined;

        const resultArray = sourceArray.mapValue((sourceObject, rowIndex, columnIndex) => {
            if (sourceObject.isError()) {
                return sourceObject;
            }

            const altTextObject = altTextArray ? altTextArray.get(rowIndex, columnIndex) as BaseValueObject : undefined;
            if (altTextObject?.isError()) {
                return altTextObject;
            }

            const sizingObject = sizingArray ? sizingArray.get(rowIndex, columnIndex) as BaseValueObject : undefined;
            if (sizingObject?.isError()) {
                return sizingObject;
            }

            const heightObject = heightArray ? heightArray.get(rowIndex, columnIndex) as BaseValueObject : undefined;
            if (heightObject?.isError()) {
                return heightObject;
            }

            const widthObject = widthArray ? widthArray.get(rowIndex, columnIndex) as BaseValueObject : undefined;
            if (widthObject?.isError()) {
                return widthObject;
            }

            return this._handleSingleObject(sourceObject, altTextObject, sizingObject, heightObject, widthObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    // eslint-disable-next-line complexity
    private _handleSingleObject(source: BaseValueObject, altText?: BaseValueObject, sizing?: BaseValueObject, height?: BaseValueObject, width?: BaseValueObject): BaseValueObject {
        if (!source.isString()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const sourceValue = source.getValue() as string;

        let altTextValue = '';
        if (altText) {
            if (altText.isBoolean()) {
                altTextValue = altText.getValue() ? 'TRUE' : 'FALSE';
            } else if (!altText.isNull()) {
                altTextValue = `${altText.getValue()}`;
            }
        }

        let _sizing = sizing ?? NumberValueObject.create(0);
        if (_sizing.isString()) {
            _sizing = _sizing.convertToNumberObjectValue();
        }
        if (_sizing.isError()) {
            return _sizing;
        }

        const sizingValue = Math.abs(Math.trunc(+_sizing.getValue()));

        // If sizing is not between 0-3, return #VALUE! error.
        if (sizingValue < 0 || sizingValue > 3) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // If sizing is 0, 1, or 2 and height or width is provided, return #VALUE! error.
        if ([0, 1, 2].includes(sizingValue) && (height || width)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _height = height ?? NumberValueObject.create(0);
        if (_height.isString()) {
            _height = _height.convertToNumberObjectValue();
        }
        if (_height.isError()) {
            return _height;
        }

        const heightValue = Math.ceil(+_height.getValue());

        let _width = width ?? NumberValueObject.create(0);
        if (_width.isString()) {
            _width = _width.convertToNumberObjectValue();
        }
        if (_width.isError()) {
            return _width;
        }

        const widthValue = Math.ceil(+_width.getValue());

        // If sizing is 3 and height or width is less than 1, return #VALUE! error.
        if (sizingValue === 3 && heightValue < 1 && widthValue < 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return StringValueObject.create('', {
            isImage: true,
            imageInfo: {
                source: sourceValue,
                altText: altTextValue,
                sizing: sizingValue,
                height: heightValue,
                width: widthValue,
            },
        });
    }
}
