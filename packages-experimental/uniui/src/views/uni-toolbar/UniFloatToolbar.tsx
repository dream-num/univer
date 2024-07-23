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

import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import React, { useEffect, useImperativeHandle } from 'react';
import { IUniverInstanceService, LocaleService, type Nullable, useDependency, useObservable } from '@univerjs/core';
import { ToolbarItem, useToolbarCollapseObserver, useToolbarGroups } from '@univerjs/ui';
import type { IUnitRendererProps } from '../workbench/UniWorkbench';
import { DOWNLOAD_MENU_ID, LOCK_MENU_ID, PRINT_MENU_ID, SHARE_MENU_ID, UNI_MENU_POSITIONS, ZEN_MENU_ID } from '../../controllers/menu';
import styles from './index.module.less';

export interface FloatingToolbarRef {
    update: () => void;
}

const MENU_POSITIONS = [
    UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
];

const UNI_FLOATING_TOOLBAR_SCHEMA: string[] = [
    DOWNLOAD_MENU_ID,
    SHARE_MENU_ID,
    LOCK_MENU_ID,
    PRINT_MENU_ID,
    ZEN_MENU_ID,
];

export const UnitName = ({ unitId }: { unitId: string }) => {
    const instanceService = useDependency(IUniverInstanceService);
    const unit = instanceService.getUnit(unitId);
    const name = useObservable(unit?.name$);
    return (
        <div className={styles.unitName}>
            {name}
        </div>
    );
};

export const UniFloatingToolbar = React.forwardRef<FloatingToolbarRef, { node: Nullable<IUnitRendererProps>; anchorRef: React.MutableRefObject<HTMLElement | null> }>(({ node, anchorRef }, ref) => {
    const { x, y, refs, strategy, update } = useFloating({
        placement: 'top',
        middleware: [offset(10), flip(), shift({ padding: 5 })],
    });
    const localeService = useDependency(LocaleService);

    const { visibleItems } = useToolbarGroups(MENU_POSITIONS);
    const uniVisibleItems = UNI_FLOATING_TOOLBAR_SCHEMA.map((id) => visibleItems.find((item) => item.id === id)).filter((item) => !!item);

    const { toolbarRef, collapsedId } = useToolbarCollapseObserver(uniVisibleItems);

    const { setReference, setFloating } = refs;

    useImperativeHandle(ref, () => ({
        update: () => update(),
    }), [update]);

    useEffect(() => {
        if (anchorRef.current) {
            setReference(anchorRef.current);
        }
    }, [anchorRef.current, setReference]);

    if (!node || !anchorRef.current) {
        return null;
    }

    return (
        <div
            className={styles.uniFloatingToolbar}
            ref={setFloating}
            style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
        >
            <div ref={toolbarRef} className={styles.uniToolbar}>

                <UnitName unitId={node.unitId} />
                <div className={styles.toolbarGroup}>
                    {uniVisibleItems.map(
                        (subItem) =>
                            !collapsedId.includes(subItem.id) && (
                                <ToolbarItem key={subItem.id} {...subItem} />
                            )
                    )}
                </div>
            </div>
        </div>
    );
});

