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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Filterxml extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(xml: BaseValueObject, xpath: BaseValueObject): BaseValueObject {
        if (xml.isError()) {
            return xml;
        }

        if (xpath.isError()) {
            return xpath;
        }

        const tagName = getDescendantTagName(`${xpath.getValue()}`);
        if (tagName == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const values = extractTagTexts(`${xml.getValue()}`, tagName);
        if (values.length === 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return ArrayValueObject.create({
            calculateValueList: transformToValueObject(values.map((value) => [value])),
            rowCount: values.length,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
    }
}

function getDescendantTagName(xpath: string): string | null {
    const text = xpath.trim();
    if (!text.startsWith('//')) {
        return null;
    }

    const tagName = text.slice(2).replace(/\/text\(\)$/, '').trim();
    return /^[A-Za-z0-9_.-]+$/.test(tagName) ? tagName : null;
}

function extractTagTexts(xml: string, tagName: string): string[] {
    const open = `<${tagName}>`;
    const close = `</${tagName}>`;
    const values: string[] = [];
    let offset = 0;

    while (offset < xml.length) {
        const openIndex = xml.indexOf(open, offset);
        if (openIndex < 0) {
            break;
        }
        const valueStart = openIndex + open.length;
        const closeIndex = xml.indexOf(close, valueStart);
        if (closeIndex < 0) {
            break;
        }
        values.push(decodeXmlEntities(xml.slice(valueStart, closeIndex)));
        offset = closeIndex + close.length;
    }

    return values;
}

function decodeXmlEntities(value: string): string {
    return value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}
