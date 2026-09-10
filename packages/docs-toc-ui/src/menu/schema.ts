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

import type { MenuSchemaType } from '@univerjs/ui';
import { DeleteTableOfContentsCommand } from '@univerjs/docs-toc';
import { ContextMenuGroup, ContextMenuPosition, MenuManagerPosition, RibbonInsertGroup } from '@univerjs/ui';
import { OpenTableOfContentsDialogOperation } from '../commands/table-of-contents-dialog.operation';
import { DeleteTableOfContentsMenuFactory, INSERT_TABLE_OF_CONTENTS_MENU_ID, InsertTableOfContentsMenuFactory, UpdateTableOfContentsMenuFactory } from './menu';

export const DOC_TABLE_OF_CONTENTS_RIBBON_TAB = 'ribbon.table-of-contents';
const DOC_TABLE_OF_CONTENTS_RIBBON_GROUP = 'ribbon.table-of-contents.manage';

export const tableOfContentsRibbonMenuSchema: MenuSchemaType = {
    [MenuManagerPosition.RIBBON]: {
        [DOC_TABLE_OF_CONTENTS_RIBBON_TAB]: {
            order: 100,
            title: 'docs-toc-ui.tableOfContents.title',
            contextual: true,
            [DOC_TABLE_OF_CONTENTS_RIBBON_GROUP]: {
                order: 0,
                [OpenTableOfContentsDialogOperation.id]: {
                    order: 0,
                    gridLayout: { row: 1, column: 1, rowSpan: 2, showLabel: true },
                    menuItemFactory: UpdateTableOfContentsMenuFactory,
                },
                [DeleteTableOfContentsCommand.id]: {
                    order: 1,
                    gridLayout: { row: 1, column: 2, rowSpan: 2, showLabel: true },
                    menuItemFactory: DeleteTableOfContentsMenuFactory,
                },
            },
        },
    },
};

export const DocsTocUIMenuSchema: MenuSchemaType = {
    [RibbonInsertGroup.CELL]: {
        [INSERT_TABLE_OF_CONTENTS_MENU_ID]: {
            order: 7,
            gridLayout: { row: 1, column: 1, showLabel: true },
            menuItemFactory: InsertTableOfContentsMenuFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.LAYOUT]: {
            [OpenTableOfContentsDialogOperation.id]: {
                order: -1,
                menuItemFactory: UpdateTableOfContentsMenuFactory,
            },
            [DeleteTableOfContentsCommand.id]: {
                order: -0.5,
                menuItemFactory: DeleteTableOfContentsMenuFactory,
            },
        },
    },
};
