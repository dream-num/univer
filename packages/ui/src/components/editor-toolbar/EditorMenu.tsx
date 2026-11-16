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

import type { ReactNode } from 'react';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx, Separator } from '@univerjs/design';
import { scan } from 'rxjs';
import type { IMenuSchema } from '../../services/menu/menu-manager.service';
import type { FloatingObjectToolbarPosition } from '../../services/menu/types';
import { IconManager } from '../../common/icon-manager';
import { MenuItemType } from '../../services/menu/menu';
import { IMenuManagerService } from '../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../utils/di';
import { EditorToolbarButton } from './EditorFloatingToolbar';
import { keepFloatingToolbarPanelInteraction, preventFloatingToolbarPanelBlur } from './floating-toolbar-interaction';

function ToolbarGroup(props: { children: ReactNode }) {
    const { children } = props;

    return (
        <div className="univer-flex univer-h-7 univer-items-center univer-gap-1 univer-px-1">
            {children}
        </div>
    );
}

function FloatingObjectToolbarMenuAction(props: { menuSchema: IMenuSchema }) {
    const { menuSchema } = props;
    const commandService = useDependency(ICommandService);
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const menuItem = menuSchema.item;
    const hidden = useObservable(menuItem?.hidden$, false);
    const disabled = useObservable(menuItem?.disabled$, false);

    if (!menuItem || menuItem.type !== MenuItemType.BUTTON || hidden || typeof menuItem.icon !== 'string') {
        return null;
    }

    const Icon = iconManager.get(menuItem.icon);
    const title = localeService.t(menuItem.tooltip ?? menuItem.title ?? menuItem.id);
    const execute = () => {
        const params = typeof menuItem.params === 'function' ? menuItem.params() : menuItem.params;
        commandService.executeCommand(menuItem.commandId ?? menuItem.id, params).catch(() => undefined);
    };

    return (
        <>
            <Separator orientation="vertical" />
            <ToolbarGroup>
                <EditorToolbarButton title={title} disabled={disabled} onClick={execute}>
                    <Icon />
                </EditorToolbarButton>
            </ToolbarGroup>
        </>
    );
}

export function EditorMenuActions(props: { position: FloatingObjectToolbarPosition }) {
    const menuManagerService = useDependency(IMenuManagerService);
    const menuSchemaVersion = useObservable(
        () => menuManagerService.menuChanged$.pipe(scan((version) => version + 1, 0)),
        0,
        false,
        [menuManagerService]
    );
    const menuSchemas = menuManagerService.getFlatMenuByPositionKey(props.position);

    return menuSchemas.map((menuSchema) => (
        <FloatingObjectToolbarMenuAction
            key={`${menuSchema.key}-${menuSchemaVersion}`}
            menuSchema={menuSchema}
        />
    ));
}

export function EditorMenuPanel(props: {
    title?: string;
    children: ReactNode;
    className?: string;
    minWidthClassName?: string;
}) {
    const { title, children, className, minWidthClassName } = props;
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());

    return (
        <div
            dir={direction}
            data-u-comp="editor-menu-panel"
            onPointerDownCapture={preventFloatingToolbarPanelBlur}
            onMouseDownCapture={preventFloatingToolbarPanelBlur}
            onPointerDown={keepFloatingToolbarPanelInteraction}
            onMouseDown={keepFloatingToolbarPanelInteraction}
            onClick={(event) => event.stopPropagation()}
            className={clsx(`
              univer-box-border univer-flex univer-flex-col univer-rounded-lg univer-border univer-border-solid
              univer-border-gray-200 univer-bg-gray-0 univer-p-3 univer-shadow-lg
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, minWidthClassName ?? 'univer-min-w-[240px]', className)}
        >
            {title && (
                <div
                    className="
                      univer-mb-2 univer-text-sm univer-font-medium univer-text-gray-900
                      dark:!univer-text-gray-100
                    "
                >
                    {title}
                </div>
            )}
            {children}
        </div>
    );
}

export function EditorMenuItem(props: {
    label: string;
    shortcut?: string;
    disabled?: boolean;
    danger?: boolean;
    onClick: () => void;
}) {
    const { label, shortcut, disabled, danger, onClick } = props;

    return (
        <span className="univer-block univer-w-full">
            <button
                type="button"
                aria-label={label}
                disabled={disabled}
                onClick={(event) => {
                    event.stopPropagation();
                    onClick();
                }}
                className={clsx(`
                  univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-between univer-gap-8
                  univer-rounded-md univer-border-none univer-bg-transparent univer-px-2 univer-text-left univer-text-xs
                  univer-text-gray-700 univer-transition-colors
                  hover:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                  rtl:univer-text-right
                  dark:!univer-text-gray-100
                  dark:hover:!univer-bg-gray-800
                `, {
                    'univer-text-red-500 hover:univer-bg-red-50 dark:!univer-text-red-400 dark:hover:univer-bg-red-950': danger,
                })}
            >
                <span className="univer-leading-none">{label}</span>
                {shortcut && (
                    <span
                        className="
                          univer-ml-auto univer-whitespace-nowrap univer-text-xs univer-leading-none
                          univer-text-gray-400
                          rtl:univer-ml-0 rtl:univer-mr-auto
                          dark:!univer-text-gray-500
                        "
                    >
                        {shortcut}
                    </span>
                )}
            </button>
        </span>
    );
}
