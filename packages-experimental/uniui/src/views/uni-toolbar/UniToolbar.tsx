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

import type { IMenuItem } from '@univerjs/ui';
import type { ComponentType } from 'react';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useWorkbooks } from '@univerjs/sheets-ui';
import { IMenuManagerService, ToolbarItem, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { UNI_MENU_POSITIONS } from '../../controllers/menu';
import { UniToolbarService } from '../../services/toolbar/uni-toolbar-service';
import { UniFormulaBar } from './UniFormulaBar';

export interface IToolbarProps {
    headerMenuComponents?: Set<ComponentType>;
}

export function UniToolbar() {
    const uniToolbarService = useDependency(UniToolbarService);
    const instanceService = useDependency(IUniverInstanceService);
    const focusedUnit = useObservable(instanceService.focused$);
    const menuManagerService = useDependency(IMenuManagerService);
    const isMenuChange = useObservable(menuManagerService.menuChanged$);
    const [uniVisibleItems, setUniVisibleItems] = useState<(IMenuItem | null)[]>([]);

    const type = focusedUnit ? (instanceService.getUnit(focusedUnit)?.type ?? UniverInstanceType.UNIVER_UNKNOWN) : UniverInstanceType.UNIVER_UNKNOWN;

    const toolbarItems = uniToolbarService.getItems();
    const hasWorkbooks = useWorkbooks().length > 0;

    // The initialization of the UniToolbar component may be earlier than the initialization of the SheetUIController in the onReady cycle, resulting in the UNI_MENU_POSITIONS.TOOLBAR_MAIN menu not being registered
    // Function to update the visible items
    const updateVisibleItems = () => {
        const menus = menuManagerService.getMenuByPositionKey(UNI_MENU_POSITIONS.TOOLBAR_MAIN);
        if (menus) {
            const visibleItems = toolbarItems.map((item) => {
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
            }).filter((item) => !!item && !item.id.startsWith('FAKE_'));
            setUniVisibleItems(visibleItems);
        }
    };

    // Listen for menu changes and update visible items
    useEffect(() => {
        updateVisibleItems();
    }, [isMenuChange]);

    return (
        <div
            className={`
              univer-flex univer-p-2 univer-items-center univer-gap-2 univer-rounded-lg univer-border
              univer-border-gray-300 univer-overflow-hidden univer-shadow-lg univer-select-none univer-relative
              univer-box-border univer-text-sm univer-bg-white
            `}
        >
            {hasWorkbooks && <UniFormulaBar />}
            <div className="univer-flex univer-gap-1 univer-items-center univer-shrink-0">
                {uniVisibleItems.map((subItem) => subItem && <ToolbarItem key={subItem.id} {...subItem} />)}
            </div>
        </div>

    );
}
