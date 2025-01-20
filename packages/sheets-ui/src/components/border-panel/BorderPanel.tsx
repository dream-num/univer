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

import { BorderStyleTypes, useDependency } from '@univerjs/core';
import { ColorPicker, DropdownLegacy, Menu, MenuItem } from '@univerjs/design';
import { MoreDownSingle, PaintBucket } from '@univerjs/icons';
import { BorderStyleManagerService, type IBorderInfo } from '@univerjs/sheets';
import { ComponentManager } from '@univerjs/ui';
import React from 'react';

import { BorderLine } from './border-line/BorderLine';
import styles from './index.module.less';
import { BORDER_LINE_CHILDREN, type IBorderPanelProps } from './interface';

const BORDER_SIZE_CHILDREN = [
    {
        label: BorderStyleTypes.THIN,
        value: BorderStyleTypes.THIN,
    },
    {
        label: BorderStyleTypes.HAIR,
        value: BorderStyleTypes.HAIR,
    },
    {
        label: BorderStyleTypes.DOTTED,
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: BorderStyleTypes.DASHED,
        value: BorderStyleTypes.DASHED,
    },
    {
        label: BorderStyleTypes.DASH_DOT,
        value: BorderStyleTypes.DASH_DOT,
    },
    {
        label: BorderStyleTypes.DASH_DOT_DOT,
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM,
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASHED,
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.THICK,
        value: BorderStyleTypes.THICK,
    },
];

export function BorderPanel(props: IBorderPanelProps) {
    const componentManager = useDependency(ComponentManager);
    const borderStyleManagerService = useDependency(BorderStyleManagerService);

    const { onChange, value } = props;

    function handleClick(v: string | number, type: keyof IBorderInfo) {
        onChange?.({
            ...value,
            [type]: v,
        });
    }

    function renderIcon(icon: string) {
        const Icon = componentManager.get(icon);

        return Icon && <Icon extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />;
    }

    function stopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <section className={styles.uiPluginSheetsBorderPanel}>
            <div className={styles.uiPluginSheetsBorderPanelPosition}>
                {BORDER_LINE_CHILDREN.map((item) => (
                    <div
                        key={item.value}
                        className={borderStyleManagerService.getBorderInfo().type === item.value
                            ? (`
                              ${styles.uiPluginSheetsBorderPanelPositionItemActive}
                              ${styles.uiPluginSheetsBorderPanelPositionItem}
                            `)
                            : styles.uiPluginSheetsBorderPanelPositionItem}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item.value, 'type');
                        }}
                    >
                        {renderIcon(item.icon)}
                    </div>
                ))}
            </div>

            <div className={styles.uiPluginSheetsBorderPanelStyles}>
                <div>
                    <DropdownLegacy
                        align={{
                            offset: [0, 18],
                        }}
                        overlay={(
                            <section className={styles.uiPluginSheetsBorderPanelBoard} onClick={stopPropagation}>
                                <ColorPicker onChange={(value) => handleClick(value, 'color')} />
                            </section>
                        )}
                    >
                        <a className={styles.uiPluginSheetsBorderPanelButton} onClick={stopPropagation}>
                            <PaintBucket extend={{ colorChannel1: value?.color ?? 'rgb(var(--primary-color))' }} />
                            <span className={styles.uiPluginSheetsBorderPanelMoreIcon}>
                                <MoreDownSingle />
                            </span>
                        </a>
                    </DropdownLegacy>
                </div>

                <div>
                    <DropdownLegacy
                        align={{
                            offset: [0, 18],
                        }}
                        overlay={(
                            <section onClick={stopPropagation}>
                                <Menu>
                                    {BORDER_SIZE_CHILDREN.map((item) => (
                                        <MenuItem
                                            key={item.value}
                                            eventKey={item.value.toString()}
                                            onClick={() => handleClick(item.value, 'style')}
                                        >
                                            <BorderLine type={item.value} />
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </section>
                        )}
                    >
                        <a className={styles.uiPluginSheetsBorderPanelButton} onClick={stopPropagation}>
                            <BorderLine type={BorderStyleTypes.THIN} />
                            <span className={styles.uiPluginSheetsBorderPanelMoreIcon}>
                                <MoreDownSingle />
                            </span>
                        </a>
                    </DropdownLegacy>
                </div>
            </div>
        </section>
    );
}
