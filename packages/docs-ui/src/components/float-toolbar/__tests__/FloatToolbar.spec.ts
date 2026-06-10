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

import type { IMenuSchema } from '@univerjs/ui';
import { MenuManagerPosition } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SetInlineFormatBoldCommand } from '../../../commands/commands/inline-format.command';
import { FLOAT_TEXT_STYLE_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION } from '../../../menu/menu';
import { resolveFloatToolbarMenus } from '../FloatToolbar';

describe('resolveFloatToolbarMenus', () => {
    it('keeps default toolbar menus ordered by whitelist and appends direct extension menus separately', () => {
        const textStyleItem = createMenuItem(FLOAT_TEXT_STYLE_MENU_ID);
        const boldItem = createMenuItem(SetInlineFormatBoldCommand.id);
        const hyperlinkItem = createMenuItem('doc.operation.show-hyper-link-edit-popup');
        const commentItem = createMenuItem('docs.operation.start-add-comment');
        const menuManagerService = {
            getMenuByPositionKey: vi.fn((position: string) => {
                if (position === FLOAT_TOOLBAR_MENU_POSITION) {
                    return [textStyleItem, hyperlinkItem, commentItem];
                }

                return [];
            }),
            getFlatMenuByPositionKey: vi.fn((position: string) => {
                if (position === FLOAT_TOOLBAR_MENU_POSITION) {
                    return [textStyleItem, hyperlinkItem, commentItem];
                }
                if (position === MenuManagerPosition.RIBBON) {
                    return [boldItem];
                }

                return [];
            }),
        };

        const { menus, extraMenus } = resolveFloatToolbarMenus(menuManagerService as never, [
            FLOAT_TEXT_STYLE_MENU_ID,
            SetInlineFormatBoldCommand.id,
        ]);

        expect(menus.map((item) => item.key)).toEqual([
            FLOAT_TEXT_STYLE_MENU_ID,
            SetInlineFormatBoldCommand.id,
        ]);
        expect(extraMenus.map((item) => item.key)).toEqual([
            'doc.operation.show-hyper-link-edit-popup',
            'docs.operation.start-add-comment',
        ]);
    });
});

function createMenuItem(key: string): IMenuSchema {
    return {
        key,
        order: 0,
        item: {
            id: key,
        } as never,
    };
}
