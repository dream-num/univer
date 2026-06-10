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

import type { Dispatch, SetStateAction } from 'react';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { combineLatest, isObservable, of, scan, startWith } from 'rxjs';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useScrollYOverContainer } from '../../../components/hooks/layout';
import { resolveMenuItemActiveState, UIQuickTileMenuGroup, UITinyMenuGroup } from '../../../components/menu/desktop/TinyMenuGroup';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';

type ContextMenuSizeVariant = 'default' | 'paragraph-t';

interface IContextMenuPanelProps {
    menuType: string;
    menuSessionVersion?: number;
    className?: string;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    sizeVariant?: ContextMenuSizeVariant;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuProps {
    menuSchemas: IMenuSchema[];
    menuSessionVersion: number;
    submenuPortalContainer: HTMLElement | null;
    maxMenuHeight: number;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    sizeVariant: ContextMenuSizeVariant;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuItemProps {
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuItem>;
    menuSessionVersion: number;
    submenuPortalContainer: HTMLElement | null;
    maxMenuHeight: number;
    activeSubmenuKey: string | null;
    setActiveSubmenuKey: Dispatch<SetStateAction<string | null>>;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    compact?: boolean;
    headerAction?: boolean;
    sizeVariant: ContextMenuSizeVariant;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuSchemaRenderGroup {
    startIndex: number;
    endIndex: number;
    menuSchemas: IMenuSchema[];
}

const menuViewportPadding = 8;
const submenuOverlapOffset = 2;
const submenuVisualGap = 20;
export const CONTEXT_MENU_SUBMENU_CLOSE_DELAY = 500;
export const CONTEXT_MENU_SUBMENU_PORTAL_ATTR = 'data-u-context-menu-submenu';
const CONTEXT_MENU_CONNECTED_QUICK_GROUP_KEYS = new Set(['quickTop', 'quickBottom']);
const CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS = new Set(['quickTop', 'quickBottom']);

type MenuLabel = IMenuItem['label'] | IValueOption['label'];

function isNonSelectableLabel(label?: MenuLabel) {
    return typeof label === 'object' && label?.selectable === false;
}

function isNonHoverableLabel(label?: MenuLabel) {
    return typeof label === 'object' && label?.hoverable === false;
}

export function hasRenderableContextMenuSchema(menuSchema: IMenuSchema): boolean {
    if (menuSchema.item) {
        return true;
    }

    if (!menuSchema.children?.length) {
        return false;
    }

    return menuSchema.children.some((childSchema) => Boolean(childSchema.item));
}

export function shouldShowContextMenuGroupSeparator(visibleSchemas: IMenuSchema[], index: number): boolean {
    if (index === visibleSchemas.length - 1) {
        return false;
    }

    const currentSchema = visibleSchemas[index];
    const nextSchema = visibleSchemas[index + 1];

    if (
        currentSchema?.quickLayout
        && nextSchema?.quickLayout
        && CONTEXT_MENU_CONNECTED_QUICK_GROUP_KEYS.has(currentSchema.key)
        && CONTEXT_MENU_CONNECTED_QUICK_GROUP_KEYS.has(nextSchema.key)
    ) {
        return false;
    }

    return true;
}

export function getContextMenuQuickGroupColumns(menuSchema: IMenuSchema): number | undefined {
    if (isRealNum(menuSchema.quickColumns)) {
        return menuSchema.quickColumns;
    }

    if (menuSchema.quickLayout === 'icon' && CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS.has(menuSchema.key)) {
        return 6;
    }

    return undefined;
}

function getContextMenuContentClassName(sizeVariant: ContextMenuSizeVariant) {
    return clsx(
        'univer-inline-flex univer-items-center',
        sizeVariant === 'paragraph-t' ? 'univer-gap-3' : 'univer-gap-2'
    );
}

function getContextMenuPanelClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t'
        ? `
          univer-box-border univer-grid univer-min-w-64 univer-max-w-full univer-gap-2 univer-overflow-y-auto
          univer-overscroll-contain univer-rounded-md univer-bg-white univer-px-3 univer-py-2 univer-text-base
          univer-text-gray-900 univer-shadow-md
          dark:!univer-bg-gray-700 dark:!univer-text-white
        `
        : `
          univer-box-border univer-grid univer-min-w-52 univer-max-w-full univer-gap-1 univer-overflow-y-auto
          univer-overscroll-contain univer-rounded-md univer-bg-white univer-px-2 univer-py-1 univer-text-sm
          univer-text-gray-900 univer-shadow-md
          dark:!univer-bg-gray-700 dark:!univer-text-white
        `;
}

function getContextMenuGroupClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t' ? 'univer-grid univer-gap-2 univer-py-2' : 'univer-grid univer-gap-1 univer-py-1';
}

function isParagraphTHeaderQuickGroup(menuSchema: IMenuSchema, sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t'
        && menuSchema.quickLayout === 'icon'
        && CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS.has(menuSchema.key);
}

function shouldClusterParagraphTHeaderQuickGroups(
    currentSchema: IMenuSchema,
    nextSchema: IMenuSchema | undefined,
    sizeVariant: ContextMenuSizeVariant
) {
    return isParagraphTHeaderQuickGroup(currentSchema, sizeVariant)
        && !!nextSchema
        && isParagraphTHeaderQuickGroup(nextSchema, sizeVariant);
}

function getContextMenuQuickGroupClassName(
    menuSchema: IMenuSchema,
    visibleSchemas: IMenuSchema[],
    index: number,
    sizeVariant: ContextMenuSizeVariant
) {
    if (sizeVariant !== 'paragraph-t' || !CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS.has(menuSchema.key)) {
        return getContextMenuGroupClassName(sizeVariant);
    }

    const previousSchema = index > 0 ? visibleSchemas[index - 1] : null;
    const nextSchema = index < visibleSchemas.length - 1 ? visibleSchemas[index + 1] : null;
    const connectedToPrevious = !!previousSchema?.quickLayout && CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS.has(previousSchema.key);
    const connectedToNext = !!nextSchema?.quickLayout && CONTEXT_MENU_HEADER_QUICK_GROUP_KEYS.has(nextSchema.key);

    if (connectedToPrevious && connectedToNext) {
        return 'univer-grid univer-gap-2 univer-pt-1 univer-pb-1';
    }

    if (connectedToPrevious) {
        return 'univer-grid univer-gap-2 univer-pt-1 univer-pb-2';
    }

    if (connectedToNext) {
        return 'univer-grid univer-gap-2 univer-pt-2 univer-pb-1';
    }

    return getContextMenuGroupClassName(sizeVariant);
}

function getContextMenuQuickGroupClusterClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t' ? 'univer-grid univer-gap-0 univer-py-2' : getContextMenuGroupClassName(sizeVariant);
}

