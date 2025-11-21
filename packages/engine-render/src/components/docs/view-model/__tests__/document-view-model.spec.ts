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

import { DataStreamTreeNodeType, DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { parseDataStreamToTree } from '../document-view-model';

describe('DocumentViewModel', () => {
    describe('parseDataStreamToTree', () => {
        it('should handle empty section correctly', () => {
            const dataStream = DataStreamTreeTokenType.SECTION_BREAK;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(1);
            const section = sectionList[0];
            expect(section.nodeType).toBe(DataStreamTreeNodeType.SECTION_BREAK);
            expect(section.children.length).toBe(1);
            expect(section.children[0].nodeType).toBe(DataStreamTreeNodeType.PARAGRAPH);
            expect(section.children[0].content).toBe('');
        });

        it('should handle consecutive section breaks correctly', () => {
            const dataStream = `Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}${DataStreamTreeTokenType.SECTION_BREAK}`;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(2);

            // First section
            expect(sectionList[0].children.length).toBe(1);
            expect(sectionList[0].children[0].content).toBe(`Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);

            // Second section (empty)
            expect(sectionList[1].children.length).toBe(1);
            expect(sectionList[1].children[0].content).toBe('');
        });
    });
});
