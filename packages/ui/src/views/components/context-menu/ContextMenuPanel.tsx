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

import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
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
import { borderBottomClassName, borderClassName, clsx, cva, scrollbarClassName } from '@univerjs/design';
import { CheckMarkIcon, MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { combineLatest, isObservable, of, scan, startWith } from 'rxjs';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';
import { useScrollYOverContainer } from '../../hooks/layout';
import { resolveMenuItemActiveState, UIQuickTileMenuGroup, UITinyMenuGroup } from '../../menu/desktop/TinyMenuGroup';

type ContextMenuSizeVariant = 'default' | 'paragraph-t';
type ContextMenuAutoFocusTarget = 'first-item' | 'container';

interface IContextMenuPanelProps {
    menuType: string;
    menuManagerService?: IMenuManagerService;
    layoutService?: ILayoutService;
    menuSessionVersion?: number;
    className?: string;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    sizeVariant?: ContextMenuSizeVariant;
    autoFocus?: boolean;
    autoFocusTarget?: ContextMenuAutoFocusTarget;
    suppressHoverUntilPointerMove?: boolean;
    onCancel?: () => void;
    onMenuPointerEnter?: () => void;
    onMenuPointerLeave?: () => void;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuProps {
    menuSchemas: IMenuSchema[];
    menuManagerService: IMenuManagerService;
    menuSessionVersion: number;
    submenuPortalContainer: HTMLElement | null;
    rootMenuElement: HTMLElement | null;
    maxMenuHeight: number;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    hoverSuppressed?: boolean;
    sizeVariant: ContextMenuSizeVariant;
    onMenuPointerEnter?: () => void;
    onMenuPointerLeave?: () => void;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IContextMenuMenuItemProps {
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuItem>;
    menuManagerService: IMenuManagerService;
    menuSessionVersion: number;
    submenuPortalContainer: HTMLElement | null;
    rootMenuElement: HTMLElement | null;
    maxMenuHeight: number;
    activeSubmenuKey: string | null;
    setActiveSubmenuKey: Dispatch<SetStateAction<string | null>>;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    hoverSuppressed?: boolean;
    compact?: boolean;
    headerAction?: boolean;
    sizeVariant: ContextMenuSizeVariant;
    onMenuPointerEnter?: () => void;
    onMenuPointerLeave?: () => void;
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
const CONTEXT_MENU_NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);

type MenuLabel = IMenuItem['label'] | IValueOption['label'];
type ContextMenuQuickGroupConnection = 'none' | 'previous' | 'next' | 'both';
type ContextMenuItemVariant = 'default' | 'compact' | 'compactHeaderAction';

const contextMenuContentVariants = cva('univer-inline-flex univer-items-center', {
    variants: {
        sizeVariant: {
            default: 'univer-gap-2',
            'paragraph-t': 'univer-gap-3',
        },
    },
    defaultVariants: {
        sizeVariant: 'default',
    },
});

const contextMenuPanelVariants = cva(
    `
      univer-box-border univer-grid univer-max-w-full univer-overflow-y-auto univer-overscroll-contain univer-rounded-md
      univer-bg-white univer-text-gray-900 univer-shadow-md
      dark:!univer-bg-gray-700 dark:!univer-text-white
    `,
    {
        variants: {
            sizeVariant: {
                default: 'univer-min-w-52 univer-gap-1 univer-px-2 univer-py-1 univer-text-sm',
                'paragraph-t': 'univer-min-w-64 univer-gap-2 univer-px-3 univer-py-2 univer-text-base',
            },
        },
        defaultVariants: {
            sizeVariant: 'default',
        },
    }
);

const contextMenuGroupVariants = cva('univer-grid', {
    variants: {
        sizeVariant: {
            default: 'univer-gap-1 univer-py-1',
            'paragraph-t': 'univer-gap-2 univer-py-2',
        },
    },
    defaultVariants: {
        sizeVariant: 'default',
    },
});

const contextMenuQuickGroupVariants = cva('univer-grid', {
    variants: {
        sizeVariant: {
            default: 'univer-gap-1 univer-py-1',
            'paragraph-t': 'univer-gap-2 univer-py-2',
        },
        connection: {
            none: '',
            previous: '',
            next: '',
            both: '',
        },
    },
    compoundVariants: [
        {
            sizeVariant: 'paragraph-t',
            connection: 'previous',
            class: 'univer-pb-2 univer-pt-1',
        },
        {
            sizeVariant: 'paragraph-t',
            connection: 'next',
            class: 'univer-pb-1 univer-pt-2',
        },
        {
            sizeVariant: 'paragraph-t',
            connection: 'both',
            class: 'univer-pb-1 univer-pt-1',
        },
    ],
    defaultVariants: {
        sizeVariant: 'default',
        connection: 'none',
    },
});

const contextMenuQuickGroupClusterVariants = cva('univer-grid', {
    variants: {
        sizeVariant: {
            default: 'univer-gap-1 univer-py-1',
            'paragraph-t': 'univer-gap-0 univer-py-2',
        },
    },
    defaultVariants: {
        sizeVariant: 'default',
    },
});

const contextMenuHeaderVariants = cva(`
  univer-font-semibold univer-text-gray-600
  dark:!univer-text-gray-300
`, {
    variants: {
        sizeVariant: {
            default: 'univer-px-2 univer-text-xs',
            'paragraph-t': 'univer-px-3 univer-text-sm',
        },
    },
    defaultVariants: {
        sizeVariant: 'default',
    },
});

const contextMenuHeaderRowVariants = cva('univer-flex univer-items-center univer-justify-between', {
    variants: {
        sizeVariant: {
            default: 'univer-gap-1.5',
            'paragraph-t': 'univer-gap-2',
        },
    },
    defaultVariants: {
        sizeVariant: 'default',
    },
});

const contextMenuSubmenuPanelVariants = cva(
    `
      univer-overflow-y-auto univer-overscroll-contain univer-rounded-md univer-border univer-border-solid
      univer-border-gray-200 univer-bg-white univer-shadow-md
      dark:!univer-border-gray-600 dark:!univer-bg-gray-700
    `,
    {
        variants: {
            sizeVariant: {
                default: 'univer-p-1.5',
                'paragraph-t': 'univer-p-2',
            },
        },
        defaultVariants: {
            sizeVariant: 'default',
        },
    }
);

const contextMenuItemVariants = cva(
    `
      univer-relative univer-flex univer-border-none univer-bg-transparent univer-text-left
      dark:!univer-text-white
    `,
    {
        variants: {
            sizeVariant: {
                default: '',
                'paragraph-t': '',
            },
            variant: {
                default: '',
                compact: '',
                compactHeaderAction: '',
            },
            disabled: {
                true: 'univer-cursor-not-allowed univer-opacity-60',
                false: `
                  univer-cursor-pointer
                  focus:univer-bg-gray-50 focus:univer-outline-none
                  dark:focus:!univer-bg-gray-600
                `,
            },
            hoverSuppressed: {
                true: '',
                false: '',
            },
            active: {
                true: `
                  univer-bg-gray-200
                  dark:!univer-bg-gray-600
                `,
                false: '',
            },
        },
        compoundVariants: [
            {
                sizeVariant: 'default',
                variant: 'default',
                class: `
                  univer-min-h-8 univer-w-full univer-items-center univer-justify-between univer-gap-3 univer-rounded-md
                  univer-px-2 univer-text-sm
                `,
            },
            {
                sizeVariant: 'default',
                variant: 'compact',
                class: `
                  univer-size-8 univer-items-center univer-justify-center univer-rounded-md univer-p-0 univer-text-sm
                `,
            },
            {
                sizeVariant: 'default',
                variant: 'compactHeaderAction',
                class: `
                  univer-size-7 univer-items-center univer-justify-center univer-rounded-sm univer-p-0 univer-text-sm
                `,
            },
            {
                sizeVariant: 'paragraph-t',
                variant: 'default',
                class: `
                  univer-min-h-10 univer-w-full univer-items-center univer-justify-between univer-gap-4
                  univer-rounded-lg univer-px-3 univer-text-base
                `,
            },
            {
                sizeVariant: 'paragraph-t',
                variant: 'compact',
                class: `
                  univer-size-10 univer-items-center univer-justify-center univer-rounded-lg univer-p-0 univer-text-base
                `,
            },
            {
                sizeVariant: 'paragraph-t',
                variant: 'compactHeaderAction',
                class: `
                  univer-size-8 univer-items-center univer-justify-center univer-rounded-md univer-p-0 univer-text-base
                `,
            },
            {
                disabled: false,
                hoverSuppressed: false,
                class: `
                  hover:univer-bg-gray-50
                  dark:hover:!univer-bg-gray-600
                `,
            },
        ],
        defaultVariants: {
            sizeVariant: 'default',
            variant: 'default',
            disabled: false,
            hoverSuppressed: false,
            active: false,
        },
    }
);

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

function isContextMenuPointerLeaveTarget(
    nextTarget: Node | null,
    owningMenuItemElement: HTMLElement | null,
    rootMenuElement: HTMLElement | null
) {
    if (!nextTarget) {
        return true;
    }

    if (owningMenuItemElement?.contains(nextTarget) || rootMenuElement?.contains(nextTarget)) {
        return false;
    }

    return true;
}

function getContextMenuContentClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuContentVariants({ sizeVariant });
}

function getContextMenuPanelClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuPanelVariants({ sizeVariant });
}

function getContextMenuGroupClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuGroupVariants({ sizeVariant });
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
    const connection: ContextMenuQuickGroupConnection = connectedToPrevious && connectedToNext
        ? 'both'
        : connectedToPrevious
            ? 'previous'
            : connectedToNext
                ? 'next'
                : 'none';

    return contextMenuQuickGroupVariants({ sizeVariant, connection });
}

function getContextMenuQuickGroupClusterClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuQuickGroupClusterVariants({ sizeVariant });
}

function getMenuButtonCenter(button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

function getMenuButtonRows(buttons: HTMLButtonElement[]): HTMLButtonElement[][] {
    const sortedButtons = [...buttons].sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();

        return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
    });
    const rows: HTMLButtonElement[][] = [];

    for (const button of sortedButtons) {
        const rect = button.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const row = rows.find((candidateRow) => {
            const rowRect = candidateRow[0].getBoundingClientRect();
            const rowCenterY = rowRect.top + rowRect.height / 2;
            const tolerance = Math.max(4, Math.max(rowRect.height, rect.height) / 2);

            return Math.abs(rowCenterY - centerY) <= tolerance;
        });

        if (row) {
            row.push(button);
        } else {
            rows.push([button]);
        }
    }

    rows.forEach((row) => row.sort((left, right) => left.getBoundingClientRect().left - right.getBoundingClientRect().left));

    return rows;
}

function getFirstMenuButtonByVisualOrder(buttons: HTMLButtonElement[]): HTMLButtonElement | undefined {
    return [...buttons].sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();

        return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
    })[0];
}

export function getNextMenuButtonByDirection(
    buttons: HTMLButtonElement[],
    activeIndex: number,
    key: string
): HTMLButtonElement {
    const direction = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1;
    const fallbackIndex = activeIndex < 0
        ? (direction > 0 ? 0 : buttons.length - 1)
        : (activeIndex + direction + buttons.length) % buttons.length;
    const fallbackButton = buttons[fallbackIndex];
    const activeButton = activeIndex >= 0 ? buttons[activeIndex] : null;

    if (!activeButton) {
        return fallbackButton;
    }

    const rows = getMenuButtonRows(buttons);
    const activeRowIndex = rows.findIndex((row) => row.includes(activeButton));
    const activeRow = rows[activeRowIndex];

    if (activeRow && (key === 'ArrowRight' || key === 'ArrowLeft')) {
        const rowButtonIndex = activeRow.indexOf(activeButton);
        const nextRowButton = activeRow[rowButtonIndex + (key === 'ArrowRight' ? 1 : -1)];

        return nextRowButton ?? fallbackButton;
    }

    if (activeRow && (key === 'ArrowDown' || key === 'ArrowUp')) {
        const nextRow = rows[activeRowIndex + (key === 'ArrowDown' ? 1 : -1)];
        if (nextRow) {
            const activeCenter = getMenuButtonCenter(activeButton);

            return [...nextRow].sort((left, right) => (
                Math.abs(getMenuButtonCenter(left).x - activeCenter.x) - Math.abs(getMenuButtonCenter(right).x - activeCenter.x)
            ))[0] ?? fallbackButton;
        }
    }

    const activeCenter = getMenuButtonCenter(activeButton);
    const scoredCandidates = buttons
        .filter((button) => button !== activeButton)
        .map((button) => {
            const center = getMenuButtonCenter(button);
            const deltaX = center.x - activeCenter.x;
            const deltaY = center.y - activeCenter.y;
            const isCandidate = key === 'ArrowRight'
                ? deltaX > 0
                : key === 'ArrowLeft'
                    ? deltaX < 0
                    : key === 'ArrowDown'
                        ? deltaY > 0
                        : deltaY < 0;

            if (!isCandidate) {
                return null;
            }

            const primaryDistance = key === 'ArrowRight' || key === 'ArrowLeft'
                ? Math.abs(deltaX)
                : Math.abs(deltaY);
            const secondaryDistance = key === 'ArrowRight' || key === 'ArrowLeft'
                ? Math.abs(deltaY)
                : Math.abs(deltaX);

            return {
                button,
                score: primaryDistance * 1000 + secondaryDistance,
            };
        })
        .filter((candidate): candidate is { button: HTMLButtonElement; score: number } => candidate != null)
        .sort((left, right) => left.score - right.score);

    return scoredCandidates[0]?.button ?? fallbackButton;
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
    return contextMenuHeaderVariants({ sizeVariant });
}

function getContextMenuHeaderRowClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuHeaderRowVariants({ sizeVariant });
}

function getContextMenuSubmenuPanelClassName(sizeVariant: ContextMenuSizeVariant) {
    return contextMenuSubmenuPanelVariants({ sizeVariant });
}

export function ContextMenuPanel(props: IContextMenuPanelProps) {
    const {
        menuType,
        menuManagerService: providedMenuManagerService,
        layoutService: providedLayoutService,
        menuSessionVersion = 0,
        className,
        activeItemIds,
        hiddenItemIds,
        sizeVariant = 'default',
        autoFocus,
        autoFocusTarget = 'first-item',
        suppressHoverUntilPointerMove = false,
        onCancel,
        onMenuPointerEnter,
        onMenuPointerLeave,
        onOptionSelect,
    } = props;
    const rootMenuManagerService = useDependency(IMenuManagerService);
    const rootLayoutService = useDependency(ILayoutService);
    const menuManagerService = providedMenuManagerService ?? rootMenuManagerService;
    const layoutService = providedLayoutService ?? rootLayoutService;
    const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null);
    const [maxMenuHeight, setMaxMenuHeight] = useState(() => {
        if (typeof window === 'undefined') {
            return 240;
        }

        return Math.max(120, window.innerHeight - menuViewportPadding * 2);
    });
    const [hoverSuppressed, setHoverSuppressed] = useState(suppressHoverUntilPointerMove);
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

    const getFocusableMenuButtons = useCallback(() => {
        if (!menuElement) {
            return [];
        }

        return Array.from(menuElement.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    }, [menuElement]);

    useEffect(() => {
        if (!autoFocus || !menuElement) {
            return;
        }

        const view = menuElement.ownerDocument.defaultView ?? window;
        const frameId = view.requestAnimationFrame(() => {
            if (autoFocusTarget === 'container') {
                menuElement.focus();
                return;
            }

            const firstButton = getFirstMenuButtonByVisualOrder(getFocusableMenuButtons());
            (firstButton ?? menuElement).focus();
        });

        return () => view.cancelAnimationFrame(frameId);
    }, [autoFocus, autoFocusTarget, getFocusableMenuButtons, menuElement, menuItems]);

    useEffect(() => {
        setHoverSuppressed(suppressHoverUntilPointerMove);
    }, [menuSessionVersion, menuType, suppressHoverUntilPointerMove]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            onCancel?.();
            return;
        }

        if (!CONTEXT_MENU_NAVIGATION_KEYS.has(event.key) && event.key !== 'Enter') {
            return;
        }

        const focusableButtons = getFocusableMenuButtons();
        if (!focusableButtons.length) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const activeElement = menuElement?.ownerDocument.activeElement;
        const activeIndex = focusableButtons.findIndex((button) => button === activeElement);

        if (event.key === 'Enter') {
            const button = activeIndex >= 0 ? focusableButtons[activeIndex] : getFirstMenuButtonByVisualOrder(focusableButtons);
            if (!button) {
                return;
            }

            button.click();
            return;
        }

        getNextMenuButtonByDirection(focusableButtons, activeIndex, event.key).focus();
    }, [getFocusableMenuButtons, menuElement, onCancel]);

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
            tabIndex={-1}
            className={clsx(
                getContextMenuPanelClassName(sizeVariant),
                borderClassName,
                scrollbarClassName,
                hoverSuppressed && 'univer-context-menu-hover-suppressed',
                className
            )}
            style={{
                maxHeight: maxMenuHeight,
            }}
            onKeyDown={handleKeyDown}
            onPointerMove={() => {
                if (hoverSuppressed) {
                    setHoverSuppressed(false);
                }
            }}
            onWheel={(event) => event.stopPropagation()}
        >
            <ContextMenuMenu
                menuSchemas={menuItems}
                menuManagerService={menuManagerService}
                menuSessionVersion={menuSessionVersion}
                submenuPortalContainer={submenuPortalContainer}
                rootMenuElement={menuElement}
                activeItemIds={activeItemIds}
                hiddenItemIds={hiddenItemIds}
                hoverSuppressed={hoverSuppressed}
                sizeVariant={sizeVariant}
                onMenuPointerEnter={onMenuPointerEnter}
                onMenuPointerLeave={onMenuPointerLeave}
                onOptionSelect={onOptionSelect}
                maxMenuHeight={maxMenuHeight}
            />
        </div>
    );
}

