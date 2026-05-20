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

import { MenuItemType, RibbonInsertGroup, RibbonStartGroup } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { CheckListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from '../../commands/commands/paragraph-align.command';
import { AlignMenuItemFactory } from '../menu';
import { menuSchema } from '../schema';

describe('docs ui ribbon schema', () => {
    it('uses one align dropdown instead of separate toolbar buttons', () => {
        const layout = (menuSchema as any)[RibbonStartGroup.LAYOUT];

        expect(layout[AlignOperationCommand.id].menuItemFactory).toBe(AlignMenuItemFactory);
        expect(layout[AlignLeftCommand.id]).toBeUndefined();
        expect(layout[AlignCenterCommand.id]).toBeUndefined();
        expect(layout[AlignRightCommand.id]).toBeUndefined();
        expect(layout[AlignJustifyCommand.id]).toBeUndefined();

        const item = AlignMenuItemFactory({ get: () => ({}) } as never);
        expect(item.type).toBe(MenuItemType.SELECTOR);
        expect((item.selections as Array<{ id?: string }>).map((option) => option.id)).toEqual([
            AlignLeftCommand.id,
            AlignCenterCommand.id,
            AlignRightCommand.id,
            AlignJustifyCommand.id,
        ]);
    });

    it('moves horizontal line and checklist to the insert tab', () => {
        const layout = (menuSchema as any)[RibbonStartGroup.LAYOUT];
        const media = (menuSchema as any)[RibbonInsertGroup.MEDIA];

        expect(layout[HorizontalLineCommand.id]).toBeUndefined();
        expect(layout[CheckListCommand.id]).toBeUndefined();
        expect(media[HorizontalLineCommand.id].menuItemFactory).toBeDefined();
        expect(media[CheckListCommand.id].menuItemFactory).toBeDefined();
    });
});
