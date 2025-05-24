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
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Hyperlink extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(url: BaseValueObject, linkLabel?: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            url.isArray() ? (url as ArrayValueObject).getRowCount() : 1,
            linkLabel?.isArray() ? (linkLabel as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            url.isArray() ? (url as ArrayValueObject).getColumnCount() : 1,
            linkLabel?.isArray() ? (linkLabel as ArrayValueObject).getColumnCount() : 1
        );

        const urlArray = expandArrayValueObject(maxRowLength, maxColumnLength, url, ErrorValueObject.create(ErrorType.NA));
        const linkLabelArray = linkLabel ? expandArrayValueObject(maxRowLength, maxColumnLength, linkLabel, ErrorValueObject.create(ErrorType.NA)) : [];

        const resultArray = urlArray.mapValue((urlObject, rowIndex, columnIndex) => {
            const linkLabelObject = linkLabel ? (linkLabelArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : undefined;

            if (urlObject.isError()) {
                return urlObject;
            }

            if (linkLabelObject?.isError()) {
                return linkLabelObject;
            }

            return this._handleSingleObject(urlObject, linkLabelObject);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(url: BaseValueObject, linkLabel?: BaseValueObject) {
        let hyperlinkUrl = `${url.getValue()}`;

        if (url.isNull()) {
            hyperlinkUrl = '';
        }

        let hyperlinkLabel = hyperlinkUrl;

        if (linkLabel) {
            hyperlinkLabel = `${linkLabel.getValue()}`;

            if (linkLabel.isNull()) {
                hyperlinkLabel = '0';
            }

            if (linkLabel.isBoolean()) {
                hyperlinkLabel = hyperlinkLabel.toLocaleUpperCase();
            }
        }

        return StringValueObject.create(hyperlinkLabel, {
            isHyperlink: true,
            hyperlinkUrl,
        });
    }
}
