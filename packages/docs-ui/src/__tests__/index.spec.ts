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
import {
    DOC_TABLE_BLOCK_MENU_ID,
    INSERT_BELLOW_MENU_ID,
    ParagraphMenuInsertBelowSubmenuItemFactory,
} from '../index';

describe('docs-ui public exports', () => {
    it('re-exports table block paragraph menu ids and factories', () => {
        expect(DOC_TABLE_BLOCK_MENU_ID).toBe('doc.menu.table-block');
        expect(INSERT_BELLOW_MENU_ID).toBe('doc.menu.insert-bellow');
        expect(ParagraphMenuInsertBelowSubmenuItemFactory).toBeTypeOf('function');
    });
});
