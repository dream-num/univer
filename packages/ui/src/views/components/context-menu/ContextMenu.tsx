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

import type { IMouseEvent } from '@univerjs/engine-render';
import type { IContextMenuAnchorRect } from './AnchoredContextMenu';
import { ICommandService } from '@univerjs/core';

import { useEffect, useRef, useState } from 'react';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { useDependency, useInjector } from '../../../utils/di';
import { AnchoredContextMenu } from './AnchoredContextMenu';

const DESKTOP_CONTEXT_MENU_HOST_ID = 'desktop-context-menu';

export function DesktopContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [anchorRect, setAnchorRect] = useState<IContextMenuAnchorRect | null>(null);
    const visibleRef = useRef(visible);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const injector = useInjector();
    visibleRef.current = visible;

    useEffect(() => {
        const disposables = contextMenuService.registerContextMenuHandler({
            handleContextMenu,
            hideContextMenu() {
                handleClose();
            },
            get visible() {
                return visibleRef.current;
            },
        });

        return () => {
            disposables.dispose();
        };
    }, [contextMenuService]);

    /** A function to open context menu with given position and menu type. */
    function handleContextMenu(event: IMouseEvent, menuType: string) {
        setVisible(false);
        requestAnimationFrame(() => {
            setMenuType(menuType);
            setAnchorRect({
                left: event.clientX,
                top: event.clientY,
                bottom: event.clientY,
            });
            setVisible(true);
        });
    }

    function handleClose() {
        setVisible(false);
    }

    return (
        <AnchoredContextMenu
            hostId={DESKTOP_CONTEXT_MENU_HOST_ID}
            visible={visible}
            anchorRect={anchorRect}
            menuType={menuType}
            onRequestClose={handleClose}
            onOptionSelect={(params) => {
                const { label: id, commandId, value } = params;

                if (commandService) {
                    commandService.executeCommand(commandId ?? id as string, { value });
                }

                const layoutService = injector.get(ILayoutService);
                layoutService.focus();

                handleClose();
            }}
        />
    );
}
