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

import { IUniverInstanceService, UniverInstanceType, useDependency, useObservable } from '@univerjs/core';
import { MenuPosition, ToolbarItem, useToolbarGroups } from '@univerjs/ui';
import type { ComponentType } from 'react';
import React from 'react';
import { UNI_MENU_POSITIONS } from '../../controllers/menu';
import { UniToolbarService } from '../../services/toolbar/uni-toolbar-service';
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

export function UniToolbar() {
    const uniToolbarService = useDependency(UniToolbarService);
    const instanceService = useDependency(IUniverInstanceService);
    const focusedUnit = useObservable(instanceService.focused$);

    const type = focusedUnit ? (instanceService.getUnit(focusedUnit)?.type ?? UniverInstanceType.UNIVER_UNKNOWN) : UniverInstanceType.UNIVER_UNKNOWN;

    const { visibleItems } = useToolbarGroups(MENU_POSITIONS);

    const toolbarItems = uniToolbarService.getItems();

    const uniVisibleItems = toolbarItems.map((item) => {
        const { impl } = item;
        const id = impl.find((item) => item.type === type) || impl.find((item) => item.type === UniverInstanceType.UNIVER_UNKNOWN);
        if (id !== undefined) {
            return visibleItems.find((item) => item.id === id.id);
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