export function getContextMenuSchemaRenderGroups(
    visibleSchemas: IMenuSchema[],
    sizeVariant: ContextMenuSizeVariant
): IContextMenuSchemaRenderGroup[] {
    const renderGroups: IContextMenuSchemaRenderGroup[] = [];

    for (let index = 0; index < visibleSchemas.length; index++) {
        const menuSchema = visibleSchemas[index];
        const nextSchema = visibleSchemas[index + 1];

        if (shouldClusterParagraphTHeaderQuickGroups(menuSchema, nextSchema, sizeVariant)) {
            renderGroups.push({
                startIndex: index,
                endIndex: index + 1,
                menuSchemas: [menuSchema, nextSchema!],
            });
            index += 1;
            continue;
        }

        renderGroups.push({
            startIndex: index,
            endIndex: index,
            menuSchemas: [menuSchema],
        });
    }

    return renderGroups;
}

function getContextMenuHeaderClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t'
        ? `
          univer-px-3 univer-text-sm univer-font-semibold univer-text-gray-600
          dark:!univer-text-gray-300
        `
        : `
          univer-px-2 univer-text-xs univer-font-semibold univer-text-gray-600
          dark:!univer-text-gray-300
        `;
}

function getContextMenuHeaderRowClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t'
        ? 'univer-flex univer-items-center univer-justify-between univer-gap-2'
        : 'univer-flex univer-items-center univer-justify-between univer-gap-1.5';
}

