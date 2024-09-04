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
import { IMenuManagerService, ToolbarItem } from '@univerjs/ui';
import type { ComponentType } from 'react';
import React from 'react';
import { useWorkbooks } from '@univerjs/sheets-ui';
import { UNI_MENU_POSITIONS } from '../../controllers/menu';
import { UniToolbarService } from '../../services/toolbar/uni-toolbar-service';
import styles from './index.module.less';
import { UniFormulaBar } from './UniFormulaBar';

export interface IToolbarProps {
    headerMenuComponents?: Set<ComponentType>;
}

export function UniToolbar() {
    const uniToolbarService = useDependency(UniToolbarService);
    const instanceService = useDependency(IUniverInstanceService);
    const focusedUnit = useObservable(instanceService.focused$);
    const menuManagerService = useDependency(IMenuManagerService);

    const type = focusedUnit ? (instanceService.getUnit(focusedUnit)?.type ?? UniverInstanceType.UNIVER_UNKNOWN) : UniverInstanceType.UNIVER_UNKNOWN;

    const menus = menuManagerService.getMenuByPositionKey(UNI_MENU_POSITIONS.TOOLBAR_MAIN);

    const toolbarItems = uniToolbarService.getItems();

    const uniVisibleItems = toolbarItems.map((item) => {
        const { impl } = item;
        const typeImpl = impl.find((item) => item.type === type);
        const visibleItem = menus.find((item) => item.key === typeImpl?.id)?.item;
        if (visibleItem) {
            return visibleItem;
        }
        const placeHolderImpl = impl.find((item) => item.type === UniverInstanceType.UNIVER_UNKNOWN);
        const placeHolderItem = menus.find((item) => item.key === placeHolderImpl?.id)?.item;
        if (placeHolderItem) {
            return placeHolderItem;
        }
        return null;
    }).filter((item) => {
        return !!item && !item.id.startsWith('FAKE_');
    });

    const hasWorkbooks = useWorkbooks().length > 0;

    return (
        <div className={styles.uniToolbar}>
            {hasWorkbooks && <UniFormulaBar />}
            <div className={styles.toolbarGroup}>
                {uniVisibleItems.map((subItem) => subItem && <ToolbarItem key={subItem.id} {...subItem} />)}
            </div>
        </div>

    );
}