function ContextMenuMenu(props: IContextMenuMenuProps) {
    const { menuSchemas, menuManagerService, menuSessionVersion, submenuPortalContainer, rootMenuElement, activeItemIds, hiddenItemIds, hoverSuppressed, sizeVariant, onMenuPointerEnter, onMenuPointerLeave, onOptionSelect, maxMenuHeight } = props;
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
                            hoverSuppressed={hoverSuppressed}
                            onOptionSelect={onOptionSelect}
                        />
                    )
                    : (
                        <UITinyMenuGroup
                            item={menuSchema}
                            columns={getContextMenuQuickGroupColumns(menuSchema)}
                            activeItemIds={activeItemIds}
                            hiddenItemIds={hiddenItemIds}
                            hoverSuppressed={hoverSuppressed}
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
                            menuManagerService={menuManagerService}
                            menuSessionVersion={menuSessionVersion}
                            submenuPortalContainer={submenuPortalContainer}
                            rootMenuElement={rootMenuElement}
                            activeSubmenuKey={activeSubmenuKey}
                            setActiveSubmenuKey={setActiveSubmenuKey}
                            onOptionSelect={onOptionSelect}
                            maxMenuHeight={maxMenuHeight}
                            hiddenItemIds={hiddenItemIds}
                            hoverSuppressed={hoverSuppressed}
                            sizeVariant={sizeVariant}
                            onMenuPointerEnter={onMenuPointerEnter}
                            onMenuPointerLeave={onMenuPointerLeave}
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
                                        menuManagerService={menuManagerService}
                                        menuSessionVersion={menuSessionVersion}
                                        submenuPortalContainer={submenuPortalContainer}
                                        rootMenuElement={rootMenuElement}
                                        activeSubmenuKey={activeSubmenuKey}
                                        setActiveSubmenuKey={setActiveSubmenuKey}
                                        activeItemIds={activeItemIds}
                                        hiddenItemIds={hiddenItemIds}
                                        hoverSuppressed={hoverSuppressed}
                                        onMenuPointerEnter={onMenuPointerEnter}
                                        onMenuPointerLeave={onMenuPointerLeave}
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
                                    menuManagerService={menuManagerService}
                                    menuSessionVersion={menuSessionVersion}
                                    submenuPortalContainer={submenuPortalContainer}
                                    rootMenuElement={rootMenuElement}
                                    activeSubmenuKey={activeSubmenuKey}
                                    setActiveSubmenuKey={setActiveSubmenuKey}
                                    activeItemIds={activeItemIds}
                                    hiddenItemIds={hiddenItemIds}
                                    hoverSuppressed={hoverSuppressed}
                                    onMenuPointerEnter={onMenuPointerEnter}
                                    onMenuPointerLeave={onMenuPointerLeave}
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
                    menuManagerService={menuManagerService}
                    menuSessionVersion={menuSessionVersion}
                    submenuPortalContainer={submenuPortalContainer}
                    rootMenuElement={rootMenuElement}
                    activeSubmenuKey={activeSubmenuKey}
                    setActiveSubmenuKey={setActiveSubmenuKey}
                    activeItemIds={activeItemIds}
                    hiddenItemIds={hiddenItemIds}
                    hoverSuppressed={hoverSuppressed}
                    compact
                    headerAction
                    sizeVariant={sizeVariant}
                    onMenuPointerEnter={onMenuPointerEnter}
                    onMenuPointerLeave={onMenuPointerLeave}
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
        menuManagerService,
        menuSessionVersion,
        submenuPortalContainer,
        rootMenuElement,
        maxMenuHeight,
        activeSubmenuKey,
        setActiveSubmenuKey,
        activeItemIds,
        hiddenItemIds = [],
        hoverSuppressed = false,
        compact = false,
        headerAction = false,
        sizeVariant,
        onMenuPointerEnter,
        onMenuPointerLeave,
        onOptionSelect,
    } = props;
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$);
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

    const closeSubmenu = useCallback(() => {
        clearSubmenuCloseTimer();
        setActiveSubmenuKey((currentKey) => (currentKey === menuKey ? null : currentKey));
    }, [clearSubmenuCloseTimer, menuKey, setActiveSubmenuKey]);

    const scheduleSubmenuClose = useCallback(() => {
        clearSubmenuCloseTimer();
        submenuCloseTimerRef.current = setTimeout(() => {
            submenuCloseTimerRef.current = null;
            closeSubmenu();
        }, CONTEXT_MENU_SUBMENU_CLOSE_DELAY);
    }, [clearSubmenuCloseTimer, closeSubmenu]);

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

            const hasLeftSpace = leftLeft >= menuViewportPadding;
            const hasRightSpace = rightLeft + submenuRect.width + menuViewportPadding <= window.innerWidth;
            const useLeft = direction === 'rtl'
                ? hasLeftSpace || !hasRightSpace
                : !hasRightSpace && hasLeftSpace;
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
    }, [direction, submenuVisible, hasSelectionSubmenu, hasSubItemSubmenu]);

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

    const itemVariant: ContextMenuItemVariant = compact
        ? headerAction ? 'compactHeaderAction' : 'compact'
        : 'default';
    const itemClassName = contextMenuItemVariants({
        sizeVariant,
        variant: itemVariant,
        disabled,
        hoverSuppressed,
        active: resolveMenuItemActiveState(menuItem.id, activated, activeItemIds),
    });

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
    const SubmenuAffordanceIcon = direction === 'rtl' ? MoreLeftIcon : MoreRightIcon;
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
                if (hasSubmenu && !disabled && !hoverSuppressed) {
                    setSubmenuPositionReady(false);
                    setActiveSubmenuKey(menuKey);
                    return;
                }

                if (!hasSubmenu && !hoverSuppressed) {
                    setActiveSubmenuKey(null);
                }
            }}
            onMouseLeave={(event) => {
                if (hasSubmenu) {
                    const nextTarget = event.relatedTarget as Node | null;
                    if (nextTarget && submenuElementRef.current?.contains(nextTarget)) {
                        return;
                    }
                    if (isContextMenuPointerLeaveTarget(nextTarget, menuItemElementRef.current, rootMenuElement)) {
                        closeSubmenu();
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
                            <SubmenuAffordanceIcon
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
                                if (headerAction) {
                                    setSubmenuPositionReady(false);
                                    setActiveSubmenuKey(menuKey);
                                    return;
                                }

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
                            <SubmenuAffordanceIcon
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
                            data-u-context-menu-submenu="true"
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
                            onMouseEnter={() => {
                                clearSubmenuCloseTimer();
                                onMenuPointerEnter?.();
                            }}
                            onMouseLeave={(event) => {
                                const nextTarget = event.relatedTarget as Node | null;
                                if (nextTarget && menuItemElementRef.current?.contains(nextTarget)) {
                                    return;
                                }

                                if (isContextMenuPointerLeaveTarget(nextTarget, menuItemElementRef.current, rootMenuElement)) {
                                    closeSubmenu();
                                    onMenuPointerLeave?.();
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
                                                optionSelectable
                                                    ? sizeVariant === 'paragraph-t'
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
                                                        `
                                                    : `
                                                      univer-relative univer-box-border univer-block univer-w-full
                                                      univer-border-none univer-bg-transparent univer-p-0
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
                                        menuManagerService={menuManagerService}
                                        menuSessionVersion={menuSessionVersion}
                                        submenuPortalContainer={submenuPortalContainer}
                                        rootMenuElement={rootMenuElement}
                                        activeItemIds={activeItemIds}
                                        hiddenItemIds={hiddenItemIds}
                                        hoverSuppressed={hoverSuppressed}
                                        sizeVariant={sizeVariant}
                                        onMenuPointerEnter={onMenuPointerEnter}
                                        onMenuPointerLeave={onMenuPointerLeave}
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