function getContextMenuSubmenuPanelClassName(sizeVariant: ContextMenuSizeVariant) {
    return sizeVariant === 'paragraph-t'
        ? `
          univer-overflow-y-auto univer-overscroll-contain univer-rounded-md univer-border
          univer-border-solid univer-border-gray-200 univer-bg-white univer-p-2
          univer-shadow-md
          dark:!univer-border-gray-600 dark:!univer-bg-gray-700
        `
        : `
          univer-overflow-y-auto univer-overscroll-contain univer-rounded-md univer-border
          univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1.5
          univer-shadow-md
          dark:!univer-border-gray-600 dark:!univer-bg-gray-700
        `;
}

export function ContextMenuPanel(props: IContextMenuPanelProps) {
    const { menuType, menuSessionVersion = 0, className, activeItemIds, hiddenItemIds, sizeVariant = 'default', onOptionSelect } = props;
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
                getContextMenuPanelClassName(sizeVariant),
                borderClassName,
                scrollbarClassName,
                className
            )}
            style={{
                maxHeight: maxMenuHeight,
            }}
            onWheel={(event) => event.stopPropagation()}
        >
            <ContextMenuMenu
                menuSchemas={menuItems}
                menuSessionVersion={menuSessionVersion}
                submenuPortalContainer={submenuPortalContainer}
                activeItemIds={activeItemIds}
                hiddenItemIds={hiddenItemIds}
                sizeVariant={sizeVariant}
                onOptionSelect={onOptionSelect}
                maxMenuHeight={maxMenuHeight}
            />
        </div>
    );
}

