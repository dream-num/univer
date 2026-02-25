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

import type {
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemDefaultValueType,
} from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { isRealNum, LocaleService } from '@univerjs/core';
import { borderBottomClassName, borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { CheckMarkIcon, MoreIcon } from '@univerjs/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { combineLatest, isObservable, of, scan, startWith } from 'rxjs';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useScrollYOverContainer } from '../../../components/hooks/layout';
import { UIQuickTileMenuGroup, UITinyMenuGroup } from '../../../components/menu/desktop/TinyMenuGroup';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';

interface IContextMenuPanelProps {
    menuType: string;
    menuSessionVersion?: number;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuProps {
    menuSchemas: IMenuSchema[];
    submenuPortalContainer: HTMLElement | null;
    maxMenuHeight: number;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuItemProps {
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuItem>;
    submenuPortalContainer: HTMLElement | null;
    maxMenuHeight: number;
    onOptionSelect?: (option: IValueOption) => void;
}

const contentClassName = 'univer-inline-flex univer-items-center univer-gap-2';
const menuViewportPadding = 8;
const submenuOverlapOffset = 2;
export const CONTEXT_MENU_SUBMENU_PORTAL_ATTR = 'data-u-context-menu-submenu';

export function ContextMenuPanel(props: IContextMenuPanelProps) {
    const { menuType, menuSessionVersion = 0, onOptionSelect } = props;
    const menuManagerService = useDependency(IMenuManagerService);
    const layoutService = useDependency(ILayoutService);
    const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null);
    const [maxMenuHeight, setMaxMenuHeight] = useState(() => {
        if (typeof window === 'undefined') {
            return 240;
        }

        return Math.max(120, window.innerHeight - menuViewportPadding * 2);
    });
    const menuSchemaVersion$ = useMemo(
        () => menuManagerService.menuChanged$.pipe(startWith(undefined), scan((version) => version + 1, 0)),
        [menuManagerService]
    );
    const menuSchemaVersion = useObservable(menuSchemaVersion$, 0);

    const menuItems = useMemo(
        () => (menuType ? menuManagerService.getMenuByPositionKey(menuType) : []),
        [menuManagerService, menuType, menuSchemaVersion, menuSessionVersion]
    );
    const submenuPortalContainer = layoutService.rootContainerElement?.ownerDocument?.body
        ?? (typeof document !== 'undefined' ? document.body : null);

    useScrollYOverContainer(menuElement, layoutService.rootContainerElement);

    useEffect(() => {
        const defaultView = layoutService.rootContainerElement?.ownerDocument?.defaultView
            ?? (typeof window !== 'undefined' ? window : null);

        if (!defaultView) {
            return;
        }

        let frameId = 0;
        const updateMaxHeight = () => {
            if (frameId) {
                defaultView.cancelAnimationFrame(frameId);
            }

            frameId = defaultView.requestAnimationFrame(() => {
                setMaxMenuHeight(Math.max(120, defaultView.innerHeight - menuViewportPadding * 2));
            });
        };

        updateMaxHeight();
        defaultView.addEventListener('resize', updateMaxHeight);

        return () => {
            if (frameId) {
                defaultView.cancelAnimationFrame(frameId);
            }
            defaultView.removeEventListener('resize', updateMaxHeight);
        };
    }, [layoutService.rootContainerElement]);

    if (!menuType) {
        return null;
    }

    return (
        <div
            ref={setMenuElement}
            className={clsx(
                `
                  univer-box-border univer-grid univer-min-w-52 univer-max-w-fit univer-gap-1 univer-overflow-y-auto
                  univer-overscroll-contain univer-rounded-md univer-bg-white univer-px-2 univer-py-1 univer-text-sm
                  univer-text-gray-900 univer-shadow-md
                  dark:!univer-bg-gray-700 dark:!univer-text-white
                `,
                borderClassName,
                scrollbarClassName
            )}
            style={{
                maxHeight: maxMenuHeight,
            }}
            onWheel={(event) => event.stopPropagation()}
        >
            <ContextMenuMenu
                menuSchemas={menuItems}
                submenuPortalContainer={submenuPortalContainer}
                onOptionSelect={onOptionSelect}
                maxMenuHeight={maxMenuHeight}
            />
        </div>
    );
}

function ContextMenuMenu(props: IContextMenuMenuProps) {
    const { menuSchemas, submenuPortalContainer, onOptionSelect, maxMenuHeight } = props;
    const localeService = useDependency(LocaleService);
    const hiddenGroupStates = useContextGroupHiddenStates(menuSchemas);

    const visibleSchemas = useMemo(() => {
        return menuSchemas.filter((item) => {
            if (!item.children) {
                return true;
            }

            return !hiddenGroupStates[item.key];
        });
    }, [hiddenGroupStates, menuSchemas]);

    return (
        <>
            {visibleSchemas.map((menuSchema, index) => {
                const hasSeparator = index !== visibleSchemas.length - 1;

                if (menuSchema.item) {
                    return (
                        <ContextMenuMenuItem
                            key={menuSchema.key}
                            menuKey={menuSchema.key}
                            menuItem={menuSchema.item as IDisplayMenuItem<IMenuItem>}
                            submenuPortalContainer={submenuPortalContainer}
                            onOptionSelect={onOptionSelect}
                            maxMenuHeight={maxMenuHeight}
                        />
                    );
                }

                if (!menuSchema.children?.length) {
                    return null;
                }

                if (menuSchema.quickLayout) {
                    return (
                        <div
                            key={menuSchema.key}
                            className={clsx(
                                'univer-py-1',
                                hasSeparator && borderBottomClassName
                            )}
                        >
                            {menuSchema.quickLayout === 'tile'
                                ? (
                                    <UIQuickTileMenuGroup
                                        item={menuSchema}
                                        onOptionSelect={onOptionSelect}
                                    />
                                )
                                : (
                                    <UITinyMenuGroup
                                        item={menuSchema}
                                        onOptionSelect={onOptionSelect}
                                    />
                                )}
                        </div>
                    );
                }

                return (
                    <div
                        key={menuSchema.key}
                        className={clsx(
                            'univer-grid univer-gap-1 univer-py-1',
                            hasSeparator && borderBottomClassName
                        )}
                    >
                        {menuSchema.title && (
                            <strong
                                className={`
                                  univer-px-2 univer-text-xs univer-font-semibold univer-text-gray-600
                                  dark:!univer-text-gray-300
                                `}
                            >
                                {localeService.t(menuSchema.title)}
                            </strong>
                        )}
                        {menuSchema.children.map((childSchema) => (
                            childSchema.item && (
                                <ContextMenuMenuItem
                                    key={childSchema.key}
                                    menuKey={childSchema.key}
                                    menuItem={childSchema.item as IDisplayMenuItem<IMenuItem>}
                                    submenuPortalContainer={submenuPortalContainer}
                                    onOptionSelect={onOptionSelect}
                                    maxMenuHeight={maxMenuHeight}
                                />
                            )
                        ))}
                    </div>
                );
            })}
        </>
    );
}

function ContextMenuMenuItem(props: IContextMenuMenuItemProps) {
    const { menuKey, menuItem, submenuPortalContainer, onOptionSelect, maxMenuHeight } = props;
    const menuManagerService = useDependency(IMenuManagerService);
    const disabled = useObservable<boolean>(menuItem.disabled$, false);
    const activated = useObservable<boolean>(menuItem.activated$, false);
    const hidden = useObservable<boolean>(menuItem.hidden$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem.value$);
    const selectorItem = menuItem as IDisplayMenuItem<IMenuSelectorItem>;
    const selectionsFromObservable = useObservable(
        isObservable(selectorItem.selections) ? selectorItem.selections : undefined
    );
    const [inputValue, setInputValue] = useState(value);
    const [submenuVisible, setSubmenuVisible] = useState(false);
    const [submenuPosition, setSubmenuPosition] = useState<{
        left: number;
        top: number;
    }>({
        left: 0,
        top: 0,
    });
    const [submenuPositionReady, setSubmenuPositionReady] = useState(false);
    const menuItemElementRef = useRef<HTMLDivElement | null>(null);
    const submenuElementRef = useRef<HTMLDivElement | null>(null);

    const selections = useMemo(() => {
        if (menuItem.type !== MenuItemType.SELECTOR && menuItem.type !== MenuItemType.BUTTON_SELECTOR) {
            return [];
        }

        if (selectionsFromObservable) {
            return selectionsFromObservable;
        }

        return Array.isArray(selectorItem.selections) ? selectorItem.selections : [];
    }, [menuItem.type, selectionsFromObservable, selectorItem.selections]);

    const subMenuItems = useMemo(() => {
        if (menuItem.type !== MenuItemType.SUBITEMS || !menuItem.id) {
            return [];
        }

        return menuManagerService.getMenuByPositionKey(menuItem.id);
    }, [menuItem.id, menuItem.type, menuManagerService]);

    const hasSelectionSubmenu = selections.length > 0;
    const hasSubItemSubmenu = subMenuItems.length > 0;
    const hasSubmenu = hasSelectionSubmenu || hasSubItemSubmenu;

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (!submenuVisible) {
            setSubmenuPositionReady(false);
            return;
        }

        const updateSubmenuPosition = () => {
            const menuItemElement = menuItemElementRef.current;
            const submenuElement = submenuElementRef.current;
            if (!menuItemElement || !submenuElement) {
                return;
            }

            const menuItemRect = menuItemElement.getBoundingClientRect();
            const submenuRect = submenuElement.getBoundingClientRect();

            const rightLeft = menuItemRect.right - submenuOverlapOffset;
            const leftLeft = menuItemRect.left - submenuRect.width + submenuOverlapOffset;

            const useLeft = rightLeft + submenuRect.width + menuViewportPadding > window.innerWidth
                && leftLeft >= menuViewportPadding;
            const left = useLeft ? leftLeft : rightLeft;

            const maxTop = window.innerHeight - menuViewportPadding - submenuRect.height;
            const top = maxTop < menuViewportPadding
                ? menuViewportPadding
                : Math.min(Math.max(menuItemRect.top, menuViewportPadding), maxTop);

            setSubmenuPosition({ left, top });
            setSubmenuPositionReady(true);
        };

        const frameId = window.requestAnimationFrame(updateSubmenuPosition);
        window.addEventListener('resize', updateSubmenuPosition);
        window.addEventListener('scroll', updateSubmenuPosition, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', updateSubmenuPosition);
            window.removeEventListener('scroll', updateSubmenuPosition, true);
        };
    }, [submenuVisible, hasSelectionSubmenu, hasSubItemSubmenu]);

    if (hidden) {
        return null;
    }

    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? Number.parseInt(v) : v;
        setInputValue(newValue);
    };

    const itemClassName = clsx(
        `
          univer-relative univer-flex univer-min-h-8 univer-w-full univer-items-center univer-justify-between
          univer-gap-3 univer-rounded-md univer-border-none univer-bg-transparent univer-px-2 univer-text-left
          univer-text-sm
          dark:!univer-text-white
        `,
        disabled
            ? 'univer-cursor-not-allowed univer-opacity-60'
            : `
              univer-cursor-pointer
              hover:univer-bg-gray-50
              dark:hover:!univer-bg-gray-600
            `,
        activated && `
          univer-bg-gray-200
          dark:!univer-bg-gray-600
        `
    );

    const contentNode = (
        <span className={contentClassName}>
            <CustomLabel
                value={inputValue}
                title={menuItem.title}
                label={menuItem.label}
                icon={menuItem.icon}
                onChange={onChange}
            />
            {menuItem.shortcut && ` (${menuItem.shortcut})`}
        </span>
    );

    const canExecuteItem = menuItem.type === MenuItemType.BUTTON || menuItem.type === MenuItemType.BUTTON_SELECTOR;

    return (
        <div
            ref={menuItemElementRef}
            className="univer-relative"
            onMouseEnter={() => {
                if (hasSubmenu && !disabled) {
                    setSubmenuPositionReady(false);
                    setSubmenuVisible(true);
                }
            }}
            onMouseLeave={(event) => {
                if (hasSubmenu) {
                    const nextTarget = event.relatedTarget as Node | null;
                    if (nextTarget && submenuElementRef.current?.contains(nextTarget)) {
                        return;
                    }
                    setSubmenuVisible(false);
                }
            }}
        >
            <button
                type="button"
                className={itemClassName}
                disabled={disabled}
                onClick={() => {
                    if (hasSubmenu) {
                        setSubmenuPositionReady(false);
                        setSubmenuVisible(true);
                        return;
                    }

                    if (!canExecuteItem) {
                        return;
                    }

                    const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
                    onOptionSelect?.({
                        commandId: item.commandId,
                        value: inputValue,
                        id: item.id,
                        label: menuKey,
                    });
                }}
            >
                {contentNode}
                {hasSubmenu && (
                    <MoreIcon
                        className={`
                          univer-size-3.5 univer-text-gray-400
                          dark:!univer-text-gray-200
                        `}
                    />
                )}
            </button>

            {hasSubmenu && submenuVisible && (
                submenuPortalContainer
                    ? createPortal(
                        <div
                            ref={submenuElementRef}
                            {...{ [CONTEXT_MENU_SUBMENU_PORTAL_ATTR]: 'true' }}
                            className={clsx(
                                `
                                  univer-z-[1080] univer-w-max univer-max-w-[calc(100vw-16px)] univer-overflow-y-auto
                                  univer-overscroll-contain univer-rounded-md univer-border univer-border-solid
                                  univer-border-gray-200 univer-bg-white univer-p-2 univer-shadow-md
                                  dark:!univer-border-gray-600 dark:!univer-bg-gray-700
                                `,
                                scrollbarClassName
                            )}
                            style={{
                                position: 'fixed',
                                left: submenuPosition.left,
                                top: submenuPosition.top,
                                maxHeight: maxMenuHeight,
                                visibility: submenuPositionReady ? 'visible' : 'hidden',
                                pointerEvents: submenuPositionReady ? 'auto' : 'none',
                            }}
                            onMouseLeave={(event) => {
                                const nextTarget = event.relatedTarget as Node | null;
                                if (nextTarget && menuItemElementRef.current?.contains(nextTarget)) {
                                    return;
                                }

                                setSubmenuVisible(false);
                            }}
                            onWheel={(event) => event.stopPropagation()}
                        >
                            {hasSelectionSubmenu && (
                                <div className="univer-grid univer-gap-1">
                                    {selections.map((option, index) => {
                                        const optionKey = `${menuItem.id}-${option.label ?? option.id}-${index}`;
                                        const optionSelected = typeof inputValue !== 'undefined' && String(inputValue) === String(option.value);

                                        return (
                                            <button
                                                key={optionKey}
                                                type="button"
                                                className={clsx(
                                                    `
                                                      univer-relative univer-flex univer-min-h-8 univer-w-full
                                                      univer-items-center univer-rounded-md univer-border-none
                                                      univer-bg-transparent univer-px-2 univer-text-left univer-text-sm
                                                      dark:!univer-text-white
                                                    `,
                                                    option.disabled
                                                        ? 'univer-cursor-not-allowed univer-opacity-60'
                                                        : `
                                                          univer-cursor-pointer
                                                          hover:univer-bg-gray-50
                                                          dark:hover:!univer-bg-gray-600
                                                        `
                                                )}
                                                disabled={option.disabled}
                                                onClick={() => {
                                                    onOptionSelect?.({
                                                        ...option,
                                                        id: menuItem.id,
                                                        label: menuKey,
                                                        commandId: option.commandId,
                                                    });
                                                }}
                                            >
                                                {optionSelected && (
                                                    <CheckMarkIcon
                                                        className="
                                                          univer-absolute univer-left-0 univer-size-4
                                                          univer-text-primary-600
                                                        "
                                                    />
                                                )}
                                                <span
                                                    className={clsx(contentClassName, optionSelected && 'univer-pl-4')}
                                                >
                                                    <CustomLabel
                                                        value$={option.value$}
                                                        value={option.value}
                                                        label={option.label}
                                                        icon={option.icon}
                                                        onChange={(optionValue) => {
                                                            onOptionSelect?.({
                                                                ...option,
                                                                value: optionValue,
                                                                id: menuItem.id,
                                                                label: menuKey,
                                                                commandId: option.commandId,
                                                            });
                                                        }}
                                                    />
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {hasSubItemSubmenu && (
                                <ContextMenuMenu
                                    menuSchemas={subMenuItems}
                                    submenuPortalContainer={submenuPortalContainer}
                                    onOptionSelect={onOptionSelect}
                                    maxMenuHeight={maxMenuHeight}
                                />
                            )}
                        </div>,
                        submenuPortalContainer
                    )
                    : null
            )}
        </div>
    );
}

function useContextGroupHiddenStates(menuSchemas: IMenuSchema[]) {
    const [hiddenStates, setHiddenStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const subscriptions = menuSchemas.map((menuSchema) => {
            if (!menuSchema.children?.length) {
                return null;
            }

            const hiddenObservables = menuSchema.children.map((childSchema) => childSchema.item?.hidden$ ?? of(false));
            return combineLatest(hiddenObservables).subscribe((hiddenValues) => {
                const isAllHidden = hiddenValues.every((hidden) => hidden === true);
                setHiddenStates((state) => ({
                    ...state,
                    [menuSchema.key]: isAllHidden,
                }));
            });
        });

        return () => {
            subscriptions.forEach((subscription) => subscription?.unsubscribe());
            setHiddenStates({});
        };
    }, [menuSchemas]);

    return hiddenStates;
}
