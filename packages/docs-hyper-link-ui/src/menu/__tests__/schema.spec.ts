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

import { EMPTY_PARAGRAPH_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION, INSERT_BELLOW_MENU_ID } from '@univerjs/docs-ui';
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { menuSchema } from '../schema';

describe('docs hyperlink menu schema', () => {
    it('adds hyperlink to paragraph insert menus', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];

        expect(paragraph[ContextMenuGroup.LAYOUT][INSERT_BELLOW_MENU_ID][ShowDocHyperLinkEditPopupOperation.id].menuItemFactory).toBeDefined();
        expect(paragraph[EMPTY_PARAGRAPH_MENU_ID][ContextMenuGroup.LAYOUT][ShowDocHyperLinkEditPopupOperation.id].menuItemFactory).toBeDefined();
    });

    it('adds hyperlink to docs text floating toolbar', () => {
        const floatToolbar = (menuSchema as any)[FLOAT_TOOLBAR_MENU_POSITION];
        const hyperlink = floatToolbar[ShowDocHyperLinkEditPopupOperation.id];

        expect(hyperlink.order).toBe(20);
        expect(hyperlink.menuItemFactory).toBeDefined();
    });
});