function ContextMenuMenu(props: IContextMenuMenuProps) {
    const { menuSchemas, menuSessionVersion, submenuPortalContainer, activeItemIds, hiddenItemIds, sizeVariant, onOptionSelect, maxMenuHeight } = props;
    const localeService = useDependency(LocaleService);
    const hiddenGroupStates = useContextGroupHiddenStates(menuSchemas);
    const [activeSubmenuKey, setActiveSubmenuKey] = useState<string | null>(null);

    const visibleSchemas = useMemo(() => {
        return menuSchemas.filter((item) => {
            if (!hasRenderableContextMenuSchema(item)) {
                return false;
            }

            if (!item.children) {
                return true;
            }

            return !hiddenGroupStates[item.key];
        });
    }, [hiddenGroupStates, menuSchemas]);
    const renderGroups = useMemo(
        () => getContextMenuSchemaRenderGroups(visibleSchemas, sizeVariant),
        [sizeVariant, visibleSchemas]
    );

    const renderQuickLayoutGroup = (
        menuSchema: IMenuSchema,
        index: number,
        renderAsClusterChild = false,
        hasSeparator = false
    ) => {
        const titleNode = renderMenuSchemaHeader(menuSchema);

        return (
            <div
                key={menuSchema.key}
                className={clsx(
                    renderAsClusterChild
                        ? 'univer-grid'
                        : getContextMenuQuickGroupClassName(menuSchema, visibleSchemas, index, sizeVariant),
                    hasSeparator && borderBottomClassName
                )}
            >
                {titleNode}
                {menuSchema.quickLayout === 'tile'
                    ? (
                        <UIQuickTileMenuGroup
                            item={menuSchema}
                            activeItemIds={activeItemIds}
                            hiddenItemIds={hiddenItemIds}
                            onOptionSelect={onOptionSelect}
                        />
                    )
                    : (
                        <UITinyMenuGroup
                            item={menuSchema}
                            columns={getContextMenuQuickGroupColumns(menuSchema)}
                            activeItemIds={activeItemIds}
                            hiddenItemIds={hiddenItemIds}
                            sizeVariant={sizeVariant}
                            layoutVariant={menuSchema.quickLayoutVariant}
                            onOptionSelect={onOptionSelect}
                        />
                    )}
            </div>
        );
    };

    return (
        <>
            {renderGroups.map(({ menuSchemas: groupedSchemas, startIndex, endIndex }) => {
                const menuSchema = groupedSchemas[0];
                const hasSeparator = shouldShowContextMenuGroupSeparator(visibleSchemas, endIndex);
                const titleNode = renderMenuSchemaHeader(menuSchema);

                if (groupedSchemas.length > 1) {
                    return (
                        <div
                            key={groupedSchemas.map((schema) => schema.key).join('-')}
                            className={clsx(
                                getContextMenuQuickGroupClusterClassName(sizeVariant),
                                hasSeparator && borderBottomClassName
                            )}
                        >
                            {groupedSchemas.map((groupedMenuSchema, groupedIndex) => renderQuickLayoutGroup(
                                groupedMenuSchema,
                                startIndex + groupedIndex,
                                true
                            ))}
                        </div>
                    );
                }

                if (menuSchema.item) {
                    return (
                        <ContextMenuMenuItem
                            key={menuSchema.key}
                            menuKey={menuSchema.key}
                            menuItem={menuSchema.item as IDisplayMenuItem<IMenuItem>}
                            menuSessionVersion={menuSessionVersion}
                            submenuPortalContainer={submenuPortalContainer}
                            activeSubmenuKey={activeSubmenuKey}
                            setActiveSubmenuKey={setActiveSubmenuKey}
                            onOptionSelect={onOptionSelect}
                            maxMenuHeight={maxMenuHeight}
                            hiddenItemIds={hiddenItemIds}
                            sizeVariant={sizeVariant}
                        />
                    );
                }

                if (!menuSchema.children?.length) {
                    return null;
                }

                if (menuSchema.quickLayout) {
                    return renderQuickLayoutGroup(menuSchema, startIndex, false, hasSeparator);
                }

                if (menuSchema.tiny) {
                    return (
                        <div
                            key={menuSchema.key}
                            className={clsx(
                                sizeVariant === 'paragraph-t'
                                    ? 'univer-flex univer-items-center univer-gap-2 univer-py-2'
                                    : 'univer-flex univer-items-center univer-gap-1 univer-py-1',
                                hasSeparator && borderBottomClassName
                            )}
                        >
                            {menuSchema.children.map((childSchema) => (
                                childSchema.item && (
                                    <ContextMenuMenuItem
                                        key={childSchema.key}
                                        menuKey={childSchema.key}
                                        menuItem={childSchema.item as IDisplayMenuItem<IMenuItem>}
                                        menuSessionVersion={menuSessionVersion}
                                        submenuPortalContainer={submenuPortalContainer}
                                        activeSubmenuKey={activeSubmenuKey}
                                        setActiveSubmenuKey={setActiveSubmenuKey}
                                        activeItemIds={activeItemIds}
                                        hiddenItemIds={hiddenItemIds}
                                        onOptionSelect={onOptionSelect}
                                        maxMenuHeight={maxMenuHeight}
                                        compact
                                        sizeVariant={sizeVariant}
                                    />
                                )
                            ))}
                        </div>
                    );
                }

                return (
                    <div
                        key={menuSchema.key}
                        className={clsx(
                            getContextMenuGroupClassName(sizeVariant),
                            hasSeparator && borderBottomClassName
                        )}
                    >
                        {titleNode}
                        {menuSchema.children.map((childSchema) => (
                            childSchema.item && (
                                <ContextMenuMenuItem
                                    key={childSchema.key}
                                    menuKey={childSchema.key}
                                    menuItem={childSchema.item as IDisplayMenuItem<IMenuItem>}
                                    menuSessionVersion={menuSessionVersion}
                                    submenuPortalContainer={submenuPortalContainer}
                                    activeSubmenuKey={activeSubmenuKey}
                                    setActiveSubmenuKey={setActiveSubmenuKey}
                                    activeItemIds={activeItemIds}
                                    hiddenItemIds={hiddenItemIds}
                                    onOptionSelect={onOptionSelect}
                                    maxMenuHeight={maxMenuHeight}
                                    sizeVariant={sizeVariant}
                                />
                            )
                        ))}
                    </div>
                );
            })}
        </>
    );

    function renderMenuSchemaHeader(menuSchema: IMenuSchema) {
        if (!menuSchema.title) {
            return null;
        }

        const titleContent = (
            <strong
                className={getContextMenuHeaderClassName(sizeVariant)}
            >
                {localeService.t(menuSchema.title)}
            </strong>
        );

        if (!menuSchema.headerActionItem) {
            return titleContent;
        }

        return (
            <div className={getContextMenuHeaderRowClassName(sizeVariant)}>
                {titleContent}
                <ContextMenuMenuItem
                    menuKey={`${menuSchema.key}-header-action`}
                    menuItem={menuSchema.headerActionItem as IDisplayMenuItem<IMenuItem>}
                    menuSessionVersion={menuSessionVersion}
                    submenuPortalContainer={submenuPortalContainer}
                    activeSubmenuKey={activeSubmenuKey}
                    setActiveSubmenuKey={setActiveSubmenuKey}
                    activeItemIds={activeItemIds}
                    hiddenItemIds={hiddenItemIds}
                    compact
                    headerAction
                    sizeVariant={sizeVariant}
                    onOptionSelect={onOptionSelect}
                    maxMenuHeight={maxMenuHeight}
                />
            </div>
        );
    }
}

