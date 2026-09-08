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

import type { ComponentProps } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { ContextMenuEvent, IContextMenuTriggerContext } from '../../../services/contextmenu/contextmenu.service';
import type { MobileMenu } from '../../menu/mobile/MobileMenu';
import { ICommandService, LocaleService } from '@univerjs/core';
import { ConfigContext } from '@univerjs/design';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IContextMenuHostService } from '../../../services/contextmenu/contextmenu-host.service';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { ContextMenuPosition } from '../../../services/menu/types';
import { IUIRuntimeScopeService } from '../../../services/runtime-scope/ui-runtime-scope.service';
import { useDependency } from '../../../utils/di';
import { MobileMenuDrawer } from '../../menu/mobile/MobileMenuDrawer';

const MOBILE_CONTEXT_MENU_HOST_ID = 'mobile-context-menu';

export function MobileContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [menuContext, setMenuContext] = useState<IContextMenuTriggerContext | undefined>();
    const visibleRef = useRef(visible);
    const contextMenuHostService = useDependency(IContextMenuHostService);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const menuManagerService = useDependency(IMenuManagerService);
    const runtimeScopeService = useDependency(IUIRuntimeScopeService);
    const localeService = useDependency(LocaleService);
    const { mountContainer } = useContext(ConfigContext);

    visibleRef.current = visible;

    const handleContextMenu = useCallback((
        _event: ContextMenuEvent,
        nextMenuType: string,
        context?: IContextMenuTriggerContext
    ) => {
        contextMenuHostService.activateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
        setMenuType(nextMenuType);
        setMenuContext(context);
        setVisible(true);
    }, [contextMenuHostService]);

    const handleClose = useCallback(() => {
        setVisible(false);
        contextMenuHostService.deactivateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
    }, [contextMenuHostService]);

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
    }, [contextMenuHostService, contextMenuService, handleClose, handleContextMenu]);

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
