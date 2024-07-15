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

import { DataStreamTreeTokenType, type IDocumentData } from '@univerjs/core';

/**
 * get plain text from rich-text
 */
export const getPlainTextFormDocument = (data: IDocumentData) => {
    if (!data.body) {
        return '';
    }
    const str = data.body.dataStream.slice(0, -2);
    return str.replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '').replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '');
};
