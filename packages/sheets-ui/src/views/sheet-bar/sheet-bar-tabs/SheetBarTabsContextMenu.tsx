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

import type { IContextMenuAnchorRect, IValueOption } from '@univerjs/ui';
import type { ReactElement } from 'react';
import { generateRandomId } from '@univerjs/core';
import { AnchoredContextMenu, ContextMenuPosition } from '@univerjs/ui';
import { useRef } from 'react';

interface ISheetBarTabsContextMenuProps {
    children: ReactElement;
    anchorRect: IContextMenuAnchorRect | null;
    showContextMenu: boolean;
    visible: boolean;
    onCommandSelect: (commandId: string, value?: string | number) => void;
    onVisibleChange: (visible: boolean) => void;
}

const MENU_OFFSET = 6;

export function SheetBarTabsContextMenu(props: ISheetBarTabsContextMenuProps) {
    const { children, anchorRect, showContextMenu, visible, onCommandSelect, onVisibleChange } = props;
    const hostIdRef = useRef(`sheetbar-tabs-context-menu-${generateRandomId(6)}`);

    if (!showContextMenu) {
        return children;
    }

    return (
        <>
            {children}
            <AnchoredContextMenu
                hostId={hostIdRef.current}
                visible={visible}
                anchorRect={anchorRect}
                menuType={ContextMenuPosition.FOOTER_TABS}
                anchorVertical="top"
                menuOffset={MENU_OFFSET}
                onRequestClose={() => onVisibleChange(false)}
                onOptionSelect={(option: IValueOption) => {
                    const { label, id, commandId, value } = option;
                    onCommandSelect(commandId ?? id ?? label as string, value as string | number | undefined);
                }}
            />
        </>
    );
}
