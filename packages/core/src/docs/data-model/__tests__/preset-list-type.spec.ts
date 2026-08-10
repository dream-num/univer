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

import { describe, expect, it } from 'vitest';
import { PRESET_LIST_TYPE } from '../preset-list-type';

describe('preset list types', () => {
    it('does not assign absolute font sizes to built-in list markers', () => {
        for (const [listType, listData] of Object.entries(PRESET_LIST_TYPE)) {
            for (const [level, nesting] of listData.nestingLevel.entries()) {
                expect(nesting.textStyle?.fs, `${listType} level ${level}`).toBeUndefined();
            }
        }
    });

    it('keeps wrapped text aligned after the hanging marker at every level', () => {
        for (const [listType, listData] of Object.entries(PRESET_LIST_TYPE)) {
            for (const [level, nesting] of listData.nestingLevel.entries()) {
                expect(nesting.paragraphProperties?.hanging, `${listType} level ${level}`).toEqual({ v: 21 });
                expect(nesting.paragraphProperties?.indentStart, `${listType} level ${level}`).toEqual({ v: 21 * (level + 1) });
            }
        }
    });
});
