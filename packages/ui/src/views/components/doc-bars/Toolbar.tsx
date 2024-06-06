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

import { LocaleService } from '@univerjs/core';
import { Dropdown, Tooltip } from '@univerjs/design';
import { MoreFunctionSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import React, { useMemo } from 'react';

import { MenuPosition } from '../../../services/menu/menu';
import { ComponentContainer } from '../ComponentContainer';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';
import { useToolbarCollapseObserver, useToolbarGroups } from './hook';

const MENU_POSITIONS = [
    MenuPosition.TOOLBAR_START,
    MenuPosition.TOOLBAR_INSERT,
    MenuPosition.TOOLBAR_FORMULAS,
    MenuPosition.TOOLBAR_DATA,
    MenuPosition.TOOLBAR_VIEW,
    MenuPosition.TOOLBAR_OTHERS,
];

export interface IToolbarProps {
    headerMenuComponents?: Set<ComponentType>;
}

/**
 * Univer's built in toolbar component.
 */
export function Toolbar(props: IToolbarProps) {
    const { headerMenuComponents } = props;
    const localeService = useDependency(LocaleService);

    const { setCategory, visibleItems, groups, category, groupsByKey } = useToolbarGroups(MENU_POSITIONS);
    const { toolbarItemRefs, toolbarRef, collapsedId } = useToolbarCollapseObserver(visibleItems);

    // Should the header when there is at least one header menu components or menu groups.
    const hasHeaderMenu = useMemo(() => (headerMenuComponents && headerMenuComponents.size > 0) || groups.length > 1, [headerMenuComponents, groups]);

    return (
        <>
            {hasHeaderMenu
                ? (
                    <header className={styles.headerbar}>
                        <div className={styles.menubar}>
                            {groups.length > 1 &&
                                groups.map((item, index) => (
                                    <a
                                        key={index}
                                        className={clsx(styles.menubarItem, {
                                            [styles.menubarItemActive]: item.name === category,
                                        })}
                                        onClick={() => {
                                            setCategory(item.name);
                                        }}
                                    >
                                        {localeService.t(item.name)}
                                    </a>
                                ))}
                        </div>
                        <div className={styles.headerMenu}>
                            <ComponentContainer components={headerMenuComponents} />
                        </div>
                    </header>
                )
                : null}

            <div ref={toolbarRef} className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {Object.entries(groupsByKey)
                        .filter(([_, item]) => {
                            const count = item.filter((subItem) => !collapsedId.includes(subItem.id)).length;
                            return count;
                        })
                        .map(([key, item]) => (
                            <div key={key} className={styles.toolbarGroup}>
                                {item.map(
                                    (subItem) =>
                                        !collapsedId.includes(subItem.id) && (
                                            <ToolbarItem key={subItem.id} {...subItem} />
                                        )
                                )}
                            </div>
                        ))}

                    {collapsedId.length > 0 && (
                        <Tooltip title={localeService.t('more')} placement="bottom">
                            <div>
                                <Dropdown
                                    forceRender
                                    className={styles.toolbarMore}
                                    overlay={(
                                        <div className={styles.toolbarMoreContainer} onClick={(e) => e.stopPropagation()}>
                                            {Object.entries(groupsByKey).map(([key, item]) => (
                                                <div key={key} className={styles.toolbarGroup}>
                                                    {item.map(
                                                        (subItem) =>
                                                            collapsedId.includes(subItem.id) && (
                                                                <ToolbarItem key={subItem.id} {...subItem} />
                                                            )
                                                    )}
                                                </div>
                                            ))}
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
            </div>

            {/* fake toolbar for calculating overflow width */}
            <div
                className={styles.toolbarContainer}
                style={{
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    opacity: 0,
                }}
            >
                {Object.entries(groupsByKey).map(([key, item]) => (
                    <div key={key} className={styles.toolbarGroup}>
                        {item.map((subItem) => (
                            // TODO@jikkai: use fake ToolbarItem (no business logic) to improve performance.
                            <ToolbarItem
                                key={subItem.id}
                                ref={(ref) => {
                                    toolbarItemRefs.current[subItem.id] = {
                                        el: ref?.nativeElement as HTMLDivElement,
                                        key: subItem.id,
                                    };
                                }}
                                {...subItem}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
