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

import { HorizontalAlign, RichTextBuilder } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { alignRangeSelectorDocument } from '../use-range-selector-editor-alignment';

describe('alignRangeSelectorDocument', () => {
    it.each([
        ['ltr', HorizontalAlign.LEFT],
        ['rtl', HorizontalAlign.RIGHT],
    ] as const)('uses %s locale direction', (direction, expected) => {
        const documentData = RichTextBuilder.create().insertText('Sheet1!B20:E26').getData();

        const alignedDocument = alignRangeSelectorDocument(documentData, direction);

        expect(alignedDocument.documentStyle?.renderConfig?.horizontalAlign).toBe(expected);
    });
});
