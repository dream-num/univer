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

import { LocaleService, RedoCommand, UndoCommand, useDependency } from '@univerjs/core';
import { Dropdown, Tooltip } from '@univerjs/design';
import { MoreFunctionSingle } from '@univerjs/icons';
import { MenuPosition, ToolbarButton, ToolbarItem, useToolbarCollapseObserver, useToolbarGroups } from '@univerjs/ui';
import type { ComponentType } from 'react';
import React from 'react';
import { SetRangeBoldCommand, SetRangeFontFamilyCommand, SetRangeFontSizeCommand, SetRangeTextColorCommand } from '@univerjs/sheets-ui';
import { SetInlineFormatBoldCommand, SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand } from '@univerjs/docs';
import { SetBackgroundColorCommand } from '@univerjs/sheets';
import { IMAGE_MENU_ID as DocsImageMenuId } from '@univerjs/docs-drawing-ui';
import { IMAGE_MENU_ID as SheetsImageMenuId } from '@univerjs/sheets-drawing-ui';
import { UNI_MENU_POSITIONS } from '../../controllers/menu';
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
    UndoCommand.id,
    RedoCommand.id,
    SetRangeFontFamilyCommand.id,
    SetInlineFormatFontFamilyCommand.id,
    SetRangeFontSizeCommand.id,
    SetInlineFormatFontSizeCommand.id,
    SetRangeBoldCommand.id,
    SetInlineFormatBoldCommand.id,
    SetRangeTextColorCommand.id,
    SetInlineFormatTextColorCommand.id,
    SetBackgroundColorCommand.id,
    SetInlineFormatTextBackgroundColorCommand.id,
    SheetsImageMenuId,
    DocsImageMenuId,
];

export function UniToolbar() {
    const localeService = useDependency(LocaleService);

    const { visibleItems } = useToolbarGroups(MENU_POSITIONS);
    const uniVisibleItems = UNI_TOOLBAR_SCHEMA.map((id) => visibleItems.find((item) => item.id === id)).filter((item) => !!item);

    const { toolbarRef, collapsedId } = useToolbarCollapseObserver(uniVisibleItems);

    return (
        <div ref={toolbarRef} className={styles.uniToolbar}>

            <UniFormulaBar />
            <div className={styles.toolbarGroup}>
                {uniVisibleItems.map(
                    (subItem) =>
                        !collapsedId.includes(subItem.id) && (
                            <ToolbarItem key={subItem.id} {...subItem} />
                        )
                )}
            </div>

            {collapsedId.length > 0 && (
                <Tooltip title={localeService.t('more')} placement="bottom">
                    <div>
                        <Dropdown
                            forceRender
                            className={styles.toolbarMore}
                            overlay={(
                                <div className={styles.toolbarMoreContainer} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.toolbarGroup}>
                                        {uniVisibleItems.map(
                                            (subItem) =>
                                                collapsedId.includes(subItem.id) && (
                                                    <ToolbarItem key={subItem.id} {...subItem} />
                                                )
                                        )}
                                    </div>

                                </div>
                            )}
                        >
                            <span>
                                <ToolbarButton className={styles.toolbarItemTextButton}>
                                    <MoreFunctionSingle />
                                </ToolbarButton>
                            </span>
                        </Dropdown>
                    </div>
                </Tooltip>
            )}
        </div>

    );
}
