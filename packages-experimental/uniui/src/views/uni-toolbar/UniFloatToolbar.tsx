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

import type { IMenuItem } from '@univerjs/ui';
import type { IUnitRendererProps } from '../workbench/UniWorkbench';
import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { IUniverInstanceService, type Nullable, useDependency, useObservable } from '@univerjs/core';
import { ComponentContainer, IMenuManagerService, ToolbarItem, useComponentsOfPart } from '@univerjs/ui';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { DELETE_MENU_ID, DOWNLOAD_MENU_ID, LOCK_MENU_ID, PRINT_MENU_ID, SHARE_MENU_ID, UNI_MENU_POSITIONS, ZEN_MENU_ID } from '../../controllers/menu';
import styles from './index.module.less';

export interface IFloatingToolbarRef {
    update: () => void;
}

export enum UniFloatToolbarUIPart {
    NAME = 'name',
}

const UNI_FLOATING_TOOLBAR_SCHEMA: string[] = [
    DOWNLOAD_MENU_ID,
    SHARE_MENU_ID,
    LOCK_MENU_ID,
    PRINT_MENU_ID,
    ZEN_MENU_ID,
    DELETE_MENU_ID,
];

export const UniFloatingToolbar = React.forwardRef<IFloatingToolbarRef, { node: Nullable<IUnitRendererProps> }>(({ node }, ref) => {
    const menuManagerService = useDependency(IMenuManagerService);
    const isMenuChange = useObservable(menuManagerService.menuChanged$);
    const [uniVisibleItems, setUniVisibleItems] = useState<IMenuItem[]>([]);

    const { x, y, refs, strategy, update } = useFloating({
        placement: 'top',
        middleware: [offset(10), flip(), shift({ padding: 5 })],
    });

    const { setReference, setFloating } = refs;

    const toolbarNameComponents = useComponentsOfPart(UniFloatToolbarUIPart.NAME);

    // Function to update the visible items
    const updateVisibleItems = () => {
        const menus = menuManagerService.getMenuByPositionKey(UNI_MENU_POSITIONS.TOOLBAR_FLOAT);
        if (menus) {
            const visibleItems = UNI_FLOATING_TOOLBAR_SCHEMA.map((id) => menus.find((item) => item.key === id)?.item).filter((item) => !!item);
            setUniVisibleItems(visibleItems);
        }
    };

    useImperativeHandle(ref, () => ({
        update: () => update(),
    }), [update]);

    useEffect(() => {
        if (node) {
            const ref = document.querySelector(`[data-id="${node.unitId}"]`);
            setReference(ref);
        }
    }, [node, setReference]);

    // Listen for menu changes and update visible items
    useEffect(() => {
        updateVisibleItems();
    }, [isMenuChange]);

    if (!node || !refs.reference.current) {
        return null;
    }

    return (
        <div
            className={styles.uniFloatingToolbar}
            ref={setFloating}
            style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
        >
            <div className={styles.uniToolbar}>
                <ComponentContainer
                    key="name"
                    components={toolbarNameComponents}
                    fallback={<UnitName unitId={node.unitId} />}
                />
                <UniDiv />
                <div className={styles.toolbarGroup}>
                    {uniVisibleItems.map((subItem) => <ToolbarItem key={subItem.id} {...subItem} />)}
                </div>
            </div>
        </div>
    );
});

export function UniDiv() {
    return <div className={styles.uniDiv}></div>;
}

export function UnitName({ unitId }: { unitId: string }) {
    const instanceService = useDependency(IUniverInstanceService);
    const unit = instanceService.getUnit(unitId);
    const name = useObservable(unit?.name$);
    return (
        <div className={styles.unitName}>
            {name}
        </div>
    );
};
