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

import type { BaseReferenceObject } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject, formatValueForFormulaText } from '../../../engine/value-object/base-value-object';
import { createTypedHyperlink } from '../../../engine/value-object/hyperlink-value';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { formatExcelTextNumber } from '../../text/format-excel-text-number';

export class Hyperlink extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(url: BaseValueObject, linkLabel?: BaseValueObject): BaseValueObject {
        let _url = url;

        if (url.isArray()) {
            _url = (url as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_url.isError()) {
            return _url;
        }

        let _linkLabel = linkLabel;

        if (linkLabel?.isArray()) {
            _linkLabel = (linkLabel as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_linkLabel?.isError()) {
            return _linkLabel;
        }

        let hyperlinkUrl = `${_url.getValue()}`;

        if (_url.isNull()) {
            hyperlinkUrl = '';
        }

        let hyperlinkLabel = hyperlinkUrl;

        if (_linkLabel) {
            hyperlinkLabel = `${_linkLabel.getValue()}`;

            if (_linkLabel.isNull()) {
                hyperlinkLabel = '0';
            } else if (_linkLabel.isBoolean()) {
                hyperlinkLabel = hyperlinkLabel.toLocaleUpperCase();
            }
        }

        return StringValueObject.create(hyperlinkLabel, {
            isHyperlink: true,
            hyperlinkUrl,
        });
    }
}

export class ExcelHyperlink extends Hyperlink {
    override needsReferenceObject = true;

    override calculate(url: BaseValueObject | BaseReferenceObject, linkLabel?: BaseValueObject | BaseReferenceObject): BaseValueObject {
        const destinationValue = this._readValue(url);
        const labelValue = linkLabel == null ? undefined : this._readValue(linkLabel);
        const labels = labelValue?.isArray() ? (labelValue as ArrayValueObject) : undefined;
        const label = labels ? labels.getFirstCell() : labelValue;
        if (destinationValue.isArray()) {
            return (destinationValue as ArrayValueObject).mapValue((value) => {
                const destination = this._destination(value);
                return typeof destination === 'string' ? this._makeLink(destination, label) : destination;
            });
        }
        const destination = this._destination(destinationValue);
        if (typeof destination !== 'string') return destination;
        return labels ? labels.mapValue((value) => this._makeLink(destination, value)) : this._makeLink(destination, label);
    }

    private _readValue(argument: BaseValueObject | BaseReferenceObject): BaseValueObject {
        if (!argument.isReferenceObject()) return argument as BaseValueObject;
        const values = (argument as BaseReferenceObject).toArrayValueObject();
        return values.getRowCount() === 1 && values.getColumnCount() === 1 ? values.getFirstCell() : values;
    }

    private _destination(url: BaseValueObject): string | BaseValueObject {
        if (url.isError()) return url;
        const value = url.getValue();
        const destination = url.isNull() ? '' : typeof value === 'number' ? formatExcelTextNumber(value) : formatValueForFormulaText(value);
        return destination.length > 255 ? ErrorValueObject.create(ErrorType.VALUE) : destination;
    }

    private _makeLink(destination: string, linkLabel?: BaseValueObject): BaseValueObject {
        if (linkLabel?.isError()) return linkLabel;
        const label = linkLabel == null
            ? StringValueObject.create(destination)
            : linkLabel.isNull() ? NumberValueObject.create(0) : linkLabel;
        return createTypedHyperlink(destination, label);
    }
}