function ContextMenuMenuItem(props: IContextMenuMenuItemProps) {
    const {
        menuKey,
        menuItem,
        menuSessionVersion,
        submenuPortalContainer,
        maxMenuHeight,
        activeSubmenuKey,
        setActiveSubmenuKey,
        activeItemIds,
        hiddenItemIds = [],
        compact = false,
        headerAction = false,
        sizeVariant,
        onOptionSelect,
    } = props;
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$);
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
    const [submenuPosition, setSubmenuPosition] = useState<{
        left: number;
        top: number;
    }>({
        left: 0,
        top: 0,
    });
    const [submenuPositionReady, setSubmenuPositionReady] = useState(false);
    const [submenuPlacement, setSubmenuPlacement] = useState<'left' | 'right'>('right');
    const menuItemElementRef = useRef<HTMLDivElement | null>(null);
    const submenuElementRef = useRef<HTMLDivElement | null>(null);
    const submenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    }, [menuItem.id, menuItem.type, menuManagerService, menuSessionVersion]);

    const hasSelectionSubmenu = selections.length > 0;
    const hasSubItemSubmenu = subMenuItems.length > 0;
    const hasSubmenu = hasSelectionSubmenu || hasSubItemSubmenu;
    const submenuVisible = hasSubmenu && activeSubmenuKey === menuKey;
    const selectionsCommandId = selectorItem.selectionsCommandId;

    const clearSubmenuCloseTimer = useCallback(() => {
        if (submenuCloseTimerRef.current == null) {
            return;
        }

        clearTimeout(submenuCloseTimerRef.current);
        submenuCloseTimerRef.current = null;
    }, []);

    const scheduleSubmenuClose = useCallback(() => {
        clearSubmenuCloseTimer();
        submenuCloseTimerRef.current = setTimeout(() => {
            submenuCloseTimerRef.current = null;
            setActiveSubmenuKey((currentKey) => (currentKey === menuKey ? null : currentKey));
        }, CONTEXT_MENU_SUBMENU_CLOSE_DELAY);
    }, [clearSubmenuCloseTimer, menuKey, setActiveSubmenuKey]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => () => clearSubmenuCloseTimer(), [clearSubmenuCloseTimer]);

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
            setSubmenuPlacement(useLeft ? 'left' : 'right');

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

    const hiddenById = (menuItem.id != null && hiddenItemIds.includes(menuItem.id)) || hiddenItemIds.includes(menuKey);

    if (hidden || hiddenById) {
        return null;
    }

    const onChange = (v: string | number) => {
        const newValue = isRealNum(v) && typeof v === 'string' ? Number.parseInt(v) : v;
        setInputValue(newValue);
    };

    const onSubmenuOptionSelect = (option: IValueOption) => {
        onOptionSelect?.(option);
        clearSubmenuCloseTimer();
        setActiveSubmenuKey((currentKey) => (currentKey === menuKey ? null : currentKey));
    };

    const itemClassName = clsx(
        compact
            ? (
                sizeVariant === 'paragraph-t'
                    ? `
                      univer-relative univer-flex
                      ${headerAction
                    ? 'univer-size-8 univer-rounded-md'
                    : 'univer-size-10 univer-rounded-lg'}
                      univer-items-center univer-justify-center univer-border-none univer-bg-transparent univer-p-0
                      univer-text-left univer-text-base
                      dark:!univer-text-white
                    `
                    : `
                      univer-relative univer-flex
                      ${headerAction
                    ? 'univer-size-7 univer-rounded-sm'
                    : 'univer-size-8 univer-rounded-md'}
                      univer-items-center univer-justify-center univer-border-none univer-bg-transparent univer-p-0
                      univer-text-left univer-text-sm
                      dark:!univer-text-white
                    `
            )
            : (
                sizeVariant === 'paragraph-t'
                    ? `
                      univer-relative univer-flex univer-min-h-10 univer-w-full univer-items-center
                      univer-justify-between univer-gap-4 univer-rounded-lg univer-border-none univer-bg-transparent
                      univer-px-3 univer-text-left univer-text-base
                      dark:!univer-text-white
                    `
                    : `
                      univer-relative univer-flex univer-min-h-8 univer-w-full univer-items-center
                      univer-justify-between univer-gap-3 univer-rounded-md univer-border-none univer-bg-transparent
                      univer-px-2 univer-text-left univer-text-sm
                      dark:!univer-text-white
                    `
            ),
        disabled
            ? 'univer-cursor-not-allowed univer-opacity-60'
            : `
              univer-cursor-pointer
              hover:univer-bg-gray-50
              dark:hover:!univer-bg-gray-600
            `,
        resolveMenuItemActiveState(menuItem.id, activated, activeItemIds) && `
          univer-bg-gray-200
          dark:!univer-bg-gray-600
        `
    );

    const contentNode = (
        <span className={getContextMenuContentClassName(sizeVariant)}>
            <CustomLabel
                value={inputValue}
                title={compact ? undefined : menuItem.title}
                label={menuItem.label}
                icon={menuItem.icon}
                onChange={onChange}
            />
            {menuItem.shortcut && ` (${menuItem.shortcut})`}
        </span>
    );

    const canExecuteItem = menuItem.type === MenuItemType.BUTTON || menuItem.type === MenuItemType.BUTTON_SELECTOR;
    const renderAsContainer = isNonSelectableLabel(menuItem.label);
    const interactiveItemClassName = clsx(itemClassName, isNonHoverableLabel(menuItem.label) && `
      hover:univer-bg-transparent
      dark:hover:!univer-bg-transparent
    `);

    return (
        <div
            ref={menuItemElementRef}
            className="univer-relative"
            onMouseEnter={() => {
                clearSubmenuCloseTimer();
                if (hasSubmenu && !disabled) {
                    setSubmenuPositionReady(false);
                    setActiveSubmenuKey(menuKey);
                }
            }}
            onMouseLeave={(event) => {
                if (hasSubmenu) {
                    const nextTarget = event.relatedTarget as Node | null;
                    if (nextTarget && submenuElementRef.current?.contains(nextTarget)) {
                        return;
                    }
                    scheduleSubmenuClose();
                }
            }}
        >
            {renderAsContainer
                ? (
                    <div
                        className={interactiveItemClassName}
                        aria-disabled={disabled}
                    >
                        {contentNode}
                        {hasSubmenu && (
                            <MoreIcon
                                className={`
                                  ${sizeVariant === 'paragraph-t' ? 'univer-size-4' : 'univer-size-3.5'}
                                  univer-text-gray-400
                                  dark:!univer-text-gray-200
                                `}
                            />
                        )}
                    </div>
                )
                : (
                    <button
                        type="button"
                        className={interactiveItemClassName}
                        disabled={disabled}
                        title={typeof menuItem.tooltip === 'string' ? localeService.t(menuItem.tooltip) : undefined}
                        onClick={() => {
                            clearSubmenuCloseTimer();
                            if (hasSubmenu) {
                                if (canExecuteItem) {
                                    const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
                                    onOptionSelect?.({
                                        commandId: item.commandId,
                                        params: item.params,
                                        value: inputValue,
                                        id: item.id,
                                        label: menuKey,
                                    });
                                    return;
                                }

                                setSubmenuPositionReady(false);
                                setActiveSubmenuKey(menuKey);
                                return;
                            }

                            if (!canExecuteItem) {
                                return;
                            }

                            const item = menuItem as IDisplayMenuItem<IMenuButtonItem>;
                            onOptionSelect?.({
                                commandId: item.commandId,
                                params: item.params,
                                value: inputValue,
                                id: item.id,
                                label: menuKey,
                            });
                        }}
                    >
                        {contentNode}
                        {hasSubmenu && !compact && (
                            <MoreIcon
                                className={`
                                  ${sizeVariant === 'paragraph-t' ? 'univer-size-4' : 'univer-size-3.5'}
                                  univer-text-gray-400
                                  dark:!univer-text-gray-200
                                `}
                            />
                        )}
                    </button>
                )}

            {hasSubmenu && submenuVisible && (
                submenuPortalContainer
                    ? createPortal(
                        <div
                            ref={submenuElementRef}
                            dir={direction}
                            {...{ [CONTEXT_MENU_SUBMENU_PORTAL_ATTR]: 'true' }}
                            className="univer-z-[1080] univer-w-max univer-max-w-[calc(100vw-16px)]"
                            style={{
                                position: 'fixed',
                                left: submenuPosition.left,
                                top: submenuPosition.top,
                                paddingLeft: submenuPlacement === 'right' ? submenuVisualGap : 0,
                                paddingRight: submenuPlacement === 'left' ? submenuVisualGap : 0,
                                maxHeight: maxMenuHeight,
                                visibility: submenuPositionReady ? 'visible' : 'hidden',
                                pointerEvents: submenuPositionReady ? 'auto' : 'none',
                            }}
                            onMouseEnter={clearSubmenuCloseTimer}
                            onMouseLeave={(event) => {
                                const nextTarget = event.relatedTarget as Node | null;
                                if (nextTarget && menuItemElementRef.current?.contains(nextTarget)) {
                                    return;
                                }

                                scheduleSubmenuClose();
                            }}
                            onWheel={(event) => event.stopPropagation()}
                        >
                            <div
                                className={clsx(
                                    getContextMenuSubmenuPanelClassName(sizeVariant),
                                    scrollbarClassName
                                )}
                                style={{
                                    maxHeight: maxMenuHeight,
                                }}
                            >
                                {hasSelectionSubmenu && (
                                    <div
                                        className={sizeVariant === 'paragraph-t'
                                            ? 'univer-grid univer-gap-2'
                                            : 'univer-grid univer-gap-1'}
                                    >
                                        {selections.map((option, index) => {
                                            const optionKey = `${menuItem.id}-${option.label ?? option.id}-${index}`;
                                            const optionSelected = typeof inputValue !== 'undefined' && String(inputValue) === String(option.value);
                                            const optionSelectable = !isNonSelectableLabel(option.label);
                                            const optionHoverable = !isNonHoverableLabel(option.label);
                                            const optionClassName = clsx(
                                                sizeVariant === 'paragraph-t'
                                                    ? `
                                                      univer-relative univer-box-border univer-flex univer-min-h-10
                                                      univer-w-full univer-items-center univer-rounded-lg
                                                      univer-border-none univer-bg-transparent univer-px-3
                                                      univer-text-left univer-text-base
                                                      dark:!univer-text-white
                                                    `
                                                    : `
                                                      univer-relative univer-box-border univer-flex univer-min-h-8
                                                      univer-w-full univer-items-center univer-rounded-md
                                                      univer-border-none univer-bg-transparent univer-px-2
                                                      univer-text-left univer-text-sm
                                                      dark:!univer-text-white
                                                    `,
                                                option.disabled
                                                    ? 'univer-cursor-not-allowed univer-opacity-60'
                                                    : optionHoverable && `
                                                      univer-cursor-pointer
                                                      hover:univer-bg-gray-50
                                                      dark:hover:!univer-bg-gray-600
                                                    `
                                            );
                                            const optionContentNode = (
                                                <>
                                                    {optionSelectable && optionSelected && (
                                                        <CheckMarkIcon
                                                            className={clsx(
                                                                'univer-absolute univer-left-0 univer-text-primary-600',
                                                                sizeVariant === 'paragraph-t'
                                                                    ? 'univer-size-5'
                                                                    : 'univer-size-4'
                                                            )}
                                                        />
                                                    )}
                                                    <span
                                                        className={clsx(getContextMenuContentClassName(sizeVariant), optionSelectable && optionSelected && `
                                                          univer-pl-4
                                                        `)}
                                                    >
                                                        <CustomLabel
                                                            value$={option.value$}
                                                            value={option.value}
                                                            label={option.label}
                                                            icon={option.icon}
                                                            onChange={(optionValue) => {
                                                                onSubmenuOptionSelect?.({
                                                                    ...option,
                                                                    value: optionValue,
                                                                    id: menuItem.id,
                                                                    label: menuKey,
                                                                    commandId: option.commandId ?? selectionsCommandId,
                                                                });
                                                            }}
                                                        />
                                                    </span>
                                                </>
                                            );

                                            return (
                                                optionSelectable
                                                    ? (
                                                        <button
                                                            key={optionKey}
                                                            type="button"
                                                            className={optionClassName}
                                                            disabled={option.disabled}
                                                            onClick={() => {
                                                                onSubmenuOptionSelect?.({
                                                                    ...option,
                                                                    id: menuItem.id,
                                                                    label: menuKey,
                                                                    commandId: option.commandId ?? selectionsCommandId,
                                                                });
                                                            }}
                                                        >
                                                            {optionContentNode}
                                                        </button>
                                                    )
                                                    : (
                                                        <div
                                                            key={optionKey}
                                                            className={optionClassName}
                                                            aria-disabled={option.disabled}
                                                        >
                                                            {optionContentNode}
                                                        </div>
                                                    )
                                            );
                                        })}
                                    </div>
                                )}
                                {hasSubItemSubmenu && (
                                    <ContextMenuMenu
                                        menuSchemas={subMenuItems}
                                        menuSessionVersion={menuSessionVersion}
                                        submenuPortalContainer={submenuPortalContainer}
                                        activeItemIds={activeItemIds}
                                        hiddenItemIds={hiddenItemIds}
                                        sizeVariant={sizeVariant}
                                        onOptionSelect={onSubmenuOptionSelect}
                                        maxMenuHeight={maxMenuHeight}
                                    />
                                )}
                            </div>
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
