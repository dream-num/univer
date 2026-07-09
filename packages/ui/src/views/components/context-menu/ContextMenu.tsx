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
import type { IContextMenuTriggerContext } from '../../../services/contextmenu/contextmenu.service';
import type { IContextMenuAnchorRect } from './AnchoredContextMenu';
import { ICommandService } from '@univerjs/core';
import { useEffect, useRef, useState } from 'react';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { IUIRuntimeScopeService } from '../../../services/runtime-scope/ui-runtime-scope.service';
import { useDependency } from '../../../utils/di';
import { AnchoredContextMenu } from './AnchoredContextMenu';

const DESKTOP_CONTEXT_MENU_HOST_ID = 'desktop-context-menu';

export function DesktopContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [anchorRect, setAnchorRect] = useState<IContextMenuAnchorRect | null>(null);
    const [menuContext, setMenuContext] = useState<IContextMenuTriggerContext | undefined>();
    const visibleRef = useRef(visible);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const menuManagerService = useDependency(IMenuManagerService);
    const runtimeScopeService = useDependency(IUIRuntimeScopeService);
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
    function handleContextMenu(event: IMouseEvent, menuType: string, context?: IContextMenuTriggerContext) {
        setVisible(false);
        requestAnimationFrame(() => {
            setMenuType(menuType);
            setMenuContext(context);
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

    const activeScope = runtimeScopeService.get(menuContext?.unitId);
    const activeMenuManagerService = activeScope?.has(IMenuManagerService)
        ? activeScope.get<IMenuManagerService>(IMenuManagerService)
        : menuManagerService;
    const activeCommandService = activeScope?.has(ICommandService)
        ? activeScope.get<ICommandService>(ICommandService)
        : commandService;
    const activeLayoutService = activeScope?.has(ILayoutService)
        ? activeScope.get<ILayoutService>(ILayoutService)
        : layoutService;

    return (
        <AnchoredContextMenu
            hostId={DESKTOP_CONTEXT_MENU_HOST_ID}
            visible={visible}
            anchorRect={anchorRect}
            menuType={menuType}
            menuManagerService={activeMenuManagerService}
            layoutService={activeLayoutService}
            onRequestClose={handleClose}
            onOptionSelect={(params) => {
                const { label: id, commandId, value } = params;
                const rawParams = typeof params.params === 'function' ? params.params() : params.params;
                const commandParams = typeof rawParams === 'undefined' ? { value } : rawParams;

                if (activeCommandService) {
                    activeCommandService.executeCommand(commandId ?? id as string, commandParams);
                }

                activeLayoutService.focus();

                handleClose();
            }}
        />
    );
}
