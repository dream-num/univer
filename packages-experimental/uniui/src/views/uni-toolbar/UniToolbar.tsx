/**
 * Copyright 2023-present DreamNum Inc.
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

import { RedoCommand, UndoCommand } from '@univerjs/core';
import { MenuPosition, ToolbarItem, useToolbarGroups } from '@univerjs/ui';
import type { ComponentType } from 'react';
import React from 'react';
import { SetRangeFontFamilyCommand, SetRangeFontSizeCommand, SetRangeTextColorCommand } from '@univerjs/sheets-ui';
import { SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand } from '@univerjs/docs';
import { SetBackgroundColorCommand } from '@univerjs/sheets';
import { IMAGE_MENU_ID as DocsImageMenuId } from '@univerjs/docs-drawing-ui';
import { IMAGE_MENU_ID as SheetsImageMenuId } from '@univerjs/sheets-drawing-ui';
import { FAKE_BG_COLOR_MENU_ID, FAKE_FONT_COLOR_MENU_ID, FAKE_FONT_FAMILY_MENU_ID, FAKE_FONT_SIZE_MENU_ID, FAKE_IMAGE_MENU_ID, FONT_GROUP_MENU_ID, UNI_MENU_POSITIONS } from '../../controllers/menu';
import styles from './index.module.less';
import { UniFormulaBar } from './UniFormulaBar';

const MENU_POSITIONS = [
    MenuPosition.TOOLBAR_START,
    MenuPosition.TOOLBAR_INSERT,
    MenuPosition.TOOLBAR_FORMULAS,
    MenuPosition.TOOLBAR_DATA,
    MenuPosition.TOOLBAR_VIEW,
    UNI_MENU_POSITIONS.TOOLBAR_MAIN,
];

export interface IToolbarProps {
    headerMenuComponents?: Set<ComponentType>;
}

const UNI_TOOLBAR_SCHEMA = [
    [UndoCommand.id],
    [RedoCommand.id],
    [SetRangeFontFamilyCommand.id, SetInlineFormatFontFamilyCommand.id, FAKE_FONT_FAMILY_MENU_ID],
    [SetRangeFontSizeCommand.id, SetInlineFormatFontSizeCommand.id, FAKE_FONT_SIZE_MENU_ID],
    [FONT_GROUP_MENU_ID],
    [SetRangeTextColorCommand.id, SetInlineFormatTextColorCommand.id, FAKE_FONT_COLOR_MENU_ID],
    [SetBackgroundColorCommand.id, SetInlineFormatTextBackgroundColorCommand.id, FAKE_BG_COLOR_MENU_ID],
    [SheetsImageMenuId, DocsImageMenuId, FAKE_IMAGE_MENU_ID],
];

export function UniToolbar() {
    const { visibleItems } = useToolbarGroups(MENU_POSITIONS);
    const uniVisibleItems = UNI_TOOLBAR_SCHEMA.map((ids) => {
        for (const id of ids) {
            const item = visibleItems.find((i) => i.id === id);
            if (item) return item;
        }
        return null;
    }).filter((item) => !!item);

    return (
        <div className={styles.uniToolbar}>
            <UniFormulaBar />
            <div className={styles.toolbarGroup}>
                {uniVisibleItems.map((subItem) => <ToolbarItem key={subItem.id} {...subItem} />)}
            </div>
        </div>

    );
}
