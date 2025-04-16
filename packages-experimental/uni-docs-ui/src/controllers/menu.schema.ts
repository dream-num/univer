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
import { DocsUIMenuSchema } from '@univerjs/docs-ui';
import { RibbonStartGroup } from '@univerjs/ui';
import { FONT_GROUP_MENU_ID, UNI_MENU_POSITIONS } from '@univerjs/uniui';
import {
    DOC_BOLD_MUTATION_ID,
    DOC_ITALIC_MUTATION_ID,
    DOC_STRIKE_MUTATION_ID,
    DOC_UNDERLINE_MUTATION_ID,
    DocBoldMenuItemFactory,
    DocItalicMenuItemFactory,
    DocStrikeThroughMenuItemFactory,
    DocUnderlineMenuItemFactory,
} from './menu';

export const menuSchema: MenuSchemaType = {
    [UNI_MENU_POSITIONS.TOOLBAR_MAIN]: (DocsUIMenuSchema as any)[RibbonStartGroup.FORMAT],
    [FONT_GROUP_MENU_ID]: {
        [DOC_BOLD_MUTATION_ID]: {
            order: 0,
            menuItemFactory: DocBoldMenuItemFactory,
        },
        [DOC_ITALIC_MUTATION_ID]: {
            order: 1,
            menuItemFactory: DocItalicMenuItemFactory,
        },
        [DOC_UNDERLINE_MUTATION_ID]: {
            order: 2,
            menuItemFactory: DocUnderlineMenuItemFactory,
        },
        [DOC_STRIKE_MUTATION_ID]: {
            order: 3,
            menuItemFactory: DocStrikeThroughMenuItemFactory,
        },
    },
};
