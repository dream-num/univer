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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

export const getPlainText = (text: string) => {
    return text.replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '')
        .replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '');
};

/**
 * get plain text from rich-text
 */
export const getPlainTextFormBody = (body: IDocumentBody) => {
    let str = body.dataStream;
    if (body.dataStream.endsWith('\r\n')) {
        str = body.dataStream.slice(0, -2);
    }

    return getPlainText(str);
};

/**
 * get plain text from rich-text
 */
export const getPlainTextFormDocument = (data: IDocumentData) => {
    if (!data.body) {
        return '';
    }
    return getPlainTextFormBody(data.body);
};

