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

import {
    DOC_CONTENT_INSERT_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    EMPTY_PARAGRAPH_MENU_ID,
    INSERT_BELLOW_MENU_ID,
} from '@univerjs/docs-ui';
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { InsertDocImageCommand } from '../../commands/commands/insert-image.command';
import {
    InsertDocEllipseShapeCommand,
    InsertDocRectangleShapeCommand,
} from '../../commands/commands/insert-shape.command';
import { UploadFloatImageMenuFactory } from '../image.menu';
import { menuSchema } from '../schema';
import {
    DOCS_SHAPE_BELOW_MENU_ID,
    DOCS_SHAPE_MENU_ID,
} from '../shape.menu';

describe('docs drawing menu schema', () => {
    it('adds image to paragraph insert menus', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];

        expect(paragraph[ContextMenuGroup.LAYOUT][INSERT_BELLOW_MENU_ID][InsertDocImageCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[EMPTY_PARAGRAPH_MENU_ID][ContextMenuGroup.LAYOUT][InsertDocImageCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[DOC_CONTENT_INSERT_MENU_ID][ContextMenuGroup.LAYOUT][InsertDocImageCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[DOC_PARAGRAPH_T_INSERT_MENU_ID].insert[InsertDocImageCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID].insert[`${InsertDocImageCommand.id}.below`].menuItemFactory).toBeDefined();
    });

    it('uses the same image icon in paragraph insert menus', () => {
        const item = UploadFloatImageMenuFactory({ get: () => undefined } as never);

        expect(item.icon).toBe('AddImageIcon');
    });

    it('registers shape submenu options for paragraph insert menus', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const rootShapeMenu = paragraph[DOCS_SHAPE_MENU_ID].shapes;
        const belowShapeMenu = paragraph[DOCS_SHAPE_BELOW_MENU_ID].shapes;

        expect(paragraph[DOC_PARAGRAPH_T_INSERT_MENU_ID].insert[DOCS_SHAPE_MENU_ID].menuItemFactory).toBeDefined();
        expect(paragraph[DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID].insert[DOCS_SHAPE_BELOW_MENU_ID].menuItemFactory).toBeDefined();
        expect(rootShapeMenu[InsertDocRectangleShapeCommand.id].menuItemFactory).toBeDefined();
        expect(rootShapeMenu[InsertDocEllipseShapeCommand.id].menuItemFactory).toBeDefined();
        expect(belowShapeMenu[`${InsertDocRectangleShapeCommand.id}.below`].menuItemFactory).toBeDefined();
        expect(belowShapeMenu[`${InsertDocEllipseShapeCommand.id}.below`].menuItemFactory).toBeDefined();
    });
});
