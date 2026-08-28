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
import type { ComponentProps } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { IContextMenuTriggerContext } from '../../../services/contextmenu/contextmenu.service';
import { ICommandService, LocaleService } from '@univerjs/core';
import { ConfigContext } from '@univerjs/design';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IContextMenuHostService } from '../../../services/contextmenu/contextmenu-host.service';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { ContextMenuPosition } from '../../../services/menu/types';
import { IUIRuntimeScopeService } from '../../../services/runtime-scope/ui-runtime-scope.service';
import { useDependency } from '../../../utils/di';
import { MobileMenu } from '../../menu/mobile/MobileMenu';
import { MobileMenuDrawer } from '../../menu/mobile/MobileMenuDrawer';

const MOBILE_CONTEXT_MENU_HOST_ID = 'mobile-context-menu';

export function MobileContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [menuContext, setMenuContext] = useState<IContextMenuTriggerContext | undefined>();
    const [anchor, setAnchor] = useState({ x: 0, y: 0 });
    const visibleRef = useRef(visible);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const contextMenuHostService = useDependency(IContextMenuHostService);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const menuManagerService = useDependency(IMenuManagerService);
    const runtimeScopeService = useDependency(IUIRuntimeScopeService);
    const localeService = useDependency(LocaleService);
    const { mountContainer } = useContext(ConfigContext);

    visibleRef.current = visible;

    useEffect(() => {
        const hostDisposable = contextMenuHostService.registerMenu(MOBILE_CONTEXT_MENU_HOST_ID, () => {
            setVisible(false);
        });

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
            hostDisposable.dispose();
            contextMenuHostService.deactivateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
        };
    }, [contextMenuHostService, contextMenuService]);

    function handleContextMenu(event: IMouseEvent, nextMenuType: string, context?: IContextMenuTriggerContext) {
        contextMenuHostService.activateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
        setMenuType(nextMenuType);
        setMenuContext(context);
        setAnchor({ x: event.clientX, y: event.clientY });
        setVisible(true);
    }

    function handleClose() {
        setVisible(false);
        contextMenuHostService.deactivateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
    }

    useEffect(() => {
        if (!visible || menuType !== ContextMenuPosition.MAIN_AREA || !mountContainer) {
            return undefined;
        }

        const ownerDocument = mountContainer.ownerDocument;
        const handleOutsidePointerDown = (event: PointerEvent) => {
            if (!(event.target instanceof Node) || !floatingMenuRef.current?.contains(event.target)) {
                setVisible(false);
                contextMenuHostService.deactivateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
            }
        };
        ownerDocument.addEventListener('pointerdown', handleOutsidePointerDown, true);
        return () => ownerDocument.removeEventListener('pointerdown', handleOutsidePointerDown, true);
    }, [contextMenuHostService, menuType, mountContainer, visible]);

    const sheetTitle = useMemo(() => {
        switch (menuType) {
            case ContextMenuPosition.ROW_HEADER:
                return localeService.t<LocaleKey>('ui.row');
            case ContextMenuPosition.COL_HEADER:
                return localeService.t<LocaleKey>('ui.column');
            default:
                return '';
        }
    }, [localeService, menuType]);

    if (!mountContainer || !visible) {
        return null;
    }

    const activeScope = runtimeScopeService.get(menuContext?.unitId);
    const activeCommandService = activeScope?.has(ICommandService)
        ? activeScope.get<ICommandService>(ICommandService)
        : commandService;
    const activeLayoutService = activeScope?.has(ILayoutService)
        ? activeScope.get<ILayoutService>(ILayoutService)
        : layoutService;
    const activeMenuManagerService = activeScope?.has(IMenuManagerService)
        ? activeScope.get<IMenuManagerService>(IMenuManagerService)
        : menuManagerService;
    const handleOptionSelect = (params: Parameters<NonNullable<ComponentProps<typeof MobileMenu>['onOptionSelect']>>[0]) => {
        const commandId = params.commandId ?? params.id ?? (typeof params.label === 'string' ? params.label : undefined);
        const fallbackParams = typeof params.params === 'function' ? params.params() : params.params;
        const optionParams = typeof params.value === 'undefined' ? fallbackParams : { value: params.value };
        const commandParams = menuContext
            ? { ...menuContext, ...optionParams }
            : optionParams;

        if (!commandId) {
            return;
        }

        activeLayoutService.focus();
        activeCommandService.executeCommand(commandId, commandParams);
        handleClose();
    };
    if (menuType === ContextMenuPosition.MAIN_AREA) {
        const viewportHeight = mountContainer.ownerDocument.defaultView?.innerHeight ?? 0;
        const placeBelow = anchor.y < 72;
        const top = placeBelow
            ? anchor.y + 12
            : Math.min(anchor.y - 56, Math.max(8, viewportHeight - 56));
        const pointerLeft = `clamp(20px, ${anchor.x - 8}px, calc(100% - 20px))`;

        return createPortal(
            <div
                className="
                  univer-pointer-events-none univer-fixed univer-inset-x-2 univer-z-[1080] univer-flex
                  univer-justify-center
                "
                style={{ top }}
            >
                <div
                    ref={floatingMenuRef}
                    className="
                      univer-pointer-events-auto univer-relative univer-min-w-0 univer-max-w-[560px] univer-flex-1
                    "
                >
                    <MobileMenu
                        menuType={menuType}
                        menuManagerService={activeMenuManagerService}
                        presentation="context-bar"
                        onOptionSelect={handleOptionSelect}
                    />
                    <div
                        aria-hidden="true"
                        className={placeBelow
                            ? `
                              univer-absolute -univer-top-1 univer-size-2 univer-rotate-45 univer-bg-gray-0
                              dark:!univer-bg-gray-700
                            `
                            : `
                              univer-absolute -univer-bottom-1 univer-size-2 univer-rotate-45 univer-bg-gray-0
                              dark:!univer-bg-gray-700
                            `}
                        style={{ left: pointerLeft }}
                    />
                </div>
            </div>,
            mountContainer
        );
    }

    return (
        <MobileMenuDrawer
            visible
            title={sheetTitle}
            menuType={menuType}
            menuManagerService={activeMenuManagerService}
            onClose={handleClose}
            onOptionSelect={handleOptionSelect}
        />
    );
}
