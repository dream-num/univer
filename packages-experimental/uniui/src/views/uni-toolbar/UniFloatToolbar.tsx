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

import type { Nullable } from '@univerjs/core';
import type { IMenuItem } from '@univerjs/ui';
import type { IUnitRendererProps } from '../workbench/UniWorkbench';
import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { IUniverInstanceService } from '@univerjs/core';
import { ComponentContainer, IMenuManagerService, ToolbarItem, useComponentsOfPart, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { DELETE_MENU_ID, DOWNLOAD_MENU_ID, LOCK_MENU_ID, PRINT_MENU_ID, SHARE_MENU_ID, UNI_MENU_POSITIONS, ZEN_MENU_ID } from '../../controllers/menu';

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
            className={`
              univer-flex univer-items-center univer-gap-2 univer-rounded-md univer-bg-white univer-text-sm
              univer-text-primary-600
              dark:univer-bg-gray-900
            `}
            ref={setFloating}
            style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
        >
            <div
                className="univer-inline-flex univer-flex-shrink-0 univer-items-center univer-gap-2 univer-p-2"
            >
                <ComponentContainer
                    key="name"
                    components={toolbarNameComponents}
                    fallback={<UnitName unitId={node.unitId} />}
                />
                <UniDiv />
                <div className="univer-flex">
                    {uniVisibleItems.map((subItem) => <ToolbarItem key={subItem.id} {...subItem} />)}
                </div>
            </div>
        </div>
    );
});

export function UniDiv() {
    return <div className="univer-h-6 univer-w-px univer-bg-gray-100" />;
}

export function UnitName({ unitId }: { unitId: string }) {
    const instanceService = useDependency(IUniverInstanceService);
    const unit = instanceService.getUnit(unitId);
    const name = useObservable(unit?.name$);
    return (
        <div
            className={`
              univer-flex univer-h-6 univer-items-center univer-gap-1 univer-rounded-md univer-bg-white univer-px-1
              univer-py-0 univer-text-sm univer-text-gray-900
              dark:univer-text-white
            `}
        >
            {name}
        </div>
    );
};
