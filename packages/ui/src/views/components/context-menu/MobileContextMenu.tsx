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
import { ICommandService, LocaleService } from '@univerjs/core';
import { ConfigContext } from '@univerjs/design';
import { CloseIcon } from '@univerjs/icons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MobileMenu } from '../../../components/menu/mobile/MobileMenu';
import { IContextMenuHostService } from '../../../services/contextmenu/contextmenu-host.service';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { ContextMenuPosition } from '../../../services/menu/types';
import { useDependency } from '../../../utils/di';

const MOBILE_CONTEXT_MENU_HOST_ID = 'mobile-context-menu';

export function MobileContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const visibleRef = useRef(visible);
    const contextMenuHostService = useDependency(IContextMenuHostService);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
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

    function handleContextMenu(_event: IMouseEvent, nextMenuType: string) {
        contextMenuHostService.activateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
        setMenuType(nextMenuType);
        setVisible(true);
    }

    function handleClose() {
        setVisible(false);
        contextMenuHostService.deactivateMenu(MOBILE_CONTEXT_MENU_HOST_ID);
    }

    const sheetTitle = useMemo(() => {
        switch (menuType) {
            case ContextMenuPosition.ROW_HEADER:
                return localeService.t('row');
            case ContextMenuPosition.COL_HEADER:
                return localeService.t('column');
            default:
                return '';
        }
    }, [localeService, menuType]);

    if (!mountContainer || !visible) {
        return null;
    }

    return createPortal(
        <div className="univer-fixed univer-inset-0 univer-z-[1080] univer-flex univer-items-end">
            <button
                type="button"
                aria-label={localeService.t('rangeSelector.cancel')}
                className="univer-absolute univer-inset-0 univer-bg-[rgba(15,23,42,0.32)] univer-backdrop-blur-[2px]"
                onClick={handleClose}
            />
            <section
                role="dialog"
                aria-modal="true"
                className="
                  univer-relative univer-z-[1] univer-mx-auto univer-flex univer-max-h-[80vh] univer-w-full
                  univer-max-w-[560px] univer-flex-col univer-overflow-hidden univer-rounded-t-[28px] univer-bg-gray-50
                  univer-shadow-[0_-16px_48px_rgba(15,23,42,0.18)]
                "
                style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
                }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="univer-flex univer-flex-col univer-gap-3 univer-px-4 univer-pb-3 univer-pt-3">
                    <div className="univer-mx-auto univer-h-1.5 univer-w-10 univer-rounded-full univer-bg-gray-300" />
                    <div className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                        <div className="univer-min-w-0 univer-flex-1">
                            {sheetTitle && (
                                <div
                                    className="univer-truncate univer-text-sm univer-font-semibold univer-text-gray-900"
                                >
                                    {sheetTitle}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            aria-label={localeService.t('rangeSelector.cancel')}
                            className="
                              univer-flex univer-size-8 univer-shrink-0 univer-appearance-none univer-items-center
                              univer-justify-center univer-rounded-full univer-border-0 univer-bg-white univer-p-0
                              univer-leading-none univer-text-gray-600 univer-shadow-sm univer-outline-none
                              univer-ring-0 univer-transition-colors
                              hover:univer-bg-gray-100
                              active:univer-bg-gray-200
                            "
                            style={{ margin: 0 }}
                            onClick={handleClose}
                        >
                            <CloseIcon className="univer-size-4 univer-text-current" />
                        </button>
                    </div>
                </div>
                {menuType && (
                    <MobileMenu
                        menuType={menuType}
                        onOptionSelect={(params) => {
                            const { label: id, value, commandId } = params;
                            layoutService.focus();
                            commandService.executeCommand(commandId ?? id as string, { value });
                            handleClose();
                        }}
                    />
                )}
            </section>
        </div>,
        mountContainer
    );
}
